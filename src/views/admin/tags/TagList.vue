<template>
  <div style="padding: 15px">
    <!-- Create Tag Area -->
    <div class="form-container">
      <div class="form-row">
        <span class="label">Select type:</span>
        <div class="tag-type-selector">
          <div
            v-for="(tagType, index) in availableTagTypesForSelection"
            :key="tagType ?? `null-${index}`"
            class="tag-type-option"
            :class="{ 'tag-type-option-selected': selectedTagType === tagType }"
            @click="selectedTagType = tagType"
          >
            <span class="tag-type-option-label">{{ formatTagTypeName(tagType) }}</span>
          </div>
        </div>
        <span class="label">Tag Name:</span>
        <a-input
          v-model:value="createTagData.tag_name"
          placeholder="Tag Name"
          style="width: 150px"
          @pressEnter="handleCreateTag"
        />
        <a-button type="primary" @click="handleCreateTag">Create Tag</a-button>
      </div>
    </div>

    <!-- Table -->
    <a-table
      :dataSource="sortedDataSource"
      :columns="columns"
      :loading="loading"
      :pagination="false"
      :scroll="{ x: 'max-content' }"
      :bordered="true"
      class="tag-table"
    >
      <template #headerCell="{ column }">
        <template v-if="column.key === 'tag_type'">
          <div 
            style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;" 
            @click="toggleTagTypeSort"
            :style="{ color: tagTypeSortOrder ? '#1890ff' : 'inherit' }"
          >
            <span>Tag_type</span>
            <SortAscendingOutlined 
              v-if="tagTypeSortOrder === 'asc'" 
              style="font-size: 14px; color: #1890ff;"
            />
            <SortDescendingOutlined 
              v-else-if="tagTypeSortOrder === 'desc'" 
              style="font-size: 14px; color: #1890ff;"
            />
            <span v-else style="color: #d9d9d9; font-size: 12px;">⇅</span>
          </div>
        </template>
        <template v-else-if="column.key === 'tag_name'">
          <div 
            style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;" 
            @click="toggleTagNameSort"
            :style="{ color: tagNameSortOrder ? '#1890ff' : 'inherit' }"
          >
            <span>Tag_name</span>
            <SortAscendingOutlined 
              v-if="tagNameSortOrder === 'asc'" 
              style="font-size: 14px; color: #1890ff;"
            />
            <SortDescendingOutlined 
              v-else-if="tagNameSortOrder === 'desc'" 
              style="font-size: 14px; color: #1890ff;"
            />
            <span v-else style="color: #d9d9d9; font-size: 12px;">⇅</span>
          </div>
        </template>
        <template v-else-if="column.key === 'objects'">
          <div class="member-header-with-buttons">
            <span>Member</span>
            <div class="header-buttons">
              <a-button size="small" @click="handleCancel">Cancel</a-button>
              <a-button type="primary" size="small" @click="handleSaveAll">Save</a-button>
            </div>
          </div>
        </template>
      </template>
      <template #bodyCell="{ column, record }">
        <!-- Tag_name column: only display tag_name itself (square shape, cross in top-right corner) -->
        <template v-if="column.dataIndex === 'tag_name'">
          <div class="tag-name-cell">
            <div class="tag-name-box">
              <span class="tag-name-value">{{ record.tag_name }}</span>
              <a-tooltip
                v-if="!hasObjects(record)"
                title="delete"
                :mouseEnterDelay="0.1"
              >
                <span
                  class="delete-tag-icon"
                  @click="deleteTagName(record)"
                >
                  ×
                </span>
              </a-tooltip>
            </div>
          </div>
        </template>

        <!-- Tag_type column: read-only display (tag_type is system predefined, cannot be modified) -->
        <template v-else-if="column.dataIndex === 'tag_type'">
          <div class="tag-type-cell">
            <span class="tag-type-display">{{ formatTagTypeName(record.tag_type) }}</span>
          </div>
        </template>

        <!-- Objects column: display object list (with checkboxes) -->
        <template v-else-if="column.dataIndex === 'objects'">
          <div class="objects-cell">
            <div v-if="record.tag_objects" class="objects-checkbox-list">
              <a-checkbox-group
                v-model:value="selectedObjects[record.tag_id]"
                @change="(checkedValues: string[]) => handleObjectCheckChange(record, checkedValues)"
              >
                <template
                  v-for="(objects, objectType) in record.tag_objects"
                  :key="objectType"
                >
                  <a-checkbox
                    v-for="(objectName, objectId) in objects"
                    :key="`${objectType}:${objectId}`"
                    :value="`${objectType}:${objectId}`"
                    class="object-checkbox"
                  >
                    {{ objectName }}
                  </a-checkbox>
                </template>
              </a-checkbox-group>
            </div>
            <span v-else class="no-objects">-</span>
          </div>
        </template>
      </template>
    </a-table>

  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons-vue'
