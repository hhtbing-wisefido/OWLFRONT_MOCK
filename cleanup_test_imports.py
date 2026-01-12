import re
import os

root = r"D:\7.项目资料\owlFront_mock\project-code\owl-monitor-mock\src\api"

def remove_mock_blocks(content):
    """移除所有 if (useMock) { ... } 块"""
    lines = content.split('\n')
    result = []
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # 检测到 if (useMock) 开始
        if re.match(r'^\s*if\s*\(\s*useMock\s*\)', line):
            # 跳过这一行和后续的块，直到找到 return defHttp
            i += 1
            while i < len(lines):
                if re.match(r'^\s*return\s+defHttp', lines[i]):
                    result.append(lines[i])
                    i += 1
                    break
                i += 1
        else:
            result.append(line)
            i += 1
    
    return '\n'.join(result)

total_fixed = 0

for dirpath, dirnames, filenames in os.walk(root):
    for filename in filenames:
        if filename.endswith('.ts'):
            filepath = os.path.join(dirpath, filename)
            
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if '@test' in content:
                new_content = remove_mock_blocks(content)
                
                # 清理多余空行
                new_content = re.sub(r'\n{3,}', '\n\n', new_content)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                rel_path = os.path.relpath(filepath, root)
                print(f"✅ Cleaned: {rel_path}")
                total_fixed += 1

print(f"\n📊 Total: Fixed {total_fixed} files")
