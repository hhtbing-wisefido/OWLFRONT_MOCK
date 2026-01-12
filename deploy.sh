#!/bin/bash

# OWL Monitor Mock - Docker 快速部署脚本
# 适用于 Linux/Mac

set -e

echo "🦉 OwlCare Monitor Mock - Docker 部署脚本"
echo "============================================"
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: Docker 未安装"
    echo "请先安装 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ 错误: Docker Compose 未安装"
    echo "请先安装 Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker 环境检查通过"
echo ""

# 选择部署方式
echo "请选择部署方式:"
echo "1) 使用 Docker Compose (推荐)"
echo "2) 使用 Docker 命令"
echo ""
read -p "请输入选项 (1/2): " choice

case $choice in
    1)
        echo ""
        echo "📦 使用 Docker Compose 部署..."
        docker-compose up -d --build
        echo ""
        echo "✅ 部署完成!"
        echo "🌐 访问地址: http://localhost:3100"
        echo ""
        echo "常用命令:"
        echo "  查看日志: docker-compose logs -f"
        echo "  停止服务: docker-compose down"
        echo "  重启服务: docker-compose restart"
        ;;
    2)
        echo ""
        echo "📦 使用 Docker 命令部署..."
        
        # 构建镜像
        echo "正在构建镜像..."
        docker build -t owl-monitor-mock:latest .
        
        # 停止并删除旧容器（如果存在）
        if [ "$(docker ps -aq -f name=owl-monitor-mock)" ]; then
            echo "停止旧容器..."
            docker stop owl-monitor-mock 2>/dev/null || true
            docker rm owl-monitor-mock 2>/dev/null || true
        fi
        
        # 运行新容器
        echo "启动容器..."
        docker run -d \
            --name owl-monitor-mock \
            -p 3100:80 \
            --restart unless-stopped \
            owl-monitor-mock:latest
        
        echo ""
        echo "✅ 部署完成!"
        echo "🌐 访问地址: http://localhost:3100"
        echo ""
        echo "常用命令:"
        echo "  查看日志: docker logs -f owl-monitor-mock"
        echo "  停止服务: docker stop owl-monitor-mock"
        echo "  删除容器: docker rm owl-monitor-mock"
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac

echo ""
echo "📚 测试账号:"
echo "  管理员: admin / admin123"
echo "  护士: nurse1 / nurse123"
echo "  医生: doctor1 / doctor123"
echo ""
echo "📖 详细文档: DOCKER_DEPLOY.md"
