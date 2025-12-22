import { faker } from '@faker-js/faker';
import { CryptoTestHelpers } from '../../helpers/crypto-helpers';

export interface TestMessage {
  content: string;
  senderPublicKey: string;
  signature: string;
  timestamp?: string;
}

/**
 * Message Factory for creating test messages with signatures
 */
export class MessageFactory {
  /**
   * Create a signed message
   */
  createMessage(senderPublicKey: string, overrides: Partial<TestMessage> = {}): TestMessage {
    const message: TestMessage = {
      content: overrides.content || this.generateMessageContent(),
      senderPublicKey,
      signature: this.generateSignature(senderPublicKey, overrides.content || ''),
      timestamp: new Date().toISOString(),
      ...overrides,
    };

    return message;
  }

  /**
   * Generate random message content
   */
  private generateMessageContent(): string {
    const messageTypes = [
      () => faker.lorem.sentence(),
      () => faker.lorem.paragraph(),
      () => faker.hacker.phrase(),
      () => faker.company.buzzPhrase(),
      () => `${faker.word.adjective()} ${faker.word.noun()}`,
    ];

    const type = faker.helpers.arrayElement(messageTypes);
    return type();
  }

  /**
   * Generate a signature for a message
   */
  private generateSignature(publicKey: string, content: string): string {
    // In real implementation, would use actual cryptographic signing
    // For testing, generate a deterministic signature
    return CryptoTestHelpers.generateTestSignature(publicKey, content);
  }

  /**
   * Create multiple messages from the same sender
   */
  createMessages(senderPublicKey: string, count: number): TestMessage[] {
    return Array.from({ length: count }, () => this.createMessage(senderPublicKey));
  }

  /**
   * Create messages from multiple senders
   */
  createMessagesFromMultipleSenders(
    senders: Array<{ publicKey: string; messageCount: number }>
  ): TestMessage[] {
    const messages: TestMessage[] = [];

    senders.forEach(sender => {
      const senderMessages = this.createMessages(sender.publicKey, sender.messageCount);
      messages.push(...senderMessages);
    });

    return messages;
  }

  /**
   * Create a message with invalid signature (for testing rejection)
   */
  createMessageWithInvalidSignature(senderPublicKey: string): TestMessage {
    return {
      content: this.generateMessageContent(),
      senderPublicKey,
      signature: '0x' + '00'.repeat(128), // Invalid signature
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create a tampered message (valid signature for different content)
   */
  createTamperedMessage(senderPublicKey: string, originalContent: string): TestMessage {
    // Generate signature for original content
    const validSignature = this.generateSignature(senderPublicKey, originalContent);

    // But use different content (tampering)
    return {
      content: this.generateMessageContent(),
      senderPublicKey,
      signature: validSignature, // Signature doesn't match new content
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Validate message signature
   */
  validateMessage(message: TestMessage): boolean {
    return CryptoTestHelpers.validateSignature(
      message.senderPublicKey,
      message.content,
      message.signature
    );
  }
}
