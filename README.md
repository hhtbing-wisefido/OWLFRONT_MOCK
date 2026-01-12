# 🦉 OwlCare Monitor - Demo System

> 养老院健康监护系统演示项目 | Senior Care Monitoring System Demo

[![Vue](https://img.shields.io/badge/Vue-3.x-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-Demo-orange.svg)]()
[![Docker](https://img.shields.io/badge/Docker-Available-blue.svg)](https://github.com/hhtbing-wisefido/OWLFRONT_MOCK/pkgs/container/owlfront_mock)

## 🌐 在线演示

**直接访问体验（无需安装）**：

🔗 **http://www.wisefido.com:3100**

> 💡 使用演示账号登录：`admin` / `admin123`

---

## 📋 项目简介

本项目是 OwlCare 养老院健康监护平台的**前端演示系统**，基于 Vue 3 + TypeScript 构建，使用 Mock 数据模拟真实监护场景。适用于产品演示、客户展示和功能验证。

### ✨ 主要特性

| 功能 | 描述 |
|------|------|
| 🏠 **100个模拟设备** | 90个ActiveBed卡片 + 10个Location卡片，分布在5栋楼 |
| 📊 **实时监护卡片** | 呼吸率、心率、在床状态、睡眠阶段实时显示 |
| 🚨 **多级报警系统** | 5级报警（EMERG/ALERT/CRIT/ERR/WARNING） |
| 🔊 **报警声音提示** | L1/L2分级声音，可自定义 |
| 📱 **响应式设计** | 支持PC端、平板和手机 |
| 🎨 **UL 2560合规** | 符合紧急呼叫系统标准设计 |

## 🚀 快速开始

### 方式一：本地开发

#### 1. 安装依赖

```bash
npm install
```

#### 2. 启动开发服务器

```bash
npm run dev
```

#### 3. 访问应用

服务启动后访问：**http://localhost:3100**

### 方式二：Docker 部署（推荐生产环境）

使用 Docker 快速部署，无需安装 Node.js 环境：

#### 首次安装

```bash
# 拉取最新镜像
docker pull ghcr.io/hhtbing-wisefido/owlfront_mock:latest

# 运行容器
docker run -d \
  --name owl-monitor-mock \
  -p 3100:80 \
  --restart unless-stopped \
  ghcr.io/hhtbing-wisefido/owlfront_mock:latest
```

#### 更新到最新版本

```bash
# 停止并删除旧容器
docker stop owl-monitor-mock
docker rm owl-monitor-mock

# 拉取最新镜像
docker pull ghcr.io/hhtbing-wisefido/owlfront_mock:latest

# 启动新容器
docker run -d \
  --name owl-monitor-mock \
  -p 3100:80 \
  --restart unless-stopped \
  ghcr.io/hhtbing-wisefido/owlfront_mock:latest
```

#### 一键更新脚本（推荐）

```bash
#!/bin/bash
# 保存为 update-docker.sh，执行 chmod +x update-docker.sh
docker stop owl-monitor-mock && docker rm owl-monitor-mock
docker pull ghcr.io/hhtbing-wisefido/owlfront_mock:latest
docker run -d --name owl-monitor-mock -p 3100:80 --restart unless-stopped ghcr.io/hhtbing-wisefido/owlfront_mock:latest
echo "✅ 更新完成！访问 http://localhost:3100"
```

访问地址：**http://localhost:3100**

> 📖 详细部署指南请查看 [DOCKER_DEPLOY.md](./DOCKER_DEPLOY.md)
> 
> 🔄 每次推送代码到 `main` 分支，GitHub Actions 会自动构建并推送镜像到 GHCR

## 🔐 Demo 登录账号

| 角色 | 用户名 | 密码 | 说明 |
|------|--------|------|------|
| 管理员 | `admin` | `admin123` | 完整权限，可管理所有功能 |
| 护士 | `nurse1` | `nurse123` | 护理人员权限 |
| 医生 | `doctor1` | `doctor123` | 医疗人员权限 |

> 💡 **提示**：登录页面有"快速登录"按钮，点击即可自动填充账号密码

## 📁 项目结构

```
owl-monitor-mock/
├── src/
│   ├── api/                    # API 接口定义
│   ├── assets/                 # 静态资源（图片、图标）
│   ├── components/             # 公共组件
│   │   └── AlarmHandleModal.vue    # 报警处理弹窗
│   ├── config/                 # 应用配置
│   ├── enums/                  # 枚举定义
│   ├── hooks/                  # 组合式函数
│   ├── layouts/                # 布局组件
│   ├── mock/                   # Mock 数据系统
│   │   ├── mockData.ts             # 100个设备模拟数据
│   │   ├── mockApi.ts              # API 接口模拟
│   │   └── interceptor.ts          # 请求拦截器
│   ├── router/                 # 路由配置
│   ├── store/                  # Vuex 状态管理（旧）
│   ├── stores/                 # Pinia 状态管理
│   ├── utils/                  # 工具函数
│   │   ├── alarm.ts                # 报警处理工具
│   │   └── radar/                  # 雷达相关工具
│   └── views/                  # 页面视图
│       └── monitoring/
│           └── overview/           # 监护总览页面
├── test/                       # 测试数据
├── types/                      # TypeScript 类型定义
├── public/                     # 静态资源
└── package.json
```

## 🎯 核心功能演示

### 1. 监护总览 (Overview)

主页面展示所有监护设备的实时状态：

- **卡片网格展示**：响应式布局，自适应屏幕宽度
- **状态筛选**：Unhandled / Out of Room / Left Bed / Visitor / Awake / Sleep
- **拖拽排序**：可自定义卡片排列顺序
- **Focus功能**：选择关注的卡片进行重点监护

### 2. 报警系统

| 级别 | 名称 | 颜色 | 声音 | 示例场景 |
|------|------|------|------|----------|
| Level 0 | EMERG | 🔴 红色 | L1 紧急 | 跌倒、心率极高 |
| Level 1 | ALERT | 🔴 红色 | L1 紧急 | 心率过高/过低 |
| Level 2 | CRIT | 🟠 橙色 | L2 重要 | 呼吸异常 |
| Level 3 | ERR | 🔵 蓝色 | - | 一般异常 |
| Level 4 | WARNING | 🟡 黄色 | - | 轻微异常 |

**报警卡片特性**：
- 报警浮动条：底部显示报警信息和响应按钮
- Response计时器：显示报警等待响应时间（从报警触发时开始）
- 报警处理弹窗：点击响应按钮可展开详细信息

### 3. 设备卡片类型

#### ActiveBed 卡片（房间监护）
- 显示：房间号、住户姓名、服务等级
- 生命体征：呼吸率(rpm)、心率(bpm)
- 睡眠状态：Awake / Light Sleep / Deep Sleep
- 在床状态：In Bed / Not in Bed
- 设备来源标识：s(Sleepace) / r(Radar)

#### Location 卡片（公共区域）
- 显示：位置名称、楼栋地址
- 人数检测：1-4人
- 姿态识别：Walking / Standing / Sitting / Lying / Fall

### 4. 固定示例场景

前10张卡片包含固定的演示场景（每次刷新保持一致）：

| 卡片 | 场景 | 说明 |
|------|------|------|
| card_001 | 心率过高报警 | 有报警条，心率 120-139 bpm |
| card_002 | 跌倒报警 | 有报警条，离床状态，跌倒姿态 |
| card_003 | 3人访客 | 多人在房间场景 |
| 其他 | 随机场景 | 睡眠/清醒/离床等混合 |

## 🛠 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.x | 前端框架（Composition API） |
| TypeScript | 5.x | 类型安全 |
| Vite | 7.x | 构建工具 |
| Ant Design Vue | 3.x | UI组件库 |
| Pinia | 2.x | 状态管理 |
| Vue Router | 4.x | 路由管理 |

## 📝 Mock 数据说明

本项目使用完全模拟的数据，**无需后端服务**：

- **设备数据**：`src/mock/mockData.ts` - 生成100个模拟设备
- **API拦截**：`src/mock/interceptor.ts` - 拦截所有API请求
- **刷新重置**：每次刷新页面，报警时间和部分随机数据会重置（Demo模式）
- **HIPAA合规**：所有数据为虚构，不包含真实患者信息

### 数据分布

| 类型 | 数量 | 说明 |
|------|------|------|
| ActiveBed | 90 | 房间监护设备 |
| Location | 10 | 公共区域监护 |
| 报警场景 | ~12% | 随机分布各级别报警 |
| 访客场景 | ~10% | 多人在房间 |
| 睡眠场景 | ~45% | Deep/Light Sleep |

## 🔧 常用命令

### 开发命令

```bash
# 开发模式（热更新）
npm run dev

# 构建生产版本（包含类型检查）
npm run build

# 构建生产版本（跳过类型检查，CI/CD使用）
npm run build:prod

# 预览构建结果
npm run preview

# 运行测试
npm run test

# 类型检查
npm run type-check
```

> **💡 build vs build:prod 区别**：
> - `npm run build` = `vue-tsc -b && vite build`（先TypeScript类型检查，再构建）
> - `npm run build:prod` = `vite build`（直接构建，跳过类型检查，速度更快）
> 
> CI/CD 使用 `build:prod` 因为：
> 1. ⚡ 构建速度更快（跳过类型检查）
> 2. 📦 生产环境不包含 test/ 目录，避免582个类型错误
> 3. ✅ 类型检查应在开发阶段完成

### Docker 命令

```bash
# 从 GHCR 拉取并运行（推荐）
docker pull ghcr.io/hhtbing-wisefido/owlfront_mock:latest
docker run -d --name owl-monitor-mock -p 3100:80 --restart unless-stopped ghcr.io/hhtbing-wisefido/owlfront_mock:latest

# 停止容器
docker stop owl-monitor-mock

# 删除容器
docker rm owl-monitor-mock

# 查看日志
docker logs -f owl-monitor-mock

# 查看运行状态
docker ps -a | grep owl-monitor-mock

# 清理旧镜像
docker image prune -a
```

> 📖 更多 Docker 操作请查看 [DOCKER_DEPLOY.md](./DOCKER_DEPLOY.md)

## 📱 响应式断点

| 设备 | 宽度 | 卡片布局 |
|------|------|----------|
| 手机 | < 480px | 1列 |
| 平板 | 480-768px | 2列 |
| 小屏PC | 768-1024px | 3列 |
| 大屏PC | > 1024px | 自适应 |

## 🎨 合规性说明

本项目设计遵循以下标准：

- **UL 2560** - 紧急呼叫系统标准
- **HIPAA** - 健康信息保护（Demo数据不含真实PHI）
- **FDA** - 医疗设备软件指导

## 📄 许可证

本项目仅供演示用途，不可用于生产环境。

---

<div align="center">

**🦉 OwlCare** - 用科技守护每一位长者的健康 ❤️

[在线演示](#) | [问题反馈](https://github.com/hhtbing-wisefido/OWLFRONT_MOCK/issues)

</div>
