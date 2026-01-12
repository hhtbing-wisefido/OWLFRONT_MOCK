# OWL Monitor Mock - Docker 部署指南

## 📦 快速开始

### 方式一：使用 Docker Compose（推荐）

```bash
# 构建并启动容器
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止容器
docker-compose down

# 重新构建
docker-compose up -d --build
```

访问地址: http://localhost:3100

### 方式二：使用 Docker 命令

```bash
# 构建镜像
docker build -t owl-monitor-mock:latest .

# 运行容器
docker run -d \
  --name owl-monitor-mock \
  -p 3100:80 \
  --restart unless-stopped \
  owl-monitor-mock:latest

# 查看日志
docker logs -f owl-monitor-mock

# 停止容器
docker stop owl-monitor-mock

# 删除容器
docker rm owl-monitor-mock
```

## 🔧 高级配置

### 自定义端口

修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "8080:80"  # 将3100改为8080
```

### 环境变量配置

在 `docker-compose.yml` 中添加环境变量：

```yaml
environment:
  - TZ=Asia/Shanghai
  - NODE_ENV=production
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
