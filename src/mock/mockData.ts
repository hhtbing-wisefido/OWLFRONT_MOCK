import type { VitalFocusCard } from '@/api/monitors/model/monitorModel'

/**
 * HIPAA合规声明：
 * 本文件包含的所有数据均为测试/演示用途的模拟数据
 * 不包含任何真实的受保护健康信息(PHI)
 * 所有姓名、ID、生理数据均为随机生成
 */

// 生成随机数辅助函数
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const randomChoice = <T>(arr: T[]): T => {
  if (arr.length === 0) throw new Error('Array cannot be empty')
  return arr[Math.floor(Math.random() * arr.length)]!
}

// 测试用姓名（HIPAA合规 - 非真实患者信息）
// 使用"Demo"前缀明确标识为演示数据，适合商业宣传使用
const lastNames = ['Demo-Smith', 'Demo-Johnson', 'Demo-Williams', 'Demo-Brown', 'Demo-Jones', 'Demo-Garcia', 'Demo-Miller', 'Demo-Davis', 'Demo-Martinez', 'Demo-Wilson']
const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'Michael', 'Linda', 'William', 'Barbara', 'David', 'Elizabeth']

// 服务等级配置
const serviceLevels = [
  { code: 'L1', name: 'Independent', color: '#28a745', priority: 1 },
  { code: 'L2', name: 'Assisted', color: '#007bff', priority: 2 },
  { code: 'L3', name: 'Memory Care', color: '#ffc107', priority: 3 },
  { code: 'L4', name: 'Skilled Nursing', color: '#ff9800', priority: 4 },
  { code: 'L5', name: 'Hospice', color: '#f44336', priority: 5 }
]

// Location卡片位置名称
const locationNames = [
  { name: 'Living Room 1F', address: 'Building A / 1F Living Room', floor: 1 },
  { name: 'Dining Room 1F', address: 'Building A / 1F Dining Room', floor: 1 },
  { name: 'Corridor 2F', address: 'Building B / 2F Corridor', floor: 2 },
  { name: 'Bathroom 2F', address: 'Building B / 2F Bathroom', floor: 2 },
  { name: 'Activity Room 3F', address: 'Building C / 3F Activity Room', floor: 3 },
  { name: 'Reading Room 3F', address: 'Building C / 3F Reading Room', floor: 3 },
  { name: 'Garden Lounge', address: 'Building D / 1F Garden Lounge', floor: 1 },
  { name: 'Therapy Room 2F', address: 'Building D / 2F Therapy Room', floor: 2 },
  { name: 'Hallway 4F', address: 'Building E / 4F Hallway', floor: 4 },
  { name: 'Cafe Corner', address: 'Building E / 1F Cafe Corner', floor: 1 }
]

