import os
import re

root = r"D:\7.项目资料\owlFront_mock\project-code\owl-monitor-mock\src\api"

def check_syntax_errors(filepath):
    """检查文件是否有语法错误"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    errors = []
    
    # 检查1: 孤立的 console.log 和 return (没有if/function包装)
    if re.search(r'^\s*console\.log\(.*\n\s*params,\s*\n\s*\}\)\s*\n\s*return\s+\w+\.', content, re.MULTILINE):
        errors.append("孤立的console.log和return语句")
    
    # 检查2: 多余的闭合括号
    if re.search(r'^\s*\}\)\s*\n\s*\}\s*\n\s*return defHttp', content, re.MULTILINE):
        errors.append("多余的闭合括号")
    
    # 检查3: 缺少函数声明
    if re.search(r'const useMock.*\n.*\n\s+return defHttp', content):
        errors.append("可能缺少函数声明")
    
    return errors

# 检查所有API文件
problem_files = []
for dirpath, dirnames, filenames in os.walk(root):
    for filename in filenames:
        if filename.endswith('.ts') and not filename.endswith('.test.ts'):
            filepath = os.path.join(dirpath, filename)
            errors = check_syntax_errors(filepath)
            if errors:
                rel_path = os.path.relpath(filepath, root)
                problem_files.append((rel_path, errors))
                print(f"❌ {rel_path}")
                for error in errors:
                    print(f"   - {error}")

if not problem_files:
    print("✅ 没有发现语法错误")
else:
    print(f"\n⚠️  发现 {len(problem_files)} 个文件有问题")
