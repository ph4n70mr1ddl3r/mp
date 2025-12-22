/**
 * Cryptographic test helpers
 * Utilities for working with cryptographic keys and signatures in tests
 */

export class CryptoTestHelpers {
  /**
   * Validate that a key looks like a valid hex key
   */
  static isValidHexKey(key: string): boolean {
    return /^0x[0-9a-fA-F]+$/.test(key);
  }

  /**
   * Validate Ed25519 public key format (32 bytes = 64 hex chars + 0x prefix)
   */
  static isValidPublicKey(publicKey: string): boolean {
    return /^0x[0-9a-fA-F]{64}$/.test(publicKey);
  }

  /**
   * Validate Ed25519 private key format (32 bytes = 64 hex chars + 0x prefix)
   */
  static isValidPrivateKey(privateKey: string): boolean {
    return /^0x[0-9a-fA-F]{64}$/.test(privateKey);
  }

  /**
   * Validate signature format (64 bytes = 128 hex chars + 0x prefix)
   */
  static isValidSignature(signature: string): boolean {
    return /^0x[0-9a-fA-F]{128}$/.test(signature);
  }

  /**
   * Extract the hex portion (without 0x prefix)
   */
  static strip0x(key: string): string {
    return key.startsWith('0x') ? key.slice(2) : key;
  }

  /**
   * Add 0x prefix if not present
   */
  static add0x(key: string): string {
    return key.startsWith('0x') ? key : `0x${key}`;
  }

  /**
   * Validate a message signature pair
   */
  static validateSignature(
    publicKey: string,
    message: string,
    signature: string
  ): boolean {
    return (
      this.isValidPublicKey(publicKey) &&
      typeof message === 'string' &&
      this.isValidSignature(signature)
    );
  }

  /**
   * Generate a deterministic signature for testing
   * In real tests, would use actual cryptographic signing
   */
  static generateTestSignature(publicKey: string, message: string): string {
    // Simple hash for testing purposes
    const input = `${publicKey}:${message}`;
    const hash = this.simpleHash(input);
    return `0x${hash}`;
  }

  /**
   * Simple hash function for test purposes
   * NOT cryptographically secure
   */
  private static simpleHash(input: string): string {
    let hash = '';
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash + char).toString(16);
    }
    // Pad to 128 hex chars (64 bytes)
    return hash.padStart(128, '0').slice(0, 128);
  }
}
