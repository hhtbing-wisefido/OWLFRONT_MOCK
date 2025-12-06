# Radar 组件差异报告

## 确认：原版 vue_radar 未被修改 ✅

原版 `vue_radar` 的组件文件（`src/components/*.vue`）**没有被修改**。

## owlFront 中的差异类型

### 1. 导入路径差异（必需，因为目录结构不同）

这些差异是**必需的**，因为 `owlFront` 的目录结构与 `vue_radar` 不同：

- `@/stores/objects` → `@/stores/radar/objects`
- `@/stores/radarData` → `@/stores/radar/radarData`
- `@/stores/canvas` → `@/stores/radar/canvas`
- `@/utils/mockRadarData` → `@/utils/radar/mockRadarData`
- `@/utils/types` → `@/utils/radar/types`
- `@/utils/postureIcons` → `@/utils/radar/postureIcons`
- `@/utils/drawObjects` → `@/utils/radar/drawObjects`
- `@/utils/drawShapes` → `@/utils/radar/drawShapes`
- `@/utils/radarUtils` → `@/utils/radar/radarUtils`
- `@/utils/alarmSound` → `@/utils/radar/alarmSound`
- `../config/radarMqttConfig` → `@/config/radarMqttConfig`

### 2. 文本国际化（之前按要求修改）

这些是**之前按要求修改的**，将用户可见的中文文本改为英文：

- **console.log/warn/error 消息**：中文 → 英文
- **UI 提示（alert/confirm/prompt）**：中文 → 英文
- **title 属性**：中文 → 英文
- **按钮文本**：保持英文（原版就是英文）

### 3. 功能修改

#### HRRRWaveform.vue
- **Line 493**: 添加了 `color` 的默认值 `'#cccccc'`
  ```typescript
  // 原版：
  const color = SLEEP_STATE_COLORS[sleepState];
  
  // 新版：
  const color = SLEEP_STATE_COLORS[sleepState] || '#cccccc'; // 默认灰色
  ```
  **原因**：修复 TypeScript 错误（`color` 可能是 `undefined`）

### 4. 样式差异

**当前状态**：已恢复为与原版一致
- `.hrrr-waveform` 的 `padding: 8px`（已恢复）

## 如何对比原版和新版

### 方法 1：使用 diff 命令
```bash
cd /Users/sady3721/project
diff -u vue_radar/src/components/HRRRWaveform.vue owlFront/src/components/Radar/HRRRWaveform.vue
```

### 方法 2：使用 git diff（如果原版是 git 仓库）
```bash
cd /Users/sady3721/project/vue_radar
git diff src/components/HRRRWaveform.vue
```

### 方法 3：检查特定文件
```bash
# 检查原版是否被修改
cd /Users/sady3721/project/vue_radar
git status src/components/*.vue

# 对比两个文件
diff vue_radar/src/components/HRRRWaveform.vue owlFront/src/components/Radar/HRRRWaveform.vue
```

## 需要恢复的修改

如果您发现任何不应该存在的差异，可以：

1. **恢复 console.log 消息**：将英文改回中文（如果不需要国际化）
2. **恢复 UI 提示**：将英文改回中文（如果不需要国际化）
3. **其他功能修改**：根据实际需求决定是否保留

## 注意事项

- **导入路径差异是必需的**，不能恢复
- **文本国际化**可以根据需求决定是否保留
- **功能修改**（如 color 默认值）是为了修复错误，建议保留

