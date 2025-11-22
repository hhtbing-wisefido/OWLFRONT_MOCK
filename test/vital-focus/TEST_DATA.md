# Vital Focus Cards 测试数据参考表

## 测试数据概览

本测试数据集基于现有的测试账号（S1-S3, R1-R3），创建了完整的卡片数据用于前端开发和测试。

## 测试卡片列表

| Card ID | 机构 | 卡片类型 | 卡片名称 | 卡片地址 | 住户 | Service Level | 设备 | 告警级别 | 设备状态 |
|---------|------|---------|---------|---------|------|--------------|------|---------|---------|
| card-001 | Sunset | ActiveBed | Smith | A 院区主楼-E203-BedA | R1 (Smith) | L2 (蓝色) | Radar + Sleepace | 0 (无) | 在线 |
| card-002 | Golden | ActiveBed | Johnson | B 院区副楼-F305-BedB | R2 (Johnson) | L3 (黄色) | Radar | 2 (L2) | 在线 |
| card-003 | Winds | ActiveBed | Williams | C 院区主楼-G401-BedC | R3 (Williams) | L1 (绿色) | Sleepace | 0 (无) | 离线 |
| card-004 | Sunset | Location | E203 | A 院区主楼-E203 | R1, R4 | L2, L4 | Radar | 1 (L1) | 在线 |
| card-005 | Golden | Location | 大厅 | B 院区副楼-大厅 | 无 | - | Radar | 0 (无) | 在线 |

## 详细数据说明

