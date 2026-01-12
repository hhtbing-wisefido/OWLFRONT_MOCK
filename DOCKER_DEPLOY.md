# OWL Monitor Mock - Docker 部署指南

## 📦 快速开始

> 💡 **说明**: 本项目是纯前端 Mock Demo，推荐使用简单的 Docker 命令即可。Docker Compose 配置保留供参考。

### 方式一：从 GitHub Container Registry 拉取（推荐）

```bash
# 拉取最新镜像
docker pull ghcr.io/hhtbing-wisefido/owlfront_mock:latest

# 运行容器
docker run -d \
  --name owl-monitor-mock \
  -p 3100:80 \
  --restart unless-stopped \
  ghcr.io/hhtbing-wisefido/owlfront_mock:latest

# 查看日志
docker logs -f owl-monitor-mock
```

访问地址: http://localhost:3100

### 方式二：本地构建 Docker 镜像

```bash
# 构建镜像
docker build -t owl-monitor-mock:latest .

# 运行容器
docker run -d \
  --name owl-monitor-mock \
  -p 3100:80 \
  --restart unless-stopped \
  owl-monitor-mock:latest
```

### 方式三：使用 Docker Compose（可选）

如果您更习惯使用 Docker Compose：

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止容器
docker-compose down
```

## 🤔 为什么保留 Docker Compose？

虽然本项目是纯前端 Mock Demo，但保留 Docker Compose 配置的原因：

1. **统一接口**: 对于习惯 Docker Compose 的开发者更友好
2. **配置管理**: 所有参数集中在 `docker-compose.yml` 中，便于维护
3. **示例参考**: 如果将来需要扩展，可以作为参考

**但对于本项目，直接使用 Docker 命令更简单直接！** ✅

---

## 📋 部署方式选择指南

| 场景 | 推荐方式 | 理由 |
|-----|---------|------|
| **服务器部署** | ✅ 从 GHCR 拉取 | 自动构建，无需本地编译 |
| **本地开发测试** | 本地构建 | 快速验证修改 |
| **习惯 Compose** | Docker Compose | 配置集中，命令统一 |
| **快速体验** | ✅ 从 GHCR 拉取 | 一行命令启动 |

---

## 🔄 CI/CD 自动构建

本项目配置了 GitHub Actions，每次推送代码到 `main` 分支时自动构建并推送 Docker 镜像到 GitHub Container Registry (GHCR)。

### 镜像标签说明

| 标签 | 说明 | 示例 |
|-----|------|------|
| `latest` | 最新稳定版本 | `ghcr.io/hhtbing-wisefido/owlfront_mock:latest` |
| `main-{sha}` | 具体提交版本 | `ghcr.io/hhtbing-wisefido/owlfront_mock:main-abc1234` |
| `v{version}` | 语义化版本号 | `ghcr.io/hhtbing-wisefido/owlfront_mock:v1.3.0` |

### 查看可用镜像

访问 GitHub Packages 页面查看所有可用镜像：
https://github.com/hhtbing-wisefido/OWLFRONT_MOCK/pkgs/container/owlfront_mock

### 更新到最新版本

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

---
| **单一前端应用** | ✅ Docker 命令 | 简单、直接、无需额外依赖 |
| **习惯 Compose** | Docker Compose | 配置集中，命令统一 |
| **快速测试** | ✅ Docker 命令 | 一行命令启动 |

---

## 🔧 高级配置

### 自定义端口（Docker 命令）

```bash
# 使用不同的端口
docker run -d \
  --name owl-monitor-mock \
  -p 8080:80 \
  --restart unless-stopped \
  owl-monitor-mock:latest
```

### 自定义端口（Docker Compose）

修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "8080:80"  # 将3100改为8080
```

### 容器资源限制（Docker 命令）

```bash
docker run -d \
  --name owl-monitor-mock \
  -p 3100:80 \
  --memory="512m" \
  --cpus="1.0" \
  --restart unless-stopped \
  owl-monitor-mock:latest
```

### 容器资源限制（Docker Compose）

修改 `docker-compose.yml`：

```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 512M
    reservations:
      cpus: '0.5'
      memory: 256M
```

### 使用自定义 Nginx 配置

如果需要修改 Nginx 配置，编辑 `nginx.conf` 文件后重新构建镜像。

## 🏗️ 多阶段构建说明

Dockerfile 使用多阶段构建优化镜像大小：

- **Stage 1 (builder)**: 使用 Node.js 镜像构建应用
- **Stage 2 (production)**: 使用 Nginx Alpine 镜像运行应用

最终镜像大小约 ~40MB（相比单阶段构建的 ~1GB）

## 📊 健康检查

容器内置健康检查，每30秒检查一次应用状态：

```bash
# 查看容器健康状态
docker ps

# 查看健康检查日志
docker inspect owl-monitor-mock | grep -A 10 Health
```

## 🌐 生产环境部署

### 使用反向代理（推荐）

配合 Nginx 或 Traefik 作为反向代理：

```nginx
# Nginx 配置示例
server {
    listen 80;
    server_name owl.example.com;

    location / {
        proxy_pass http://localhost:3100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### HTTPS 配置

使用 Let's Encrypt 配置 HTTPS：

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d owl.example.com
```

## 🐛 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker logs owl-monitor-mock

# 检查容器状态
docker ps -a

# 进入容器调试
docker exec -it owl-monitor-mock sh
```

### 端口冲突

```bash
# 查看端口占用
netstat -ano | findstr :3100  # Windows
lsof -i :3100                  # Linux/Mac

# 修改端口
# 编辑 docker-compose.yml 中的 ports 配置
```

### 构建失败

```bash
# 清理 Docker 缓存
docker system prune -a

# 重新构建
docker-compose build --no-cache
```

## 📈 性能优化

### 镜像优化

- ✅ 使用 Alpine 基础镜像
- ✅ 多阶段构建减小体积
- ✅ .dockerignore 排除不必要文件

### Nginx 优化

- ✅ 启用 Gzip 压缩
- ✅ 静态资源缓存
- ✅ 安全头配置

### 资源限制

在生产环境建议限制容器资源：

```yaml
services:
  owl-monitor-mock:
    # ... 其他配置
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M
```

## 🔐 安全建议

1. **不要在镜像中包含敏感信息**
2. **定期更新基础镜像**
3. **使用非 root 用户运行**（可选）
4. **启用容器安全扫描**

```bash
# 使用 Trivy 扫描镜像
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image owl-monitor-mock:latest
```

## 📝 版本管理

### 标签镜像

```bash
# 构建并标签
docker build -t owl-monitor-mock:1.2.0 .
docker tag owl-monitor-mock:1.2.0 owl-monitor-mock:latest

# 推送到私有仓库（可选）
docker tag owl-monitor-mock:latest registry.example.com/owl-monitor-mock:latest
docker push registry.example.com/owl-monitor-mock:latest
```

## 🔄 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建并部署
docker-compose up -d --build

# 或者使用零停机更新
docker-compose up -d --force-recreate --no-deps owl-monitor-mock
```

## 📞 支持

如遇问题，请查看：
- 项目 README.md
- MOCK_ACCOUNTS.md（测试账号）
- GitHub Issues

---

**注意**: 本 Mock 系统仅用于演示和测试，不包含真实医疗数据。所有数据均为模拟生成。
