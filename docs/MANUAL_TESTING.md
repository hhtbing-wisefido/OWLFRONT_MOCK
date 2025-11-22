# 手工测试指南

本文档说明如何进行手工测试，验证登录和 Vital Focus 页面的功能。

## 前置准备

### 1. 启动开发服务器

```bash
npm run dev
```

服务器启动后，访问：http://localhost:3100

### 2. 确认 Mock 模式已启用

打开浏览器控制台（F12），应该能看到：
```
[Mock] API Mock enabled - Using test data
[Mock] Monitor API Mock enabled - Using test data
```

如果看到这些消息，说明 Mock 数据已启用，无需后端服务器即可测试。

---

## 测试流程

### 第一步：测试登录功能

#### 1.1 访问登录页面

- 打开浏览器，访问：http://localhost:3100/login
- 应该能看到登录表单（左侧）和标语（右侧）

#### 1.2 测试账号搜索功能

**测试场景 1：单个机构匹配（Staff）**

1. 在"账号"输入框中输入：`S1` 或 `720101101` 或 `s1@test.com`
2. 等待 500ms（防抖延迟）
3. **预期结果**：
   - 机构选择框自动填充：`Sunset Care Center`
   - 控制台输出：`[Mock] Search Institutions API Request`

**测试场景 2：多个机构匹配（Staff）**

1. 在"账号"输入框中输入：`S2` 或 `720101102` 或 `s2@test.com`
2. 等待 500ms
3. **预期结果**：
   - 机构选择框显示下拉列表，包含：
     - `Sunset Care Center`
     - `Golden Care Center`
   - 需要手动选择一个机构

**测试场景 3：不同机构（Staff）**

1. 在"账号"输入框中输入：`S2` 或 `720101103` 或 `s3@test.com`
2. 等待 500ms
3. **预期结果**：
   - 机构选择框自动填充：`Winds Care Center`

**测试场景 4：账号不存在**

1. 在"账号"输入框中输入：`9999999999`
2. 等待 500ms
3. **预期结果**：
   - 机构选择框为空
   - 不显示任何机构

#### 1.3 测试表单验证

**测试场景 1：必填字段验证**

1. 不填写任何内容，直接点击"Sign In"按钮
2. **预期结果**：
   - 显示错误提示："Please enter your username, email, or phone"
   - 显示错误提示："Please enter your password"

**测试场景 2：账号长度验证**

1. 在"账号"输入框中输入超过 100 个字符
2. 点击"Sign In"按钮
3. **预期结果**：
   - 显示错误提示："Account must not exceed 100 characters"

**测试场景 3：密码长度验证**

1. 在"密码"输入框中输入少于 4 个字符（如：`123`）
2. 点击"Sign In"按钮
3. **预期结果**：
   - 显示错误提示："Password must be at least 4 characters"

4. 输入超过 100 个字符
5. **预期结果**：
   - 显示错误提示："Password must not exceed 100 characters"

#### 1.4 测试登录功能

**测试场景 1：成功登录（Staff - 单个机构）**

1. 选择用户类型：`Staff`
2. 输入账号：`S1` 或 `720101101` 或 `s1@test.com`
3. 输入密码：`Ts123@123`
4. 等待机构自动填充：`Sunset Care Center`
5. 点击"Sign In"按钮
6. **预期结果**：
   - 显示成功消息："Login successful!"
   - 控制台输出：`[Mock] Login API Request`
   - 自动跳转到：`/monitoring/vital-focus`
   - 控制台输出：`[Mock] Get Vital Focus Cards API Request`

**测试场景 2：成功登录（Staff - 多个机构）**

1. 选择用户类型：`Staff`
2. 输入账号：`S2` 或 `720101102` 或 `s2@test.com`
3. 输入密码：`Ts123@123`
4. 等待机构列表显示，选择：`Sunset Care Center`
5. 点击"Sign In"按钮
6. **预期结果**：
   - 显示成功消息："Login successful!"
   - 跳转到 Vital Focus 页面

**测试场景 3：成功登录（Resident）**

1. 选择用户类型：`Resident`
2. 输入账号：`R1` 或 `82010101` 或 `R1@test.com`
3. 输入密码：`Ts123@123`
4. 等待机构自动填充：`Sunset Care Center`
5. 点击"Sign In"按钮
6. **预期结果**：
   - 显示成功消息："Login successful!"
   - 跳转到 Vital Focus 页面

**测试场景 4：密码错误**

