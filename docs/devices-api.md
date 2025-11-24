# Devices Management API 接口文档

## 概述

设备管理 API 用于管理 `devices` 表中的设备信息。本模块仅处理租户设备管理界面相关的功能，不包括设备库存管理、位置绑定、监护状态管理等（这些功能属于其他模块）。

## v1.5 API 端点

```
# 设备列表和详情
GET    /device/api/v1/device/items                    # 获取设备列表（支持筛选、搜索、分页，排序由前端处理）
GET    /device/api/v1/device/:id                      # 获取设备详情（暂不实现详情页）

# 设备更新
PUT    /device/api/v1/device/:id                     # 更新设备信息（device_name, business_access）

# 设备删除
DELETE /device/api/v1/device/:id                     # 删除设备（由 server 判断物理删除或软删除）
```

### 基础路径
- 开发环境：支持 Mock 模式（使用测试数据）
- 生产环境：`/device/api/v1/device`

---

## 1. 获取设备列表 (getDevicesApi)

### 功能描述
获取当前租户的设备列表，支持筛选、搜索和分页（排序由前端处理）。

### 请求参数 (GetDevicesParams)

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `tenant_id` | string | 否 | 租户 ID。如果不提供，后端应使用当前登录用户的 tenant_id |
| `status` | string[] | 否 | 状态过滤。可选值：'online', 'offline', 'error', 'disabled'。数组形式，支持多选 |
| `search_type` | string | 否 | 搜索类型。可选值：'device_name', 'serial_number', 'uid' |
| `search_keyword` | string | 否 | 搜索关键词。与 `search_type` 配合使用，进行模糊搜索 |
| `page` | number | 否 | 页码。从 1 开始，默认 1 |
| `size` | number | 否 | 每页数量。默认 10 |

### 响应数据 (GetDevicesResult)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `items` | Device[] | 设备列表数组 |
| `total` | number | 符合条件的设备总数（用于分页） |

### 业务规则

1. **默认过滤规则**：
   - 如果 `status` 参数为空或未提供，默认过滤掉 `status = 'disabled'` 的设备
   - 如果提供了 `status` 数组，则只返回匹配状态的设备

2. **搜索功能**：
   - `search_type` 和 `search_keyword` 必须同时提供才生效
   - 搜索为模糊匹配（包含关系），不区分大小写
   - 搜索字段：
     - `device_name`：按设备名称搜索
     - `serial_number`：按序列号搜索
     - `uid`：按 UID 搜索

3. **排序功能**：排序由前端 Vue 处理，server 只返回原始数据，不进行排序。

4. **分页功能**：分页从第 1 页开始，返回 `total` 字段用于计算总页数。

5. **权限控制**：只能查询当前租户的设备。如果未提供 `tenant_id`，后端应自动使用当前登录用户的 `tenant_id`。

---

## 2. 获取设备详情 (getDeviceDetailApi)

**注意：** 此接口暂不实现详情页，保留用于后续扩展。

### 功能描述
根据设备 ID 获取单个设备的详细信息。

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `deviceId` | string | 是 | 设备 ID（UUID） |

### 响应数据
返回完整的 Device 对象。

### 业务规则
- 只能查询当前租户的设备
- 设备不存在或无权限：返回 404/403 错误

---

## 3. 更新设备信息 (updateDeviceApi)

### 功能描述
更新设备的部分信息。目前仅支持更新 `device_name` 和 `business_access` 字段。

**注意：** 前端采用即时生效模式，用户修改后立即调用此接口保存，无需点击 Save 按钮。

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `deviceId` | string | 是 | 设备 ID（UUID） |
| `params` | UpdateDeviceParams | 是 | 更新参数对象 |

### 更新参数 (UpdateDeviceParams)

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `device_name` | string | 否 | 设备名称。用户自定义的设备名称 |
| `business_access` | string | 否 | 租户业务接入权限。可选值：'pending', 'approved', 'rejected' |

**注意**：
- 至少需要提供一个字段进行更新
- 其他字段（如 `device_model`, `device_type`, `serial_number` 等）为只读字段，不能通过此接口更新
- 这些只读字段由设备自身提供，需要通过设备同步机制更新

### 响应数据

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `success` | boolean | 更新是否成功 |

### 业务规则

1. **字段更新规则**：
   - `device_name`：用户自定义设备名称
   - `business_access`：设备审批状态（'pending'/'approved'/'rejected'）

2. **权限验证**：只能更新当前租户的设备，需要 Admin/Director/IT 权限。

3. **验证规则**：
   - `device_name`：不能为空
   - `business_access`：必须是有效值

4. **错误处理**：设备不存在返回 404，无权限返回 403，参数验证失败返回 400。

---

## 4. 删除设备 (deleteDeviceApi)

### 功能描述
删除设备。根据设备是否使用过，执行物理删除或软删除。

**注意：** 前端采用即时生效模式，用户点击删除按钮后立即调用此接口，删除前会有确认提示。

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `deviceId` | string | 是 | 设备 ID（UUID） |

### 响应数据

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `success` | boolean | 删除是否成功 |

### 业务规则

1. **删除判断逻辑**（由后端 server 执行）：
   - 检查 `iot_timeseries` 表中是否有该设备的数据记录
   - **如果 `iot_timeseries` 有数据**（设备使用过）：
     - 执行**软删除**：设置 `status = 'disabled'`
     - 保留设备记录，便于审计和追溯
   - **如果 `iot_timeseries` 无数据**（设备未使用过）：
     - 执行**物理删除**：从 `devices` 表中删除记录

2. **设备"使用过"的定义**：在 `iot_timeseries` 表中有该设备的数据记录。

3. **权限验证**：只能删除当前租户的设备，需要 Admin/Director/IT 权限。

4. **查询过滤**：默认查询时过滤 `status = 'disabled'` 的设备，可通过 Status 筛选器显示/隐藏。

5. **错误处理**：设备不存在返回 404，无权限返回 403，删除失败返回 500。

---

## 业务规则总结

### 1. 设备审批流程
- 新设备：`business_access = 'pending'`（待审批）
- 审批状态：`'approved'`（允许）或 `'rejected'`（拒绝）

### 2. 设备状态
- `'online'`：在线
- `'offline'`：离线
- `'error'`：错误
- `'disabled'`：已禁用（软删除状态）

### 3. 设备删除
- **物理删除**：设备未使用过（`iot_timeseries` 表中无数据）
- **软删除**：设备使用过，设置 `status = 'disabled'`

### 4. 只读字段
以下字段为设备自身属性，只能从设备读取，不能通过 API 更新：
`device_model`, `device_type`, `serial_number`, `uid`, `imei`, `comm_mode`, `firmware_version`, `mcu_model`, `status`

---

## 权限要求

| 操作 | 角色 |
|------|------|
| 设备列表查看 | Admin, Director, IT, NurseManager |
| 设备编辑 | Admin, Director, IT |
| 设备删除 | Admin, Director, IT |
| 设备审批 | Admin, Director |

---

## 错误处理

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 注意事项

1. **租户隔离**：所有操作必须在租户范围内进行
2. **只读字段**：设备自身属性字段不能通过 API 更新，只能从设备读取
3. **删除策略**：删除操作由后端判断是物理删除还是软删除
4. **默认过滤**：查询设备列表时，默认过滤掉 `status = 'disabled'` 的设备
5. **搜索功能**：搜索为模糊匹配，不区分大小写
6. **排序功能**：排序由前端 Vue 处理，server 只返回原始数据

