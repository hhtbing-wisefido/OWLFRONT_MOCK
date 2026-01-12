import re
import os
from pathlib import Path

root = r"D:\7.项目资料\owlFront_mock\project-code\owl-monitor-mock"
files = [
    r"src\api\admin\tags\tags.ts",
    r"src\api\admin\user\user.ts",
    r"src\api\admin\role\role.ts",
    r"src\api\admin\role-permission\rolePermission.ts",
    r"src\api\resident\resident.ts",
    r"src\api\admin\device-store\deviceStore.ts"
]

# 匹配模式: if (useMock) { ... 多行 ... })
pattern = re.compile(
    r"if\s*\(\s*useMock\s*\)\s*\{[^\}]*import\s*\(\s*['\"]@test/index['\"]\s*\)\s*\.then\s*\([^\)]*\{[^\}]*\}\s*\)\s*\.\s*(then|catch)\([^\)]*\{[^\}]*\}[^\)]*\)[^\}]*\}\s*\)\s*\}",
    re.DOTALL | re.MULTILINE
)

# 更简单的模式
pattern2 = re.compile(
    r"if\s*\(\s*useMock\s*\)\s*\{.*?import\s*\(\s*['\"]@test/index['\"]\s*\).*?\}\s*\}\s*\)",
    re.DOTALL
)

total_fixed = 0
total_blocks = 0

for file_path in files:
    full_path = os.path.join(root, file_path)
    if not os.path.exists(full_path):
        print(f"❌ File not found: {file_path}")
        continue
    
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    matches = list(pattern2.finditer(content))
    
    if matches:
        content = pattern2.sub('', content)
        # 清理多余空行
        content = re.sub(r'\n{3,}', '\n\n', content)
        
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Fixed: {file_path} ({len(matches)} blocks)")
        total_fixed += 1
        total_blocks += len(matches)
    else:
        print(f"✅ Clean: {file_path}")

print(f"\n📊 Total: Fixed {total_fixed} files, removed {total_blocks} blocks")
