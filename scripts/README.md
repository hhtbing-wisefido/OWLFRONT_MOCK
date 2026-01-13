# 🔧 脚本工具目录

本目录包含项目的实用脚本工具。

## 📜 脚本列表

### update-docker.sh - Docker一键更新脚本

**功能**：快速更新服务器上运行的Docker容器到最新版本

**使用方法**：

```bash
# Linux/Mac
chmod +x update-docker.sh
./update-docker.sh

# Windows (PowerShell)
bash update-docker.sh
```

**执行流程**：

1. 🔄 **[1/4] 停止旧容器**
   - 自动检测并停止名为 `owl-monitor-mock` 的容器
   - 删除旧容器释放资源

2. 📦 **[2/4] 拉取最新镜像**
   - 从GHCR拉取 `ghcr.io/hhtbing-wisefido/owlfront_mock:latest`
   - 自动下载最新版本

3. 🚀 **[3/4] 启动新容器**
   - 使用最新镜像启动容器
   - 配置端口映射（3100:80）
   - 设置自动重启策略

4. 📊 **[4/4] 验证状态**
   - 检查容器运行状态
   - 显示容器信息
   - 显示访问地址
   - 提供管理命令提示

**输出示例**：

```
==========================================
🦉 OWL Monitor Mock - Docker 更新工具
==========================================

🔄 [1/4] 停止旧容器...
   ✅ 旧容器已停止并删除

📦 [2/4] 拉取最新镜像...
   ✅ 镜像拉取完成

🚀 [3/4] 启动新容器...
   ✅ 新容器已启动

📊 [4/4] 验证容器状态...
   ✅ 容器运行正常

==========================================
✅ 更新完成！
==========================================

📋 容器信息：
NAMES               STATUS              PORTS
owl-monitor-mock    Up 2 seconds        0.0.0.0:3100->80/tcp

🌐 访问地址：
   本地访问: http://localhost:3100
   服务器访问: http://192.168.1.100:3100

💡 提示：
   - 查看日志: docker logs -f owl-monitor-mock
   - 停止容器: docker stop owl-monitor-mock
   - 重启容器: docker restart owl-monitor-mock
```

**配置参数**：

脚本开头定义了以下可配置参数：

```bash
CONTAINER_NAME="owl-monitor-mock"           # 容器名称
IMAGE_NAME="ghcr.io/hhtbing-wisefido/owlfront_mock:latest"  # 镜像地址
PORT="3100"                                  # 端口映射
```

如需修改，编辑脚本中的这些变量即可。

**适用场景**：

- ✅ 服务器部署后的日常更新
- ✅ CI/CD自动部署
- ✅ 快速回滚到最新版本
- ✅ 批量更新多台服务器

---

## 🛠 未来计划

计划添加的脚本：

- `backup-data.sh` - 数据备份脚本
- `health-check.sh` - 健康检查脚本
- `log-analyzer.sh` - 日志分析脚本
- `deploy-prod.sh` - 生产环境部署脚本

---

## 📝 脚本开发规范

创建新脚本时请遵循以下规范：

1. **文件命名**：使用小写字母和连字符（如：`update-docker.sh`）
2. **文件头**：包含脚本说明和用途
3. **错误处理**：使用 `set -e` 确保出错时立即退出
4. **用户友好**：添加清晰的进度提示和错误信息
5. **配置分离**：将可配置参数放在脚本开头
6. **权限检查**：如需特殊权限，在脚本开头检查

---

## 🔗 相关文档

- [项目主README](../../README.md)
- [Docker部署文档](../README.md#docker-部署)
- [CI/CD指南](../.github/workflows/)

---

<div align="center">

🔧 **高效脚本，简化运维**

</div>
