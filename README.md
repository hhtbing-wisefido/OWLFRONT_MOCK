# 🦉 OwlCare Monitor - Demo System

> 养老院健康监护系统演示项目 | Senior Care Monitoring System Demo

## 📋 项目简介

本项目是 OwlCare 养老院健康监护平台的**前端演示系统**，基于 Vue 3 + TypeScript 构建，使用 Mock 数据模拟真实监护场景。

**主要特性：**
- 🏠 100个模拟设备，分布在5栋楼（Building A-E）
- 📊 实时监护卡片展示（呼吸、心率、在床状态）
- 🚨 多级报警系统（紧急/重要/一般）
- 🔊 报警声音提示（L1/L2分级）
- 📱 响应式设计，支持移动端

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

服务启动后访问：http://localhost:3100

## 🔐 Demo 登录账号

| 角色 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| 管理员 | `admin` | `admin123` | 完整权限 |
| 护士 | `nurse1` | `nurse123` | 护理人员权限 |
| 医生 | `doctor1` | `doctor123` | 医疗人员权限 |

> 💡 登录页面有"快速登录"按钮，点击即可自动填充账号密码

## 📁 项目结构

```
owl-monitor-mock/
├── src/
│   ├── api/            # API 接口定义
│   ├── components/     # 公共组件
│   │   ├── AlarmHandleModal.vue   # 报警处理弹窗
│   │   └── DeviceCard.vue         # 设备卡片
│   ├── mock/           # Mock 数据和拦截器
│   │   ├── mockData.ts            # 设备/报警模拟数据
│   │   └── mockApi.ts             # API 拦截
│   ├── views/          # 页面视图
│   │   └── monitoring/overview/   # 监护总览页面
│   ├── utils/          # 工具函数
│   │   └── radar/alarmSound.ts    # 报警声音
│   └── router/         # 路由配置
├── test/               # 测试数据（被源码引用）
├── types/              # TypeScript 类型定义
└── public/             # 静态资源
```

## 🎯 核心功能演示

### 1. 监护总览 (Overview)
- 设备卡片网格展示
- 按状态筛选（全部/报警/正常/离线）
- 按楼栋/楼层筛选
- 实时更新生命体征数据

### 2. 报警系统
- **报警级别**：
  - 🔴 Level 0-1: 紧急报警（红色边框，L1声音）
  - 🟠 Level 2: 重要报警（橙色边框，L2声音）
  - 🔵 Level 3-4: 一般报警（蓝色边框）
- **报警浮动条**：点击可展开处理弹窗
- **Response计时器**：显示报警等待响应时间

### 3. 设备卡片
- 显示：房间号、住户姓名、设备状态
- 生命体征：呼吸率、心率
- 状态图标：在床/离床/报警
- 底部状态栏：实时状态文字

## 🛠 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.x | 前端框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 7.x | 构建工具 |
| Ant Design Vue | 3.x | UI组件库 |
| Pinia | 2.x | 状态管理 |
| Vue Router | 4.x | 路由管理 |

## 📝 Mock 数据说明

本项目使用完全模拟的数据，**无需后端服务**：

- 设备数据在 `src/mock/mockData.ts` 中定义
- 每次刷新页面，报警时间重置（Demo模式）
- 登录验证通过本地Mock实现

## 🔧 常用命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 运行测试
npm run test
```

## 📄 许可证

本项目仅供演示用途。

---

**OwlCare** - 用科技守护每一位长者的健康 🦉❤️
