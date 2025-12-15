<template>
  <div style="padding: 15px">
    <!-- Create Tag Area -->
    <div class="form-container">
      <div class="form-row">
        <a-space style="margin-right: 12px;">
          <a-button type="text" @click="goBack" :title="'Back'">
            <template #icon>
              <ArrowLeftOutlined />
            </template>
          </a-button>
          <a-button type="text" @click="goHome" :title="'Home'">
            <template #icon>
              <HomeOutlined />
            </template>
          </a-button>
        </a-space>
        <a-input
          v-model:value="createBranchData"
          placeholder="Branch Name"
          style="width: 150px; margin-left: 8px;"
          :disabled="!canManageBranch"
          @pressEnter="handleCreateBranch"
        />
        <a-button 
          type="primary" 
          style="margin-left: 8px;"
          @click="handleCreateBranch"
          :disabled="!canManageBranch"
        >
          Create Branch
        </a-button>
        <a-input
          v-model:value="createAreaData"
          placeholder="Area Name"
          style="width: 150px; margin-left: 16px;"
          :disabled="!canManageOtherTags"
          @pressEnter="handleCreateArea"
        />
        <a-button type="primary" style="margin-left: 8px;" :disabled="!canManageOtherTags" @click="handleCreateArea">Create AreaTag</a-button>
        <a-input
          v-model:value="createUserTagData"
          placeholder="User Tag Name"
          style="width: 150px; margin-left: 16px;"
          :disabled="!canManageOtherTags"
          @pressEnter="handleCreateUserTag"
        />
        <a-button type="primary" style="margin-left: 8px;" :disabled="!canManageOtherTags" @click="handleCreateUserTag">Create UserTag</a-button>
        <a-input
          v-model:value="createFamilyData"
          placeholder="Family Name"
          style="width: 150px; margin-left: 16px;"
          :disabled="!canManageOtherTags"
          @pressEnter="handleCreateFamily"
        />
        <a-button type="primary" style="margin-left: 8px;" :disabled="!canManageOtherTags" @click="handleCreateFamily">Create Familytag</a-button>
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
        <!-- Tag_name column: display tag_name or "-" for Branch/Area -->
        <template v-if="column.dataIndex === 'tag_name'">
          <div class="tag-name-cell">
            <div class="tag-name-box">
              <span class="tag-name-value">
                {{ record.tag_name || '-' }}
              </span>
              <a-tooltip
                v-if="!hasObjects(record) && (record.tag_type === 'user_tag' || record.tag_type === 'family_tag') && canManageOtherTags"
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

        <!-- Objects column: display object list (with checkboxes for User/Family, delete buttons for Branch/Area) -->
        <template v-else-if="column.dataIndex === 'objects'">
          <div class="objects-cell">
            <div v-if="record.tag_objects">
              <!-- Branch and Area: display with delete buttons only (no checkbox) -->
              <template v-if="record.tag_type === 'branch_tag' || record.tag_type === 'area_tag'">
                <div class="objects-list-simple">
                  <template
                    v-for="(objects, objectType) in record.tag_objects"
                    :key="objectType"
                  >
                    <div
                      v-for="(objectName, objectId) in objects"
                      :key="`${objectType}:${objectId}`"
                      class="object-item-wrapper has-delete-btn"
                    >
                      <span class="object-name">{{ objectName }}</span>
                      <a-tooltip 
                        :title="(record.tag_type === 'branch_tag' && !canManageBranch) ? 'Only administrators can delete branch' : '删除'" 
                        :mouseEnterDelay="0.1"
                      >
                        <span
                          class="delete-object-icon"
                          :class="{ 'disabled': record.tag_type === 'branch_tag' && !canManageBranch }"
                          @click="deleteObjectFromTag(record, String(objectType), String(objectId))"
                        >
                          ×
                        </span>
                      </a-tooltip>
                    </div>
                  </template>
                </div>
              </template>
              <!-- User and Family: display with checkboxes (no delete button) -->
              <template v-else>
                <div class="objects-checkbox-list">
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
              </template>
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
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { SortAscendingOutlined, SortDescendingOutlined, HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons-vue'
import type { Rule } from 'ant-design-vue/lib/form'
import {
  getTagsApi,
  createTagApi,
  updateTagApi,
  deleteTagApi,
  addTagObjectsApi,
  removeTagObjectsApi,
} from '@/api/admin/tags/tags'
import type {
  TagCatalogItem,
  CreateTagParams,
  UpdateTagParams,
  DeleteTagParams,
  AddTagObjectsParams,
  RemoveTagObjectsParams,
} from '@/api/admin/tags/model/tagsModel'
import { useUserStore } from '@/store/modules/user'
import { usePermission } from '@/hooks/usePermission'

const router = useRouter()
const userStore = useUserStore()
const { hasManagePermission } = usePermission()
const currentUserRole = computed(() => userStore.getUserInfo?.role || '')
const isSystemAdmin = computed(() => currentUserRole.value === 'SystemAdmin')
// Permission checks for tag operations
const isAdmin = computed(() => currentUserRole.value === 'Admin')
const isManager = computed(() => currentUserRole.value === 'Manager')
const canManageBranch = computed(() => isAdmin.value) // Only Admin can manage Branch
const canManageOtherTags = computed(() => isManager.value || isAdmin.value) // Manager or Admin can manage Area/Family/User tags

// Navigate to home page
// Go back
const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/monitoring/overview')
}

