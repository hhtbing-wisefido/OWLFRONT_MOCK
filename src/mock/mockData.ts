import type { VitalFocusCard } from '@/api/monitors/model/monitorModel'

/**
 * HIPAA鍚堣澹版槑锛?
 * 鏈枃浠跺寘鍚殑鎵€鏈夋暟鎹潎涓烘祴璇?婕旂ず鐢ㄩ€旂殑妯℃嫙鏁版嵁
 * 涓嶅寘鍚换浣曠湡瀹炵殑鍙椾繚鎶ゅ仴搴蜂俊鎭?PHI)
 * 鎵€鏈夊鍚嶃€両D銆佺敓鐞嗘暟鎹潎涓洪殢鏈虹敓鎴?
 */

// 馃敶 绉嶅瓙闅忔満鏁扮敓鎴愬櫒 - 纭繚姣忔鍒锋柊鐢熸垚鐩稿悓鐨勬暟鎹?
class SeededRandom {
  private seed: number

  constructor(seed: number = 12345) {
    this.seed = seed
  }

  // 绾挎€у悓浣欑敓鎴愬櫒 (LCG)
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }

  // 閲嶇疆绉嶅瓙
  reset(seed: number = 12345) {
    this.seed = seed
  }
}

// 鍒涘缓鍏ㄥ眬闅忔満鏁扮敓鎴愬櫒瀹炰緥
const seededRandom = new SeededRandom(12345)

// 鐢熸垚闅忔満鏁拌緟鍔╁嚱鏁?- 浣跨敤绉嶅瓙闅忔満鏁?
const randomInt = (min: number, max: number) => Math.floor(seededRandom.next() * (max - min + 1)) + min
const randomChoice = <T>(arr: T[]): T => {
  if (arr.length === 0) throw new Error('Array cannot be empty')
  return arr[Math.floor(seededRandom.next() * arr.length)]!
}

// 娴嬭瘯鐢ㄥ鍚嶏紙HIPAA鍚堣 - 闈炵湡瀹炴偅鑰呬俊鎭級
// 浣跨敤"Demo"鍓嶇紑鏄庣‘鏍囪瘑涓烘紨绀烘暟鎹紝閫傚悎鍟嗕笟瀹ｄ紶浣跨敤
const lastNames = ['Demo-Smith', 'Demo-Johnson', 'Demo-Williams', 'Demo-Brown', 'Demo-Jones', 'Demo-Garcia', 'Demo-Miller', 'Demo-Davis', 'Demo-Martinez', 'Demo-Wilson']
const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'Michael', 'Linda', 'William', 'Barbara', 'David', 'Elizabeth']

// 鏈嶅姟绛夌骇閰嶇疆
const serviceLevels = [
  { code: 'L1', name: 'Independent', color: '#28a745', priority: 1 },
  { code: 'L2', name: 'Assisted', color: '#007bff', priority: 2 },
  { code: 'L3', name: 'Memory Care', color: '#ffc107', priority: 3 },
  { code: 'L4', name: 'Skilled Nursing', color: '#ff9800', priority: 4 },
  { code: 'L5', name: 'Hospice', color: '#f44336', priority: 5 }
]

