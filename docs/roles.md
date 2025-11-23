# 角色管理功能设计文档

## 功能概述

角色管理功能用于管理系统中的角色定义，包括系统预置角色和自定义角色。角色定义了用户在系统中的职责和权限范围。

## 用户界面

### 页面布局

- **顶部工具栏**：左侧搜索框和搜索按钮，右侧创建角色按钮
- **角色列表表格**：显示所有角色信息

### 表格列

| 列名 | 说明 | 特性 |
|------|------|------|
| Role Code | 角色编码 | 灵活宽度（80-150px），不换行，超长省略 |
| Description | 角色描述 | 灵活宽度，占用剩余空间，支持换行 |
| Status | 角色状态 | 固定 80px，Active（绿色）/ Inactive（红色），无边框 |
| Operation | 操作按钮 | 固定 280px，Edit、Delete 和 Disable 按钮，间距 20px |

### 创建/编辑角色对话框

**表单字段**：
- **Role Code**（必填）：角色编码，唯一索引，创建后不能修改（编辑时禁用）
- **Display Name**（必填）：角色显示名称
- **Description**（可选）：角色描述，最大 500 字符，显示字符计数

**操作按钮**：Cancel（取消）、Confirm（确认）

### 删除/禁用确认对话框

- **图标**：警告图标（黄色）
- **消息**：显示角色名称和编码的确认信息
- **操作按钮**：Cancel（取消）、Confirm（确认）

## 按钮功能

### 搜索按钮

**位置**：顶部工具栏左侧

**功能**：根据输入关键词搜索角色（Role Code、Display Name、Description），实时提交到服务器，更新表格显示。

### Create Role 按钮

**位置**：顶部工具栏右侧

**功能**：打开创建角色对话框，初始化空表单。

### Edit 按钮

**位置**：表格 Operation 列

**显示条件**：所有角色都显示

**功能**：打开编辑角色对话框，允许修改 Display Name 和 Description。

**限制**：系统角色的 Role Code 字段禁用，不能修改。

### Delete 按钮

**位置**：表格 Operation 列

**显示条件**：仅自定义角色显示

**功能**：打开删除确认对话框，确认后删除角色。

**限制**：系统角色不允许删除（按钮不显示）。

### Disable 按钮

**位置**：表格 Operation 列

**显示条件**：仅启用状态的角色显示

**功能**：打开禁用确认对话框，确认后将角色状态改为禁用。

### Confirm 按钮（创建/编辑对话框）

**位置**：创建/编辑角色对话框底部右侧

**功能**：验证表单，提交角色信息，成功后关闭对话框并刷新列表。

### Confirm 按钮（确认对话框）

**位置**：删除/禁用确认对话框底部右侧

**功能**：确认执行删除或禁用操作，成功后关闭对话框并刷新列表。

### Cancel 按钮

**位置**：各种对话框底部左侧

**功能**：取消当前操作，关闭对话框，不保存任何更改。

## 业务规则

### 角色类型

**系统角色**（`is_system: true`）：
- 系统预置，所有租户共享
- 不允许删除
- 不允许修改 Role Code（唯一索引，创建后不能修改）
- 可以修改 Display Name 和 Description
- 可以启用/禁用

**自定义角色**（`is_system: false`）：
- 用户创建，属于特定租户
- 允许删除
- 不允许修改 Role Code（唯一索引，创建后不能修改，被 `role_permissions` 表引用）
- 可以修改 Display Name 和 Description
- 可以启用/禁用

### 角色状态

- **Active**：角色启用，可以分配给用户，Status 显示绿色，显示 Disable 按钮
- **Inactive**：角色禁用，不能分配给新用户，Status 显示红色，不显示 Disable 按钮

## 系统预置角色

系统预置以下角色（`is_system: true`，`tenant_id: null`）：

1. **Admin** - System Administrator（系统管理员）
2. **Director** - Executive Director / Facility Director（执行董事/机构主任）
3. **DON** - DON (Director of Nursing)（护理主任）
4. **NurseManager** - Nurse Manager（护士长，兼容旧名称）
5. **CM** - CM (Care Manager / Case Manager)（护理主管）
6. **CS** - CS (Clinical Supervisor)（临床主管）
7. **CO** - CO (Compliance Officer)（合规官）
8. **Nurse** - Nurse（护士）
9. **Caregiver** - Caregiver（护工）
10. **IT** - IT (IT Support)（IT 支持）
11. **SocialWork** - Social Worker（社工）

这些角色在数据库初始化时自动创建，所有租户共享，不允许删除。