// Data
const loading = ref(false)
const dataSource = ref<TagCatalogItem[]>([])
// Create tag data: separate inputs for different tag types
const createBranchData = ref<string>('')
const createAreaData = ref<string>('')
const createFamilyData = ref<string>('')
const createUserTagData = ref<string>('')
const selectedTagTypeList = ref<(string | null)[]>([])
const selectedObjects = ref<Record<string, string[]>>({}) // tag_id -> selected object keys
const objectsToRemove = ref<Record<string, Array<{ objectType: string; objectId: string }>>>({}) // tag_id -> objects to remove

// Available tag types from server (all available tag types)
// This is populated from API response to avoid hardcoding (for display purposes only)
const availableTagTypesFromServer = ref<string[]>([])

// System predefined tag types from server (for reference only, not used for modification)
const systemPredefinedTagTypesFromServer = ref<string[]>([])

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
// For branch_tag and area_tag, merge all tags of the same type into one row
const sortedDataSource = computed(() => {
  let processed = [...dataSource.value]
  
  // Group tags by tag_type
  const groupedByType: Record<string, TagCatalogItem[]> = {}
  processed.forEach((tag) => {
    const type = tag.tag_type || 'unknown'
    if (!groupedByType[type]) {
      groupedByType[type] = []
    }
    groupedByType[type].push(tag)
  })
  
  // For branch_tag and area_tag, merge into single row
  const merged: TagCatalogItem[] = []
  
  Object.keys(groupedByType).forEach((tagType) => {
    const tags = groupedByType[tagType]
    if (!tags || tags.length === 0) return
    
    if (tagType === 'branch_tag') {
      // For branch_tag, find the tag with tag_name = "Branch" and merge all branch_tag tags
      const branchTag = tags.find((tag) => tag.tag_name === 'Branch') || tags[0]
      if (!branchTag) return
      
      const mergedTag: TagCatalogItem = {
        tag_id: branchTag.tag_id,
        tenant_id: branchTag.tenant_id,
        tag_type: branchTag.tag_type,
        tag_name: 'Branch', // Fixed tag_name
        tag_objects: {},
      }
      
      // Merge all tag_objects from all branch_tag tags
      tags.forEach((tag) => {
        if (tag.tag_objects) {
          Object.keys(tag.tag_objects).forEach((objectType) => {
            if (!mergedTag.tag_objects) {
              mergedTag.tag_objects = {}
            }
            if (!mergedTag.tag_objects[objectType]) {
              mergedTag.tag_objects[objectType] = {}
            }
            const sourceObjects = tag.tag_objects?.[objectType]
            if (sourceObjects && mergedTag.tag_objects) {
              Object.assign(mergedTag.tag_objects[objectType], sourceObjects)
            }
          })
        }
      })
      
      merged.push(mergedTag)
    } else if (tagType === 'area_tag') {
      // For area_tag, find the tag with tag_name = "Area" and merge all area_tag tags
      const areaTag = tags.find((tag) => tag.tag_name === 'Area') || tags[0]
      if (!areaTag) return
      
      const mergedTag: TagCatalogItem = {
        tag_id: areaTag.tag_id,
        tenant_id: areaTag.tenant_id,
        tag_type: areaTag.tag_type,
        tag_name: 'Area', // Fixed tag_name
        tag_objects: {},
      }
      
      // Merge all tag_objects from all area_tag tags
      tags.forEach((tag) => {
        if (tag.tag_objects) {
          Object.keys(tag.tag_objects).forEach((objectType) => {
            if (!mergedTag.tag_objects) {
              mergedTag.tag_objects = {}
            }
            if (!mergedTag.tag_objects[objectType]) {
              mergedTag.tag_objects[objectType] = {}
            }
            const sourceObjects = tag.tag_objects?.[objectType]
            if (sourceObjects && mergedTag.tag_objects) {
              Object.assign(mergedTag.tag_objects[objectType], sourceObjects)
            }
          })
        }
      })
      
      merged.push(mergedTag)
    } else {
      // For other types (family_tag, user_tag), keep all rows
      merged.push(...tags)
    }
  })
  
  // Sort: first by tag_type, then by tag_name (ascending)
  merged.sort((a, b) => {
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
  
  return merged
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
      // Fallback: use default system predefined types (branch_tag, family_tag, area_tag)
      // These are the built-in types that cannot be deleted according to database schema
      systemPredefinedTagTypesFromServer.value = ['branch_tag', 'family_tag', 'area_tag']
    }
    // Initialize selectedObjects: all objects selected by default (based on DB data)
    // Always re-initialize from DB to reflect current state
    result.items.forEach((tag) => {
      const allKeys: string[] = []
      if (tag.tag_objects) {
        for (const [objectType, objects] of Object.entries(tag.tag_objects)) {
          for (const objectId of Object.keys(objects)) {
            allKeys.push(`${objectType}:${objectId}`)
          }
        }
      }
      // Always update from DB (don't preserve user selections, as they're reflected in tag_objects)
      selectedObjects.value[tag.tag_id] = allKeys
      // Only initialize objectsToRemove if not already set (preserve pending removals)
      if (!objectsToRemove.value[tag.tag_id]) {
        objectsToRemove.value[tag.tag_id] = []
      }
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
  // Map tag types to display names
  const tagTypeMap: Record<string, string> = {
    'branch_tag': 'Branch_tag',
    'area_tag': 'Area_tag',
    'family_tag': 'Family_tag',
    'user_tag': 'User_tag',
  }
  return tagTypeMap[tagType] || tagType.replace(/_tag$/, '').replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) + '_tag'
}

// Get all related tags by Tag Type
const getTagsByType = (tagType: string | null): TagCatalogItem[] => {
  return dataSource.value.filter((tag) => tag.tag_type === tagType)
}



// Create Branch (branch_tag)
// For branch_tag, tag_name is "Branch", actual branch names are stored as members in tag_objects
const handleCreateBranch = async () => {
  try {
    if (!createBranchData.value.trim()) {
      message.warning('Please enter branch name')
      return
    }

    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      message.error('No tenant ID available')
      return
    }

    // For branch_tag, we need to:
    // 1. Ensure "Branch" tag exists (tag_name = "Branch", tag_type = "branch_tag")
    // 2. Add the branch name as a member in tag_objects
    
    // Check if branch_tag with tag_name = "Branch" exists
    let branchTag = dataSource.value.find(
      (tag) => tag.tag_type === 'branch_tag' && tag.tag_name === 'Branch'
    )

    if (!branchTag) {
      // Create branch_tag with tag_name = "Branch"
      const createParams: CreateTagParams = {
        tenant_id: tenantId,
        tag_type: 'branch_tag',
        tag_name: 'Branch', // Fixed tag_name for branch_tag
      }
      await createTagApi(createParams)
      await fetchTags() // Refresh to get the new tag
      // Find the newly created tag
      branchTag = dataSource.value.find(
        (tag) => tag.tag_type === 'branch_tag' && tag.tag_name === 'Branch'
      )
    }

    if (!branchTag) {
      message.error('Failed to create or find branch tag')
      return
    }

    // Generate a UUID for the branch name
    const branchId = crypto.randomUUID()
    const branchName = createBranchData.value.trim()

    // Add branch name to tag_objects JSONB
    const addParams: AddTagObjectsParams = {
      tag_id: branchTag.tag_id,
      object_type: 'branch',
      objects: [{ object_id: branchId, object_name: branchName }],
    }

    await addTagObjectsApi(addParams)
    message.success('Branch created successfully')
    
    // Reset form
    createBranchData.value = ''
    await fetchTags()
  } catch (error: any) {
    message.error(error?.message || 'Failed to create branch')
  }
}

// Create Area (area_tag)
// For area_tag, all area names are stored as members in tag_objects of a single tag
// There should be only one area_tag row, all areas are in its member column
const handleCreateArea = async () => {
  try {
    if (!createAreaData.value.trim()) {
      message.warning('Please enter area name')
      return
    }

    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      message.error('No tenant ID available')
      return
    }

    // For area_tag, we need to:
    // 1. Ensure area_tag exists with tag_name = "Area" (only one row for all areas)
    // 2. Add the area name as a member in tag_objects JSONB
    
    // Check if area_tag with tag_name = "Area" exists
    let areaTag = dataSource.value.find(
      (tag) => tag.tag_type === 'area_tag' && tag.tag_name === 'Area'
    )

    if (!areaTag) {
      // Create area_tag with tag_name = "Area"
      const createParams: CreateTagParams = {
        tenant_id: tenantId,
        tag_type: 'area_tag',
        tag_name: 'Area', // Fixed tag_name for area_tag
      }
      await createTagApi(createParams)
      await fetchTags() // Refresh to get the new tag
      // Find the newly created tag
      areaTag = dataSource.value.find(
        (tag) => tag.tag_type === 'area_tag' && tag.tag_name === 'Area'
      )
    }

    if (!areaTag) {
      message.error('Failed to create or find area tag')
      return
    }

    // Generate a UUID for the area name
    const areaId = crypto.randomUUID()
    const areaName = createAreaData.value.trim()

    // Add area name to tag_objects JSONB
    const addParams: AddTagObjectsParams = {
      tag_id: areaTag.tag_id,
      object_type: 'area',
      objects: [{ object_id: areaId, object_name: areaName }],
    }

    await addTagObjectsApi(addParams)
    message.success('Area created successfully')
    
    // Reset form
    createAreaData.value = ''
    await fetchTags()
  } catch (error: any) {
    message.error(error?.message || 'Failed to create area')
  }
}

// Create Family (family_tag)
// For family_tag, each family has its own tag_name, members are stored in tag_objects
// Similar to user_tag, can have multiple family tags, each with different residents as members
const handleCreateFamily = async () => {
  try {
    if (!createFamilyData.value.trim()) {
      message.warning('Please enter family name')
      return
    }

    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      message.error('No tenant ID available')
      return
    }

    // For family_tag, tag_name is the actual family name
    const params: CreateTagParams = {
      tenant_id: tenantId,
      tag_type: 'family_tag',
      tag_name: createFamilyData.value.trim(),
    }
    
    await createTagApi(params)
    message.success('Family tag created successfully')
    
    // Reset form
    createFamilyData.value = ''
    await fetchTags()
  } catch (error: any) {
    message.error(error?.message || 'Failed to create family tag')
  }
}

