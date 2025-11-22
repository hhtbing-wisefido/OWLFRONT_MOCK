/**
 * Vital Focus Cards 测试数据
 * 对应 src/api/monitor/model/monitorModel.ts
 * 
 * 测试数据基于现有的测试账号：
 * - Staff: S1, S2, S3 (对应机构: Sunset, Golden, Winds)
 * - Resident: R1, R2, R3 (对应机构: Sunset, Golden, Winds)
 * 
 * ========================================
 * 报警数据说明
 * ========================================
 * 
 * 报警项数据来源：alarm_events 表
 * - unhandled_alarms_count: 统计 alarm_status='active' 且 alarm_level IN ('1','ALERT','2','CRIT','4','WARNING') 的记录数
 * - unhandled_alarms_level: 取最高级别的报警
 *   * 1 (ALERT): 最高级别，显示 "Alarm (数量)"
 *   * 2 (CRIT): 严重级别，显示 "Alert (数量)"
 *   * 4 (WARNING): 警告级别，显示 "Alert (数量)"
 * - alarms 数组: 包含具体的报警项，每个报警项对应 alarm_events 表的一条记录
 *   * event_id: UUID (对应 alarm_events.event_id)
 *   * event_type: 事件类型 (对应 alarm_events.event_type，如 'Fall', 'Radar_AbnormalHeartRate' 等)
 *   * alarm_level: 报警级别 (对应 alarm_events.alarm_level: '1'/'ALERT', '2'/'CRIT', '4'/'WARNING')
 *   * alarm_status: 报警状态 (对应 alarm_events.alarm_status: 'active', 'acknowledged')
 *   * triggered_at: 触发时间 (对应 alarm_events.triggered_at)
 * 
 * 显示逻辑：
 * - 如果 unhandled_alarms_level === 1 (ALERT): 显示红色 "Alarm (数量)"
 * - 如果 unhandled_alarms_level === 2 (CRIT) 或 4 (WARNING): 显示黄色 "Alert (数量)"
 * - 如果 unhandled_alarms_count === 0: 显示灰色图标，不显示报警条
 * 
 * ========================================
 * 测试卡片汇总（方便统一修改）
 * ========================================
 * 
 * Card 1: ActiveBed - R1 (Sunset)
 *   - card_id: UUID (see below)
 *   - card_name: 'Smith'
 *   - card_address: 'A - E203 - BedA'
 *   - tenant_id: institutions.sunset.id
 *   - resident: R1 (Smith, L2)
 *   - devices: Radar-001, Sleepace-001 (both online)
 *   - status: in bed, light sleep, HR: 72, RR: 18
 * 
 * Card 2: ActiveBed - R2 (Golden)
 *   - card_id: UUID (see below)
 *   - card_name: 'Johnson'
 *   - card_address: 'B - F305 - BedB'
 *   - tenant_id: institutions.golden.id
 *   - resident: R2 (Johnson, L3)
 *   - devices: Radar-002 (online), no sleepace
 *   - status: in bed, awake, HR: 85, RR: 20
 *   - alarms: 1个 CRIT(2) 级别报警
 *     * 右上角图标: 橙色（CRIT级别，在icon_alarm_level=3阈值内）
 *     * 下端弹出: 不显示（pop_alarm_emerge=0，CRIT级别不弹出）
 * 
 * Card 3: ActiveBed - R3 (Winds)
 *   - card_id: UUID (see below)
 *   - card_name: 'Williams'
 *   - card_address: 'C - G401 - BedC'
 *   - tenant_id: institutions.winds.id
 *   - resident: R3 (Williams, L1)
 *   - devices: Sleepace-003 (offline)
 *   - status: not in bed, device offline
 * 
 * Card 4: Location - MultiPerson (Sunset)
 *   - card_id: UUID (see below)
 *   - card_name: 'E203'
 *   - card_address: 'A - E203'
 *   - tenant_id: institutions.sunset.id
 *   - residents: R1 (Smith, L2), R4 (Brown, L4)
 *   - devices: Radar-004 (online)
 *   - status: 2 persons, both lying
 *   - alarms: 2个 ALERT(1) 级别报警
 *     * 右上角图标: 红色（ALERT级别，在icon_alarm_level=3阈值内）
 *     * 下端弹出: 显示最新报警 "Fall Handle"（pop_alarm_emerge=1，ALERT级别会弹出）
 *   - 报警项来源: alarm_events 表 (alarm_status='active', alarm_level IN ('1','ALERT','2','CRIT','4','WARNING'))
 * 
 * Card 5: Location - PublicSpace (Golden)
 *   - card_id: UUID (see below)
 *   - card_name: 'Lobby'
 *   - card_address: 'B - Lobby'
 *   - tenant_id: institutions.golden.id
 *   - residents: none (public space)
 *   - devices: Radar-005 (online)
 *   - status: 0 persons, no alarms
 */

