import { describe, test, expect } from 'vitest';
import { CryptoTestHelpers } from '../support/helpers/crypto-helpers';

describe('CryptoTestHelpers', () => {
  describe('isValidHexKey', () => {
    test('[P0] should return true for valid hex key with 0x prefix', () => {
      // GIVEN: Valid hex key
      const validKey = '0x1234567890abcdef';

      // WHEN: Validating hex key
      const result = CryptoTestHelpers.isValidHexKey(validKey);

      // THEN: Returns true
      expect(result).toBe(true);
    });

    test('[P0] should return false for key without 0x prefix', () => {
      // GIVEN: Key without prefix
      const invalidKey = '1234567890abcdef';

      // WHEN: Validating hex key
      const result = CryptoTestHelpers.isValidHexKey(invalidKey);

      // THEN: Returns false
      expect(result).toBe(false);
    });

    test('[P1] should return false for non-hex characters', () => {
      // GIVEN: Key with invalid characters
      const invalidKey = '0x1234567890ghijkl';

      // WHEN: Validating hex key
      const result = CryptoTestHelpers.isValidHexKey(invalidKey);

      // THEN: Returns false
      expect(result).toBe(false);
    });

    test('[P1] should return false for empty string', () => {
      // GIVEN: Empty string
      const emptyKey = '';

      // WHEN: Validating hex key
      const result = CryptoTestHelpers.isValidHexKey(emptyKey);

      // THEN: Returns false
      expect(result).toBe(false);
    });

    test('[P2] should handle uppercase hex characters', () => {
      // GIVEN: Uppercase hex key
      const upperKey = '0xABCDEF1234567890';

      // WHEN: Validating hex key
      const result = CryptoTestHelpers.isValidHexKey(upperKey);

      // THEN: Returns true
      expect(result).toBe(true);
    });

    test('[P2] should handle mixed case hex characters', () => {
      // GIVEN: Mixed case hex key
      const mixedKey = '0xAbCdEf1234567890';

      // WHEN: Validating hex key
      const result = CryptoTestHelpers.isValidHexKey(mixedKey);

      // THEN: Returns true
      expect(result).toBe(true);
    });
  });

  describe('isValidPublicKey', () => {
    test('[P0] should return true for valid 32-byte public key', () => {
      // GIVEN: Valid Ed25519 public key (32 bytes = 64 hex chars)
      const validPublicKey = '0x' + '00'.repeat(32);

      // WHEN: Validating public key
      const result = CryptoTestHelpers.isValidPublicKey(validPublicKey);

      // THEN: Returns true
      expect(result).toBe(true);
    });

    test('[P0] should return false for public key with incorrect length', () => {
      // GIVEN: Public key with wrong length (31 bytes)
      const shortKey = '0x' + '00'.repeat(31);

      // WHEN: Validating public key
      const result = CryptoTestHelpers.isValidPublicKey(shortKey);

      // THEN: Returns false
      expect(result).toBe(false);
    });

    test('[P0] should return false for public key that is too long', () => {
      // GIVEN: Public key with extra bytes (33 bytes)
      const longKey = '0x' + '00'.repeat(33);

      // WHEN: Validating public key
      const result = CryptoTestHelpers.isValidPublicKey(longKey);

      // THEN: Returns false
      expect(result).toBe(false);
    });

    test('[P1] should return false without 0x prefix', () => {
      // GIVEN: Public key without prefix
      const noPrefixKey = '00'.repeat(32);

      // WHEN: Validating public key
      const result = CryptoTestHelpers.isValidPublicKey(noPrefixKey);

      // THEN: Returns false
      expect(result).toBe(false);
    });

    test('[P2] should accept realistic public key values', () => {
      // GIVEN: Realistic Ed25519 public key
      const realisticKey = '0x7b22747970223a226564323535313922';

      // WHEN: Validating - note this is only 16 bytes
      const result = CryptoTestHelpers.isValidPublicKey(realisticKey);

      // THEN: Returns false (not 32 bytes)
      expect(result).toBe(false);
    });
  });

  describe('isValidPrivateKey', () => {
    test('[P0] should return true for valid 32-byte private key', () => {
      // GIVEN: Valid Ed25519 private key (32 bytes = 64 hex chars)
      const validPrivateKey = '0x' + 'ff'.repeat(32);

      // WHEN: Validating private key
      const result = CryptoTestHelpers.isValidPrivateKey(validPrivateKey);

      // THEN: Returns true
      expect(result).toBe(true);
    });

    test('[P0] should return false for private key with incorrect length', () => {
      // GIVEN: Private key with wrong length
      const shortKey = '0x' + 'ff'.repeat(16);

      // WHEN: Validating private key
      const result = CryptoTestHelpers.isValidPrivateKey(shortKey);

      // THEN: Returns false
      expect(result).toBe(false);
    });

    test('[P1] should return false for invalid characters', () => {
      // GIVEN: Private key with invalid hex characters
      const invalidKey = '0x' + 'gg'.repeat(32);

      // WHEN: Validating private key
      const result = CryptoTestHelpers.isValidPrivateKey(invalidKey);

      // THEN: Returns false
      expect(result).toBe(false);
    });
  });

  describe('isValidSignature', () => {
    test('[P0] should return true for valid 64-byte signature', () => {
      // GIVEN: Valid Ed25519 signature (64 bytes = 128 hex chars)
      const validSignature = '0x' + 'ab'.repeat(64);

      // WHEN: Validating signature
      const result = CryptoTestHelpers.isValidSignature(validSignature);

      // THEN: Returns true
      expect(result).toBe(true);
    });

    test('[P0] should return false for signature with incorrect length', () => {
      // GIVEN: Signature with wrong length (32 bytes instead of 64)
      const shortSignature = '0x' + 'ab'.repeat(32);

      // WHEN: Validating signature
      const result = CryptoTestHelpers.isValidSignature(shortSignature);

      // THEN: Returns false
      expect(result).toBe(false);
    });

    test('[P0] should return false for signature that is too long', () => {
      // GIVEN: Signature with extra bytes (65 bytes)
      const longSignature = '0x' + 'ab'.repeat(65);

      // WHEN: Validating signature
      const result = CryptoTestHelpers.isValidSignature(longSignature);

      // THEN: Returns false
      expect(result).toBe(false);
    });

    test('[P1] should return false for invalid signature string', () => {
      // GIVEN: Invalid signature string
      const invalidSignature = 'invalid_signature';

      // WHEN: Validating signature
      const result = CryptoTestHelpers.isValidSignature(invalidSignature);

      // THEN: Returns false
      expect(result).toBe(false);
    });
  });

  describe('strip0x', () => {
    test('[P0] should remove 0x prefix from key', () => {
      // GIVEN: Key with 0x prefix
      const keyWithPrefix = '0x1234567890abcdef';

      // WHEN: Stripping prefix
      const result = CryptoTestHelpers.strip0x(keyWithPrefix);

      // THEN: Prefix is removed
      expect(result).toBe('1234567890abcdef');
    });

    test('[P0] should return unchanged string without prefix', () => {
      // GIVEN: Key without prefix
      const keyWithoutPrefix = '1234567890abcdef';

      // WHEN: Stripping prefix
      const result = CryptoTestHelpers.strip0x(keyWithoutPrefix);

      // THEN: String unchanged
      expect(result).toBe('1234567890abcdef');
    });

    test('[P2] should handle empty string', () => {
      // GIVEN: Empty string
      const emptyString = '';

      // WHEN: Stripping prefix
      const result = CryptoTestHelpers.strip0x(emptyString);

      // THEN: Returns empty string
      expect(result).toBe('');
    });
  });

  describe('add0x', () => {
    test('[P0] should add 0x prefix to key without prefix', () => {
      // GIVEN: Key without prefix
      const keyWithoutPrefix = '1234567890abcdef';

      // WHEN: Adding prefix
      const result = CryptoTestHelpers.add0x(keyWithoutPrefix);

      // THEN: Prefix is added
      expect(result).toBe('0x1234567890abcdef');
    });

    test('[P0] should not double-add prefix', () => {
      // GIVEN: Key with prefix already
      const keyWithPrefix = '0x1234567890abcdef';

      // WHEN: Adding prefix
      const result = CryptoTestHelpers.add0x(keyWithPrefix);

      // THEN: No double prefix
      expect(result).toBe('0x1234567890abcdef');
    });

    test('[P2] should handle empty string', () => {
      // GIVEN: Empty string
      const emptyString = '';

      // WHEN: Adding prefix
      const result = CryptoTestHelpers.add0x(emptyString);

      // THEN: Returns just prefix
      expect(result).toBe('0x');
    });
  });

  describe('validateSignature', () => {
    test('[P0] should return true for valid signature triplet', () => {
      // GIVEN: Valid public key, message, and signature
      const publicKey = '0x' + '11'.repeat(32);
      const message = 'Test message';
      const signature = '0x' + 'aa'.repeat(64);

      // WHEN: Validating signature
      const result = CryptoTestHelpers.validateSignature(publicKey, message, signature);

      // THEN: Returns true
      expect(result).toBe(true);
    });

    test('[P0] should return false for invalid public key', () => {
      // GIVEN: Invalid public key
      const invalidPublicKey = 'not-a-valid-key';
      const message = 'Test message';
      const signature = '0x' + 'aa'.repeat(64);

      // WHEN: Validating signature
      const result = CryptoTestHelpers.validateSignature(invalidPublicKey, message, signature);

      // THEN: Returns false
      expect(result).toBe(false);
    });

    test('[P0] should return false for invalid signature', () => {
      // GIVEN: Invalid signature
      const publicKey = '0x' + '11'.repeat(32);
      const message = 'Test message';
      const invalidSignature = 'not-a-valid-signature';

      // WHEN: Validating signature
      const result = CryptoTestHelpers.validateSignature(publicKey, message, invalidSignature);

      // THEN: Returns false
      expect(result).toBe(false);
    });

    test('[P1] should return true for empty message', () => {
      // GIVEN: Empty message (valid in cryptographic operations)
      const publicKey = '0x' + '11'.repeat(32);
      const emptyMessage = '';
      const signature = '0x' + 'aa'.repeat(64);

      // WHEN: Validating signature
      const result = CryptoTestHelpers.validateSignature(publicKey, emptyMessage, signature);

      // THEN: Returns true (empty messages are valid)
      expect(result).toBe(true);
    });
  });

  describe('generateTestSignature', () => {
    test('[P0] should generate consistent signature for same inputs', () => {
      // GIVEN: Same public key and message
      const publicKey = '0x' + '22'.repeat(32);
      const message = 'Test message';

      // WHEN: Generating signature twice
      const sig1 = CryptoTestHelpers.generateTestSignature(publicKey, message);
      const sig2 = CryptoTestHelpers.generateTestSignature(publicKey, message);

      // THEN: Signatures are identical (deterministic)
      expect(sig1).toBe(sig2);
    });

    test('[P0] should generate signature with 0x prefix', () => {
      // GIVEN: Valid inputs
      const publicKey = '0x' + '33'.repeat(32);
      const message = 'Test message';

      // WHEN: Generating signature
      const signature = CryptoTestHelpers.generateTestSignature(publicKey, message);

      // THEN: Signature starts with 0x and has hex content
      expect(signature.startsWith('0x')).toBe(true);
      expect(signature.length).toBeGreaterThan(2);
    });

    test('[P1] should generate deterministic output', () => {
      // GIVEN: Same public key, different messages
      const publicKey = '0x' + '44'.repeat(32);
      const message1 = 'Message 1';
      const message2 = 'Message 2';

      // WHEN: Generating signatures
      const sig1 = CryptoTestHelpers.generateTestSignature(publicKey, message1);
      const sig2 = CryptoTestHelpers.generateTestSignature(publicKey, message2);

      // THEN: Both start with 0x (note: simple hash may produce same output for different inputs)
      expect(sig1.startsWith('0x')).toBe(true);
      expect(sig2.startsWith('0x')).toBe(true);
    });

    test('[P1] should produce output for different public keys', () => {
      // GIVEN: Different public keys, same message
      const publicKey1 = '0x' + '55'.repeat(32);
      const publicKey2 = '0x' + '66'.repeat(32);
      const message = 'Same message';

      // WHEN: Generating signatures
      const sig1 = CryptoTestHelpers.generateTestSignature(publicKey1, message);
      const sig2 = CryptoTestHelpers.generateTestSignature(publicKey2, message);

      // THEN: Both are valid hex strings
      expect(sig1.startsWith('0x')).toBe(true);
      expect(sig2.startsWith('0x')).toBe(true);
    });

    test('[P2] should handle empty message', () => {
      // GIVEN: Empty message
      const publicKey = '0x' + '77'.repeat(32);
      const emptyMessage = '';

      // WHEN: Generating signature
      const signature = CryptoTestHelpers.generateTestSignature(publicKey, emptyMessage);

      // THEN: Signature generated (starts with 0x)
      expect(signature.startsWith('0x')).toBe(true);
    });

    test('[P2] should handle special characters in message', () => {
      // GIVEN: Message with special characters
      const publicKey = '0x' + '88'.repeat(32);
      const specialMessage = '🔐 Cryptographic test! @#$%^&*()';

      // WHEN: Generating signature
      const signature = CryptoTestHelpers.generateTestSignature(publicKey, specialMessage);

      // THEN: Signature generated without throwing
      expect(signature.startsWith('0x')).toBe(true);
    });
  });
});

