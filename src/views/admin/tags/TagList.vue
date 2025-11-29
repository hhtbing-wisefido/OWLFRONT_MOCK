<template>
  <div style="padding: 15px">
    <!-- Search area -->
    <div class="form-container">
      <a-form layout="inline" class="flex-form">
        <!-- Save Button -->
        <a-form-item>
          <a-button type="primary" @click="handleSaveAll">Save</a-button>
        </a-form-item>

        <!-- Create Tag -->
        <a-form-item>
          <div class="create-tag-row">
            <a-button type="primary" @click="handleCreateTag">Create Tag</a-button>
            <span class="separator">:</span>
            <a-input
              v-model:value="createTagData.tag_name"
              placeholder="Tag Name"
              style="width: 200px"
              @pressEnter="handleCreateTag"
            />
          </div>
        </a-form-item>
        <!-- Create Type -->
        <a-form-item>
          <div class="create-tag-row">
            <a-button type="primary" @click="handleCreateTagType">Create Type</a-button>
            <span class="separator">:</span>
            <a-input
              v-model:value="newTagType"
              placeholder="Tag type"
              style="width: 200px"
              @pressEnter="handleCreateTagType"
            />
          </div>
        </a-form-item>
        <a-form-item style="flex: 1; min-width: 200px;">
          <div class="tag-type-list-container">
            <div
              v-for="(tagType, index) in selectedTagTypeList"
              :key="tagType ?? `null-${index}`"
              class="tag-type-item"
            >
              <div class="tag-type-box-item">
                <span class="tag-type-label">{{ formatTagTypeName(tagType) }}</span>
                <a-tooltip
                  v-if="!isSystemTagType(tagType)"
                  title="delete"
                  :mouseEnterDelay="0.1"
                >
                  <span
                    class="delete-tag-type-icon"
                    @click="deleteTagTypeByValue(tagType)"
                  >
                    ×
                  </span>
                </a-tooltip>
              </div>
            </div>
          </div>
        </a-form-item>
      </a-form>
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

        <!-- Tag_type column: dropdown to select tag_type (type of this row's tag_name) -->
        <template v-else-if="column.dataIndex === 'tag_type'">
          <div class="tag-type-cell">
              <a-select
                v-model:value="record.tag_type"
                style="width: 100%"
                @change="(value: string | null) => handleTagTypeChange(record, value)"
              >
              <a-select-option
                v-for="tagType in availableTagTypes"
                :key="tagType.value"
                :value="tagType.value"
              >
                {{ tagType.label }}
              </a-select-option>
            </a-select>
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
  deleteTagTypeApi,
  removeTagObjectsApi,
} from '@/api/admin/tags/tags'
import type {
  TagCatalogItem,
  CreateTagParams,
  UpdateTagParams,
  DeleteTagParams,
  DeleteTagTypeParams,
  RemoveTagObjectsParams,
} from '@/api/admin/tags/model/tagsModel'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()

// Data
const loading = ref(false)
const dataSource = ref<TagCatalogItem[]>([])
const createTagData = ref<{ tag_name: string; tag_type: string | null }>({
  tag_name: '',
  tag_type: null,
})
const newTagType = ref<string>('')
const selectedTagTypeList = ref<(string | null)[]>([])
const selectedObjects = ref<Record<string, string[]>>({}) // tag_id -> selected object keys
const objectsToRemove = ref<Record<string, Array<{ objectType: string; objectId: string }>>>({}) // tag_id -> objects to remove

