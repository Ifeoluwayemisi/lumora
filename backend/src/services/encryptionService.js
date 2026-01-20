import crypto from "crypto";

const ENCRYPTION_ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");

/**
 * Encrypt sensitive data
 * @param {string} data - Data to encrypt
 * @returns {string} Encrypted data (IV:encryptedData)
 */
export function encryptData(data) {
  try {
    if (!data) return null;

    // Create IV
    const iv = crypto.randomBytes(16);

    // Create cipher
    const key = Buffer.from(ENCRYPTION_KEY, "hex");
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

    // Encrypt
    let encrypted = cipher.update(data, "utf-8", "hex");
    encrypted += cipher.final("hex");

    // Return IV + encrypted (separated by colon)
    return `${iv.toString("hex")}:${encrypted}`;
  } catch (err) {
    console.error("[ENCRYPTION] Error encrypting data:", err.message);
    throw new Error("Encryption failed");
  }
}

/**
 * Decrypt sensitive data
 * @param {string} encryptedData - Encrypted data (IV:encryptedData format)
 * @returns {string} Decrypted data
 */
export function decryptData(encryptedData) {
  try {
    if (!encryptedData) return null;

    // Split IV and encrypted data
    const [ivHex, encrypted] = encryptedData.split(":");
    if (!ivHex || !encrypted) {
      throw new Error("Invalid encrypted data format");
    }

    // Get key and IV
    const key = Buffer.from(ENCRYPTION_KEY, "hex");
    const iv = Buffer.from(ivHex, "hex");

    // Create decipher
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);

    // Decrypt
    let decrypted = decipher.update(encrypted, "hex", "utf-8");
    decrypted += decipher.final("utf-8");

    return decrypted;
  } catch (err) {
    console.error("[DECRYPTION] Error decrypting data:", err.message);
    throw new Error("Decryption failed");
  }
}

/**
 * Hash a password (for storing)
 * @param {string} password - Password to hash
 * @returns {string} Hashed password
 */
export function hashPassword(password) {
  try {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, "sha512")
      .toString("hex");
    return `${salt}:${hash}`;
  } catch (err) {
    console.error("[HASH] Error hashing password:", err.message);
    throw new Error("Hashing failed");
  }
}

/**
 * Verify a password against hash
 * @param {string} password - Password to verify
 * @param {string} hash - Hash to verify against
 * @returns {boolean} True if password matches hash
 */
export function verifyPassword(password, hash) {
  try {
    if (!hash) return false;

    const [salt, originalHash] = hash.split(":");
    if (!salt || !originalHash) return false;

    const newHash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, "sha512")
      .toString("hex");

    return newHash === originalHash;
  } catch (err) {
    console.error("[VERIFY] Error verifying password:", err.message);
    return false;
  }
}

/**
 * Generate a secure random token
 * @param {number} length - Token length in bytes
 * @returns {string} Random token
 */
export function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Hash a token (for storing token hashes in DB)
 * @param {string} token - Token to hash
 * @returns {string} Token hash
 */
export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Encrypt API key for storage
 * @param {string} apiKey - API key to encrypt
 * @returns {string} Encrypted API key
 */
export function encryptApiKey(apiKey) {
  try {
    const encrypted = encryptData(apiKey);
    return encrypted;
  } catch (err) {
    console.error(
      "[API_KEY_ENCRYPTION] Error encrypting API key:",
      err.message,
    );
    throw err;
  }
}

/**
 * Decrypt API key from storage
 * @param {string} encryptedKey - Encrypted API key
 * @returns {string} Decrypted API key
 */
export function decryptApiKey(encryptedKey) {
  try {
    const decrypted = decryptData(encryptedKey);
    return decrypted;
  } catch (err) {
    console.error(
      "[API_KEY_DECRYPTION] Error decrypting API key:",
      err.message,
    );
    throw err;
  }
}

/**
 * Encrypt 2FA secret
 * @param {string} secret - 2FA secret
 * @returns {string} Encrypted secret
 */
export function encrypt2FASecret(secret) {
  return encryptData(secret);
}

/**
 * Decrypt 2FA secret
 * @param {string} encryptedSecret - Encrypted 2FA secret
 * @returns {string} Decrypted secret
 */
export function decrypt2FASecret(encryptedSecret) {
  return decryptData(encryptedSecret);
}

/**
 * Encrypt payment information (though ideally shouldn't be stored)
 * @param {string} paymentInfo - Payment info
 * @returns {string} Encrypted payment info
 */
export function encryptPaymentInfo(paymentInfo) {
  return encryptData(paymentInfo);
}

/**
 * Decrypt payment information
 * @param {string} encryptedInfo - Encrypted payment info
 * @returns {string} Decrypted payment info
 */
export function decryptPaymentInfo(encryptedInfo) {
  return decryptData(encryptedInfo);
}

/**
 * Mask sensitive data for logging
 * @param {string} data - Data to mask
 * @param {number} showChars - Number of characters to show (default 4)
 * @returns {string} Masked data
 */
export function maskSensitiveData(data, showChars = 4) {
  if (!data || data.length <= showChars) return "****";
  return (
    data.substring(0, showChars) +
    "*".repeat(Math.max(0, data.length - showChars))
  );
}

/**
 * Verify encryption key is configured
 */
export function verifyEncryptionKey() {
  if (!process.env.ENCRYPTION_KEY) {
    console.warn(
      "[ENCRYPTION] No ENCRYPTION_KEY in environment - using random key (keys will not persist across restarts)",
    );
    return false;
  }
  return true;
}

/**
 * Generate a new encryption key (run this once and save to .env)
 */
export function generateEncryptionKey() {
  const key = crypto.randomBytes(32).toString("hex");
  console.log(
    "[ENCRYPTION] New encryption key (add to .env as ENCRYPTION_KEY):",
  );
  console.log(key);
  return key;
}
