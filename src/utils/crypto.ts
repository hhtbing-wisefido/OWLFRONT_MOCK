/**
 * Cryptographic utility functions
 * For secure password hashing and account identification
 */

/**
 * Simple hash function fallback for non-secure contexts
 * Note: This is NOT cryptographically secure, only for development/demo
 */
function simpleHash(text: string): string {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  // Convert to hex string (64 chars to match SHA-256 length)
  const hex = Math.abs(hash).toString(16).padStart(8, '0')
  return hex.repeat(8) // 64 chars total
}

/**
 * Hash a string using SHA-256 (with fallback for non-secure contexts)
 * @param text The text to hash
 * @returns Promise<string> The hex-encoded hash
 */
export async function sha256(text: string): Promise<string> {
  // Check if crypto.subtle is available (HTTPS or localhost only)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(text)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
      return hashHex
    } catch (error) {
      console.warn('[crypto] crypto.subtle.digest failed, using fallback hash:', error)
      return simpleHash(text)
    }
  } else {
    // Fallback for non-secure contexts (HTTP + IP address)
    console.warn('[crypto] crypto.subtle not available (non-secure context), using fallback hash')
    return simpleHash(text)
  }
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

/**
 * Hash password only (independent of account/phone/email)
 * Used for contact password_hash which should only depend on password itself
 * 
 * @param password The password (case-sensitive)
 * @returns Promise<string> The hex-encoded hash of password
 */
export async function hashPassword(password: string): Promise<string> {
  // Password hash only depends on password itself: SHA256(password)
  return sha256(password)
}

