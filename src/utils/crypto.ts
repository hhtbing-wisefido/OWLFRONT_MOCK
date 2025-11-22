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
 * Normalization rules (for user-friendly experience):
 * - ALL accounts (username/email/phone): Convert to lowercase before hashing
 *   This ensures consistent hash regardless of user input case (e.g., "S1" vs "s1" → same hash)
 *   Humans often make case mistakes, so this provides better UX
 * - Phone numbers: toLowerCase() has no effect (they're numeric), but applied for consistency
 * - Password: Keep as-is (passwords are case-sensitive)
 * 
 * @param account The account (username/email/phone) - will be normalized to lowercase
 * @param password The password (case-sensitive)
 * @returns Promise<string> The hex-encoded hash of normalized_account + password
 */
export async function hashAccountPassword(account: string, password: string): Promise<string> {
  // Normalize account to lowercase for consistent hashing
  // This ensures "S1" and "s1" produce the same hash (better UX, humans make case mistakes)
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
 * Normalization rules (for user-friendly experience):
 * - ALL accounts (username/email/phone): Convert to lowercase before hashing
 *   This ensures consistent hash regardless of user input case (e.g., "S1" vs "s1" → same hash)
 *   Humans often make case mistakes, so this provides better UX
 * - Phone numbers: toLowerCase() has no effect (they're numeric), but applied for consistency
 * 
 * @param account The account (username/email/phone) - will be normalized to lowercase
 * @returns Promise<string> The hex-encoded hash of normalized account
 */
export async function hashAccount(account: string): Promise<string> {
  // Normalize account to lowercase for consistent hashing
  // This ensures "S1" and "s1" produce the same hash (better UX, humans make case mistakes)
  // Phone numbers are numeric, so toLowerCase() has no effect on them, but applied for consistency
  const normalized = account.trim().toLowerCase()
  return sha256(normalized)
}

