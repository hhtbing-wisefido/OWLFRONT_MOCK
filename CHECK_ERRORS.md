# 错误修复检查清单

## ✅ 已修复项

### 1. handleDeleteBuilding 未定义错误
- ✅ useBuilding.ts 中已定义（第 185 行）
- ✅ useBuilding.ts 中已导出（第 251 行）
- ✅ UnitList.vue 中已解构（第 1002 行）
- ✅ UnitList.vue 中已使用 wrapper（第 1006 行）

### 2. expandedRooms.value.add 错误
- ✅ useBed.ts 中已修复（3 处都使用 .value.add）
- ✅ useDevice.ts 中已修复（1 处使用 .value.add）
- ✅ useRoom.ts 中已修复（1 处使用 .value.add）
- ✅ UnitList.vue 中已修复（1 处使用 .value.add）

### 3. 模板中的函数调用
- ✅ handleToggleBuildingTag → handleToggleBuildingTagWrapper（第 62 行）
- ✅ handleToggleBuildingCard → handleToggleBuildingCardWrapper（第 155 行）
- ✅ handleDeleteBuilding → handleDeleteBuildingWrapper（第 114, 207 行）

### 4. is_active 字段错误
- ✅ UnitList.vue 中已移除（第 1237 行）
- ✅ useBuilding.ts 中已移除（2 处）
- ✅ UnitView.vue 中已移除（第 294 行）

### 5. 未使用的导入
- ✅ 已清理 Modal 导入（移至 composable）
- ✅ 已清理未使用的 API 导入

## 🔍 验证命令

```bash
# 检查 linter 错误
npm run lint

# 检查 TypeScript 错误
npx vue-tsc --noEmit
```

