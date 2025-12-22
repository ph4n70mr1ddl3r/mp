import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebSocketTestHelper, WebSocketMessage, createWebSocketHelper } from '../support/helpers/websocket-helpers';

// Mock WebSocket
class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;

  readyState = MockWebSocket.OPEN;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((error: any) => void) | null = null;

  constructor(public url: string) {
    setTimeout(() => this.onopen?.(), 0);
  }

  send = vi.fn();
  close = vi.fn(() => {
    this.readyState = MockWebSocket.CLOSED;
    setTimeout(() => this.onclose?.(), 0);
  });

  // Helper to simulate receiving a message
  simulateMessage(message: WebSocketMessage) {
    this.onmessage?.({ data: JSON.stringify(message) });
  }
}

// Replace global WebSocket with mock
const originalWebSocket = global.WebSocket;
beforeEach(() => {
  (global as any).WebSocket = MockWebSocket;
});

afterEach(() => {
  (global as any).WebSocket = originalWebSocket;
});

describe('WebSocketTestHelper', () => {
  describe('connect', () => {
    test('[P0] should connect to WebSocket server', async () => {
      // GIVEN: WebSocket helper
      const helper = new WebSocketTestHelper('ws://localhost:8080/ws');

      // WHEN: Connecting
      await helper.connect();

      // THEN: Connection is established (no error thrown)
      expect(true).toBe(true);
    });

    test('[P1] should handle connection errors', async () => {
      // GIVEN: WebSocket that fails to connect
      (global as any).WebSocket = class FailingWebSocket {
        onopen: any;
        onerror: any;
        constructor() {
          setTimeout(() => this.onerror?.(new Error('Connection failed')), 0);
        }
      };

      const helper = new WebSocketTestHelper('ws://localhost:8080/ws');

      // WHEN/THEN: Connection fails
      await expect(helper.connect()).rejects.toThrow();
    });
  });

  describe('send', () => {
    test('[P0] should send message in correct format', async () => {
      // GIVEN: Connected WebSocket
      const helper = new WebSocketTestHelper('ws://localhost:8080/ws');
      await helper.connect();

      // WHEN: Sending message
      await helper.send('lobby_message', { content: 'Test' });

      // THEN: Message is sent with correct structure
      const mockWs = (helper as any).ws as MockWebSocket;
      expect(mockWs.send).toHaveBeenCalled();

      const sentMessage = JSON.parse(mockWs.send.mock.calls[0][0]);
      expect(sentMessage.type).toBe('lobby_message');
      expect(sentMessage.data.content).toBe('Test');
      expect(sentMessage.timestamp).toBeTruthy();
    });

    test('[P0] should throw if not connected', async () => {
      // GIVEN: Unconnected WebSocket helper
      const helper = new WebSocketTestHelper('ws://localhost:8080/ws');

      // WHEN/THEN: Sending fails
      await expect(helper.send('test', {})).rejects.toThrow('WebSocket not connected');
    });

    test('[P1] should include timestamp in message', async () => {
      // GIVEN: Connected WebSocket
      const helper = new WebSocketTestHelper('ws://localhost:8080/ws');
      await helper.connect();

      // WHEN: Sending message
      const beforeSend = new Date().toISOString();
      await helper.send('test', { data: 'value' });
      const afterSend = new Date().toISOString();

      // THEN: Timestamp is within expected range
      const mockWs = (helper as any).ws as MockWebSocket;
      const sentMessage = JSON.parse(mockWs.send.mock.calls[0][0]);

      expect(sentMessage.timestamp).toBeTruthy();
      expect(sentMessage.timestamp >= beforeSend).toBe(true);
      expect(sentMessage.timestamp <= afterSend).toBe(true);
    });
  });

  describe('waitForMessage', () => {
    test('[P0] should resolve when message type received', async () => {
      // GIVEN: Connected WebSocket
      const helper = new WebSocketTestHelper('ws://localhost:8080/ws');
      await helper.connect();

      const mockWs = (helper as any).ws as MockWebSocket;

      // WHEN: Waiting for message and receiving it
      const waitPromise = helper.waitForMessage('auth_response');

      // Simulate receiving message
      mockWs.simulateMessage({
        type: 'auth_response',
        data: { success: true },
      });

      const result = await waitPromise;

      // THEN: Correct message received
      expect(result.type).toBe('auth_response');
      expect(result.data.success).toBe(true);
    });

    test('[P0] should timeout if message not received', async () => {
      // GIVEN: Connected WebSocket
      const helper = new WebSocketTestHelper('ws://localhost:8080/ws');
      await helper.connect();

      // WHEN/THEN: Waiting times out
      await expect(
        helper.waitForMessage('never_sent', 100)
      ).rejects.toThrow('Timeout waiting for message type: never_sent');
    });

    test('[P1] should ignore messages of wrong type', async () => {
      // GIVEN: Connected WebSocket
      const helper = new WebSocketTestHelper('ws://localhost:8080/ws');
      await helper.connect();

      const mockWs = (helper as any).ws as MockWebSocket;

      // WHEN: Waiting for specific type
      const waitPromise = helper.waitForMessage('target_type', 500);

      // Send wrong type first
      mockWs.simulateMessage({ type: 'wrong_type', data: {} });

      // Then send correct type
      setTimeout(() => {
        mockWs.simulateMessage({ type: 'target_type', data: { found: true } });
      }, 50);

      const result = await waitPromise;

      // THEN: Only target message returned
      expect(result.type).toBe('target_type');
      expect(result.data.found).toBe(true);
    });
  });

  describe('getMessages', () => {
    test('[P0] should return all received messages', async () => {
      // GIVEN: Connected WebSocket with messages
      const helper = new WebSocketTestHelper('ws://localhost:8080/ws');
      await helper.connect();

      const mockWs = (helper as any).ws as MockWebSocket;

      // Simulate receiving multiple messages
      mockWs.simulateMessage({ type: 'type1', data: { id: 1 } });
      mockWs.simulateMessage({ type: 'type2', data: { id: 2 } });
      mockWs.simulateMessage({ type: 'type1', data: { id: 3 } });

      // WHEN: Getting all messages
      const messages = helper.getMessages();

      // THEN: All messages returned
      expect(messages).toHaveLength(3);
      expect(messages[0].data.id).toBe(1);
      expect(messages[1].data.id).toBe(2);
      expect(messages[2].data.id).toBe(3);
    });

    test('[P1] should return a copy (not reference)', async () => {
      // GIVEN: Connected WebSocket
      const helper = new WebSocketTestHelper('ws://localhost:8080/ws');
      await helper.connect();

      const mockWs = (helper as any).ws as MockWebSocket;
      mockWs.simulateMessage({ type: 'test', data: {} });

      // WHEN: Getting messages and modifying
      const messages = helper.getMessages();
      messages.push({ type: 'fake', data: {} });

      // THEN: Original not modified
      expect(helper.getMessages()).toHaveLength(1);
    });
  });

  describe('getMessagesByType', () => {
    test('[P0] should filter messages by type', async () => {
      // GIVEN: Connected WebSocket with mixed messages
      const helper = new WebSocketTestHelper('ws://localhost:8080/ws');
      await helper.connect();

      const mockWs = (helper as any).ws as MockWebSocket;

      mockWs.simulateMessage({ type: 'lobby_message', data: { content: 'A' } });
      mockWs.simulateMessage({ type: 'user_joined', data: { user: 'Bob' } });
      mockWs.simulateMessage({ type: 'lobby_message', data: { content: 'B' } });

      // WHEN: Getting messages by type
      const lobbyMessages = helper.getMessagesByType('lobby_message');

      // THEN: Only matching messages returned
      expect(lobbyMessages).toHaveLength(2);
      expect(lobbyMessages[0].data.content).toBe('A');
      expect(lobbyMessages[1].data.content).toBe('B');
    });

    test('[P2] should return empty array for unknown type', async () => {
      // GIVEN: Connected WebSocket
      const helper = new WebSocketTestHelper('ws://localhost:8080/ws');
      await helper.connect();

      // WHEN: Getting messages of non-existent type
      const messages = helper.getMessagesByType('unknown_type');

      // THEN: Empty array returned
      expect(messages).toHaveLength(0);
    });
  });

  describe('clearMessages', () => {
    test('[P0] should clear all stored messages', async () => {
      // GIVEN: Connected WebSocket with messages
      const helper = new WebSocketTestHelper('ws://localhost:8080/ws');
      await helper.connect();

      const mockWs = (helper as any).ws as MockWebSocket;
      mockWs.simulateMessage({ type: 'test', data: {} });
      mockWs.simulateMessage({ type: 'test', data: {} });

      expect(helper.getMessages()).toHaveLength(2);

      // WHEN: Clearing messages
      helper.clearMessages();

      // THEN: Messages are cleared
      expect(helper.getMessages()).toHaveLength(0);
    });
  });

  describe('close', () => {
    test('[P0] should close WebSocket connection', async () => {
      // GIVEN: Connected WebSocket
      const helper = new WebSocketTestHelper('ws://localhost:8080/ws');
      await helper.connect();

      // WHEN: Closing connection
      await helper.close();

      // THEN: WebSocket is closed (subsequent send fails)
      await expect(helper.send('test', {})).rejects.toThrow();
    });

    test('[P1] should handle close on unconnected helper', async () => {
      // GIVEN: Unconnected WebSocket helper
      const helper = new WebSocketTestHelper('ws://localhost:8080/ws');

      // WHEN/THEN: Close doesn't throw
      await expect(helper.close()).resolves.toBeUndefined();
    });
  });
});

describe('createWebSocketHelper', () => {
  test('[P0] should create helper instance', () => {
    // GIVEN: WebSocket URL
    const wsUrl = 'ws://localhost:8080/ws';

    // WHEN: Creating helper
    const helper = createWebSocketHelper(wsUrl);

    // THEN: Helper is created
    expect(helper).toBeInstanceOf(WebSocketTestHelper);
  });
});