import type { Rule } from 'ant-design-vue/lib/form'
import {
  getTagsApi,
  createTagApi,
  updateTagApi,
  deleteTagApi,
  removeTagObjectsApi,
} from '@/api/admin/tags/tags'
import type {
  TagCatalogItem,
  CreateTagParams,
  UpdateTagParams,
  DeleteTagParams,
  RemoveTagObjectsParams,
} from '@/api/admin/tags/model/tagsModel'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const currentUserRole = computed(() => userStore.getUserInfo?.role || '')
const isSystemAdmin = computed(() => currentUserRole.value === 'SystemAdmin')

// Data
const loading = ref(false)
const dataSource = ref<TagCatalogItem[]>([])
// Create tag data: tag_type defaults to 'custom_tag' for user-created tags
// SystemAdmin can choose tag_type, non-SystemAdmin always uses 'custom_tag'
const createTagData = ref<{ tag_name: string }>({
  tag_name: '',
})
const selectedTagType = ref<string | null>('custom_tag') // Default to 'custom_tag' for new tags
const selectedTagTypeList = ref<(string | null)[]>([])
const selectedObjects = ref<Record<string, string[]>>({}) // tag_id -> selected object keys
const objectsToRemove = ref<Record<string, Array<{ objectType: string; objectId: string }>>>({}) // tag_id -> objects to remove

// Available tag types from server (all available tag types)
// This is populated from API response to avoid hardcoding (for display purposes only)
const availableTagTypesFromServer = ref<string[]>([])

// System predefined tag types from server (for reference only, not used for modification)
const systemPredefinedTagTypesFromServer = ref<string[]>([])

// Available tag types for selection (for Create Tag dropdown)
const availableTagTypesForSelection = computed(() => {
  return availableTagTypesFromServer.value.length > 0
    ? availableTagTypesFromServer.value
    : ['custom_tag', 'user_tag', 'alarm_tag', 'location_tag', 'family_tag', 'area_tag']
})

// Sort state
const tagTypeSortOrder = ref<'asc' | 'desc' | null>(null)
const tagNameSortOrder = ref<'asc' | 'desc' | null>(null)

// Table column definitions: 3-column layout (Tag_type first column, Tag_name second column)
const columns = [
  {
    title: 'Tag_type',
    dataIndex: 'tag_type',
    key: 'tag_type',
    width: 250,
  },
  {
    title: 'Tag_name',
    dataIndex: 'tag_name',
    key: 'tag_name',
    width: 250,
  },
  {
    title: 'Member',
    dataIndex: 'objects',
    key: 'objects',
    width: 'auto',
  },
]

// Sorted data source (default sorted by tag_type and tag_name)
const sortedDataSource = computed(() => {
  let sorted = [...dataSource.value]
  
  // Default sort: first by tag_type, then by tag_name (ascending)
  sorted.sort((a, b) => {
    // First compare tag_type
    const typeA = (a.tag_type ?? '') as string
    const typeB = (b.tag_type ?? '') as string
    const typeCompare = typeA.localeCompare(typeB)
    
    if (typeCompare !== 0 && tagTypeSortOrder.value !== null) {
      // If tag_type differs and sort is specified, sort by tag_type
      return tagTypeSortOrder.value === 'desc' ? -typeCompare : typeCompare
    }
    
    // If tag_type is same or tag_type sort not specified, sort by tag_name
    const nameA = a.tag_name || ''
    const nameB = b.tag_name || ''
    const nameCompare = nameA.localeCompare(nameB)
    
    if (tagNameSortOrder.value !== null) {
      return tagNameSortOrder.value === 'desc' ? -nameCompare : nameCompare
    }
    
    // Default sort: first by tag_type, then by tag_name (both ascending)
    if (typeCompare !== 0) {
      return typeCompare
    }
    return nameCompare
  })
  
  return sorted
})

// Toggle Tag_type sort
const toggleTagTypeSort = () => {
  if (tagTypeSortOrder.value === null) {
    tagTypeSortOrder.value = 'asc'
  } else if (tagTypeSortOrder.value === 'asc') {
    tagTypeSortOrder.value = 'desc'
  } else {
    tagTypeSortOrder.value = null
  }
  // Reset tag_name sort
  tagNameSortOrder.value = null
}

