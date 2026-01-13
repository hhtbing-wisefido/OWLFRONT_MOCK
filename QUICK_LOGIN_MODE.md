# Quick Login 模式切换说明

## 概述

Quick Login 支持两种显示模式：

1. **Simple 模式（正式版）** - 只显示3个核心角色
2. **Full 模式（测试版）** - 显示所有L1-L4角色

## 模式对比

### Simple 模式（生产环境）
- ✅ 适用于正式部署
- ✅ 只显示3个核心角色：
  - 👨‍💼 Admin
  - 👨‍⚕️ Manager
  - 🤝 Caregiver
- ✅ 界面简洁，适合演示

### Full 模式（开发/测试环境）
- ✅ 适用于开发测试
- ✅ 显示所有角色分层：
  - L1-SYS: SysAdmin, SysOperator
  - L2-MGT: Admin, Manager
  - L3-SUP: IT
  - L4-OPS: Nurse, Caregiver
- ✅ 方便测试不同权限

## 如何切换模式

### 方法1: 修改环境变量（推荐）

#### 开发环境（.env.development）
```env
# Full模式 - 显示所有L1-L4角色
VITE_QUICK_LOGIN_MODE=full
```

#### 生产环境（.env.production）
```env
# Simple模式 - 只显示3个核心角色
VITE_QUICK_LOGIN_MODE=simple
```

### 方法2: 手动切换（临时）

在 `src/views/login/LoginForm.vue` 中修改：

```typescript
// 修改这行代码
const quickLoginMode = import.meta.env.VITE_QUICK_LOGIN_MODE || 'full'

// 临时切换为simple模式：
const quickLoginMode = 'simple'

// 临时切换为full模式：
const quickLoginMode = 'full'
```

## 构建说明

### 开发模式（npm run dev）
- 自动使用 `.env.development` 配置
- 默认为 `full` 模式

### 生产构建（npm run build）
- 自动使用 `.env.production` 配置
- 默认为 `simple` 模式

### 预览生产构建（npm run preview）
- 使用生产环境配置
- 可以验证 `simple` 模式效果

## 配置文件位置

```
project-root/
├── .env.development     # 开发环境配置
└── .env.production      # 生产环境配置
```

## 注意事项

1. **修改环境变量后需要重启开发服务器**
   ```bash
   # 停止当前服务（Ctrl+C）
   # 重新启动
   npm run dev
   ```

2. **环境变量只在构建时生效**
   - 不能在运行时动态切换
   - 需要重新构建才能生效

3. **建议保留Full模式配置**
   - 在开发环境保持 `full` 模式
   - 方便随时测试不同角色
   - 生产环境使用 `simple` 模式

## 快速测试

### 测试Simple模式
```bash
# 方法1: 临时设置环境变量
set VITE_QUICK_LOGIN_MODE=simple && npm run dev

# 方法2: 修改.env.development
# VITE_QUICK_LOGIN_MODE=simple
npm run dev
```

### 测试Full模式
```bash
# 方法1: 临时设置环境变量
set VITE_QUICK_LOGIN_MODE=full && npm run dev

# 方法2: 修改.env.development（默认）
# VITE_QUICK_LOGIN_MODE=full
npm run dev
```

## 演示效果

### Simple模式登录页面
```
🎯 Quick Login (Mock Demo)
👇 Select Role

[👨‍💼 Admin] [👨‍⚕️ Manager] [🤝 Caregiver]
```

### Full模式登录页面
```
🎯 Quick Login (Mock Demo)
👇 Select Level & Role

Level: [L1-SYS] [L2-MGT] [L3-SUP] [L4-OPS]

Roles: (根据选择的Level显示对应角色)
```

## 账号信息

所有模式都使用相同的Mock账号：

| 角色 | 用户名 | 密码 |
|-----|--------|------|
| Admin | admin | admin123 |
| Manager | doctor1 | doctor123 |
| Caregiver | caregiver1 | care123 |
| SysAdmin | sysadmin | sysadmin123 |
| SysOperator | sysoperator | sysop123 |
| IT | it1 | it123 |
| Nurse | nurse1 | nurse123 |

## 相关文件

- 环境配置: `.env.development`, `.env.production`
- 登录组件: `src/views/login/LoginForm.vue`
- Mock账号: `src/mock/mockData.ts`