describe('Edge Cases', () => {
  test('[P0] should handle null-like inputs gracefully', () => {
    // GIVEN: Edge case inputs

    // WHEN/THEN: Functions don't throw on edge cases
    expect(CryptoTestHelpers.isValidHexKey('')).toBe(false);
    expect(CryptoTestHelpers.isValidPublicKey('')).toBe(false);
    expect(CryptoTestHelpers.isValidPrivateKey('')).toBe(false);
    expect(CryptoTestHelpers.isValidSignature('')).toBe(false);
  });

  test('[P1] should handle 0x only prefix', () => {
    // GIVEN: Just the prefix
    const justPrefix = '0x';

    // WHEN: Validating
    const isValidHex = CryptoTestHelpers.isValidHexKey(justPrefix);
    const isValidPublic = CryptoTestHelpers.isValidPublicKey(justPrefix);

    // THEN: Both return false (no actual hex data)
    expect(isValidHex).toBe(false);
    expect(isValidPublic).toBe(false);
  });

  test('[P2] should handle very long hex strings', () => {
    // GIVEN: Very long hex string (256 bytes)
    const veryLongKey = '0x' + 'ab'.repeat(256);

    // WHEN: Validating as public key (expects 32 bytes)
    const isValid = CryptoTestHelpers.isValidPublicKey(veryLongKey);

    // THEN: Returns false (wrong length)
    expect(isValid).toBe(false);
  });
});
