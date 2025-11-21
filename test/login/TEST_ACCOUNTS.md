# 测试账号完整参考表

## 测试账号列表

| Type | User | Username/Phone/Email | Password | Institution | 场景说明 |
|------|------|---------------------|----------|-------------|----------|
| Staff | S1 | S1 / 720101101 / s1@test.com | Ts123@123 | Sunset | 单个机构，登录成功 |
| Staff | S2 | S2 / 720101102 / s2@test.com | Ts123@123 | Sunset + Golden | 多个机构（跨机构账号） |
| Staff | S3 | S2 / 720101103 / s3@test.com | Ts123@121 | Winds | 相同 username，不同 phone/email/password，不同机构 |
| Resident | R1 | R1 / 82010101 / R1@test.com | Ts123@123 | Sunset | 单个机构，登录成功 |
| Resident | R2 | R2 / 82010102 / R2@test.com | Ts123@123 | Sunset + Golden | 多个机构（跨机构账号） |
| Resident | R3 | R2 / 82010103 / R3@test.com | Ts123@121 | Winds | 相同 username，不同 phone/email/password，不同机构 |

## 场景说明

### S2 vs S3 的差异

- **S2**: `S2` / `720101102` / `s2@test.com` / `Ts123@123`
  - 在 **Sunset** 和 **Golden** 两个机构
  - 测试场景：**跨机构账号**（同一账号在多个机构）

- **S3**: `S2` / `720101103` / `s3@test.com` / `Ts123@121`
  - 在 **Winds** 机构
  - 测试场景：**相同 username，不同 phone/email/password，不同机构**
  - 注意：虽然 username 相同（S2），但 phone 不同（720101103），email 不同（s3@test.com），密码不同（Ts123@121），所以是不同的账号

### 测试场景覆盖

1. **单个机构匹配**
   - S1 → Sunset（单个）
   - R1 → Sunset（单个）

2. **多个机构匹配（跨机构）**
   - S2 → Sunset + Golden（需要选择）
   - R2 → Sunset + Golden（需要选择）

3. **不同机构**
   - S3 → Winds
   - R3 → Winds

4. **账号格式测试**
   - Username: `S1`, `R1`
   - Phone: `720101101`, `82010101`
   - Email: `s1@test.com`, `R1@test.com`

## 使用说明

### 在登录页面测试

1. **测试单个机构（Staff）**
   - 账号：`S1` 或 `720101101` 或 `s1@test.com`
   - 密码：`Ts123@123`
   - 预期：自动匹配到 Sunset 机构

2. **测试多个机构（Staff）**
   - 账号：`S2` 或 `720101102` 或 `s2@test.com`
   - 密码：`Ts123@123`
   - 预期：显示 Sunset 和 Golden 两个机构，需要选择

3. **测试相同 username 但不同密码（Staff）**
   - 账号：`S2` 或 `720101103` 或 `s3@test.com`
   - 密码：`Ts123@121`（注意：不是 Ts123@123）
   - 预期：匹配到 Winds 机构

### 在代码中使用

```typescript
import { login } from '@/test/index'

// 使用测试账号
const account = 'S1'  // 或 '720101101' 或 's1@test.com'
const password = 'Ts123@123'
```

## 注意事项

1. **S2 和 S3 的区别**：
   - S2: username `S2`, phone `720101102`, email `s2@test.com`, password `Ts123@123`，在 Sunset + Golden
   - S3: username `S2`, phone `720101103`, email `s3@test.com`, password `Ts123@121`，在 Winds
   - 虽然 username 相同（S2），但 phone、email、password 都不同，所以是不同的账号

2. **跨机构账号**：
   - S2 和 R2 都在多个机构，测试时需要选择机构

3. **密码说明**：
   - S1, S2, R1, R2 使用密码：`Ts123@123`
   - S3, R3 使用密码：`Ts123@121`（用于测试相同 username 但不同密码的场景）

