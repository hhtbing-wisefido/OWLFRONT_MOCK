/**
 * Cryptographic utility functions
 * For secure password hashing and account identification
 */

/**
 * Hash a string using SHA-256
 * @param text The text to hash
 * @returns Promise<string> The hex-encoded hash
 */
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * Create a secure identifier for account + password combination
 * Used to distinguish accounts with same username but different passwords
 * 
 * Security: This hash is sent to backend instead of plain password
 * Backend can compare this hash with stored hash to identify the account
 * 
 * Normalization rules:
 * - Username: Convert to lowercase (case-insensitive)
 * - Email: Convert to lowercase (case-insensitive, standard practice)
 * - Phone: Keep as-is (phone numbers are not case-sensitive)
 * - Password: Keep as-is (passwords are case-sensitive)
 * 
 * @param account The account (username/email/phone)
 * @param password The password (case-sensitive)
 * @returns Promise<string> The hex-encoded hash of account + password
 */
export async function hashAccountPassword(account: string, password: string): Promise<string> {
  // Normalize account: lowercase for username/email, keep phone as-is
  // Password remains case-sensitive
  // Format: normalized_account:password
  const normalizedAccount = account.trim().toLowerCase()
  const combined = `${normalizedAccount}:${password}`
  return sha256(combined)
}

/**
 * Hash account for institution search
 * Backend uses this to query email_hash or phone_hash in database
 * 
 * Normalization rules:
 * - Username: Convert to lowercase (case-insensitive)
 * - Email: Convert to lowercase (case-insensitive, standard practice)
 * - Phone: Keep as-is (phone numbers are not case-sensitive)
 * 
 * @param account The account (username/email/phone)
 * @returns Promise<string> The hex-encoded hash
 */
export async function hashAccount(account: string): Promise<string> {
  // Normalize: lowercase for username/email, keep phone as-is
  // Phone numbers are numeric, so toLowerCase() has no effect on them
  // This ensures consistent hash calculation for username and email
  const normalized = account.trim().toLowerCase()
  return sha256(normalized)
}

