/**
 * WebSocket test helpers
 * Utilities for testing real-time WebSocket communication
 */

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: string;
}

export class WebSocketTestHelper {
  private ws: WebSocket | null = null;
  private messages: WebSocketMessage[] = [];
  private callbacks: Array<(message: WebSocketMessage) => void> = [];

  constructor(private wsUrl: string) {}

  /**
   * Connect to WebSocket
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.messages.push(message);
          this.callbacks.forEach(cb => cb(message));
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
      };
    });
  }

  /**
   * Send a message via WebSocket
   */
  async send(type: string, data: any): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    const message: WebSocketMessage = {
      type,
      data,
      timestamp: new Date().toISOString(),
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Wait for a specific message type
   */
  async waitForMessage(messageType: string, timeout = 5000): Promise<WebSocketMessage> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Timeout waiting for message type: ${messageType}`));
      }, timeout);

      const callback = (message: WebSocketMessage) => {
        if (message.type === messageType) {
          clearTimeout(timeoutId);
          this.callbacks = this.callbacks.filter(cb => cb !== callback);
          resolve(message);
        }
      };

      this.callbacks.push(callback);
    });
  }

  /**
   * Get all received messages
   */
  getMessages(): WebSocketMessage[] {
    return [...this.messages];
  }

  /**
   * Get messages of a specific type
   */
  getMessagesByType(type: string): WebSocketMessage[] {
    return this.messages.filter(msg => msg.type === type);
  }

  /**
   * Clear all received messages
   */
  clearMessages(): void {
    this.messages = [];
  }

  /**
   * Close WebSocket connection
   */
  async close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.ws) {
        this.ws.onclose = () => {
          console.log('WebSocket closed');
          resolve();
        };
        this.ws.close();
        this.ws = null;
      } else {
        resolve();
      }
    });
  }
}

/**
 * Create a WebSocket test helper instance
 */
export function createWebSocketHelper(wsUrl: string): WebSocketTestHelper {
  return new WebSocketTestHelper(wsUrl);
}