// Toggle Tag_name sort
const toggleTagNameSort = () => {
  if (tagNameSortOrder.value === null) {
    tagNameSortOrder.value = 'asc'
  } else if (tagNameSortOrder.value === 'asc') {
    tagNameSortOrder.value = 'desc'
  } else {
    tagNameSortOrder.value = null
  }
  // Reset tag_type sort
  tagTypeSortOrder.value = null
}


// Get Tags list
const fetchTags = async () => {
  loading.value = true
  try {
    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      message.error('No tenant ID available')
      return
    }

    const result = await getTagsApi({
      tenant_id: tenantId,
      include_system_tag_types: true,
    })

    dataSource.value = result.items
    
    // Store available tag types from server (if provided)
    // This avoids hardcoding tag_type values in frontend
    if (result.available_tag_types && result.available_tag_types.length > 0) {
      availableTagTypesFromServer.value = result.available_tag_types
    } else {
      // Fallback: extract unique tag_type from returned data
      const types = new Set<string>()
      result.items.forEach((tag) => {
        if (tag.tag_type) {
          types.add(tag.tag_type)
        }
      })
      availableTagTypesFromServer.value = Array.from(types)
    }
    
    // Store system predefined tag types from server (if provided)
    // These are the built-in tag types that cannot be deleted
    if (result.system_predefined_tag_types && result.system_predefined_tag_types.length > 0) {
      systemPredefinedTagTypesFromServer.value = result.system_predefined_tag_types
    } else {
      // Fallback: use default system predefined types (alarm_tag, location_tag, family_tag, area_tag)
      // These are the built-in types that cannot be deleted according to database schema
      systemPredefinedTagTypesFromServer.value = ['alarm_tag', 'location_tag', 'family_tag', 'area_tag']
    }
    // Initialize selectedObjects: all objects selected by default
    result.items.forEach((tag) => {
      const allKeys: string[] = []
      if (tag.tag_objects) {
        for (const [objectType, objects] of Object.entries(tag.tag_objects)) {
          for (const objectId of Object.keys(objects)) {
            allKeys.push(`${objectType}:${objectId}`)
          }
        }
      }
      selectedObjects.value[tag.tag_id] = allKeys
      objectsToRemove.value[tag.tag_id] = []
    })
    
    // Initialize selectedTagTypeList: list all tag_type (from server response, not hardcoded)
    const tagTypes = new Set<string | null>()
    
    // Use available tag types from server (already stored in availableTagTypesFromServer)
    availableTagTypesFromServer.value.forEach((type) => {
      tagTypes.add(type)
    })
    
    // Add tag_type from data (including newly created, in case server doesn't provide all types)
    result.items.forEach((tag) => {
      if (tag.tag_type !== null) {
        tagTypes.add(tag.tag_type)
      }
    })
    
    selectedTagTypeList.value = Array.from(tagTypes).sort()
  } catch (error: any) {
    console.error('Failed to fetch tags:', error)
    message.error(error?.message || 'Failed to fetch tags')
  } finally {
    loading.value = false
  }
}

// Format Tag Type name
const formatTagTypeName = (tagType: string | null): string => {
  if (!tagType) return '(None)'
  return tagType.replace(/_tag$/, '').replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

// Get all related tags by Tag Type
const getTagsByType = (tagType: string | null): TagCatalogItem[] => {
  return dataSource.value.filter((tag) => tag.tag_type === tagType)
}



// Create Tag
// Note: tag_type is automatically set to 'custom_tag' by backend (application layer control)
// Users cannot modify tag_type, it's system predefined
const handleCreateTag = async () => {
  try {
    if (!createTagData.value.tag_name.trim()) {
      message.warning('Please enter tag name')
      return
    }

    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      message.error('No tenant ID available')
      return
    }

    // tag_type is automatically set to 'custom_tag' by backend (application layer control)
    // Users cannot specify tag_type, it's system predefined
    const params: CreateTagParams = {
      tenant_id: tenantId,
      tag_type: null, // Backend will set to 'custom_tag' automatically
      tag_name: createTagData.value.tag_name.trim(),
    }
    
    await createTagApi(params)
    message.success('Tag created successfully')
    
    // Reset form
    createTagData.value = {
      tag_name: '',
    }
    selectedTagType.value = 'custom_tag' // Reset to default
    
    await fetchTags()
  } catch (error: any) {
    message.error(error?.message || 'Failed to create tag')
  }
}


