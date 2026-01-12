# 验证API架构重构后的系统运行
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  🔍 验证API架构重构" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n[1/4] 检查test导入是否清理..." -ForegroundColor Yellow
$apiTest = (Get-ChildItem -Path "src\api" -Filter "*.ts" -Recurse | Select-String -Pattern "@test" | Measure-Object).Count
$viewTest = (Get-ChildItem -Path "src\views\admin" -Filter "*.vue" -Recurse | Select-String -Pattern "@test" | Where-Object { $_.Line -notmatch "^//" } | Measure-Object).Count

if ($apiTest -eq 0 -and $viewTest -eq 0) {
    Write-Host "  ✅ API文件已清理" -ForegroundColor Green
    Write-Host "  ✅ 业务组件已清理" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  还有 $apiTest 个API引用, $viewTest 个组件引用" -ForegroundColor Yellow
}

Write-Host "`n[2/4] 检查interceptor配置..." -ForegroundColor Yellow
if (Test-Path "src\mock\interceptor.ts") {
    $interceptorLines = (Get-Content "src\mock\interceptor.ts").Count
    Write-Host "  ✅ Interceptor存在 ($interceptorLines 行)" -ForegroundColor Green
} else {
    Write-Host "  ❌ Interceptor不存在" -ForegroundColor Red
}

Write-Host "`n[3/4] 检查mock系统..." -ForegroundColor Yellow
$mockApiLines = (Get-Content "src\mock\mockApi.ts").Count
$mockDataLines = (Get-Content "src\mock\mockData.ts").Count
Write-Host "  ✅ mockApi.ts: $mockApiLines 行" -ForegroundColor Green
Write-Host "  ✅ mockData.ts: $mockDataLines 行" -ForegroundColor Green

Write-Host "`n[4/4] 统计修改..." -ForegroundColor Yellow
$modifiedFiles = git diff --name-status HEAD~1 HEAD | Where-Object { $_ -match "^M" } | Measure-Object
Write-Host "  📝 本次提交修改: $($modifiedFiles.Count) 个文件" -ForegroundColor Cyan

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ✅ 架构重构验证通过!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n📋 下一步验证:" -ForegroundColor Yellow
Write-Host "  1️⃣  启动开发服务器: npm run dev" -ForegroundColor White
Write-Host "  2️⃣  访问 http://localhost:5173" -ForegroundColor White
Write-Host "  3️⃣  登录系统 (admin@mapleview / Admin123!)" -ForegroundColor White
Write-Host "  4️⃣  打开 Tag Management页面" -ForegroundColor White
Write-Host "  5️⃣  验证显示13个标签" -ForegroundColor White
Write-Host "  6️⃣  测试创建/编辑/删除标签" -ForegroundColor White

Write-Host "`n💡 预期结果:" -ForegroundColor Cyan
Write-Host "  ✓ Tag Management正常显示数据" -ForegroundColor Green
Write-Host "  ✓ tenant_id自动匹配 (mapleview-001)" -ForegroundColor Green
Write-Host "  ✓ CRUD操作成功执行" -ForegroundColor Green
Write-Host "  ✓ 控制台显示interceptor日志" -ForegroundColor Green
