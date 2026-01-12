# 多阶段构建 - Stage 1: 构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖（增加超时时间）
RUN npm ci --legacy-peer-deps --timeout=600000

# 复制项目文件
COPY . .

# 设置 Node.js 内存限制，构建项目
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# 多阶段构建 - Stage 2: 生产阶段
FROM nginx:alpine

# 维护者信息
LABEL maintainer="hhtbing-wisefido"
LABEL description="OWL Monitor Mock System - Frontend Application"
LABEL version="1.2.0"

# 复制构建产物到nginx目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