// 生成100个Mock卡片数据 (90个ActiveBed + 10个Location)
function generateMockCards(): VitalFocusCard[] {
  const cards: VitalFocusCard[] = []
  const buildings = ['Building A', 'Building B', 'Building C', 'Building D', 'Building E']
  
  // 生成90个ActiveBed卡片
  for (let i = 0; i < 90; i++) {
    const cardId = `card_${String(i + 1).padStart(3, '0')}`
    const building = buildings[Math.floor(i / 20)]
    const floor = Math.floor((i % 20) / 4) + 1
    const room = (i % 4) + 1
    const roomNumber = `${floor}0${room}`
    
    // 居民信息
    const lastName = randomChoice(lastNames)
    const firstName = randomChoice(firstNames)
    const serviceLevel = randomChoice(serviceLevels)
    
    // 设备配置 (需求: 所有设备都在线,不要离线示例)
    // 大部分是双设备,少数单设备
    const hasSleepace = Math.random() > 0.05  // 95%有Sleepace
    const hasRadar = Math.random() > 0.15     // 85%有Radar
    
    const devices = []
    if (hasSleepace) {
      devices.push({
        device_id: `sleepace_${cardId}`,
        device_name: `Sleepace ${roomNumber}`,
        device_type: 1,
        device_model: 'SleepacePro',
        binding_type: 'direct' as const
      })
    }
    if (hasRadar) {
      devices.push({
        device_id: `radar_${cardId}`,
        device_name: `Radar ${roomNumber}`,
        device_type: 2,
        device_model: 'TI AWR1843',
        binding_type: 'direct' as const
      })
    }
    
    // 设备连接状态 (所有设备都在线)
    const s_connection = hasSleepace ? 1 : 0
    const r_connection = hasRadar ? 1 : 0
    
    // 决定卡片状态类型
    let bedStatus = 0  // 默认在床
    let sleepStage = 2 // 默认浅睡眠
    let heart = randomInt(65, 80)
    let breath = randomInt(14, 18)
    let personCount = 1
    let postures: number[] = []
    let hasAlarm = false
    let alarmLevel = 3
    
    // 随机分配状态场景 (模拟真实情况,各种状态混合分布)
    const rand = Math.random()
    
    if (rand < 0.45) {
      // 45%: 正常睡眠 (Deep Sleep / Light Sleep)
      bedStatus = 0  // 在床
      sleepStage = Math.random() > 0.6 ? 2 : 4  // 60%浅睡眠, 40%深睡眠
      heart = randomInt(55, 70)
      breath = randomInt(12, 16)
      personCount = 1
      // 【测试】睡眠时显示躺姿图标（posture=6）
      postures = [6]
    } else if (rand < 0.58) {
      // 13%: 清醒状态 (Awake in bed)
      bedStatus = 0  // 在床
      sleepStage = 1
      heart = randomInt(70, 85)
      breath = randomInt(14, 20)
      personCount = 1
      // 清醒状态90%有姿势图标，行走和站立姿势增加
      const hasPosture = Math.random() < 0.9
      if (hasPosture) {
        const postureRand = Math.random()
        if (postureRand < 0.25) postures = [3]      // 坐着 sitting 25%
        else if (postureRand < 0.50) postures = [4] // 站立 stand 25%
        else if (postureRand < 0.75) postures = [1] // 行走 walk 25%
        else postures = [6]                          // 躺着 lying 25%
      } else {
        postures = []  // 10%无姿势
      }
    } else if (rand < 0.70) {
      // 12%: 离床状态 (Out of bed) ⭐ 新增场景
      bedStatus = 1  // 离床
      sleepStage = 1  // 离床时默认清醒
      heart = randomInt(75, 90)
      breath = randomInt(15, 22)
      // 离床时：60%有姿态（人在房间但不在床上），40%无姿态（人已离开）
      const hasPosture = Math.random() < 0.6
      personCount = hasPosture ? 1 : 0
      if (hasPosture) {
        // 🔴 离床时的姿态：只能是站立、行走，不能坐着或躺着！
        const postureRand = Math.random()
        if (postureRand < 0.5) postures = [4]   // 站立 standing 50%
        else postures = [1]                      // 行走 walking 50%
      } else {
        postures = []  // 人已离开房间，无姿态
        personCount = 0
      }
    } else if (rand < 0.82) {
      // 12%: 报警场景 (心率或呼吸异常)
      hasAlarm = true
      bedStatus = 0
      sleepStage = 1
      
      const alarmType = Math.random()
      if (alarmType < 0.15) {
        // 15%: 心率极高 - EMERG (level 0)
        heart = randomInt(140, 180)
        breath = randomInt(20, 25)
        alarmLevel = 0
      } else if (alarmType < 0.35) {
        // 20%: 心率过高 - ALERT (level 1)
        heart = randomInt(105, 139)
        breath = randomInt(15, 20)
        alarmLevel = 1
      } else if (alarmType < 0.50) {
        // 15%: 心率过低 - ALERT (level 1)
        heart = randomInt(38, 48)
        breath = randomInt(12, 16)
        alarmLevel = 1
      } else if (alarmType < 0.65) {
        // 15%: 呼吸异常严重 - CRIT (level 2)
        heart = randomInt(70, 85)
        breath = Math.random() > 0.5 ? randomInt(30, 40) : randomInt(4, 7)
        alarmLevel = 2
      } else if (alarmType < 0.85) {
        // 20%: 呼吸异常一般 - ERR (level 3)
        heart = randomInt(70, 85)
        breath = Math.random() > 0.5 ? randomInt(26, 29) : randomInt(8, 9)
        alarmLevel = 3
      } else {
        // 15%: 轻微异常 - WARNING (level 4)
        heart = randomInt(95, 104)
        breath = randomInt(21, 24)
        alarmLevel = 4
      }
      personCount = 1
      postures = [6]  // 报警时显示躺姿图标（人在床上）
    } else if (rand < 0.92) {
      // 10%: 访客场景 (person_count > 1)
      bedStatus = 0
      sleepStage = 1
      heart = randomInt(70, 85)
      breath = randomInt(14, 20)
      personCount = 2
      postures = [3, 4, 1] // 多个姿态
    } else {
      // 8%: 特殊姿态或其他场景
      bedStatus = 0
      sleepStage = 1  // 🔴 修正: 只能是清醒状态(1),睡眠时不能有姿态
      heart = randomInt(65, 85)
      breath = randomInt(13, 19)
      personCount = 1
      // 🔴 修正: 清醒且在床时,允许少量姿态(躺/坐),不允许跌倒
      postures = Math.random() > 0.5 ? [randomChoice([2, 3])] : []  // 只有躺(2)或坐(3)
    }
    
    // 【测试】强制睡眠状态显示躺姿图标
    if (sleepStage === 2 || sleepStage === 4) {
      postures = [6]  // 睡眠时显示lying图标
    }
    
    // 🔴 关键验证: ActiveBed卡片在床时不允许跌倒姿态(5)
    // 跌倒只能发生在Location卡片(公共区域)或离床场景
    if (bedStatus === 0 && postures.includes(5)) {
      postures = postures.filter(p => p !== 5)  // 移除跌倒姿态
    }
    
    // 数据来源
    const heartSource = hasSleepace && hasRadar 
      ? (Math.random() > 0.5 ? 's' : 'r')
      : hasSleepace ? 's' : hasRadar ? 'r' : '-'
    const breathSource = heartSource
    
    // 报警事件 - 使用合规术语（Pattern Change 替代 Abnormal）
    const alarms = hasAlarm ? [{
      event_id: `alarm_${cardId}`,
      event_type: heart > 100 ? 'Radar_HeartRatePatternChange_High' : 
                  heart < 50 ? 'Radar_HeartRatePatternChange_Low' :
                  breath > 25 ? 'Radar_RespirationPatternChange_High' : 'Radar_RespirationPatternChange_Low',
      category: 'clinical' as const,
      alarm_level: alarmLevel,
      alarm_status: Math.random() > 0.4 ? 'active' as const : 'acknowledged' as const,  // 60% active, 40% acknowledged
      triggered_at: Date.now(), // Demo模式：每次刷新归零
      triggered_by: hasRadar ? `Radar ${roomNumber}` : 'Cloud',
      trigger_data: {
        heart_rate: heart > 0 ? heart : undefined,
        respiratory_rate: breath > 0 ? breath : undefined,
        threshold: heart > 100 ? { max: 100 } : 
                   heart < 50 ? { min: 50 } :
                   breath > 25 ? { max: 25 } : { min: 10 }
      }
    }] : []
    
    // 🔴 修正: 时间信息必须始终有值,不能为undefined
    // bedStatus=1(离床)时显示离床时间,bedStatus=0(在床)时显示上床时间
    const bedStatusTimestamp = bedStatus === 1 
      ? `${String(randomInt(0, 23)).padStart(2, '0')}:${String(randomInt(0, 59)).padStart(2, '0')}`  // 离床时间: 随机0-23点
      : `${String(randomInt(18, 23)).padStart(2, '0')}:${String(randomInt(0, 59)).padStart(2, '0')}`  // 上床时间: 随机18-23点
    
    const statusDuration = bedStatus === 1
      ? `${randomInt(0, 5)}h ${randomInt(0, 59)}m`  // 离床时长
      : sleepStage === 1 
        ? `${randomInt(0, 2)}h ${randomInt(0, 59)}m`  // 清醒时长
        : `${randomInt(1, 8)}h ${randomInt(0, 59)}m`  // 睡眠时长
    
    cards.push({
      card_id: cardId,
      tenant_id: 'demo_tenant_001',
      card_type: 'ActiveBed',
      bed_id: `bed_${cardId}`,
      card_name: `${lastName}, ${firstName}`,
      card_address: `${building} / Room ${roomNumber} / Bed 1`,
      primary_resident_id: `resident_${cardId}`,
      
      residents: [{
        resident_id: `resident_${cardId}`,
        last_name: lastName,
        first_name: firstName,
        service_level: serviceLevel.code,
        service_level_info: {
          level_code: serviceLevel.code,
          display_name: serviceLevel.name,
          color_tag: serviceLevel.color.includes('#28a745') ? 'green' :
                     serviceLevel.color.includes('#007bff') ? 'blue' :
                     serviceLevel.color.includes('#ffc107') ? 'yellow' :
                     serviceLevel.color.includes('#ff9800') ? 'orange' : 'red',
          color_hex: serviceLevel.color,
          priority: serviceLevel.priority
        }
      }],
      
      devices,
      device_count: devices.length,
      resident_count: 1,
      
      unhandled_alarm_0: hasAlarm && alarmLevel === 0 ? 1 : 0,
      unhandled_alarm_1: hasAlarm && alarmLevel === 1 ? 1 : 0,
      unhandled_alarm_2: hasAlarm && alarmLevel === 2 ? 1 : 0,
      total_unhandled_alarms: hasAlarm ? 1 : 0,
      
      icon_alarm_level: 3,
      pop_alarm_emerge: 0,
      
      r_connection,
      s_connection,
      
      breath: breath > 0 && breath < 255 ? breath : undefined,
      heart: heart > 0 && heart < 255 ? heart : undefined,
      breath_source: breathSource as 's' | 'r' | '-',
      heart_source: heartSource as 's' | 'r' | '-',
      
      sleep_stage: sleepStage,
      sleep_state_display: sleepStage === 1 ? 'Awake' : sleepStage === 2 ? 'Light sleep' : 'Deep sleep',
      
      bed_status: bedStatus,
      
      person_count: personCount,
      postures: postures.length > 0 ? postures : undefined,
      
      bed_status_timestamp: bedStatusTimestamp,
      status_duration: statusDuration,
      
      alarms: alarms.length > 0 ? alarms : undefined
    })
  }
  
  // 生成10个Location卡片
  for (let i = 0; i < 10; i++) {
    const location = locationNames[i]
    if (!location) continue // 跳过undefined的location
    const cardId = `location_${String(i + 1).padStart(3, '0')}`
    
    // 雷达设备 (Location卡片只有雷达,没有睡眠带)
    const devices = [{
      device_id: `radar_${cardId}`,
      device_name: `Radar ${location.name}`,
      device_type: 2,
      device_model: 'TI AWR1843',
      binding_type: 'direct' as const
    }]
    
    // 设备连接状态 (雷达在线)
    const r_connection = 1
    
    // 随机人数和姿态场景
    let personCount = 0
    let postures: number[] = []
    let hasAlarm = false
    let alarmLevel = 3
    
    const rand = Math.random()
    
    if (rand < 0.10) {
      // 10%: 跌倒报警场景 (EMERG)
      personCount = 1
      postures = [5] // 跌倒
      hasAlarm = true
      alarmLevel = 0 // 紧急报警
    } else if (rand < 0.18) {
      // 8%: 疑似跌倒 (ALERT)
      personCount = 1
      postures = [2] // 疑似跌倒
      hasAlarm = true
      alarmLevel = 1
    } else if (rand < 0.22) {
      // 4%: 长时间躺地 (CRIT)
      personCount = 1
      postures = [6] // 躺
      hasAlarm = true
      alarmLevel = 2
    } else if (rand < 0.40) {
      // 18%: 无人 - OutofRoom 场景 ⭐ 新增
      personCount = 0
      postures = []
    } else if (rand < 0.60) {
      // 20%: 1人
      personCount = 1
      postures = [randomChoice([1, 3, 4, 6])] // 走/坐/站/躺
    } else if (rand < 0.80) {
      // 20%: 2人
      personCount = 2
      postures = Array.from({ length: personCount }, () => randomChoice([1, 3, 4]))
    } else if (rand < 0.92) {
      // 12%: 3人
      personCount = 3
      postures = Array.from({ length: personCount }, () => randomChoice([1, 3, 4]))
    } else {
      // 8%: 4人
      personCount = 4
      postures = Array.from({ length: personCount }, () => randomChoice([1, 3, 4]))
    }
    
    // 报警事件 (根据报警级别生成不同类型)
    const alarms = hasAlarm ? [{
      event_id: `alarm_${cardId}`,
      event_type: alarmLevel === 0 ? 'Fall' : 
                  alarmLevel === 1 ? 'SuspectedFall' :
                  alarmLevel === 2 ? 'LyingOnFloor' : 'Fall',
      category: 'safety' as const,
      alarm_level: alarmLevel,
      alarm_status: Math.random() > 0.4 ? 'active' as const : 'acknowledged' as const,  // 60% active, 40% acknowledged
      triggered_at: Date.now(), // Demo模式：每次刷新归零
      triggered_by: `Radar ${location.name}`,
      trigger_data: {
        posture: alarmLevel === 0 ? 'fall' : 
                 alarmLevel === 1 ? 'suspected_fall' :
                 alarmLevel === 2 ? 'lying' : 'fall',
        location: location.name
      }
    }] : []
    
    cards.push({
      card_id: cardId,
      tenant_id: 'demo_tenant_001',
      card_type: 'Location',
      location_id: `loc_${String(i + 1).padStart(3, '0')}`,
      card_name: location.name,
      card_address: location.address,
      primary_resident_id: undefined,
      
      residents: [], // Location卡片通常没有固定住户
      
      devices,
      device_count: 1,
      resident_count: 0,
      
      unhandled_alarm_0: hasAlarm && alarmLevel === 0 ? 1 : 0,
      unhandled_alarm_1: hasAlarm && alarmLevel === 1 ? 1 : 0,
      unhandled_alarm_2: hasAlarm && alarmLevel === 2 ? 1 : 0,
      total_unhandled_alarms: hasAlarm ? 1 : 0,
      
      icon_alarm_level: 3,
      pop_alarm_emerge: hasAlarm && alarmLevel === 0 ? 1 : 0,
      
      r_connection,
      s_connection: 0, // Location没有睡眠带
      
      breath: undefined, // Location不显示生命体征
      heart: undefined,
      breath_source: '-' as const,
      heart_source: '-' as const,
      
      sleep_stage: undefined, // Location没有睡眠状态
      sleep_state_display: undefined,
      
      bed_status: undefined, // Location没有床位状态
      
      person_count: personCount,
      postures: postures.length > 0 ? postures : undefined,
      
      bed_status_timestamp: undefined,
      status_duration: undefined,
      
      alarms: alarms.length > 0 ? alarms : undefined
    })
  }
  
  // 打乱卡片顺序，确保前15个中至少有1个Location，前30个中至少有3个Location
  const locationCards = cards.filter(c => c.card_type === 'Location')
  const activeBedCards = cards.filter(c => c.card_type === 'ActiveBed')
  
  // 打乱两种卡片
  const shuffledLocations = locationCards.sort(() => Math.random() - 0.5)
  const shuffledActiveBeds = activeBedCards.sort(() => Math.random() - 0.5)
  
  // 确保前15个中至少有1个Location
  const first15 = [
    shuffledLocations[0], // 第1个Location放在前15
    ...shuffledActiveBeds.slice(0, 14)
  ].filter((card): card is VitalFocusCard => card !== undefined).sort(() => Math.random() - 0.5)
  
  // 确保第16-30个中至少有2个Location
  const next15 = [
    shuffledLocations[1],
    shuffledLocations[2],
    ...shuffledActiveBeds.slice(14, 27)
  ].filter((card): card is VitalFocusCard => card !== undefined).sort(() => Math.random() - 0.5)
  
  // 剩余的卡片
  const remaining = [
    ...shuffledLocations.slice(3),
    ...shuffledActiveBeds.slice(27)
  ].filter((card): card is VitalFocusCard => card !== undefined).sort(() => Math.random() - 0.5)
  
  return [...first15, ...next15, ...remaining]
}

export const mockCards = generateMockCards()

// Mock账号
export const mockAccounts = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'SystemAdmin',
    fullName: 'John Smith',
    email: 'admin@owlcare.com',
    user_type: 'staff'
  },
  {
    username: 'nurse1',
    password: 'nurse123',
    role: 'Nurse',
    fullName: 'Mary Johnson',
    email: 'mary.j@owlcare.com',
    user_type: 'staff'
  },
  {
    username: 'doctor1',
    password: 'doctor123',
    role: 'Doctor',
    fullName: 'Dr. David Wilson',
    email: 'david.w@owlcare.com',
    user_type: 'staff'
  }
]
