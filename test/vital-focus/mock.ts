/**
 * Vital Focus Cards Mock API
 * 模拟后端 API 返回测试数据
 */

import { delay } from '../utils/generator'
import type { GetVitalFocusCardsModel, VitalFocusCardInfo } from '@/api/monitor/model/monitorModel'
import type { SaveVitalFocusSelectionParams, SaveVitalFocusSelectionResult } from '@/api/monitor/monitor'
import {
  allTestCards,
  getCardsByTenant,
  generateCardsResponse,
  card1_ActiveBed_R1,
  card2_ActiveBed_R2,
  card3_ActiveBed_R3,
} from './data'

/**
 * Mock: 获取 Vital Focus Cards 列表
 * 
 * @param params 查询参数（可选）
 *   - tenant_id: 机构 ID（过滤条件）
 *   - page: 页码（默认 1）
 *   - pageSize: 每页数量（默认 10）
 */
export async function mockGetVitalFocusCards(
  params?: Record<string, any>,
): Promise<GetVitalFocusCardsModel> {
  await delay(300) // 模拟网络延迟

  // 如果指定了 tenant_id，只返回该机构的卡片
  let cards = allTestCards
  if (params?.tenant_id) {
    cards = getCardsByTenant(params.tenant_id)
  }

  // 分页处理
  const page = params?.page || 1
  const pageSize = params?.pageSize || 10

  return generateCardsResponse(cards, page, pageSize)
}

/**
 * Mock: 根据 Resident ID 获取卡片
 */
export async function mockGetVitalFocusCardByResident(
  residentId: string,
): Promise<VitalFocusCardInfo> {
  await delay(200)

  // 查找包含该住户的卡片
  const card = allTestCards.find(
    (c) =>
      c.primary_resident_id === residentId ||
      c.residents.some((r) => r.resident_id === residentId),
  )

  if (!card) {
    throw new Error(`Card not found for resident: ${residentId}`)
  }

  // 转换为 VitalFocusCardInfo（不包含实时数据）
  return {
    card_id: card.card_id,
    tenant_id: card.tenant_id,
    card_type: card.card_type,
    bed_id: card.bed_id,
    location_id: card.location_id,
    card_name: card.card_name,
    card_address: card.card_address,
    primary_resident_id: card.primary_resident_id,
    residents: card.residents,
    devices: card.devices,
  }
}

/**
 * Mock: 根据 Card ID 获取卡片详情
 */
export async function mockGetVitalFocusCardDetail(
  cardId: string,
): Promise<VitalFocusCardInfo> {
  await delay(200)

  const card = allTestCards.find((c) => c.card_id === cardId)

  if (!card) {
    throw new Error(`Card not found: ${cardId}`)
  }

  // 转换为 VitalFocusCardInfo
  return {
    card_id: card.card_id,
    tenant_id: card.tenant_id,
    card_type: card.card_type,
    bed_id: card.bed_id,
    location_id: card.location_id,
    card_name: card.card_name,
    card_address: card.card_address,
    primary_resident_id: card.primary_resident_id,
    residents: card.residents,
    devices: card.devices,
  }
}

/**
 * Mock: 保存 Vital Focus 卡片选择
 */
export async function mockSaveVitalFocusSelection(
  params: SaveVitalFocusSelectionParams,
): Promise<SaveVitalFocusSelectionResult> {
  await delay(400) // 模拟网络延迟

  console.log('%c[Mock] Save Vital Focus Selection', 'color: #52c41a; font-weight: bold', {
    selected_card_ids: params.selected_card_ids,
    count: params.selected_card_ids.length,
  })

  // 模拟保存成功
  return {
    success: true,
    message: 'Focus selection saved successfully',
  }
}