import type {
  VitalFocusCard,
  CardResident,
  CardDevice,
  ServiceLevelInfo,
  GetVitalFocusCardsModel,
} from '@/api/monitor/model/monitorModel'
import { institutions } from '../login/data'

/**
 * Backend Pagination Type (duplicated here to avoid import issues in test data)
 * This matches the definition in src/api/model/pagination.ts
 */
interface BackendPagination {
  size: number
  page: number
  count: number
  sort: string
  direction: number
}

/**
 * Service Level 定义（对应 service_levels 表）
 */
export const serviceLevels: Record<string, ServiceLevelInfo> = {
  L1: {
    level_code: 'L1',
    display_name: 'Independent',
    display_name_cn: '无需协助',
    color_tag: 'green',
    color_hex: '#28a745',
    priority: 1,
  },
  L2: {
    level_code: 'L2',
    display_name: 'Assisted',
    display_name_cn: '需部分协助',
    color_tag: 'blue',
    color_hex: '#007bff',
    priority: 2,
  },
  L3: {
    level_code: 'L3',
    display_name: 'Memory care',
    display_name_cn: '记忆护理',
    color_tag: 'yellow',
    color_hex: '#ffc107',
    priority: 3,
  },
  L4: {
    level_code: 'L4',
    display_name: 'Fall-risk',
    display_name_cn: '跌倒风险',
    color_tag: 'orange',
    color_hex: '#fd7e14',
    priority: 4,
  },
  L5: {
    level_code: 'L5',
    display_name: 'Vital Risk',
    display_name_cn: '生命体征风险',
    color_tag: 'red',
    color_hex: '#dc3545',
    priority: 5,
  },
  L6: {
    level_code: 'L6',
    display_name: 'Critical',
    display_name_cn: '危重症',
    color_tag: 'red',
    color_hex: '#c82333',
    priority: 6,
  },
}

/**
 * 测试住户数据（对应 residents 表）
 */
export const testResidents = {
  // Sunset 机构的住户
  r1: {
    resident_id: 'resident-r1-001',
    last_name: 'Smith',
    first_name: 'John',
    nickname: 'Smith',
    service_level: 'L2',
    service_level_info: serviceLevels.L2,
    tenant_id: institutions.sunset.id,
  },
  // Golden 机构的住户
  r2: {
    resident_id: 'resident-r2-001',
    last_name: 'Johnson',
    first_name: 'Mary',
    nickname: 'Johnson',
    service_level: 'L3',
    service_level_info: serviceLevels.L3,
    tenant_id: institutions.golden.id,
  },
  // Winds 机构的住户
  r3: {
    resident_id: 'resident-r3-001',
    last_name: 'Williams',
    first_name: 'Robert',
    nickname: 'Williams',
    service_level: 'L1',
    service_level_info: serviceLevels.L1,
    tenant_id: institutions.winds.id,
  },
  // 额外的测试住户（用于多人房间场景）
  r4: {
    resident_id: 'resident-r4-001',
    last_name: 'Brown',
    first_name: 'Alice',
    nickname: 'Brown',
    service_level: 'L4',
    service_level_info: serviceLevels.L4,
    tenant_id: institutions.sunset.id,
  },
}

