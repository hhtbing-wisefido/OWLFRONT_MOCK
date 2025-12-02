/**
 * Service Level API data model definition
 * Corresponds to service_level table structure in owlRD/db/service_level.sql
 */

/**
 * Service Level data model
 */
export interface ServiceLevel {
  level_code: string // e.g., 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'
  name: string // Display name, e.g., 'Independent', 'Assisted'
  color: string // Color code, e.g., 'green', 'blue', 'yellow', 'orange', 'red', 'purple', 'gray'
  priority?: number // 1=lowest risk, 6=highest risk
}

/**
 * Get service level list response
 */
export interface GetServiceLevelsResult {
  items: ServiceLevel[]
  total: number
}