// Create User Tag (user_tag)
// For user_tag, tag_name is the actual tag name, members are stored in tag_objects
const handleCreateUserTag = async () => {
  try {
    if (!createUserTagData.value.trim()) {
      message.warning('Please enter user tag name')
      return
    }

    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      message.error('No tenant ID available')
      return
    }

    // For user_tag, tag_name is the actual tag name
    const params: CreateTagParams = {
      tenant_id: tenantId,
      tag_type: 'user_tag',
      tag_name: createUserTagData.value.trim(),
    }
    
    await createTagApi(params)
    message.success('User tag created successfully')
    
    // Reset form
    createUserTagData.value = ''
    await fetchTags()
  } catch (error: any) {
    message.error(error?.message || 'Failed to create user tag')
  }
}


// Check if tag has objects
const hasObjects = (record: TagCatalogItem): boolean => {
  if (!record.tag_objects) return false
  // Check if any object type has at least one object
  for (const objectType in record.tag_objects) {
    const objects = record.tag_objects[objectType]
    if (objects && Object.keys(objects).length > 0) {
      return true
    }
  }
  return false
}

// Delete Tag Name
const deleteTagName = async (record: TagCatalogItem) => {
  // Check permission: Manager or Admin required for deleting tags
  if (!canManageOtherTags.value) {
    message.warning('Only Manager or Admin can delete tags')
    return
  }
  
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
  
  // Build previous selected from record.tag_objects (what should be selected based on DB data)
  // This represents the state before user unselected items
  const previousSelected: string[] = []
  if (record.tag_objects) {
    for (const [objectType, objects] of Object.entries(record.tag_objects)) {
      for (const objectId of Object.keys(objects)) {
        previousSelected.push(`${objectType}:${objectId}`)
      }
    }
  }
  
  console.log(`[handleObjectCheckChange] Tag ${tagId}:`, {
    previousSelected,
    checkedValues,
    previousCount: previousSelected.length,
    currentCount: checkedValues.length,
    previousSelectedKeys: previousSelected.map(k => k),
    checkedValuesKeys: checkedValues.map(k => k),
    recordTagObjects: record.tag_objects
  })
  
  // Find unselected objects (objects that were in DB but not in checkedValues)
  const unselected = previousSelected.filter((key) => !checkedValues.includes(key))
  
  console.log(`[handleObjectCheckChange] Unselected objects (${unselected.length}):`, unselected)
  
  // Initialize objectsToRemove if needed
  if (!objectsToRemove.value[tagId]) {
    objectsToRemove.value[tagId] = []
  }
  
  // Add newly unselected objects to removal list
  unselected.forEach((key) => {
    const [objectType, objectId] = key.split(':')
    if (!objectType || !objectId) {
      console.log(`[handleObjectCheckChange] Invalid key format: ${key}`)
      return
    }
    const exists = objectsToRemove.value[tagId].some(
      (obj) => obj.objectType === objectType && obj.objectId === objectId
    )
    if (!exists) {
      console.log(`[handleObjectCheckChange] Adding to removal list: ${objectType}:${objectId}`)
      objectsToRemove.value[tagId].push({ objectType, objectId })
    } else {
      console.log(`[handleObjectCheckChange] Already in removal list: ${objectType}:${objectId}`)
    }
  })
  
  // Remove re-selected objects (if previously marked for deletion)
  const beforeFilter = objectsToRemove.value[tagId].length
  objectsToRemove.value[tagId] = objectsToRemove.value[tagId].filter((obj) => {
    const key = `${obj.objectType}:${obj.objectId}`
    const shouldKeep = !checkedValues.includes(key)
    if (!shouldKeep) {
      console.log(`[handleObjectCheckChange] Removing from removal list (re-selected): ${key}`)
    }
    return shouldKeep
  })
  const afterFilter = objectsToRemove.value[tagId].length
  if (beforeFilter !== afterFilter) {
    console.log(`[handleObjectCheckChange] Removed ${beforeFilter - afterFilter} re-selected objects from removal list`)
  }
  
  console.log(`[handleObjectCheckChange] Final objectsToRemove[${tagId}]:`, objectsToRemove.value[tagId])
  console.log(`[handleObjectCheckChange] Final objectsToRemove[${tagId}] length:`, objectsToRemove.value[tagId].length)
  
  // v-model already updated selectedObjects.value[tagId], no need to update manually
  // After save and refresh, selectedObjects will be re-initialized from DB data
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
  // Check permission: Manager or Admin required for editing Area/Family/User tags
  if (!canManageOtherTags.value) {
    message.warning('Only Manager or Admin can edit tags')
    return
  }
  
  try {
    let hasChanges = false
    let totalRemoved = 0
    
    // Debug: Log objectsToRemove to see what we have
    console.log('[handleSaveAll] objectsToRemove:', JSON.stringify(objectsToRemove.value, null, 2))
    
    // Handle all objects that need to be removed
    // Process each tag and each object individually
    for (const [tagId, objects] of Object.entries(objectsToRemove.value)) {
      // Check if objects is an array and has items
      if (Array.isArray(objects) && objects.length > 0) {
        const record = dataSource.value.find((tag) => tag.tag_id === tagId)
        if (!record) {
          console.log(`[handleSaveAll] Tag ${tagId} not found in dataSource`)
          continue
        }
        
        hasChanges = true
        console.log(`[handleSaveAll] Processing ${objects.length} objects to remove from tag ${tagId}`)
        
        // Remove each object individually (sequentially)
        for (const obj of objects) {
          if (!obj.objectType || !obj.objectId) {
            console.log(`[handleSaveAll] Skipping invalid object:`, obj)
            continue
          }
          
          const params: RemoveTagObjectsParams = {
            tag_id: tagId,
            object_type: obj.objectType,
            object_ids: [obj.objectId], // Remove one at a time
          }
          
          console.log(`[handleSaveAll] Removing object: ${obj.objectType}:${obj.objectId} from tag ${tagId}`)
          try {
            await removeTagObjectsApi(params)
            totalRemoved++
            console.log(`[handleSaveAll] Successfully removed ${obj.objectType}:${obj.objectId}`)
          } catch (error: any) {
            console.error(`[handleSaveAll] Failed to remove ${obj.objectType}:${obj.objectId}:`, error)
            // Continue with next object even if one fails
          }
        }
      }
    }
    
    if (hasChanges) {
      message.success(`Successfully removed ${totalRemoved} object(s)`)
      // Clear removal list
      objectsToRemove.value = {}
      // Refresh tags page from DB
      console.log('[handleSaveAll] Refreshing tags from database...')
      await fetchTags()
      console.log('[handleSaveAll] Tags refreshed successfully')
    } else {
      console.log('[handleSaveAll] No changes detected, objectsToRemove:', objectsToRemove.value)
      message.info('No changes to save')
    }
  } catch (error: any) {
    console.error('[handleSaveAll] Error:', error)
    message.error(error?.message || 'Failed to save changes')
  }
}

