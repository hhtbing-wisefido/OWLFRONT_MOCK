/**
 * Residents API Mock 函数
 * 对应 src/api/resident/resident.ts
 * 用于开发环境模拟后端 API 响应
 */

import type {
  GetResidentsParams,
  GetResidentsResult,
  GetResidentParams,
  CreateResidentParams,
  CreateResidentResult,
  UpdateResidentParams,
  UpdateResidentPHIParams,
  UpdateResidentContactParams,
  Resident,
} from '@/api/resident/model/residentModel'
import { mockResidentsData } from './data'
import { delay } from '../../utils/generator'

// 模拟内存存储（用于模拟创建、更新、删除操作）
let residentsStore: Resident[] = [...mockResidentsData]
let nextResidentId = 4 // 下一个可用的住户ID

/**
 * Mock: 获取住户列表
 * 对应 getResidentsApi
 */
export async function mockGetResidents(params?: GetResidentsParams): Promise<GetResidentsResult> {
  // 模拟网络延迟
  await delay(300)

  let filteredResidents = [...residentsStore]

  // 如果有搜索关键词，进行过滤
  if (params?.search && params.search.trim()) {
    const searchLower = params.search.toLowerCase().trim()
    filteredResidents = residentsStore.filter((resident) => {
      return (
        resident.nickname?.toLowerCase().includes(searchLower) ||
        resident.unit_name?.toLowerCase().includes(searchLower) ||
        resident.location_tag?.toLowerCase().includes(searchLower)
      )
    })
  }

  // 如果有状态筛选，进行过滤
  if (params?.status) {
    filteredResidents = filteredResidents.filter((resident) => resident.status === params.status)
  }

  // 如果有护理级别筛选，进行过滤
  if (params?.service_level) {
    filteredResidents = filteredResidents.filter(
      (resident) => resident.service_level === params.service_level
    )
  }

  return {
    items: filteredResidents,
    total: filteredResidents.length,
  }
}

/**
 * Mock: 获取住户详情
 * 对应 getResidentApi
 */
export async function mockGetResident(
  residentId: string,
  params?: GetResidentParams,
): Promise<Resident> {
  // 模拟网络延迟
  await delay(300)

  const resident = residentsStore.find((r) => r.resident_id === residentId)
  if (!resident) {
    throw new Error(`Resident with ID "${residentId}" not found`)
  }

  // 如果需要包含 PHI 数据
  if (params?.include_phi) {
    resident.phi = {
      // Add PHI fields as needed
      resident_id: residentId,
    }
  }

  // 如果需要包含联系人数据
  if (params?.include_contacts) {
    // Contacts are already included in mock data
  }

  return { ...resident }
}

/**
 * Mock: 创建住户
 * 对应 createResidentApi
 */
export async function mockCreateResident(params: CreateResidentParams): Promise<CreateResidentResult> {
  // 模拟网络延迟
  await delay(500)

  // 创建新住户
  const newResident: Resident = {
    resident_id: String(nextResidentId++),
    tenant_id: '550e8400-e29b-41d4-a716-446655440000', // Default tenant
    resident_account: params.resident_account || `R${String(nextResidentId - 1).padStart(3, '0')}`,
    nickname: params.nickname,
    email: params.email,
    phone: params.phone,
    status: params.status || 'active',
    service_level: params.service_level,
    admission_date: params.admission_date,
    unit_id: params.unit_id,
    note: params.note,
    contacts: [],
  }

  residentsStore.push(newResident)

  return {
    resident_id: newResident.resident_id,
  }
}

/**
 * Mock: 更新住户
 * 对应 updateResidentApi
 */
export async function mockUpdateResident(
  residentId: string,
  params: UpdateResidentParams,
): Promise<void> {
  // 模拟网络延迟
  await delay(500)

  const residentIndex = residentsStore.findIndex((r) => r.resident_id === residentId)
  if (residentIndex === -1) {
    throw new Error(`Resident with ID "${residentId}" not found`)
  }

  // 更新住户信息
  residentsStore[residentIndex] = {
    ...residentsStore[residentIndex],
    ...params,
  }
}

/**
 * Mock: 删除住户
 * 对应 deleteResidentApi
 */
export async function mockDeleteResident(residentId: string): Promise<void> {
  // 模拟网络延迟
  await delay(500)

  const residentIndex = residentsStore.findIndex((r) => r.resident_id === residentId)
  if (residentIndex === -1) {
    throw new Error(`Resident with ID "${residentId}" not found`)
  }

  // 删除住户
  residentsStore.splice(residentIndex, 1)
}

/**
 * Mock: 更新住户 PHI
 * 对应 updateResidentPHIApi
 */
export async function mockUpdateResidentPHI(
  residentId: string,
  params: UpdateResidentPHIParams,
): Promise<void> {
  // 模拟网络延迟
  await delay(500)

  const residentIndex = residentsStore.findIndex((r) => r.resident_id === residentId)
  if (residentIndex === -1) {
    throw new Error(`Resident with ID "${residentId}" not found`)
  }

  // 更新 PHI 数据
  residentsStore[residentIndex].phi = {
    ...residentsStore[residentIndex].phi,
    ...params,
  }
}

/**
 * Mock: 更新住户联系人
 * 对应 updateResidentContactApi
 */
export async function mockUpdateResidentContact(
  residentId: string,
  params: UpdateResidentContactParams,
): Promise<void> {
  // 模拟网络延迟
  await delay(500)

  const residentIndex = residentsStore.findIndex((r) => r.resident_id === residentId)
  if (residentIndex === -1) {
    throw new Error(`Resident with ID "${residentId}" not found`)
  }

  const resident = residentsStore[residentIndex]
  if (!resident.contacts) {
    resident.contacts = []
  }

  // 如果提供了 contact_id，更新现有联系人
  if (params.contact_id) {
    const contactIndex = resident.contacts.findIndex((c) => c.contact_id === params.contact_id)
    if (contactIndex !== -1) {
      resident.contacts[contactIndex] = {
        ...resident.contacts[contactIndex],
        ...params,
      }
    } else {
      // 如果找不到，添加为新联系人
      resident.contacts.push({
        resident_id: residentId,
        ...params,
      })
    }
  } else {
    // 添加新联系人
    resident.contacts.push({
      resident_id: residentId,
      ...params,
    })
  }
}

