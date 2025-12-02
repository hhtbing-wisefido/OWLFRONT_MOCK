/**
 * Service Level API data model definition
 * Corresponds to service_level table structure in owlRD/db/service_level.sql
 */

/**
 * Service Level data model
 * Corresponds to service_levels table structure in owlRD/db/20_service_levels.sql
 */
export interface ServiceLevel {
  level_code: string // e.g., 'Independent', 'Assisted', 'MemoryCare', 'FallRisk', 'VitalRisk', 'Critical'
  description?: string // Detailed description
  color: string // Color code, e.g., 'green', 'blue', 'yellow', 'orange', 'red', 'purple', 'gray'
  color_hex?: string // Hexadecimal color value, e.g., '#28a745', '#007bff'
  priority?: number // 1=lowest risk, 6=highest risk
  name?: string // Display name (legacy field, may not be used)
}

/**
 * Get service level list response
 */
export interface GetServiceLevelsResult {
  items: ServiceLevel[]
  total: number
}

