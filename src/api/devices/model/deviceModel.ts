/**
 * Device API 数据模型定义
 * 对应 owlRD/db/11_devices.sql 中的 devices 表结构
 */

/**
 * 设备基础信息（租户设备管理界面）
 */
export interface Device {
  device_id: string
  tenant_id: string
  device_name: string // 可编辑
  device_model: string // 只读，从设备读取
  device_type: string // 'Radar' | 'SleepPad' | 'VibrationSensor' | 'Gateway' | ...，只读，从设备读取
  serial_number?: string // 只读，从设备读取
  uid?: string // 只读，从设备读取
  imei?: string // 只读，从设备读取
  comm_mode: string // 'WiFi' | 'LTE' | 'Zigbee' | ...，只读，从设备读取
  firmware_version: string // 只读，从设备读取
  mcu_model?: string // 只读，从设备读取
  status: 'online' | 'offline' | 'error' | 'disabled' // 只读，从设备读取
  business_access: 'pending' | 'approved' | 'rejected' // 可编辑，租户业务接入权限
  monitoring_enabled?: boolean // 监控启用状态
  device_code?: string // 设备代码
  // 以下字段不在租户设备管理界面处理：
  // location_id?: string // 在 Location 模块处理
  // bound_room_id?: string // 在 Location 模块处理
  // bound_bed_id?: string // 在 Location 模块处理
  // metadata?: Record<string, any> // 在 alarm/IoT alarm monitor 模块处理
}

/**
 * 获取设备列表请求参数
 */
export interface GetDevicesParams {
  tenant_id?: string // 租户 ID（可选，如果不提供则使用当前用户的 tenant_id）
  device_type?: string // 设备类型过滤（可选）
  status?: string[] // 状态过滤（可选，数组：['online', 'offline', 'error', 'disabled']）
  business_access?: 'pending' | 'approved' | 'rejected' // 审批状态过滤（可选）
  search_type?: 'device_name' | 'serial_number' | 'uid' // 搜索类型（可选）
  search_keyword?: string // 搜索关键词（可选）
  page?: number // 页码（可选）
  size?: number // 每页数量（可选）
  sort?: string // 排序字段（可选）
  direction?: 'asc' | 'desc' // 排序方向（可选）
}

/**
 * 获取设备列表响应
 */
export interface GetDevicesResult {
  items: Device[]
  total: number
}

/**
 * 更新设备请求参数
 */
export interface UpdateDeviceParams {
  device_name?: string
  business_access?: 'pending' | 'approved' | 'rejected'
  // 设备绑定字段
  location_id?: string | null // 绑定到 Unit（location）
  bound_room_id?: string | null // 绑定到 Room
  bound_bed_id?: string | null // 绑定到 Bed
}

/**
 * 删除设备请求参数
 */
export interface DeleteDeviceParams {
  device_id: string
}