// Location卡片位置名称（35个公共区域）
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
  { name: 'Cafe Corner', address: 'Building E / 1F Cafe Corner', floor: 1 },
  { name: 'Main Entrance', address: 'Building A / 1F Main Entrance', floor: 1 },
  { name: 'Reception Area', address: 'Building A / 1F Reception', floor: 1 },
  { name: 'TV Lounge 2F', address: 'Building A / 2F TV Lounge', floor: 2 },
  { name: 'Library 2F', address: 'Building B / 2F Library', floor: 2 },
  { name: 'Art Studio 3F', address: 'Building B / 3F Art Studio', floor: 3 },
  { name: 'Music Room 3F', address: 'Building C / 3F Music Room', floor: 3 },
  { name: 'Meditation Room', address: 'Building C / 2F Meditation Room', floor: 2 },
  { name: 'Game Room 1F', address: 'Building D / 1F Game Room', floor: 1 },
  { name: 'Computer Lab 2F', address: 'Building D / 2F Computer Lab', floor: 2 },
  { name: 'Craft Workshop', address: 'Building E / 3F Craft Workshop', floor: 3 },
  { name: 'Chapel 1F', address: 'Building F / 1F Chapel', floor: 1 },
  { name: 'Wellness Center', address: 'Building F / 2F Wellness Center', floor: 2 },
  { name: 'Fitness Room 3F', address: 'Building F / 3F Fitness Room', floor: 3 },
  { name: 'Swimming Pool', address: 'Building G / 1F Swimming Pool', floor: 1 },
  { name: 'Sauna Room', address: 'Building G / 1F Sauna Room', floor: 1 },
  { name: 'Movie Theater 2F', address: 'Building G / 2F Movie Theater', floor: 2 },
  { name: 'Conference Room', address: 'Building H / 3F Conference Room', floor: 3 },
  { name: 'Visitor Lounge', address: 'Building H / 1F Visitor Lounge', floor: 1 },
  { name: 'Balcony Garden', address: 'Building H / 4F Balcony Garden', floor: 4 },
  { name: 'Coffee Shop', address: 'Building A / 1F Coffee Shop', floor: 1 },
  { name: 'Beauty Salon', address: 'Building B / 1F Beauty Salon', floor: 1 },
  { name: 'Medical Office', address: 'Building C / 1F Medical Office', floor: 1 },
  { name: 'Pharmacy', address: 'Building C / 1F Pharmacy', floor: 1 },
  { name: 'Emergency Exit', address: 'Building D / 1F Emergency Exit', floor: 1 },
  { name: 'Staff Lounge', address: 'Building E / 2F Staff Lounge', floor: 2 }
]