1. 选择用户类型：`Staff`
2. 输入账号：`S1`
3. 输入错误密码：`wrongpassword`
4. 点击"Sign In"按钮
5. **预期结果**：
   - 显示错误消息："Invalid password"
   - 不跳转，停留在登录页面

**测试场景 5：账号不存在**

1. 选择用户类型：`Staff`
2. 输入账号：`9999999999`
3. 输入密码：`Ts123@123`
4. 点击"Sign In"按钮
5. **预期结果**：
   - 显示错误消息："Account not found"
   - 不跳转，停留在登录页面

#### 1.5 测试 Cookie 保存功能

1. 成功登录后，关闭浏览器
2. 重新打开浏览器，访问：http://localhost:3100/login
3. **预期结果**：
   - 机构选择框自动填充上次选择的机构名称
   - 用户类型保持上次选择的值

---

### 第二步：测试 Vital Focus 页面

#### 2.1 访问 Vital Focus 页面

**方式 1：通过登录跳转**
- 使用上述登录流程，登录成功后自动跳转

**方式 2：直接访问**
- 访问：http://localhost:3100/monitoring/vital-focus
- **注意**：如果未登录，可能会被路由守卫拦截

#### 2.2 验证卡片显示

登录成功后，应该能看到 **5 张测试卡片**：

**Card 1: ActiveBed - Smith (Sunset)**
- **卡片名称**：`Smith`
- **卡片地址**：`A 院区主楼-E203-BedA`
- **Service Level**：蓝色圆点（L2 - Assisted）
- **设备状态**：雷达和睡眠监测设备都在线
- **实时数据**：呼吸 18 rpm，心率 72 bpm
- **告警**：无

**Card 2: ActiveBed - Johnson (Golden)**
- **卡片名称**：`Johnson`
- **卡片地址**：`B 院区副楼-F305-BedB`
- **Service Level**：黄色圆点（L3 - Memory care）
- **设备状态**：雷达在线，无睡眠监测设备
- **实时数据**：呼吸 20 rpm，心率 85 bpm
- **告警**：L2 级别告警（1 个未处理）

**Card 3: ActiveBed - Williams (Winds)**
- **卡片名称**：`Williams`
- **卡片地址**：`C 院区主楼-G401-BedC`
- **Service Level**：绿色圆点（L1 - Independent）
- **设备状态**：睡眠监测设备离线
- **实时数据**：无（设备离线）
- **告警**：无

**Card 4: Location - E203 (Sunset)**
- **卡片名称**：`E203`
- **卡片地址**：`A 院区主楼-E203`
- **住户**：2 人（Smith - 蓝色，Brown - 橙色）
- **设备状态**：雷达在线
- **告警**：L1 级别告警（2 个未处理，最高级别）

**Card 5: Location - 大厅 (Golden)**
- **卡片名称**：`大厅`
- **卡片地址**：`B 院区副楼-大厅`
- **住户**：无（公共空间）
- **设备状态**：雷达在线
- **告警**：无

#### 2.3 验证 Service Level 颜色点

检查每张卡片上的 Service Level 颜色点：

