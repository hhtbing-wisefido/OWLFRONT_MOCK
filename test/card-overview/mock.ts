/**
 * Card Overview Mock Functions
 * For testing card overview API
 */

import type {
  GetCardOverviewParams,
  GetCardOverviewResult,
} from '@/api/card-overview/model/cardOverviewModel'
import { mockCardOverviewItems, generateCardOverviewResult } from './data'
import { delay } from '../utils/generator'

/**
 * Mock: Get Card Overview API
 */
export async function mockGetCardOverview(
  params?: GetCardOverviewParams,
): Promise<GetCardOverviewResult> {
  await delay(300)

  let filteredItems = [...mockCardOverviewItems]

  // Filter by search
  if (params?.search) {
    const searchLower = params.search.toLowerCase()
    filteredItems = filteredItems.filter(
      (item) =>
        item.card_name?.toLowerCase().includes(searchLower) ||
        item.card_address?.toLowerCase().includes(searchLower),
    )
  }

  // Filter by unit_type
  if (params?.unit_type) {
    filteredItems = filteredItems.filter((item) => item.unit_type === params.unit_type)
  }

  // Filter by is_multi_person_room
  if (params?.is_multi_person_room !== undefined) {
    filteredItems = filteredItems.filter(
      (item) => item.is_multi_person_room === params.is_multi_person_room,
    )
  }

  // Filter by is_public_space
  if (params?.is_public_space !== undefined) {
    filteredItems = filteredItems.filter(
      (item) => item.is_public_space === params.is_public_space,
    )
  }

  // Filter by family_view
  if (params?.family_view !== undefined) {
    filteredItems = filteredItems.filter((item) => item.family_view === params.family_view)
  }

  // Pagination
  const page = params?.page || 1
  const pageSize = params?.size || 10

  return generateCardOverviewResult(filteredItems, page, pageSize)
}

