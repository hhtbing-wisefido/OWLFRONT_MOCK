# 批量修复API文件，移除test目录依赖
# 让所有请求通过interceptor处理

Write-Host "`n🔧 开始修复API文件..." -ForegroundColor Cyan

$files = @(
    "src/api/admin/tags/tags.ts",
    "src/api/card-overview/cardOverview.ts",
    "src/api/admin/user/user.ts",
    "src/api/admin/role/role.ts",
    "src/api/admin/role-permission/rolePermission.ts",
    "src/api/resident/resident.ts",
    "src/api/devices/device.ts",
    "src/api/units/unit.ts",
    "src/api/monitors/monitor.ts",
    "src/api/alarm/alarm.ts",
    "src/api/settings/settings.ts",
    "src/api/service-level/serviceLevel.ts",
    "src/api/admin/device-store/deviceStore.ts"
)

$totalFixed = 0
$totalBlocks = 0

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "`n📄 处理: $file" -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw -Encoding UTF8
        $originalContent = $content
        
        # 匹配并移除 useMock 条件判断块
        # 匹配模式: if (useMock) { ... import('@test/index') ... }
        $pattern = '(?s)if\s*\(\s*useMock\s*\)\s*\{[^}]*import\s*\(\s*[''"]@test/index[''"]\s*\)[^}]*\}[^\n]*\n\s*'
        
        $matches = [regex]::Matches($content, $pattern)
        $blockCount = $matches.Count
        
        if ($blockCount -gt 0) {
            # 移除所有匹配的块
            $content = [regex]::Replace($content, $pattern, '')
            
            # 移除多余的空行
            $content = $content -replace '(\r?\n){3,}', "`n`n"
            
            # 保存文件
            [System.IO.File]::WriteAllText($file, $content, [System.Text.UTF8Encoding]::new($false))
            
            Write-Host "  ✅ 移除了 $blockCount 个test导入块" -ForegroundColor Green
            $totalBlocks += $blockCount
            $totalFixed++
        } else {
            Write-Host "  ℹ️  没有找到test导入" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ⚠️  文件不存在: $file" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "修复完成!" -ForegroundColor Green
Write-Host "  处理文件数: $($files.Count)" -ForegroundColor White
Write-Host "  修改文件数: $totalFixed" -ForegroundColor Green
Write-Host "  移除test块: $totalBlocks" -ForegroundColor Yellow
Write-Host "`n现在所有API请求将通过interceptor处理" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
