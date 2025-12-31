# 报警系统测试验证脚本

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   报警系统改进测试验证" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 检查服务器是否运行
Write-Host "1. 检查开发服务器状态..." -ForegroundColor Yellow
$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3100" -Method Head -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        $serverRunning = $true
        Write-Host "   ✓ 服务器正在运行 (http://localhost:3100)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ 服务器未运行" -ForegroundColor Red
    Write-Host "   请先启动: npm run dev" -ForegroundColor Yellow
}

Write-Host ""

# 检查关键文件是否存在
Write-Host "2. 检查关键文件..." -ForegroundColor Yellow
$files = @(
    "src\components\AlarmHandleModal.vue",
    "src\mock\mockData.ts",
    "src\views\monitoring\overview\Overview.vue"
)

$allFilesExist = $true
foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        Write-Host "   ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file (未找到)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Write-Host ""

# 统计代码改动
Write-Host "3. 代码改动统计..." -ForegroundColor Yellow
Write-Host "   - mockData.ts: 报警级别增强 (5个级别: 0-4)" -ForegroundColor White
Write-Host "   - mockData.ts: Location报警概率生成 (30%)" -ForegroundColor White
Write-Host "   - AlarmHandleModal.vue: 新增Modal组件 (680px宽)" -ForegroundColor White
Write-Host "   - Overview.vue: 集成确认功能" -ForegroundColor White

Write-Host ""

# 测试指引
Write-Host "4. 手动测试步骤..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   步骤1: 打开浏览器访问 http://localhost:3100" -ForegroundColor Cyan
Write-Host "   步骤2: 使用Staff账号登录" -ForegroundColor Cyan
Write-Host "          用户名: staff@wisefido.com" -ForegroundColor White
Write-Host "          密码: staff123" -ForegroundColor White
Write-Host ""
Write-Host "   步骤3: 在Overview页面查找报警卡片" -ForegroundColor Cyan
Write-Host "          - 红色弹出条: Level 0-1 (紧急/警告)" -ForegroundColor Red
Write-Host "          - 黄色弹出条: Level 2-4 (严重/错误/警告)" -ForegroundColor Yellow
Write-Host "          预期: 约15-20张卡片有报警" -ForegroundColor White
Write-Host ""
Write-Host "   步骤4: 点击弹出条上的 'View' 按钮" -ForegroundColor Cyan
Write-Host "          应该打开报警详情Modal" -ForegroundColor White
Write-Host ""
Write-Host "   步骤5: 验证Modal内容" -ForegroundColor Cyan
Write-Host "          ✓ 报警级别徽章 (颜色和文本)" -ForegroundColor White
Write-Host "          ✓ 报警详情 (类型、卡片、状态、时间)" -ForegroundColor White
Write-Host "          ✓ 触发数据 (心率/呼吸/姿态/位置)" -ForegroundColor White
Write-Host "          ✓ 阈值信息 (Max/Min)" -ForegroundColor White
Write-Host ""
Write-Host "   步骤6: 点击 'Acknowledge Alert' 按钮" -ForegroundColor Cyan
Write-Host "          ✓ 加载状态显示 (800ms)" -ForegroundColor White
Write-Host "          ✓ 成功消息提示" -ForegroundColor White
Write-Host "          ✓ Modal自动关闭" -ForegroundColor White
Write-Host "          ✓ 卡片弹出条消失" -ForegroundColor White
Write-Host ""
Write-Host "   步骤7: 刷新页面重新测试" -ForegroundColor Cyan
Write-Host "          观察不同的报警级别分布" -ForegroundColor White

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   测试准备完成!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

if ($serverRunning) {
    Write-Host "现在可以开始测试了!" -ForegroundColor Green
    Write-Host "按任意键打开浏览器..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Start-Process "http://localhost:3100"
} else {
    Write-Host "请先启动开发服务器:" -ForegroundColor Yellow
    Write-Host "  cd project-code\owl-monitor-mock" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
}
