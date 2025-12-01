# Unit Create/Edit/Delete 属性处理检查报告

## 数据库字段列表（根据 05_units.sql）

1. **必填字段**：
   - `unit_id` (UUID, primary key)
   - `tenant_id` (UUID, required)
   - `location_tag` (VARCHAR(255) NOT NULL, 默认 '-')
   - `unit_name` (VARCHAR(255) NOT NULL)
   - `building` (VARCHAR(50) NOT NULL DEFAULT '-')
   - `floor` (VARCHAR(50) NOT NULL DEFAULT '1F')
   - `unit_number` (VARCHAR(255) NOT NULL)
   - `unit_type` (VARCHAR(20) NOT NULL)
   - `is_public_space` (BOOLEAN NOT NULL DEFAULT FALSE)
   - `is_multi_person_room` (BOOLEAN NOT NULL DEFAULT FALSE)
   - `timezone` (VARCHAR(50) NOT NULL)

2. **可选字段**：
   - `area_tag` (VARCHAR(255))
   - `layout_config` (JSONB)
   - `primary_resident_id` (UUID)
   - `alarm_user_ids` (UUID[])
   - `alarm_tags` (VARCHAR[])

## Create Unit 属性处理检查

### ✅ 已处理的字段
- `unit_number` ✅ (form 字段)
- `unit_name` ✅ (form 字段)
- `unit_type` ✅ (form 字段)
- `building` ✅ (form > selectedBuilding > '-')
- `floor` ✅ (form > selectedFloor > '1F')
- `location_tag` ✅ (form > selectedBuilding > '-')
- `area_tag` ✅ (form 字段)
- `is_public_space` ✅ (form 字段)
- `is_multi_person_room` ✅ (form 字段)
- `timezone` ✅ (form 字段)

### ⚠️ 未处理的字段（不在表单中）
- `layout_config` - 可选字段，不在当前表单中
- `primary_resident_id` - 可选字段，不在当前表单中
- `alarm_user_ids` - 可选字段，不在当前表单中
- `alarm_tags` - 可选字段，不在当前表单中

### 📝 代码位置
- `src/views/units/composables/useUnit.ts` - `handleCreateUnit` (lines 155-234)
- `src/views/units/UnitList.vue` - `handleCreateUnit` wrapper (lines 1392-1526)

## Edit Unit 属性处理检查

### ✅ 已处理的字段（表单中有）
- `unit_name` ✅ (editUnitForm.unit_name)
- `unit_number` ✅ (editUnitForm.unit_number, disabled when editing)
- `unit_type` ✅ (editUnitForm.unit_type)
- `area_tag` ✅ (editUnitForm.area_tag)
- `is_public_space` ✅ (editUnitForm.is_public_space)
- `is_multi_person_room` ✅ (editUnitForm.is_multi_person_room)
- `timezone` ✅ (editUnitForm.timezone)

### ⚠️ 未处理的字段（不在编辑表单中）
- `building` - 位置字段，通常创建后不修改
- `floor` - 位置字段，通常创建后不修改
- `location_tag` - 位置字段，通常创建后不修改
- `layout_config` - 可选字段，不在当前表单中
- `primary_resident_id` - 可选字段，不在当前表单中
- `alarm_user_ids` - 可选字段，不在当前表单中
- `alarm_tags` - 可选字段，不在当前表单中

### 📝 代码位置
- `src/views/units/composables/useUnit.ts` - `handleSaveUnit` (lines 274-324)
- `src/views/units/UnitList.vue` - Edit Unit Modal (lines 357-500+)

## Delete Unit 属性处理检查

### ✅ 处理正确
- 使用 `deleteUnitApi(unit_id)` 删除
- 有确认对话框
- 删除后重置表单

### 📝 代码位置
- `src/views/units/composables/useUnit.ts` - `handleDeleteUnit` (lines 327-362)

## 总结

### ✅ 所有表单字段都已正确处理
- Create 表单中的所有字段都已正确传递到 API
- Edit 表单中的所有字段都已正确传递到 API

### ⚠️ 可选字段说明
- `layout_config`, `primary_resident_id`, `alarm_user_ids`, `alarm_tags` 不在当前表单中
- 这些字段可以在后续需要时添加到表单中

### 📌 位置字段处理
- `building`, `floor`, `location_tag` 在编辑时通常不修改（位置信息）
- 这是合理的设计，因为修改位置会影响 unit 的显示和查询
- 如果确实需要修改，可以在编辑表单中添加这些字段

### 🔍 建议
1. 所有表单中的字段都已正确处理 ✅
2. 可选字段（不在表单中）已添加注释说明 ✅
3. 位置字段在编辑时不修改是合理的设计 ✅

