import os
import re

root = r"D:\7.项目资料\owlFront_mock\project-code\owl-monitor-mock\src\api"

def fix_file(filepath):
    """修复文件中的残留mock代码"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 模式1: 删除孤立的console.log + return语句 (没有函数包装)
    # 匹配: console.log(...\n  params,\n  })\n  return xxx.mockXxx(...)
    pattern1 = re.compile(
        r'  // In development with mock enabled, return mock data directly\s*\n'
        r'\s*console\.log\([^)]+\),\s*\{\s*\n'
        r'(?:\s+\w+,\s*\n)*'  # 参数行
        r'\s*\}\)\s*\n'
        r'\s*return\s+\w+\.\w+\([^)]*\)\s*\n'
        r'\s*\}\)\s*\n'
        r'\s*\}\s*\n'
        r'\s*\n'
        r'\s*// Production: Call real API\s*\n',
        re.MULTILINE
    )
    content = pattern1.sub('', content)
    
    # 模式2: 删除有then/catch的残留块
    pattern2 = re.compile(
        r'  // In development with mock enabled, return mock data directly\s*\n'
        r'\s*console\.log\([^)]+,\s*\{[^}]+\}\)\s*\n'
        r'\s*return\s+\w+\.\w+\([^)]*\)\.then\([^}]+\{[^}]+\}\s*\)\.catch\([^}]+\{[^}]+\}\s*\)\s*\n'
        r'\s*\}\)\s*\n'
        r'\s*\}\s*\n'
        r'\s*\n'
        r'\s*// Production: Call real API\s*\n',
        re.MULTILINE
    )
    content = pattern2.sub('', content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

# 修复所有API文件
fixed_count = 0
for dirpath, dirnames, filenames in os.walk(root):
    for filename in filenames:
        if filename.endswith('.ts') and not filename.endswith('.test.ts'):
            filepath = os.path.join(dirpath, filename)
            if fix_file(filepath):
                rel_path = os.path.relpath(filepath, root)
                print(f"✅ Fixed: {rel_path}")
                fixed_count += 1

print(f"\n📊 Total: Fixed {fixed_count} files")