/**
 * 测试卡片数据
 */

// Card 1: ActiveBed - R1 (Sunset) - 单人房间，有雷达和睡眠监测设备
export const card1_ActiveBed_R1: VitalFocusCard = {
  card_id: '100e8400-e29b-41d4-a716-446655440001', // UUID
  tenant_id: institutions.sunset.id, // UUID
  card_type: 'ActiveBed',
  bed_id: 'bed-001',
  location_id: 'location-001',
  card_name: 'Smith', // 使用 last_name
  card_address: 'A - E203 - BedA', // building简写 + location_name + BedName (English, 带空格)
  primary_resident_id: testResidents.r1.resident_id,
  residents: [
    {
      resident_id: testResidents.r1.resident_id,
      last_name: testResidents.r1.last_name,
      first_name: testResidents.r1.first_name,
      nickname: testResidents.r1.nickname,
      service_level: testResidents.r1.service_level,
      service_level_info: testResidents.r1.service_level_info,
    },
  ],
  devices: [
    {
      device_id: 'device-radar-001',
      device_name: 'Radar-001',
      device_type: 2, // radar
      device_model: 'Radar-V2',
      binding_type: 'direct',
    },
    {
      device_id: 'device-sleepace-001',
      device_name: 'Sleepace-001',
      device_type: 1, // sleepace
      device_model: 'Sleepace-Pro',
      binding_type: 'direct',
    },
  ],
  device_count: 2,
  resident_count: 1,
  // 未处理报警统计（5个级别）
  unhandled_alarm_0: 0, // EMERG(0)
  unhandled_alarm_1: 0, // ALERT(1)
  unhandled_alarm_2: 0, // CRIT(2)
  unhandled_alarm_3: 0, // ERR(3)
  unhandled_alarm_4: 0, // WARNING(4)
  total_unhandled_alarms: 0,
  // 报警显示控制
  icon_alarm_level: 3, // 默认 3 (ERR)
  pop_alarm_emerge: 0, // 默认 0 (EMERG)
  r_connection: 1, // online
  s_connection: 1, // online
  breath: 18,
  heart: 72,
  bed_status: 0, // in bed
  timestamp: Date.now() - 3600000, // 1 hour ago
  sleep_stage: 2, // light sleep
  heart_source: 'sleepace',
  breath_source: 'sleepace',
  person_count: 1,
  postures: [],
  alarms: [],
}

// Card 2: ActiveBed - R2 (Golden) - 单人房间，只有雷达设备
export const card2_ActiveBed_R2: VitalFocusCard = {
  card_id: '200e8400-e29b-41d4-a716-446655440002', // UUID
  tenant_id: institutions.golden.id, // UUID
  card_type: 'ActiveBed',
  bed_id: 'bed-002',
  location_id: 'location-002',
  card_name: 'Johnson',
  card_address: 'B - F305 - BedB', // building简写 + location_name + BedName (English, 带空格)
  primary_resident_id: testResidents.r2.resident_id,
  residents: [
    {
      resident_id: testResidents.r2.resident_id,
      last_name: testResidents.r2.last_name,
      first_name: testResidents.r2.first_name,
      nickname: testResidents.r2.nickname,
      service_level: testResidents.r2.service_level,
      service_level_info: testResidents.r2.service_level_info,
    },
  ],
  devices: [
    {
      device_id: 'device-radar-002',
      device_name: 'Radar-002',
      device_type: 2,
      device_model: 'Radar-V2',
      binding_type: 'direct',
    },
  ],
  device_count: 1,
  resident_count: 1,
  // 未处理报警统计（5个级别）
  unhandled_alarm_0: 0, // EMERG(0)
  unhandled_alarm_1: 0, // ALERT(1)
  unhandled_alarm_2: 1, // CRIT(2) - 1个CRIT级别报警
  unhandled_alarm_3: 0, // ERR(3)
  unhandled_alarm_4: 0, // WARNING(4)
  total_unhandled_alarms: 1,
  // 报警显示控制
  icon_alarm_level: 3, // 默认 3 (ERR)
  pop_alarm_emerge: 0, // 默认 0 (EMERG) - CRIT级别不会弹出
  r_connection: 1,
  s_connection: 0, // no sleepace
  breath: 20,
  heart: 85,
  bed_status: 0,
  timestamp: Date.now() - 1800000, // 30 minutes ago
  sleep_stage: 1, // awake
  heart_source: 'radar',
  breath_source: 'radar',
  person_count: 1,
  postures: [],
  alarms: [
    {
      event_id: 'alarm-event-001',
      event_type: 'Radar_AbnormalHeartRate',
      alarm_level: 2, // CRIT(2) 级别报警
      alarm_status: 'active',
      triggered_at: Date.now() - 600000, // 10 minutes ago
    },
  ],
}

