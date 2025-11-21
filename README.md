# OwlFront - v1.5 前端项目

## 项目概述

本项目是 Wisefido 平台 v1.5 版本的前端应用，基于 Vue 3 + TypeScript + Vite 构建。

## 项目架构

### v1.0 原项目

- **wisefido-frontend** (`../wisefido-frontend`)
  - v1.0 版本的前端项目
  - 作为零组件仓库，供新项目参考和复用组件

- **wisefido-backend** (`../wisefido-backend`)
  - v1.0 版本的后端服务

### v1.5 新项目

- **owlRD** (`../owlRD`)
  - v1.5 版本的需求文档及底层数据库设计
  - 包含需求文档、数据库设计、技术文档等

- **owlFront** (当前项目)
  - v1.5 版本的前端应用
  - 基于原 v1.0 项目的接口模式进行镜像重开发
  - 保持原项目的接口模式，根据新需求完全新建
  - 原项目仅作为零组件仓库

- **vue_radar** (`../vue_radar`)
  - 替换原 v1.0 中的 radar 轨迹展示模块
  - 独立的雷达轨迹可视化组件

## 技术栈

- Vue 3 (Composition API)
- TypeScript
- Vite
- Ant Design Vue
- Pinia (状态管理)
- Vue Router
- Axios (HTTP 请求)

## 接口模式

本项目保持与原 v1.0 项目 (`wisefido-frontend`) 相同的接口模式：

- 使用统一的 `defHttp` 实例进行 HTTP 请求
- API 文件组织方式：`src/api/[module]/[module].ts`
- 数据模型定义：`src/api/[module]/model/[module]Model.ts`
- 支持 Token 自动刷新、请求重试、错误统一处理等特性

## 开发说明

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
owlFront/
├── src/
│   ├── api/          # API 接口定义
│   ├── components/   # 组件
│   ├── hooks/        # 组合式函数
│   ├── router/       # 路由配置
│   ├── store/        # 状态管理
│   ├── utils/        # 工具函数
│   ├── views/        # 页面视图
│   └── main.ts       # 入口文件
├── public/           # 静态资源
└── package.json      # 项目配置
```

## 相关项目

- [wisefido-frontend](../wisefido-frontend) - v1.0 前端（零组件仓库）
- [wisefido-backend](../wisefido-backend) - v1.0 后端
- [owlRD](../owlRD) - v1.5 需求及数据库设计
- [vue_radar](../vue_radar) - 雷达轨迹展示模块


测试方法：
terminal:
npm run test:forgot-password

chrome上看
cd /Users/sady3721/project/owlFront && npm run test:ui
等待几秒让 Vitest UI 启动，然后检查输出：
sleep 3 && echo "Vitest UI should be starting..."
Vitest UI should be starting...

打开浏览器，访问：
http://localhost:51204/__vitest__/
或查看终端输出的 URL（通常类似 http://localhost:51204/__vitest__/）
如果端口不同，检查终端输出中的实际 URL。