// Get all available tag_type (extracted from data)
const availableTagTypes = computed(() => {
  const tagTypes = new Set<string | null>()
  dataSource.value.forEach((tag) => {
    if (tag.tag_type !== null) {
      tagTypes.add(tag.tag_type)
    }
  })
  
  // Add common system tag_type
  const systemTagTypes = [
    'alarm_tag',
    'location_tag',
    'family_tag',
    'nursestation_tag',
    'user_tag',
    'caregiver_tag',
  ]
  systemTagTypes.forEach((type) => {
    tagTypes.add(type)
  })
  
  // Convert to options array
  const options: Array<{ value: string | null; label: string }> = [
    { value: null, label: '(None)' },
  ]
  
  Array.from(tagTypes)
    .sort()
    .forEach((type) => {
      if (type !== null) {
        options.push({
          value: type,
          label: type.replace(/_tag$/, '').replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        })
      }
    })
  
  return options
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
    title: 'objects of Tag_name',
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
    
    // Initialize selectedTagTypeList: list all tag_type (including preset system tags and newly created)
    const tagTypes = new Set<string | null>()
    
    // Add preset system tag_type
    const systemTagTypes = [
      'alarm_tag',
      'location_tag',
      'family_tag',
      'nursestation_tag',
      'user_tag',
      'caregiver_tag',
    ]
    systemTagTypes.forEach((type) => {
      tagTypes.add(type)
    })
    
    // Add tag_type from data (including newly created)
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

// Check if it's a system Tag Type
const isSystemTagType = (tagType: string | null): boolean => {
  if (!tagType) return false
  // Preset system tag_type
  const systemTagTypes = [
    'alarm_tag',
    'location_tag',
    'family_tag',
    'nursestation_tag',
    'user_tag',
    'caregiver_tag',
  ]
  return systemTagTypes.includes(tagType)
}

// Delete Tag Type by value
const deleteTagTypeByValue = async (tagType: string | null) => {
  try {
    if (!tagType) {
      message.warning('Tag type is empty')
      return
    }

    // Check if it's a system tag_type
    if (isSystemTagType(tagType)) {
      message.warning('Cannot delete system tag type')
      return
    }

    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      message.error('No tenant ID available')
      return
    }

    const params: DeleteTagTypeParams = {
      tenant_id: tenantId,
      tag_type: tagType,
    }

    await deleteTagTypeApi(params)
    message.success('Tag type deleted successfully')
    await fetchTags()
  } catch (error: any) {
    message.error(error?.message || 'Failed to delete tag type')
  }
}

// Create Tag
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

    const params: CreateTagParams = {
      tenant_id: tenantId,
      tag_type: createTagData.value.tag_type,
      tag_name: createTagData.value.tag_name.trim(),
    }
    
    await createTagApi(params)
    message.success('Tag created successfully')
    
    // Reset form
    createTagData.value = {
      tag_name: '',
      tag_type: null,
    }
    
    await fetchTags()
  } catch (error: any) {
    message.error(error?.message || 'Failed to create tag')
  }
}

// Create TagType
const handleCreateTagType = async () => {
  try {
    if (!newTagType.value.trim()) {
      message.warning('Please enter tag type')
      return
    }

    const tagTypeValue = newTagType.value.trim()
    
    // Check if it already exists
    if (selectedTagTypeList.value.includes(tagTypeValue)) {
      message.warning('Tag type already exists')
      return
    }

    // Check if it's a system preset tag_type
    const systemTagTypes = [
      'alarm_tag',
      'location_tag',
      'family_tag',
      'nursestation_tag',
      'user_tag',
      'caregiver_tag',
    ]
    if (systemTagTypes.includes(tagTypeValue)) {
      message.warning('This is a system tag type and cannot be created')
      return
    }

    // Add to list (actual creation needs to be done by creating a tag, because tag_type is specified when creating a tag)
    // Here we add to list first, actual use requires creating a tag to use this tag_type
    selectedTagTypeList.value.push(tagTypeValue)
    selectedTagTypeList.value.sort()
    
    message.success('Tag type added successfully')
    
    // Reset input field
    newTagType.value = ''
  } catch (error: any) {
    message.error(error?.message || 'Failed to create tag type')
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

// Handle Tag Type change
const handleTagTypeChange = async (record: TagCatalogItem, newTagType: string | null) => {
  try {
    // If value hasn't changed, don't perform update
    if (record.tag_type === newTagType) {
      return
    }

    const oldTagType = record.tag_type
    // Update local display first
    record.tag_type = newTagType

    const params: UpdateTagParams = {
      tag_name: record.tag_name,
      tag_type: newTagType,
    }

    await updateTagApi(record.tag_id, params)
    message.success('Tag type updated successfully')
    await fetchTags()
  } catch (error: any) {
    // Restore original value
    await fetchTags()
    message.error(error?.message || 'Failed to update tag type')
  }
}

// Delete Tag Type
const deleteTagType = async (record: TagCatalogItem) => {
  try {
    // Check if it's a system tag_type
    if (record.is_system_tag_type) {
      message.warning('Cannot delete system tag type')
      return
    }

    if (!record.tag_type) {
      message.warning('Tag type is empty')
      return
    }

    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      message.error('No tenant ID available')
      return
    }

    const params: DeleteTagTypeParams = {
      tenant_id: tenantId,
      tag_type: record.tag_type,
    }

    await deleteTagTypeApi(params)
    message.success('Tag type deleted successfully')
    await fetchTags()
  } catch (error: any) {
    message.error(error?.message || 'Failed to delete tag type')
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

// Save all changes (submit to server)
const handleSaveAll = async () => {
  try {
    let hasChanges = false
    
    // Handle all objects that need to be removed
    for (const [tagId, objects] of Object.entries(objectsToRemove.value)) {
      if (objects.length > 0) {
        hasChanges = true
        const record = dataSource.value.find((tag) => tag.tag_id === tagId)
        if (!record) continue
        
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

.flex-form {
  display: flex;
  align-items: center;
  gap: 12px;
}

.create-tag-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.separator {
  margin: 0 2px;
  color: #666;
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
  min-height: 90px;
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