// Card 3: ActiveBed - R3 (Winds) - 单人房间，设备离线
export const card3_ActiveBed_R3: VitalFocusCard = {
  card_id: '300e8400-e29b-41d4-a716-446655440003', // UUID
  tenant_id: institutions.winds.id, // UUID
  card_type: 'ActiveBed',
  bed_id: 'bed-003',
  location_id: 'location-003',
  card_name: 'Williams',
  card_address: 'C - G401 - BedC', // building简写 + location_name + BedName (English, 带空格)
  primary_resident_id: testResidents.r3.resident_id,
  residents: [
    {
      resident_id: testResidents.r3.resident_id,
      last_name: testResidents.r3.last_name,
      first_name: testResidents.r3.first_name,
      nickname: testResidents.r3.nickname,
      service_level: testResidents.r3.service_level,
      service_level_info: testResidents.r3.service_level_info,
    },
  ],
  devices: [
    {
      device_id: 'device-sleepace-003',
      device_name: 'Sleepace-003',
      device_type: 1,
      device_model: 'Sleepace-Pro',
      binding_type: 'direct',
    },
  ],
  device_count: 1,
  resident_count: 1,
  // 未处理报警统计（5个级别）
  unhandled_alarm_0: 0, // EMERG(0)
  unhandled_alarm_1: 0, // ALERT(1)
  unhandled_alarm_2: 0, // CRIT(2)
  unhandled_alarm_3: 0, // ERR(3)
  unhandled_alarm_4: 0, // WARNING(4)
  total_unhandled_alarms: 0,
  // 报警显示控制
  icon_alarm_level: 3, // 默认 3 (ERR)
  pop_alarm_emerge: 0, // 默认 0 (EMERG)
  r_connection: 0, // no radar
  s_connection: 0, // offline
  breath: 0,
  heart: 0,
  bed_status: 1, // not in bed
  timestamp: Date.now() - 7200000, // 2 hours ago
  sleep_stage: 0,
  heart_source: '',
  breath_source: '',
  person_count: 0,
  postures: [],
  alarms: [],
}