// Check if tag has objects
const hasObjects = (record: TagCatalogItem): boolean => {
  if (!record.tag_objects) return false
  return Object.keys(record.tag_objects).length > 0
}

// Delete Tag Name
const deleteTagName = async (record: TagCatalogItem) => {
  try {
    // Check if it has objects
    if (hasObjects(record)) {
      message.warning('Cannot delete tag with objects. Please remove all objects first.')
      return
    }

    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      message.error('No tenant ID available')
      return
    }

    const params: DeleteTagParams = {
      tenant_id: tenantId,
      tag_name: record.tag_name,
    }

    await deleteTagApi(params)
    message.success('Tag name deleted successfully')
    await fetchTags()
  } catch (error: any) {
    message.error(error?.message || 'Failed to delete tag name')
  }
}



// Handle object checkbox changes
const handleObjectCheckChange = (record: TagCatalogItem, checkedValues: string[]) => {
  const tagId = record.tag_id
  const previousSelected = selectedObjects.value[tagId] || []
  
  // Find unselected objects
  const unselected = previousSelected.filter((key) => !checkedValues.includes(key))
  
  // Record objects to be removed
  if (!objectsToRemove.value[tagId]) {
    objectsToRemove.value[tagId] = []
  }
  
  // Add newly unselected objects to removal list
  unselected.forEach((key) => {
    const [objectType, objectId] = key.split(':')
    if (!objectType || !objectId) return
    if (!objectsToRemove.value[tagId]) {
      objectsToRemove.value[tagId] = []
    }
    const exists = objectsToRemove.value[tagId].some(
      (obj) => obj.objectType === objectType && obj.objectId === objectId
    )
    if (!exists) {
      objectsToRemove.value[tagId].push({ objectType, objectId })
    }
  })
  
  // Remove re-selected objects (if previously marked for deletion)
  objectsToRemove.value[tagId] = objectsToRemove.value[tagId].filter((obj) => {
    const key = `${obj.objectType}:${obj.objectId}`
    return !checkedValues.includes(key)
  })
  
  // Update selected state
  selectedObjects.value[tagId] = checkedValues
}

// Cancel changes (reset to original state)
// Resets member modifications and clears object removal list
const handleCancel = () => {
  // Reset selected objects to original state
  dataSource.value.forEach((tag) => {
    const allKeys: string[] = []
    if (tag.tag_objects) {
      for (const [objectType, objects] of Object.entries(tag.tag_objects)) {
        for (const objectId of Object.keys(objects)) {
          allKeys.push(`${objectType}:${objectId}`)
        }
      }
    }
    selectedObjects.value[tag.tag_id] = allKeys
  })
  
  // Clear removal list
  objectsToRemove.value = {}
  
  message.info('Changes cancelled')
}

// Save all changes (submit to server)
const handleSaveAll = async () => {
  try {
    let hasChanges = false
    
    // Handle all objects that need to be removed
    for (const [tagId, objects] of Object.entries(objectsToRemove.value)) {
      if (objects.length > 0) {
        const record = dataSource.value.find((tag) => tag.tag_id === tagId)
        if (!record) continue
        
        // Check if tag_type is Area or Custom (only these support object deletion)
        const allowedTagTypes = ['area_tag', 'custom_tag']
        if (!record.tag_type || !allowedTagTypes.includes(record.tag_type)) {
          message.warning(`Object deletion is only supported for Area and Custom tag types. Tag "${record.tag_name}" has type "${record.tag_type}"`)
          continue
        }
        
        hasChanges = true
        
        // Group by objectType
        const groupedByType: Record<string, string[]> = {}
        objects.forEach((obj) => {
          if (!obj.objectType || !obj.objectId) return
          const objectType = obj.objectType
          const objectId = obj.objectId
          if (!groupedByType[objectType]) {
            groupedByType[objectType] = []
          }
          groupedByType[objectType].push(objectId)
        })
        
        // Remove objects of each type
        for (const [objectType, objectIds] of Object.entries(groupedByType)) {
          const params: RemoveTagObjectsParams = {
            tag_id: tagId,
            object_type: objectType,
            object_ids: objectIds,
          }
          await removeTagObjectsApi(params)
        }
      }
    }
    
    if (hasChanges) {
      message.success('All changes saved successfully')
      // Clear removal list
      objectsToRemove.value = {}
      await fetchTags()
    } else {
      message.info('No changes to save')
    }
  } catch (error: any) {
    message.error(error?.message || 'Failed to save changes')
  }
}

