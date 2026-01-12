@echo off
REM OWL Monitor Mock - Docker 快速部署脚本
REM 适用于 Windows

echo ========================================
echo 🦉 OwlCare Monitor Mock - Docker 部署脚本
echo ========================================
echo.

REM 检查 Docker 是否安装
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: Docker 未安装
    echo 请先安装 Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM 检查 Docker 是否运行
docker info >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: Docker 未运行
    echo 请先启动 Docker Desktop
    pause
    exit /b 1
)

echo ✅ Docker 环境检查通过
echo.

REM 选择部署方式
echo 请选择部署方式:
echo 1) 使用 Docker Compose (推荐)
echo 2) 使用 Docker 命令
echo.
set /p choice="请输入选项 (1/2): "

if "%choice%"=="1" (
    echo.
    echo 📦 使用 Docker Compose 部署...
    docker-compose up -d --build
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ 部署完成!
        echo 🌐 访问地址: http://localhost:3100
        echo.
        echo 常用命令:
        echo   查看日志: docker-compose logs -f
        echo   停止服务: docker-compose down
        echo   重启服务: docker-compose restart
    ) else (
        echo ❌ 部署失败，请检查错误信息
        pause
        exit /b 1
    )
) else if "%choice%"=="2" (
    echo.
    echo 📦 使用 Docker 命令部署...
    
    REM 构建镜像
    echo 正在构建镜像...
    docker build -t owl-monitor-mock:latest .
    
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 镜像构建失败
        pause
        exit /b 1
    )
    
    REM 停止并删除旧容器（如果存在）
    docker stop owl-monitor-mock >nul 2>nul
    docker rm owl-monitor-mock >nul 2>nul
    
    REM 运行新容器
    echo 启动容器...
    docker run -d --name owl-monitor-mock -p 3100:80 --restart unless-stopped owl-monitor-mock:latest
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ 部署完成!
        echo 🌐 访问地址: http://localhost:3100
        echo.
        echo 常用命令:
        echo   查看日志: docker logs -f owl-monitor-mock
        echo   停止服务: docker stop owl-monitor-mock
        echo   删除容器: docker rm owl-monitor-mock
    ) else (
        echo ❌ 容器启动失败
        pause
        exit /b 1
    )
) else (
    echo ❌ 无效选项
    pause
    exit /b 1
)

echo.
echo 📚 测试账号:
echo   管理员: admin / admin123
echo   护士: nurse1 / nurse123
echo   医生: doctor1 / doctor123
echo.
echo 📖 详细文档: DOCKER_DEPLOY.md
echo.
pause
