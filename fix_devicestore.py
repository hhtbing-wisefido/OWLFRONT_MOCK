import re

filepath = r"D:\7.项目资料\owlFront_mock\project-code\owl-monitor-mock\src\views\admin\devicestore.vue"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 移除所有 if (useMock) { ... } else { ... } 块，保留 else 部分
def remove_mock_if_blocks(content):
    lines = content.split('\n')
    result = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # 检测 if (useMock) {
        if re.match(r'^\s*if\s*\(\s*useMock\s*\)\s*\{', line):
            # 跳过整个if块，找到对应的else
            brace_count = 1
            i += 1
            while i < len(lines) and brace_count > 0:
                if '{' in lines[i]:
                    brace_count += lines[i].count('{')
                if '}' in lines[i]:
                    brace_count -= lines[i].count('}')
                i += 1
            
            # 现在i指向else行或下一个语句
            if i < len(lines) and re.match(r'^\s*else\s*\{', lines[i]):
                # 跳过 'else {' 这一行
                indent = len(lines[i]) - len(lines[i].lstrip())
                i += 1
                
                # 复制else块的内容，并减少缩进
                brace_count = 1
                while i < len(lines) and brace_count > 0:
                    current_line = lines[i]
                    if current_line.strip() == '}' and brace_count == 1:
                        # 结束的}，跳过
                        i += 1
                        break
                    
                    if '{' in current_line:
                        brace_count += current_line.count('{')
                    if '}' in current_line:
                        brace_count -= current_line.count('}')
                    
                    # 减少缩进
                    if current_line.startswith(' ' * indent):
                        result.append(current_line[indent:])
                    else:
                        result.append(current_line)
                    i += 1
            continue
        else:
            result.append(line)
            i += 1
    
    return '\n'.join(result)

new_content = remove_mock_if_blocks(content)

# 清理多余空行
new_content = re.sub(r'\n{3,}', '\n\n', new_content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Fixed devicestore.vue - removed all useMock blocks")