### Card 1: ActiveBed - R1 (Smith) - Sunset
- **卡片类型**: ActiveBed（床位卡片）
- **卡片名称**: Smith（使用住户 last_name）
- **卡片地址**: A 院区主楼-E203-BedA（location_tag + location_name + BedName）
- **住户信息**:
  - Resident ID: resident-r1-001
  - Name: Smith, John
  - Service Level: L2 (Assisted - 需部分协助)
  - Color: 蓝色 (#007bff)
- **设备信息**:
  - Radar-001 (雷达设备，在线)
  - Sleepace-001 (睡眠监测设备，在线)
- **实时数据**:
  - 呼吸: 18 rpm
  - 心率: 72 bpm
  - 在床状态: 在床
- **告警**: 无

### Card 2: ActiveBed - R2 (Johnson) - Golden
- **卡片类型**: ActiveBed
- **卡片名称**: Johnson
- **卡片地址**: B 院区副楼-F305-BedB
- **住户信息**:
  - Resident ID: resident-r2-001
  - Name: Johnson, Mary
  - Service Level: L3 (Memory care - 记忆护理)
  - Color: 黄色 (#ffc107)
- **设备信息**:
  - Radar-002 (雷达设备，在线)
  - 无 Sleepace 设备
- **实时数据**:
  - 呼吸: 20 rpm
  - 心率: 85 bpm
  - 在床状态: 在床
- **告警**: L2 级别告警（1 个未处理）

### Card 3: ActiveBed - R3 (Williams) - Winds
- **卡片类型**: ActiveBed
- **卡片名称**: Williams
- **卡片地址**: C 院区主楼-G401-BedC
- **住户信息**:
  - Resident ID: resident-r3-001
  - Name: Williams, Robert
  - Service Level: L1 (Independent - 无需协助)
  - Color: 绿色 (#28a745)
- **设备信息**:
  - Sleepace-003 (睡眠监测设备，离线)
  - 无 Radar 设备
- **实时数据**:
  - 呼吸: 0 (设备离线)
  - 心率: 0 (设备离线)
  - 在床状态: 离床
- **告警**: 无

### Card 4: Location - 多人房间 - Sunset
- **卡片类型**: Location（位置卡片）
- **卡片名称**: E203（多人房间显示 location_name）
- **卡片地址**: A 院区主楼-E203（location_tag + location_name）
- **住户信息**:
  - R1 (Smith) - L2 (蓝色)
  - R4 (Brown) - L4 (橙色)
- **设备信息**:
  - Radar-004 (未绑床的设备，间接绑定)
- **告警**: L1 级别告警（2 个未处理，最高级别）

### Card 5: Location - 公共空间 - Golden
- **卡片类型**: Location（位置卡片）
- **卡片名称**: 大厅（公共空间显示 location_name）
- **卡片地址**: B 院区副楼-大厅
- **住户信息**: 无（公共空间）
- **设备信息**:
  - Radar-005 (未绑床的设备)
- **告警**: 无

## Service Level 定义

| Level | Code | Display Name | 中文名称 | Color Tag | Color Hex | Priority |
|-------|------|-------------|---------|-----------|-----------|----------|
| L1 | L1 | Independent | 无需协助 | green | #28a745 | 1 |
| L2 | L2 | Assisted | 需部分协助 | blue | #007bff | 2 |
| L3 | L3 | Memory care | 记忆护理 | yellow | #ffc107 | 3 |
| L4 | L4 | Fall-risk | 跌倒风险 | orange | #fd7e14 | 4 |
| L5 | L5 | Vital Risk | 生命体征风险 | red | #dc3545 | 5 |
| L6 | L6 | Critical | 危重症 | red | #c82333 | 6 |

## 测试场景覆盖

### 1. ActiveBed 卡片场景
- ✅ 单人房间，双设备（Radar + Sleepace）- Card 1
- ✅ 单人房间，单设备（Radar）- Card 2
- ✅ 单人房间，设备离线 - Card 3
- ✅ 不同 Service Level 显示（L1, L2, L3）

### 2. Location 卡片场景
- ✅ 多人房间（多个住户）- Card 4
- ✅ 公共空间（无住户）- Card 5

### 3. 告警场景
- ✅ 无告警 - Card 1, 3, 5
- ✅ L2 级别告警 - Card 2
- ✅ L1 级别告警（最高级别）- Card 4

### 4. 设备状态场景
- ✅ 双设备在线 - Card 1
- ✅ 单设备在线 - Card 2, 4, 5
- ✅ 设备离线 - Card 3

### 5. 机构场景
- ✅ Sunset 机构 - Card 1, 4
- ✅ Golden 机构 - Card 2, 5
- ✅ Winds 机构 - Card 3

## 使用说明

### 在代码中使用

```typescript
import { vitalFocus } from '@/test/index'

// 获取所有卡片
const cards = await vitalFocus.mockGetVitalFocusCards()

// 根据机构过滤
const sunsetCards = await vitalFocus.mockGetVitalFocusCards({ 
  tenant_id: '550e8400-e29b-41d4-a716-446655440000' 
})

// 根据住户 ID 获取卡片
const card = await vitalFocus.mockGetVitalFocusCardByResident('resident-r1-001')

// 根据卡片 ID 获取详情
const detail = await vitalFocus.mockGetVitalFocusCardDetail('card-001')
```

### 在 API 中使用

API 函数会自动在开发环境中使用 mock 数据：

```typescript
import { getVitalFocusCardsApi } from '@/api/monitor/monitor'

// 开发环境：自动使用 mock 数据
// 生产环境：调用真实 API
const data = await getVitalFocusCardsApi()
```

## 数据文件位置

- **测试数据定义**: `test/vital-focus/data.ts`
- **Mock 函数**: `test/vital-focus/mock.ts`
- **统一导出**: `test/vital-focus/index.ts`
- **API 集成**: `src/api/monitor/monitor.ts`

## 注意事项

1. **数据一致性**: 测试数据与现有测试账号（S1-S3, R1-R3）保持一致
2. **字段命名**: 所有字段使用 `snake_case`，与数据库 schema 保持一致
3. **Service Level**: 每个住户都有对应的 service_level 和 color_point
4. **卡片名称**: ActiveBed 卡片使用 `last_name`，Location 卡片使用 `location_name`
5. **卡片地址**: 使用 `location_tag + location_name + BedName` 格式

## 扩展测试数据

如需添加更多测试数据，请：

1. 在 `test/vital-focus/data.ts` 中添加新的卡片定义
2. 更新 `allTestCards` 数组
3. 更新本文档的测试数据参考表