// Card 4: Location - 多人房间（Sunset）- 有未绑床的设备
export const card4_Location_MultiPerson: VitalFocusCard = {
  card_id: '400e8400-e29b-41d4-a716-446655440004', // UUID
  tenant_id: institutions.sunset.id, // UUID
  card_type: 'Location',
  location_id: 'location-004',
  card_name: 'E203', // 多人房间显示 location_name
  card_address: 'A - E203', // building简写 + location_name (English, 带空格)
  primary_resident_id: undefined, // Location 卡片没有 primary_resident_id
  residents: [
    {
      resident_id: testResidents.r1.resident_id,
      last_name: testResidents.r1.last_name,
      service_level: testResidents.r1.service_level,
      service_level_info: testResidents.r1.service_level_info,
    },
    {
      resident_id: testResidents.r4.resident_id,
      last_name: testResidents.r4.last_name,
      service_level: testResidents.r4.service_level,
      service_level_info: testResidents.r4.service_level_info,
    },
  ],
  devices: [
    {
      device_id: 'device-radar-004',
      device_name: 'Radar-004',
      device_type: 2,
      device_model: 'Radar-V2',
      binding_type: 'indirect', // 未绑床的设备
    },
  ],
  device_count: 1,
  resident_count: 2,
  // 未处理报警统计（5个级别）
  unhandled_alarm_0: 0, // EMERG(0)
  unhandled_alarm_1: 2, // ALERT(1) - 2个ALERT级别报警
  unhandled_alarm_2: 0, // CRIT(2)
  unhandled_alarm_3: 0, // ERR(3)
  unhandled_alarm_4: 0, // WARNING(4)
  total_unhandled_alarms: 2,
  // 报警显示控制
  icon_alarm_level: 3, // 默认 3 (ERR)
  pop_alarm_emerge: 1, // 设置为 1 (ALERT) - ALERT级别会弹出
  r_connection: 1,
  s_connection: 0,
  timestamp: Date.now() - 900000, // 15 minutes ago
  person_count: 2,
  postures: [6, 6], // both lying
  alarms: [
    {
      event_id: 'alarm-event-002',
      event_type: 'Fall',
      alarm_level: 1, // ALERT(1) 级别报警
      alarm_status: 'active',
      triggered_at: Date.now() - 300000, // 5 minutes ago
    },
    {
      event_id: 'alarm-event-003',
      event_type: 'Radar_AbnormalRespiratoryRate',
      alarm_level: 1, // ALERT(1) 级别报警
      alarm_status: 'active',
      triggered_at: Date.now() - 180000, // 3 minutes ago
    },
  ],
}

// Card 5: Location - 公共空间（Golden）- 大厅
export const card5_Location_PublicSpace: VitalFocusCard = {
  card_id: '500e8400-e29b-41d4-a716-446655440005', // UUID
  tenant_id: institutions.golden.id, // UUID
  card_type: 'Location',
  location_id: 'location-005',
  card_name: 'Lobby', // 公共空间显示 location_name (English)
  card_address: 'B - Lobby', // building简写 + location_name (English, 带空格)
  primary_resident_id: undefined,
  residents: [], // 公共空间没有住户
  devices: [
    {
      device_id: 'device-radar-005',
      device_name: 'Radar-005',
      device_type: 2,
      device_model: 'Radar-V2',
      binding_type: 'indirect',
    },
  ],
  device_count: 1,
  resident_count: 0,
  // 未处理报警统计（5个级别）
  unhandled_alarm_0: 0, // EMERG(0)
  unhandled_alarm_1: 0, // ALERT(1)
  unhandled_alarm_2: 0, // CRIT(2)
  unhandled_alarm_3: 0, // ERR(3)
  unhandled_alarm_4: 0, // WARNING(4)
  total_unhandled_alarms: 0,
  // 报警显示控制
  icon_alarm_level: 3, // 默认 3 (ERR)
  pop_alarm_emerge: 0, // 默认 0 (EMERG)
  r_connection: 1,
  s_connection: 0,
  timestamp: Date.now() - 600000, // 10 minutes ago
  person_count: 0,
  postures: [],
  alarms: [],
}

/**
 * 所有测试卡片
 */
export const allTestCards: VitalFocusCard[] = [
  card1_ActiveBed_R1,
  card2_ActiveBed_R2,
  card3_ActiveBed_R3,
  card4_Location_MultiPerson,
  card5_Location_PublicSpace,
]

/**
 * 根据 tenant_id 获取卡片列表
 */
export function getCardsByTenant(tenantId: string): VitalFocusCard[] {
  return allTestCards.filter((card) => card.tenant_id === tenantId)
}

/**
 * 生成分页响应
 */
export function generateCardsResponse(
  cards: VitalFocusCard[],
  page: number = 1,
  pageSize: number = 10,
): GetVitalFocusCardsModel {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginatedCards = cards.slice(start, end)

  const pagination: BackendPagination = {
    size: pageSize,
    page: page,
    count: cards.length,
    sort: '',
    direction: 0,
  }

  return {
    items: paginatedCards,
    timestamp: Date.now(),
    pagination,
  }
}