// 生成235个Mock卡片数据 (200个ActiveBed + 35个Location)
function generateMockCards(): VitalFocusCard[] {
  // 🔴 重置随机数种子，确保每次生成相同的数据
  seededRandom.reset(12345)
  
  const cards: VitalFocusCard[] = []
  const buildings = ['Building A', 'Building B', 'Building C', 'Building D', 'Building E', 'Building F', 'Building G', 'Building H']
  
  // 鍓?0寮犲崱鐗囩殑鍥哄畾鍦烘櫙閰嶇疆锛堢'淇滵emo鏈夊畬鏁寸殑绀轰緥锛?
  // 绱㈠紩: 0=蹇冪巼杩囬珮鎶ヨ, 1=璺屽€掓姤璀? 2=3浜鸿瀹? 3-9=闅忔満
  const FIXED_HEART_ALARM_INDEX = 0    // 蹇冪巼杩囬珮鎶ヨ鍗＄墖
  const FIXED_FALL_ALARM_INDEX = 1     // 璺屽€掓姤璀﹀崱鐗? 
  const FIXED_VISITOR_3_INDEX = 2      // 3浜鸿瀹㈠崱鐗?
  
  // 鐢熸垚200涓狝ctiveBed鍗＄墖
  for (let i = 0; i < 200; i++) {
    const cardId = `card_${String(i + 1).padStart(3, '0')}`
    const building = buildings[Math.floor(i / 25)]
    const floor = Math.floor((i % 25) / 5) + 1
    const room = (i % 5) + 1
    const roomNumber = `${floor}0${room}`
    
    // 灞呮皯淇℃伅
    const lastName = randomChoice(lastNames)
    const firstName = randomChoice(firstNames)
    const serviceLevel = randomChoice(serviceLevels)
    
    // 璁惧閰嶇疆 (闇€姹? 鎵€鏈夎澶囬兘鍦ㄧ嚎,涓嶈绂荤嚎绀轰緥)
    // 澶ч儴鍒嗘槸鍙岃澶?灏戞暟鍗曡澶?
    const hasSleepace = seededRandom.next() > 0.05  // 95%鏈塖leepace
    const hasRadar = seededRandom.next() > 0.15     // 85%鏈塕adar
    
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
    
    // 璁惧杩炴帴鐘舵€?(鎵€鏈夎澶囬兘鍦ㄧ嚎)
    const s_connection = hasSleepace ? 1 : 0
    const r_connection = hasRadar ? 1 : 0
    
    // 鍐冲畾鍗＄墖鐘舵€佺被鍨?
    let bedStatus = 0  // 榛樿鍦ㄥ簥
    let sleepStage = 2 // 榛樿娴呯潯鐪?
    let heart = randomInt(65, 80)
    let breath = randomInt(14, 18)
    let personCount = 1
    let postures: number[] = []
    let hasAlarm = false
    let alarmLevel = 3
    
    // ========== 鍓?0寮犲崱鐗囩殑鍥哄畾鍦烘櫙 ==========
    if (i === FIXED_HEART_ALARM_INDEX) {
      // 鍗＄墖1: 蹇冪巼杩囬珮鎶ヨ锛堟湁鎶ヨ鏉★級
      hasAlarm = true
      bedStatus = 0
      sleepStage = 1
      alarmLevel = 1  // ALERT level锛屾樉绀烘姤璀︽潯
      heart = randomInt(120, 139)  // 蹇冪巼杩囬珮
      breath = randomInt(16, 20)
      personCount = 1
      postures = [6]
    } else if (i === FIXED_FALL_ALARM_INDEX) {
      // 鍗＄墖2: 璺屽€掓姤璀︼紙鏈夋姤璀︽潯锛?
      hasAlarm = true
      bedStatus = 1  // 绂诲簥
      sleepStage = 1
      alarmLevel = 0  // EMERG level锛岀揣鎬ヨ穼鍊?
      heart = randomInt(85, 100)
      breath = randomInt(18, 24)
      personCount = 1
      postures = [5]  // 璺屽€掑Э鎬?
    } else if (i === FIXED_VISITOR_3_INDEX) {
      // 鍗＄墖3: 3浜鸿瀹㈠満鏅?
      hasAlarm = false
      bedStatus = 0
      sleepStage = 1  // 娓呴啋
      heart = randomInt(70, 85)
      breath = randomInt(14, 18)
      personCount = 3  // 3涓汉
      postures = [3, 4, 1]  // 鍧愩€佺珯銆佽蛋
    } else {
      // ========== 鍏朵粬鍗＄墖闅忔満鍒嗛厤 ==========
      // 闅忔満鍒嗛厤鐘舵€佸満鏅?(妯℃嫙鐪熷疄鎯呭喌,鍚勭鐘舵€佹贩鍚堝垎甯?
      const rand = seededRandom.next()
    
      if (rand < 0.45) {
        // 45%: 姝ｅ父鐫＄湢 (Deep Sleep / Light Sleep)
        bedStatus = 0  // 鍦ㄥ簥
        sleepStage = seededRandom.next() > 0.6 ? 2 : 4  // 60%娴呯潯鐪? 40%娣辩潯鐪?
        heart = randomInt(55, 70)
        breath = randomInt(12, 16)
        personCount = 1
        // 銆愭祴璇曘€戠潯鐪犳椂鏄剧ず韬哄Э鍥炬爣锛坧osture=6锛?
        postures = [6]
      } else if (rand < 0.58) {
        // 13%: 娓呴啋鐘舵€?(Awake in bed)
      bedStatus = 0  // 鍦ㄥ簥
      sleepStage = 1
      heart = randomInt(70, 85)
      breath = randomInt(14, 20)
      personCount = 1
      // 娓呴啋鐘舵€?0%鏈夊Э鍔垮浘鏍囷紝琛岃蛋鍜岀珯绔嬪Э鍔垮鍔?
      const hasPosture = seededRandom.next() < 0.9
      if (hasPosture) {
        const postureRand = seededRandom.next()
        if (postureRand < 0.25) postures = [3]      // 鍧愮潃 sitting 25%
        else if (postureRand < 0.50) postures = [4] // 绔欑珛 stand 25%
        else if (postureRand < 0.75) postures = [1] // 琛岃蛋 walk 25%
        else postures = [6]                          // 韬虹潃 lying 25%
      } else {
        postures = []  // 10%鏃犲Э鍔?
      }
    } else if (rand < 0.70) {
      // 12%: 绂诲簥鐘舵€?(Out of bed) 猸?鏂板鍦烘櫙
      bedStatus = 1  // 绂诲簥
      sleepStage = 1  // 绂诲簥鏃堕粯璁ゆ竻閱?
      heart = randomInt(75, 90)
      breath = randomInt(15, 22)
      // 绂诲簥鏃讹細60%鏈夊Э鎬侊紙浜哄湪鎴块棿浣嗕笉鍦ㄥ簥涓婏級锛?0%鏃犲Э鎬侊紙浜哄凡绂诲紑锛?
      const hasPosture = seededRandom.next() < 0.6
      personCount = hasPosture ? 1 : 0
      if (hasPosture) {
        // 馃敶 绂诲簥鏃剁殑濮挎€侊細鍙兘鏄珯绔嬨€佽璧帮紝涓嶈兘鍧愮潃鎴栬汉鐫€锛?
        const postureRand = seededRandom.next()
        if (postureRand < 0.5) postures = [4]   // 绔欑珛 standing 50%
        else postures = [1]                      // 琛岃蛋 walking 50%
      } else {
        postures = []  // 浜哄凡绂诲紑鎴块棿锛屾棤濮挎€?
        personCount = 0
      }
    } else if (rand < 0.82) {
      // 12%: 鎶ヨ鍦烘櫙 (蹇冪巼鎴栧懠鍚稿紓甯?
      hasAlarm = true
      bedStatus = 0
      sleepStage = 1
      
      const alarmType = seededRandom.next()
      if (alarmType < 0.15) {
        // 15%: 蹇冪巼鏋侀珮 - EMERG (level 0)
        heart = randomInt(140, 180)
        breath = randomInt(20, 25)
        alarmLevel = 0
      } else if (alarmType < 0.35) {
        // 20%: 蹇冪巼杩囬珮 - ALERT (level 1)
        heart = randomInt(105, 139)
        breath = randomInt(15, 20)
        alarmLevel = 1
      } else if (alarmType < 0.50) {
        // 15%: 蹇冪巼杩囦綆 - ALERT (level 1)
        heart = randomInt(38, 48)
        breath = randomInt(12, 16)
        alarmLevel = 1
      } else if (alarmType < 0.65) {
        // 15%: 鍛煎惛寮傚父涓ラ噸 - CRIT (level 2)
        heart = randomInt(70, 85)
        breath = seededRandom.next() > 0.5 ? randomInt(30, 40) : randomInt(4, 7)
        alarmLevel = 2
      } else if (alarmType < 0.85) {
        // 20%: 鍛煎惛寮傚父涓€鑸?- ERR (level 3)
        heart = randomInt(70, 85)
        breath = seededRandom.next() > 0.5 ? randomInt(26, 29) : randomInt(8, 9)
        alarmLevel = 3
      } else {
        // 15%: 杞诲井寮傚父 - WARNING (level 4)
        heart = randomInt(95, 104)
        breath = randomInt(21, 24)
        alarmLevel = 4
      }
      personCount = 1
      postures = [6]  // 鎶ヨ鏃舵樉绀鸿汉濮垮浘鏍囷紙浜哄湪搴婁笂锛?
    } else if (rand < 0.92) {
      // 10%: 璁垮鍦烘櫙 (person_count > 1)
      bedStatus = 0
      sleepStage = 1
      heart = randomInt(70, 85)
      breath = randomInt(14, 20)
      personCount = 2
      postures = [3, 4, 1] // 澶氫釜濮挎€?
    } else {
      // 8%: 鐗规畩濮挎€佹垨鍏朵粬鍦烘櫙
      bedStatus = 0
      sleepStage = 1  // 馃敶 淇: 鍙兘鏄竻閱掔姸鎬?1),鐫＄湢鏃朵笉鑳芥湁濮挎€?
      heart = randomInt(65, 85)
      breath = randomInt(13, 19)
      personCount = 1
      // 馃敶 淇: 娓呴啋涓斿湪搴婃椂,鍏佽灏戦噺濮挎€?韬?鍧?,涓嶅厑璁歌穼鍊?
      postures = seededRandom.next() > 0.5 ? [randomChoice([2, 3])] : []  // 鍙湁韬?2)鎴栧潗(3)
    }
    } // 缁撴潫 else 鍧楋紙闈炲浐瀹氬満鏅崱鐗囷級
    
    // 銆愭祴璇曘€戝己鍒剁潯鐪犵姸鎬佹樉绀鸿汉濮垮浘鏍囷紙鍥哄畾鍦烘櫙鍗＄墖闄ゅ锛?
    if (i > FIXED_VISITOR_3_INDEX && (sleepStage === 2 || sleepStage === 4)) {
      postures = [6]  // 鐫＄湢鏃舵樉绀簂ying鍥炬爣
    }
    
    // 馃敶 鍏抽敭楠岃瘉: ActiveBed鍗＄墖鍦ㄥ簥鏃朵笉鍏佽璺屽€掑Э鎬?5)
    // 璺屽€掑彧鑳藉彂鐢熷湪Location鍗＄墖(鍏叡鍖哄煙)鎴栫搴婂満鏅?
    // 娉ㄦ剰锛氬浐瀹氳穼鍊掑崱鐗?FIXED_FALL_ALARM_INDEX)鏄搴婄殑锛屽厑璁歌穼鍊?
    if (bedStatus === 0 && postures.includes(5) && i !== FIXED_FALL_ALARM_INDEX) {
      postures = postures.filter(p => p !== 5)  // 绉婚櫎璺屽€掑Э鎬?
    }
    
    // 鏁版嵁鏉ユ簮
    const heartSource = hasSleepace && hasRadar 
      ? (seededRandom.next() > 0.5 ? 's' : 'r')
      : hasSleepace ? 's' : hasRadar ? 'r' : '-'
    const breathSource = heartSource
    
    // 报警事件 - 使用合规术语（Pattern Change 替代 Abnormal）
    // 时间戳: 使用过去1-24小时内的随机时间
    const hoursAgo = randomInt(1, 24)
    const minutesAgo = randomInt(0, 59)
    const alarmTriggeredAt = Date.now() - (hoursAgo * 3600000 + minutesAgo * 60000)
    
    const alarms = hasAlarm ? [{
      event_id: `alarm_${cardId}`,
      event_type: heart > 100 ? 'Radar_HeartRatePatternChange_High' : 
                  heart < 50 ? 'Radar_HeartRatePatternChange_Low' :
                  breath > 25 ? 'Radar_RespirationPatternChange_High' : 'Radar_RespirationPatternChange_Low',
      category: 'clinical' as const,
      alarm_level: alarmLevel,
      alarm_status: seededRandom.next() > 0.4 ? 'active' as const : 'acknowledged' as const,  // 60% active, 40% acknowledged
      triggered_at: alarmTriggeredAt,
      triggered_by: hasRadar ? `Radar ${roomNumber}` : 'Cloud',
      trigger_data: {
        heart_rate: heart > 0 ? heart : undefined,
        respiratory_rate: breath > 0 ? breath : undefined,
        threshold: heart > 100 ? { max: 100 } : 
                   heart < 50 ? { min: 50 } :
                   breath > 25 ? { max: 25 } : { min: 10 }
      }
    }] : []
    
    // 馃敶 淇: 鏃堕棿淇℃伅蹇呴』濮嬬粓鏈夊€?涓嶈兘涓簎ndefined
    // bedStatus=1(绂诲簥)鏃舵樉绀虹搴婃椂闂?bedStatus=0(鍦ㄥ簥)鏃舵樉绀轰笂搴婃椂闂?
    const bedStatusTimestamp = bedStatus === 1 
      ? `${String(randomInt(0, 23)).padStart(2, '0')}:${String(randomInt(0, 59)).padStart(2, '0')}`  // 绂诲簥鏃堕棿: 闅忔満0-23鐐?
      : `${String(randomInt(18, 23)).padStart(2, '0')}:${String(randomInt(0, 59)).padStart(2, '0')}`  // 涓婂簥鏃堕棿: 闅忔満18-23鐐?
    
    const statusDuration = bedStatus === 1
      ? `${randomInt(0, 5)}h ${randomInt(0, 59)}m`  // 绂诲簥鏃堕暱
      : sleepStage === 1 
        ? `${randomInt(0, 2)}h ${randomInt(0, 59)}m`  // 娓呴啋鏃堕暱
        : `${randomInt(1, 8)}h ${randomInt(0, 59)}m`  // 鐫＄湢鏃堕暱
    
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
  
  // 生成35个Location卡片
  for (let i = 0; i < 35; i++) {
    // 澶嶇敤location鍚嶇О锛屽惊鐜娇鐢?
    const locationIndex = i % locationNames.length
    const location = locationNames[locationIndex]
    if (!location) continue // 璺宠繃undefined鐨刲ocation
    const cardId = `location_${String(i + 1).padStart(3, '0')}`
    const locationSuffix = i >= locationNames.length ? ` (${Math.floor(i / locationNames.length) + 1})` : ''
    
    // 闆疯揪璁惧 (Location鍗＄墖鍙湁闆疯揪,娌℃湁鐫＄湢甯?
    const devices = [{
      device_id: `radar_${cardId}`,
      device_name: `Radar ${location.name}`,
      device_type: 2,
      device_model: 'TI AWR1843',
      binding_type: 'direct' as const
    }]
    
    // 璁惧杩炴帴鐘舵€?(闆疯揪鍦ㄧ嚎)
    const r_connection = 1
    
    // 闅忔満浜烘暟鍜屽Э鎬佸満鏅?
    let personCount = 0
    let postures: number[] = []
    let hasAlarm = false
    let alarmLevel = 3
    
    const rand = seededRandom.next()
    
    if (rand < 0.10) {
      // 10%: 璺屽€掓姤璀﹀満鏅?(EMERG)
      personCount = 1
      postures = [5] // 璺屽€?
      hasAlarm = true
      alarmLevel = 0 // 绱ф€ユ姤璀?
    } else if (rand < 0.18) {
      // 8%: 鐤戜技璺屽€?(ALERT)
      personCount = 1
      postures = [2] // 鐤戜技璺屽€?
      hasAlarm = true
      alarmLevel = 1
    } else if (rand < 0.22) {
      // 4%: 闀挎椂闂磋汉鍦?(CRIT)
      personCount = 1
      postures = [6] // 韬?
      hasAlarm = true
      alarmLevel = 2
    } else if (rand < 0.35) {
      // 13%: 无人（OutRoom场景）
      personCount = 0
      postures = []
    } else if (rand < 0.55) {
      // 20%: 1人
      personCount = 1
      postures = [randomChoice([1, 3, 4, 6])] // 走/坐/站/躺
    } else if (rand < 0.75) {
      // 20%: 2人
      personCount = 2
      postures = Array.from({ length: personCount }, () => randomChoice([1, 3, 4]))
    } else if (rand < 0.90) {
      // 15%: 3人
      personCount = 3
      postures = Array.from({ length: personCount }, () => randomChoice([1, 3, 4]))
    } else {
      // 10%: 4人
      personCount = 4
      postures = Array.from({ length: personCount }, () => randomChoice([1, 3, 4]))
    }
    
    // 鎶ヨ浜嬩欢 (鏍规嵁鎶ヨ绾у埆鐢熸垚涓嶅悓绫诲瀷)
    const alarms = hasAlarm ? [{
      event_id: `alarm_${cardId}`,
      event_type: alarmLevel === 0 ? 'Fall' : 
                  alarmLevel === 1 ? 'SuspectedFall' :
                  alarmLevel === 2 ? 'LyingOnFloor' : 'Fall',
      category: 'safety' as const,
      alarm_level: alarmLevel,
      alarm_status: seededRandom.next() > 0.4 ? 'active' as const : 'acknowledged' as const,  // 60% active, 40% acknowledged
      triggered_at: Date.now(), // Demo妯″紡锛氭瘡娆″埛鏂板綊闆?
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
      card_name: `${location.name}${locationSuffix}`,
      card_address: location.address,
      primary_resident_id: undefined,
      
      residents: [], // Location鍗＄墖閫氬父娌℃湁鍥哄畾浣忔埛
      
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
      s_connection: 0, // Location娌℃湁鐫＄湢甯?
      
      breath: undefined, // Location涓嶆樉绀虹敓鍛戒綋寰?
      heart: undefined,
      breath_source: '-' as const,
      heart_source: '-' as const,
      
      sleep_stage: undefined, // Location娌℃湁鐫＄湢鐘舵€?
      sleep_state_display: undefined,
      
      bed_status: undefined, // Location娌℃湁搴婁綅鐘舵€?
      
      person_count: personCount,
      postures: postures.length > 0 ? postures : undefined,
      
      bed_status_timestamp: undefined,
      status_duration: undefined,
      
      alarms: alarms.length > 0 ? alarms : undefined
    })
  }
  
  // 鎵撲贡鍗＄墖椤哄簭锛岀‘淇濆墠15涓腑鑷冲皯鏈?涓狶ocation锛屽墠30涓腑鑷冲皯鏈?涓狶ocation
  const locationCards = cards.filter(c => c.card_type === 'Location')
  const activeBedCards = cards.filter(c => c.card_type === 'ActiveBed')
  
  // 鎵撲贡涓ょ鍗＄墖
  const shuffledLocations = locationCards.sort(() => seededRandom.next() - 0.5)
  const shuffledActiveBeds = activeBedCards.sort(() => seededRandom.next() - 0.5)
  
  // 纭繚鍓?5涓腑鑷冲皯鏈?涓狶ocation
  const first15 = [
    shuffledLocations[0], // 绗?涓狶ocation鏀惧湪鍓?5
    ...shuffledActiveBeds.slice(0, 14)
  ].filter((card): card is VitalFocusCard => card !== undefined).sort(() => seededRandom.next() - 0.5)
  
  // 纭繚绗?6-30涓腑鑷冲皯鏈?涓狶ocation
  const next15 = [
    shuffledLocations[1],
    shuffledLocations[2],
    ...shuffledActiveBeds.slice(14, 27)
  ].filter((card): card is VitalFocusCard => card !== undefined).sort(() => seededRandom.next() - 0.5)
  
  // 鍓╀綑鐨勫崱鐗?
  const remaining = [
    ...shuffledLocations.slice(3),
    ...shuffledActiveBeds.slice(27)
  ].filter((card): card is VitalFocusCard => card !== undefined).sort(() => seededRandom.next() - 0.5)
  
  const finalCards = [...first15, ...next15, ...remaining]
  console.log(`📊 生成卡片统计: ActiveBed=${activeBedCards.length}, Location=${locationCards.length}, 总计=${cards.length}`)
  console.log(`✅ 最终卡片数量: ${finalCards.length}`)
  console.log(`📋 预期: ActiveBed=200, Location=35, 总计=235`)
  
  return finalCards
}

export const mockCards = generateMockCards()

// Mock璐﹀彿
export const mockAccounts = [
  {
    username: 'sysadmin',
    password: 'sysadmin123',
    role: 'SystemAdmin',
    fullName: 'System Administrator',
    email: 'sysadmin@owlcare.com',
    user_type: 'staff',
    userId: 'user_sysadmin_001',
    avatar: '/avatars/sysadmin.png'
  },
  {
    username: 'sysoperator',
    password: 'sysop123',
    role: 'SystemOperator',
    fullName: 'System Operator',
    email: 'sysop@owlcare.com',
    user_type: 'staff',
    userId: 'user_sysop_001',
    avatar: '/avatars/operator.png'
  },
  {
    username: 'admin',
    password: 'admin123',
    role: 'Admin',
    fullName: 'John Smith (Admin)',
    email: 'admin@owlcare.com',
    user_type: 'staff',
    userId: 'user_admin_001',
    avatar: '/avatars/admin.png'
  },
  {
    username: 'nurse1',
    password: 'nurse123',
    role: 'Nurse',
    fullName: 'Mary Johnson (Nurse)',
    email: 'mary.j@owlcare.com',
    user_type: 'staff',
    userId: 'user_nurse_001',
    avatar: '/avatars/nurse.png'
  },
  {
    username: 'caregiver1',
    password: 'caregiver123',
    role: 'Caregiver',
    fullName: 'Lisa White (Caregiver)',
    email: 'lisa.w@owlcare.com',
    user_type: 'staff',
    userId: 'user_caregiver_001',
    avatar: '/avatars/caregiver.png'
  },
  {
    username: 'resident1',
    password: 'doctor123',
    role: 'Manager',
    fullName: 'Dr. David Wilson (Manager)',
    email: 'david.w@owlcare.com',
    user_type: 'staff',
    userId: 'user_manager_001',
    avatar: '/avatars/doctor.png'
  },
  {
    username: 'it1',
    password: 'it123',
    role: 'IT',
    fullName: 'Tom Anderson (IT Support)',
    email: 'tom.a@owlcare.com',
    user_type: 'staff',
    userId: 'user_it_001',
    avatar: '/avatars/it.png'
  },
  {
    username: 'nurse1',
    password: 'resident123',
    role: 'Resident',
    fullName: 'Emily Brown (Resident)',
    email: 'emily.b@owlcare.com',
    user_type: 'resident',
    userId: 'user_resident_001',
    avatar: '/avatars/resident.png'
  },
  {
    username: 'family1',
    password: 'family123',
    role: 'Family',
    fullName: 'Robert Brown (Family)',
    email: 'robert.b@owlcare.com',
    user_type: 'resident',
    userId: 'user_family_001',
    avatar: '/avatars/family.png'
  }
]

