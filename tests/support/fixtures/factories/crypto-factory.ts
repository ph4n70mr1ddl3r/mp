import { faker } from '@faker-js/faker';

/**
 * Cryptographic test data factory
 * Generates valid-looking cryptographic keys for testing
 * NOTE: These are NOT real cryptographic keys - only for UI testing
 */

export interface CryptographicKeyPair {
  privateKey: string;
  publicKey: string;
  signature: string;
}

export class CryptographicKeyPairFactory {
  /**
   * Generate a new key pair for testing
   * In real implementation, would use ed25519-dalek to generate actual keys
   */
  generate(): CryptographicKeyPair {
    const privateKey = this.generatePrivateKey();
    const publicKey = this.derivePublicKey(privateKey);
    const signature = this.generateSignature();

    return {
      privateKey,
      publicKey,
      signature,
    };
  }

  /**
   * Generate a test private key
   * Format: 64 hexadecimal characters (32 bytes)
   */
  private generatePrivateKey(): string {
    const bytes = new Array(32).fill(0).map(() => faker.number.int({ min: 0, max: 255 }));
    return '0x' + bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Derive public key from private key
   * In real implementation, would use cryptographic derivation
   */
  private derivePublicKey(privateKey: string): string {
    // For testing, generate a deterministic but different key
    const bytes = new Array(32).fill(0).map((_, i) => {
      const privByte = parseInt(privateKey.slice(2 + i * 2, 4 + i * 2), 16);
      return (privByte + 128) % 256;
    });
    return '0x' + bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate a test signature
   * Format: 128 hexadecimal characters (64 bytes)
   */
  private generateSignature(): string {
    const bytes = new Array(64).fill(0).map(() => faker.number.int({ min: 0, max: 255 }));
    return '0x' + bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate multiple key pairs
   */
  generateMany(count: number): CryptographicKeyPair[] {
    return Array.from({ length: count }, () => this.generate());
  }
}

export class CryptographicKeyPair {
  private factory = new CryptographicKeyPairFactory();

  async getKeyPair(): Promise<CryptographicKeyPair> {
    return this.factory.generate();
  }

  async getMultiple(count: number): Promise<CryptographicKeyPair[]> {
    return this.factory.generateMany(count);
  }
}
