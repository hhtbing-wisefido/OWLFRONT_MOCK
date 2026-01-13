#!/bin/bash
# OWL Monitor Mock - Docker 一键更新脚本
# 用于快速更新服务器上运行的 Docker 容器到最新版本

set -e  # 遇到错误立即退出

echo "=========================================="
echo "🦉 OWL Monitor Mock - Docker 更新工具"
echo "=========================================="
echo ""

# 容器配置
CONTAINER_NAME="owl-monitor-mock"
IMAGE_NAME="ghcr.io/hhtbing-wisefido/owlfront_mock:latest"
PORT="3100"

# 步骤1: 停止旧容器
echo "🔄 [1/4] 停止旧容器..."
if docker ps -a | grep -q $CONTAINER_NAME; then
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    echo "   ✅ 旧容器已停止并删除"
else
    echo "   ℹ️  未发现旧容器"
fi
echo ""

# 步骤2: 拉取最新镜像
echo "📦 [2/4] 拉取最新镜像..."
docker pull $IMAGE_NAME
echo "   ✅ 镜像拉取完成"
echo ""

# 步骤3: 启动新容器
echo "🚀 [3/4] 启动新容器..."
docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT:80 \
  --restart unless-stopped \
  $IMAGE_NAME

# 等待容器启动
sleep 2
echo "   ✅ 新容器已启动"
echo ""

# 步骤4: 验证状态
echo "📊 [4/4] 验证容器状态..."
if docker ps | grep -q $CONTAINER_NAME; then
    echo "   ✅ 容器运行正常"
    echo ""
    echo "=========================================="
    echo "✅ 更新完成！"
    echo "=========================================="
    echo ""
    
    # 显示容器信息
    echo "📋 容器信息："
    docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    
    # 显示访问地址
    echo "🌐 访问地址："
    echo "   本地访问: http://localhost:$PORT"
    
    # 尝试获取服务器IP（Linux）
    if command -v hostname &> /dev/null; then
        SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "N/A")
        if [ "$SERVER_IP" != "N/A" ]; then
            echo "   服务器访问: http://$SERVER_IP:$PORT"
        fi
    fi
    
    echo ""
    echo "💡 提示："
    echo "   - 查看日志: docker logs -f $CONTAINER_NAME"
    echo "   - 停止容器: docker stop $CONTAINER_NAME"
    echo "   - 重启容器: docker restart $CONTAINER_NAME"
    echo ""
else
    echo "   ❌ 容器启动失败"
    echo ""
    echo "查看日志排查问题："
    echo "   docker logs $CONTAINER_NAME"
    exit 1
fi