| Service Level | 颜色 | 说明 |
|--------------|------|------|
| L1 | 绿色 (#28a745) | Independent - 无需协助 |
| L2 | 蓝色 (#007bff) | Assisted - 需部分协助 |
| L3 | 黄色 (#ffc107) | Memory care - 记忆护理 |
| L4 | 橙色 (#fd7e14) | Fall-risk - 跌倒风险 |

**验证方法**：
1. 查看 Card 1 (Smith) - 应该是蓝色圆点
2. 查看 Card 2 (Johnson) - 应该是黄色圆点
3. 查看 Card 3 (Williams) - 应该是绿色圆点
4. 查看 Card 4 (E203) - 应该有两个圆点（蓝色和橙色）

#### 2.4 验证设备状态图标

检查设备状态图标是否正确显示：

- **在线设备**：显示正常图标
- **离线设备**：显示离线图标（灰色或带斜线）

**验证方法**：
1. Card 1：雷达和睡眠监测设备都应该显示在线
2. Card 2：雷达在线，无睡眠监测设备
3. Card 3：睡眠监测设备应该显示离线
4. Card 4 和 Card 5：雷达应该显示在线

#### 2.5 验证机构过滤

**测试场景：不同机构登录**

1. 使用 S1 登录（Sunset 机构）
   - **预期结果**：只显示 Card 1 和 Card 4（Sunset 机构的卡片）

2. 使用 S2 登录，选择 Golden 机构
   - **预期结果**：只显示 Card 2 和 Card 5（Golden 机构的卡片）

3. 使用 S3 登录（Winds 机构）
   - **预期结果**：只显示 Card 3（Winds 机构的卡片）

---

## 测试账号参考表

### Staff 账号

| 账号 | 密码 | 机构 | 场景说明 |
|------|------|------|---------|
| S1 / 720101101 / s1@test.com | Ts123@123 | Sunset | 单个机构，登录成功 |
| S2 / 720101102 / s2@test.com | Ts123@123 | Sunset + Golden | 多个机构（需要选择） |
| S2 / 720101103 / s3@test.com | Ts123@121 | Winds | 相同 username，不同机构 |

### Resident 账号

| 账号 | 密码 | 机构 | 场景说明 |
|------|------|------|---------|
| R1 / 82010101 / R1@test.com | Ts123@123 | Sunset | 单个机构，登录成功 |
| R2 / 82010102 / R2@test.com | Ts123@123 | Sunset + Golden | 多个机构（需要选择） |
| R2 / 82010103 / R3@test.com | Ts123@121 | Winds | 相同 username，不同机构 |

---

## 浏览器控制台检查

### 登录流程控制台输出

成功登录时，控制台应该显示：

```
[Mock] Login API Request
{
  account: "S1",
  password: "***",
  userType: "staff",
  tenant_id: "550e8400-e29b-41d4-a716-446655440000"
}
```

### Vital Focus 页面控制台输出

访问 Vital Focus 页面时，控制台应该显示：

```
[Mock] Get Vital Focus Cards API Request
{
  tenant_id: "550e8400-e29b-41d4-a716-446655440000"
}
```

### 错误情况

如果出现错误，控制台会显示：
- `Failed to fetch vital focus cards: [错误信息]`
- 页面会显示错误提示消息

---

## 常见问题排查

### 1. 页面无法加载

**检查项**：
- 开发服务器是否正在运行（`npm run dev`）
- 浏览器控制台是否有错误信息
- 网络请求是否成功（Network 标签页）

### 2. Mock 数据未启用

**检查项**：
- 控制台是否显示 `[Mock] API Mock enabled`
- 如果没有，检查 `src/api/monitor/monitor.ts` 中的 `useMock` 变量

### 3. 登录后未跳转

**检查项**：
- 控制台是否有错误信息
- 路由配置是否正确（`src/router/index.ts`）
- Pinia store 是否正确保存登录状态

### 4. Vital Focus 页面无数据

**检查项**：
- 控制台是否显示 `[Mock] Get Vital Focus Cards API Request`
- 检查 `test/vital-focus/data.ts` 中的测试数据
- 检查当前登录用户的 `tenant_id` 是否匹配

---

## 测试检查清单

### 登录功能
- [ ] 账号搜索功能正常（单个/多个机构）
- [ ] 表单验证正常（必填、长度限制）
- [ ] 成功登录并跳转
- [ ] 错误处理正常（密码错误、账号不存在）
- [ ] Cookie 保存功能正常

### Vital Focus 页面
- [ ] 卡片列表正常显示（5 张卡片）
- [ ] Service Level 颜色点正确显示
- [ ] 卡片名称和地址正确显示
- [ ] 设备状态图标正确显示
- [ ] 机构过滤功能正常
- [ ] 实时数据显示（如果有）

---

## 下一步测试

完成基础功能测试后，可以测试：

1. **路由守卫**：未登录时访问受保护页面
2. **Token 刷新**：Token 过期时的处理
3. **用户信息刷新**：刷新用户信息 API
4. **登出功能**：登出后清除状态
5. **响应式设计**：不同屏幕尺寸下的显示效果

---

## 注意事项

1. **Mock 数据**：当前使用的是 Mock 数据，不会调用真实后端 API
2. **数据持久化**：刷新页面后，登录状态会丢失（需要实现 Token 持久化）
3. **路由守卫**：部分路由可能需要登录才能访问
4. **浏览器兼容性**：建议使用 Chrome 或 Firefox 最新版本

---

## 联系支持

如果遇到问题：
1. 检查浏览器控制台的错误信息
2. 检查网络请求（Network 标签页）
3. 查看测试数据文件：`test/vital-focus/TEST_DATA.md`
4. 查看测试账号：`test/login/TEST_ACCOUNTS.md`

