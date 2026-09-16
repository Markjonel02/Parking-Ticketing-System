// server/src/utils/secretCrypto.js
//
// Password-based AES-256-CBC encryption for secrets-at-rest (e.g. the
// JWT signing secret sitting in a .env file). Derives the AES key from
// a master password via PBKDF2 with a random salt, and stores
// salt:iv:ciphertext together (all Base64) so decryption only needs the
// master password and the stored blob.
//
// Adapted from a synchronous cipher.update()/final() flow — the original
// event-based (`cipher.on('data', ...)`) version this was based on
// returns before the 'end' event necessarily fires, which is fragile.
// Using update()/final() directly is the correct, deterministic way to
// do this for in-memory strings.
import crypto from 'crypto';

const PBKDF2_ITERATIONS = 210_000; // OWASP 2023+ minimum for PBKDF2-SHA256
const KEY_LENGTH = 32; // AES-256
const SALT_LENGTH = 32;
const IV_LENGTH = 16;
const DIGEST = 'sha256';
const ALGORITHM = 'aes-256-cbc';

function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, DIGEST);
}

/**
 * Encrypts `plaintext` with a key derived from `password`.
 * Returns "saltBase64:ivBase64:ciphertextBase64".
 */
export function encryptWithPassword(password, plaintext) {
  if (!password) throw new Error('encryptWithPassword: a master password is required.');

  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(password, salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);

  return [salt.toString('base64'), iv.toString('base64'), ciphertext.toString('base64')].join(':');
}

/**
 * Reverses encryptWithPassword. Throws if the password is wrong or the
 * blob is malformed/corrupted (AES-CBC padding check fails loudly rather
 * than silently returning garbage).
 */
export function decryptWithPassword(password, blob) {
  if (!password) throw new Error('decryptWithPassword: a master password is required.');
  if (!blob || blob.split(':').length !== 3) {
    throw new Error('decryptWithPassword: malformed ciphertext blob (expected "salt:iv:ciphertext").');
  }

  const [saltB64, ivB64, ciphertextB64] = blob.split(':');
  const salt = Buffer.from(saltB64, 'base64');
  const iv = Buffer.from(ivB64, 'base64');
  const ciphertext = Buffer.from(ciphertextB64, 'base64');
  const key = deriveKey(password, salt);

  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext.toString('utf8');
  } catch (err) {
    throw new Error('decryptWithPassword: decryption failed — wrong master password or corrupted data.');
  }
}

export default { encryptWithPassword, decryptWithPassword };