// Remove object from Tag (keep this function for other possible uses)
const removeObjectFromTag = async (
  record: TagCatalogItem,
  objectType: string,
  objectId: string
) => {
  try {
    const params: RemoveTagObjectsParams = {
      tag_id: record.tag_id,
      object_type: objectType,
      object_ids: [objectId],
    }
    await removeTagObjectsApi(params)
    message.success('Object removed successfully')
    await fetchTags()
  } catch (error: any) {
    message.error(error?.message || 'Failed to remove object')
  }
}


// Initialize
onMounted(() => {
  fetchTags()
})
</script>

<style scoped>
.form-container {
  margin-bottom: 16px;
}

.member-header-with-buttons {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
  width: 100%;
}

.form-row-second {
  margin-top: 0;
}

.label {
  font-weight: 500;
  color: #595959;
  white-space: nowrap;
}

/* Tag Type Selector (container style) */
.tag-type-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fafafa;
  min-height: 32px;
}

.tag-type-option {
  padding: 4px 12px;
  background: #f0f0f0;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.tag-type-option:hover {
  background: #e6f7ff;
  border-color: #1890ff;
}

.tag-type-option-selected {
  background: #1890ff;
  border-color: #1890ff;
  color: #fff;
}

.tag-type-option-selected .tag-type-option-label {
  color: #fff;
  font-weight: 500;
}

.tag-type-option-label {
  font-weight: 500;
  color: #595959;
}

/* Objects display */
.objects-display-container {
  min-width: 150px;
  padding: 4px 12px;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.objects-count {
  color: #1890ff;
  font-weight: 500;
}

.objects-placeholder {
  color: #999;
  font-style: italic;
}

.tag-type-display-inline {
  font-weight: 500;
  color: #595959;
  font-size: 14px;
  padding: 4px 12px;
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  min-width: 120px;
  display: inline-block;
  text-align: center;
}

.tag-type-list-wrapper {
  flex: 1;
  min-width: 200px;
  overflow: hidden;
}

.tag-table {
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tag-table :deep(.ant-table) {
  border: 1px solid #d9d9d9;
}

.tag-table :deep(.ant-table-thead > tr > th) {
  border: 1px solid #d9d9d9;
  background: #fafafa;
  font-weight: 600;
}

.tag-table :deep(.ant-table-tbody > tr > td) {
  border: 1px solid #d9d9d9;
  padding: 12px;
  vertical-align: top;
}

.tag-name-cell,
.tag-type-cell {
  display: flex;
  align-items: center;
}

.tag-type-display {
  font-weight: 500;
  color: #595959;
  font-size: 14px;
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 4px;
  display: inline-block;
}

.tag-name-box,
.tag-type-box {
  position: relative;
  display: inline-block;
  padding: 4px 24px 4px 8px;
  background: #f0f0f0;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.tag-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.delete-tag-icon {
  position: absolute;
  top: -4px;
  right: -4px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  font-weight: bold;
  line-height: 1;
  display: inline-block;
}

.delete-tag-icon:hover {
  color: #333;
}

.objects-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.object-type-group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.object-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 20px 2px 6px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
}

.delete-icon {
  position: absolute;
  top: -4px;
  right: 2px;
  cursor: pointer;
  color: #ff4d4f;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.delete-icon:hover {
  color: #cf1322;
  background: #fff1f0;
}

.tag-name-value,
.tag-type-name {
  font-weight: 500;
  color: #1890ff;
  font-size: 14px;
}

.objects-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.objects-checkbox-list :deep(.ant-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.object-checkbox {
  margin-right: 0;
  white-space: nowrap;
}

.objects-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.object-type-group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.object-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 20px 2px 6px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
}

.delete-icon {
  position: absolute;
  top: -4px;
  right: 2px;
  cursor: pointer;
  color: #ff4d4f;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.delete-icon:hover {
  color: #cf1322;
  background: #fff1f0;
}


.no-objects {
  color: #999;
  font-style: italic;
}

.tag-type-list-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fafafa;
  min-height: 40px;
  max-height: 60px;
  overflow-y: auto;
  align-content: flex-start;
}

.tag-type-item {
  flex: 0 0 auto;
  height: fit-content;
}

.tag-type-box-item {
  position: relative;
  display: inline-block;
  padding: 4px 24px 4px 8px;
  background: #f0f0f0;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.tag-type-label {
  font-weight: 500;
  color: #1890ff;
}

.delete-tag-type-icon {
  position: absolute;
  top: -4px;
  right: -4px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
  font-weight: bold;
  line-height: 1;
  display: inline-block;
}

.delete-tag-type-icon:hover {
  color: #333;
}
</style>
