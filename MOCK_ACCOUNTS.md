# Mock账号信息

本项目使用以下Mock账号进行演示：

## Staff 账号（工作人员）

### 管理员账号
- **用户名**: `admin`
- **密码**: `admin123`
- **角色**: Admin
- **姓名**: John Smith (Admin)
- **邮箱**: admin@owlcare.com
- **权限**: 完整管理权限，可访问所有页面（除系统级别页面）

### 护士账号
- **用户名**: `nurse1`
- **密码**: `nurse123`
- **角色**: Nurse
- **姓名**: Mary Johnson (Nurse)
- **邮箱**: mary.j@owlcare.com
- **权限**: 监控、报警记录、居民管理、标签管理

### 管理者账号（医生）
- **用户名**: `doctor1`
- **密码**: `doctor123`
- **角色**: Manager
- **姓名**: Dr. David Wilson (Manager)
- **邮箱**: david.w@owlcare.com
- **权限**: 监控、报警记录、居民管理、设备管理、用户管理

---

## Resident 账号（居民/家属）

### 居民账号
- **用户名**: `resident1`
- **密码**: `resident123`
- **角色**: Resident
- **姓名**: Emily Brown (Resident)
- **邮箱**: emily.b@owlcare.com
- **权限**: 仅能查看自己的监控数据和联系人信息

### 家属账号
- **用户名**: `family1`
- **密码**: `family123`
- **角色**: Family
- **姓名**: Robert Brown (Family)
- **邮箱**: robert.b@owlcare.com
- **权限**: 查看关联居民的监控数据和报警云记录

---

## 使用说明

1. 在登录页面选择 **Staff** 或 **Resident** 选项卡
2. 根据选择的类型，会显示不同的快速登录按钮：
   - **Staff**: Admin、Nurse、Manager
   - **Resident**: Resident、Family
3. 点击对应的"快速登录"按钮
4. 账号和密码会自动填充
5. 点击"Sign In"即可登录

## 权限差异说明

不同角色登录后看到的页面和功能不同：

| 功能模块 | Admin | Manager | Nurse | Resident | Family |
|---------|-------|---------|-------|----------|--------|
| 监控概览 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 报警记录 | ✅ | ✅ | ✅ | ❌ | ❌ |
| 报警云 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 居民管理 | ✅ | ✅ | ✅ | ✅ | ❌ |
| 设备管理 | ✅ | ✅ | ❌ | ❌ | ❌ |
| 用户管理 | ✅ | ✅ | ❌ | ❌ | ❌ |
| 角色管理 | ✅ | ✅ | ❌ | ❌ | ❌ |
| 标签管理 | ✅ | ✅ | ✅ | ❌ | ❌ |

## Mock数据说明

- 项目包含100个模拟设备数据
- 设备分布在Building A-E共5栋楼
- 包含正常、报警、睡眠等多种状态
- 所有数据符合真实养老院监控场景