// Delete single object from Tag (used by delete button in Member column)
const deleteObjectFromTag = async (
  record: TagCatalogItem,
  objectType: string,
  objectId: string
) => {
  // Check permission: only Admin can delete branch_tag objects
  if (record.tag_type === 'branch_tag' && !canManageBranch.value) {
    message.warning('Only administrators can delete branch')
    return
  }
  
  // Check permission: Manager or Admin required for deleting area_tag objects
  if (record.tag_type === 'area_tag' && !canManageOtherTags.value) {
    message.warning('Only Manager or Admin can delete area')
    return
  }
  
  try {

    const params: RemoveTagObjectsParams = {
      tag_id: record.tag_id,
      object_type: objectType,
      object_ids: [objectId],
    }
    await removeTagObjectsApi(params)
    message.success('Member deleted successfully')
    await fetchTags()
  } catch (error: any) {
    message.error(error?.message || 'Failed to delete member')
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

.objects-list-simple {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.object-item-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 20px 2px 6px;
  background: #f0f0f0;
  border-radius: 4px;
  margin-right: 8px;
  margin-bottom: 4px;
}

.object-name {
  font-size: 14px;
  color: #333;
}

.object-checkbox {
  margin-right: 0;
  white-space: nowrap;
}

.delete-object-icon {
  position: absolute;
  top: -6px;
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
  transition: all 0.2s;
}

.delete-object-icon:hover:not(.disabled) {
  color: #cf1322;
  background: #fff1f0;
  transform: scale(1.1);
}

.delete-object-icon.disabled {
  cursor: not-allowed;
  color: #d9d9d9;
  opacity: 0.5;
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
