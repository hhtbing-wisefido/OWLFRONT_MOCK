<template>
  <div class="unit-view">
    <div class="view-header">
      <div class="header-left">
        <a-button type="default" @click="goToUnitList" style="margin-right: 12px">
          <ArrowLeftOutlined />
          Back
        </a-button>
        <h2>Unit View (Read Only)</h2>
        <a-button 
          type="default" 
          @click="toggleExpandAll" 
          style="margin-left: 16px"
        >
          <template #icon>
            <ShrinkOutlined v-if="isAllExpanded" />
            <ExpandOutlined v-else />
          </template>
          {{ isAllExpanded ? 'Collapse All' : 'Expand All' }}
        </a-button>
        <a-button 
          type="default" 
          @click="handleRefresh" 
          style="margin-left: 8px"
          :loading="loading"
        >
          <template #icon>
            <ReloadOutlined />
          </template>
          Refresh
        </a-button>
        <a-button type="primary" @click="goToUnitList" style="margin-left: 8px">
          <EditOutlined />
          Go to Edit Mode
        </a-button>
      </div>
    </div>

    <div class="table-container">
      <a-table
        :columns="tableColumns"
        :data-source="tableData"
        :pagination="paginationConfig"
        :scroll="{ x: 'max-content', y: 'calc(100vh - 200px)' }"
        size="small"
        bordered
        :loading="loading"
        :expandIconColumnIndex="-1"
      >
        <template #headerCell="{ column }">
          <template v-if="column.key === 'UnitNumb'">
            <div 
              style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;" 
              @click="toggleUnitNumbSort"
              :style="{ color: unitNumbSortOrder ? '#1890ff' : 'inherit' }"
            >
              <span>UnitNumb</span>
              <SortAscendingOutlined 
                v-if="unitNumbSortOrder === 'asc'" 
                style="font-size: 14px; color: #1890ff;"
              />
              <SortDescendingOutlined 
                v-else-if="unitNumbSortOrder === 'desc'" 
                style="font-size: 14px; color: #1890ff;"
              />
              <span v-else style="color: #d9d9d9; font-size: 12px;">⇅</span>
            </div>
          </template>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'branch_name'">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span 
                v-if="record.hasChildren"
                @click="toggleExpand(record.key)"
                style="cursor: pointer; user-select: none; font-size: 16px; color: #1890ff;"
                :title="expandedKeys.has(record.key) ? 'Collapse' : 'Expand'"
              >
                <MinusOutlined v-if="expandedKeys.has(record.key)" />
                <PlusOutlined v-else />
              </span>
              <span v-if="record.branch_name">{{ record.branch_name }}</span>
            </div>
          </template>
          <template v-else-if="column.key === 'Building'">
            <span v-if="record.Building">{{ record.Building }}</span>
          </template>
          <template v-else-if="column.key === 'Floor'">
            <span v-if="record.Floor">{{ record.Floor }}</span>
          </template>
          <template v-else-if="column.key === 'area_name'">
            <span v-if="record.area_name">{{ record.area_name }}</span>
          </template>
          <template v-else-if="column.key === 'UnitName'">
            <span v-if="record.UnitName">{{ record.UnitName }}</span>
          </template>
          <template v-else-if="column.key === 'UnitNumb'">
            <span v-if="record.UnitNumb">{{ record.UnitNumb }}</span>
          </template>
          <template v-else-if="column.key === 'UnitType'">
            <span v-if="record.UnitType">{{ record.UnitType }}</span>
          </template>
          <template v-else-if="column.key === 'room'">
            <span v-if="record.room" style="white-space: pre-line;">{{ record.room }}</span>
          </template>
          <template v-else-if="column.key === 'bed'">
            <span v-if="record.bed" style="white-space: pre-line;">{{ record.bed }}</span>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { EditOutlined, ArrowLeftOutlined, ExpandOutlined, ShrinkOutlined, SortAscendingOutlined, SortDescendingOutlined, ReloadOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons-vue'
import type { Building, Unit, RoomWithBeds } from '@/api/units/model/unitModel'
import { getBuildingsApi, getUnitsApi, getRoomsApi } from '@/api/units/unit'
import { getDevicesApi } from '@/api/devices/device'
import type { Device } from '@/api/devices/model/deviceModel'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// Loading state
const loading = ref(false)

// Table data
const tableData = ref<any[]>([])
const rawTableData = ref<any[]>([]) // Store original data with children
const allDevices = ref<Device[]>([]) // Store all devices for displaying bound devices

// Expand state
const expandedKeys = ref<Set<string>>(new Set())
const unitNumbSortOrder = ref<'asc' | 'desc' | null>(null) // null = no sort, 'asc' = ascending, 'desc' = descending

// Computed: is all expanded
const isAllExpanded = computed(() => {
  const unitRows = rawTableData.value.filter(row => row.hasChildren)
  return unitRows.length > 0 && unitRows.every(row => expandedKeys.value.has(row.key))
})

// Table columns
const tableColumns = ref([
  { title: 'Branch', key: 'branch_name', dataIndex: 'branch_name', width: 100 },
  { title: 'Building', key: 'Building', dataIndex: 'Building', width: 80 },
  { title: 'Floor', key: 'Floor', dataIndex: 'Floor', width: 70 },
  { title: 'area_name', key: 'area_name', dataIndex: 'area_name', width: 100 },
  { title: 'UnitName', key: 'UnitName', dataIndex: 'UnitName', width: 100 },
  { 
    title: 'UnitNumb', 
    key: 'UnitNumb', 
    dataIndex: 'UnitNumb', 
    width: 80,
  },
  { title: 'UnitType', key: 'UnitType', dataIndex: 'UnitType', width: 50 },
  { title: 'Room:device', key: 'room', dataIndex: 'room', width: 120 },
  { title: 'Bed:device', key: 'bed', dataIndex: 'bed', width: 120 },
])

// Pagination config
const paginationConfig = {
  pageSize: 50,
  showSizeChanger: true,
  showTotal: (total: number) => `Total ${total} items`,
}

// Navigate to edit mode
const goToUnitList = () => {
  router.push('/units')
}

// Refresh data
const handleRefresh = () => {
  fetchAllData()
}

// Toggle expand for a single unit
const toggleExpand = (key: string) => {
  if (expandedKeys.value.has(key)) {
    expandedKeys.value.delete(key)
  } else {
    expandedKeys.value.add(key)
  }
  updateTableData()
}

// Toggle expand all
const toggleExpandAll = () => {
  if (isAllExpanded.value) {
    expandedKeys.value.clear()
  } else {
    const unitRows = rawTableData.value.filter(row => row.hasChildren)
    unitRows.forEach(row => expandedKeys.value.add(row.key))
  }
  updateTableData()
}

// Sort by UnitNumb
const toggleUnitNumbSort = () => {
  if (unitNumbSortOrder.value === null) {
    unitNumbSortOrder.value = 'asc'
  } else if (unitNumbSortOrder.value === 'asc') {
    unitNumbSortOrder.value = 'desc'
  } else {
    unitNumbSortOrder.value = null
  }
  updateTableData()
}

// Update table data based on expand state and sort
const updateTableData = () => {
  let data = [...rawTableData.value]
  
  // Apply sorting
  if (unitNumbSortOrder.value) {
    // Group rows by unit (unit row + its children)
    const unitGroups: Map<string, any[]> = new Map()
    let currentUnitKey: string | null = null
    let currentGroup: any[] = []
    
    data.forEach(row => {
      if (row.hasChildren) {
        // Save previous group
        if (currentUnitKey) {
          unitGroups.set(currentUnitKey, currentGroup)
        }
        // Start new group
        currentUnitKey = row.key
        currentGroup = [row]
      } else if (currentUnitKey) {
        // Add to current group
        currentGroup.push(row)
      } else {
        // Standalone row (no unit)
        unitGroups.set(row.key, [row])
      }
    })
    // Save last group
    if (currentUnitKey) {
      unitGroups.set(currentUnitKey, currentGroup)
    }
    
    // Sort groups by UnitNumb
    const sortedGroups = Array.from(unitGroups.entries()).sort(([, groupA], [, groupB]) => {
      const unitA = groupA[0]
      const unitB = groupB[0]
      const numA = parseInt(unitA.UnitNumb) || 0
      const numB = parseInt(unitB.UnitNumb) || 0
      
      if (unitNumbSortOrder.value === 'asc') {
        return numA - numB
      } else {
        return numB - numA
      }
    })
    
    // Flatten sorted groups
    data = sortedGroups.flatMap(([_, group]) => group)
  }
  
  // Apply expand/collapse
  const result: any[] = []
  data.forEach(row => {
    if (row.hasChildren) {
      // Unit row: always add
      result.push({
        ...row,
        isExpanded: expandedKeys.value.has(row.key)
      })
      // Add children if expanded
      if (expandedKeys.value.has(row.key) && row.children) {
        result.push(...row.children)
      }
    } else {
      // Non-unit row: only add if it's not a child of a collapsed unit
      // (children are handled above)
      if (!row.isChild) {
        result.push(row)
      }
    }
  })
  
  tableData.value = result
}

// Get minimum width for each column
const getMinWidthForColumn = (columnKey: string): number => {
  const minWidths: Record<string, number> = {
    branch_name: 50,  // Short values like DV1, SPR
    Building: 20,      // Single characters like A, B
    Floor: 20,         // Short values like 1F, 2F
    area_name: 50,      // Values like East, West, MemaryCare
    UnitName: 50,      // Values like E101, W201, M110
    UnitNumb: 50,      // Numbers like 101, 201, 110
    UnitType: 50,      // Values like Facility, Home
    room: 50,          // Values like bedroom, bathroom, LivingRoom
    bed: 50,           // Values like BedA, BedB
  }
  return minWidths[columnKey] || 50 // Default minimum 50px
}

// Fetch all data for table view
const fetchAllData = async () => {
  loading.value = true
  try {
    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      message.error('No tenant ID available')
      return
    }

    // Fetch all Buildings
    const allBuildings = await getBuildingsApi()

    // Fetch all Units
    const allUnitsResult = await getUnitsApi({
      tenant_id: tenantId,
    })
    const allUnits = allUnitsResult.items

    // Fetch Rooms and Beds for each Unit
    const unitsWithRoomsAndBeds = await Promise.all(
      allUnits.map(async (unit) => {
        try {
          const rooms = await getRoomsApi({ unit_id: unit.unit_id })
          return {
            ...unit,
            rooms: rooms || [],
          }
        } catch (error) {
          return {
            ...unit,
            rooms: [],
          }
        }
      })
    )

    // Fetch all devices (including bound ones)
    const devicesResult = await getDevicesApi({
      tenant_id: tenantId,
      business_access: 'approved',
      include_bound: true,
    } as any)
    allDevices.value = devicesResult.items || []

    // Transform data to table format
    rawTableData.value = transformToTableData(allBuildings, unitsWithRoomsAndBeds, allDevices.value)
    updateTableData()
  } catch (error: any) {
    message.error('Failed to fetch data: ' + (error.message || 'Unknown error'))
    tableData.value = []
  } finally {
    loading.value = false
  }
}

// Transform data to table format
const transformToTableData = (
  buildings: Building[],
  units: (Unit & { rooms: RoomWithBeds[] })[],
  devices: Device[] = []
): any[] => {
  const rows: any[] = []

  // Helper function to extract building value (handle both string and object format)
  const getBuildingValue = (building: any): string | null => {
    if (building == null) return null
    if (typeof building === 'string') return building
    if (typeof building === 'object' && building.String) {
      // Handle sql.NullString format: {"String": "A", "Valid": true}
      return building.Valid ? building.String : null
    }
    return null
  }

  // Separate units with and without buildings
  // Handle undefined/null/'' cases: building can be undefined (NULL in DB), or a string value
  const unitsWithBuilding = units.filter((unit) => {
    const building = getBuildingValue(unit.building)
    return building != null && building !== '' && building !== '-'
  })
  const unitsWithoutBuilding = units.filter((unit) => {
    const building = getBuildingValue(unit.building)
    return building == null || building === '' || building === '-'
  })

  // Group Buildings by branch_name
  const buildingsByBranchTag = new Map<string, Building[]>()
  buildings.forEach((building) => {
    // Use empty string instead of 'N/A' for null/undefined branch_name
    const branchTag = building.branch_name || ''
    if (!buildingsByBranchTag.has(branchTag)) {
      buildingsByBranchTag.set(branchTag, [])
    }
    buildingsByBranchTag.get(branchTag)!.push(building)
  })

  // Group Units by Building and Floor (only for units with building)
  const unitsByBuildingAndFloor = new Map<string, typeof unitsWithBuilding>()
  unitsWithBuilding.forEach((unit) => {
    // Normalize floor: ensure it has "F" suffix (e.g., "1" -> "1F", "1F" -> "1F")
    const normalizedFloor = unit.floor 
      ? (unit.floor.match(/^\d+$/) ? `${unit.floor}F` : unit.floor)
      : '1F'
    // Extract building value (handle both string and object format)
    const buildingValue = getBuildingValue(unit.building)
    const buildingName = (buildingValue != null && buildingValue !== '' && buildingValue !== '-') ? String(buildingValue) : ''
    const key = `${buildingName}-${normalizedFloor}`
    if (!unitsByBuildingAndFloor.has(key)) {
      unitsByBuildingAndFloor.set(key, [])
    }
    unitsByBuildingAndFloor.get(key)!.push(unit)
  })

  // Group units without building by branch_name
  const unitsWithoutBuildingByBranchTag = new Map<string, typeof unitsWithoutBuilding>()
  unitsWithoutBuilding.forEach((unit) => {
    // Use empty string instead of 'N/A' for null/undefined branch_name
    const branchTag = unit.branch_name || ''
    if (!unitsWithoutBuildingByBranchTag.has(branchTag)) {
      unitsWithoutBuildingByBranchTag.set(branchTag, [])
    }
    unitsWithoutBuildingByBranchTag.get(branchTag)!.push(unit)
  })

  // Helper function to process units and generate rows
  const processUnits = (
    unitsToProcess: typeof units,
    branchTag: string,
    buildingName: string,
    floor: string
  ) => {
    if (unitsToProcess.length === 0) return

      // Group Units by area_name
      const unitsByAreaTag = new Map<string, typeof unitsToProcess>()
      unitsToProcess.forEach((unit) => {
        // Use empty string instead of 'N/A' for null/undefined area_name
        const areaTag = unit.area_name || ''
        if (!unitsByAreaTag.has(areaTag)) {
          unitsByAreaTag.set(areaTag, [])
        }
        unitsByAreaTag.get(areaTag)!.push(unit)
      })

    // Sort area_names alphabetically
    const sortedAreaTags = Array.from(unitsByAreaTag.keys()).sort()

    sortedAreaTags.forEach((areaTag) => {
      const unitsInAreaTag = unitsByAreaTag.get(areaTag) || []
      
      // Sort Units by UnitNumb (extract number from unit_number for numeric sort)
      const sortedUnits = [...unitsInAreaTag].sort((a, b) => {
        const numA = parseInt(a.unit_number) || 0
        const numB = parseInt(b.unit_number) || 0
        return numA - numB
      })

      sortedUnits.forEach((unit) => {
        // Collect all rooms and beds for this unit
        const roomBedRows: Array<{ room: string; bed?: string; isUnitRoom: boolean }> = []
        const roomsWithoutBed: Array<{ room: string; isUnitRoom: boolean }> = []

        if (unit.rooms && unit.rooms.length > 0) {
          // Sort rooms: prioritize unit_room (room_name === unit_name), then alphabetical
          const sortedRooms = [...unit.rooms].sort((a, b) => {
            const aIsUnitRoom = a.room_name === unit.unit_name
            const bIsUnitRoom = b.room_name === unit.unit_name
            if (aIsUnitRoom && !bIsUnitRoom) return -1
            if (!aIsUnitRoom && bIsUnitRoom) return 1
            return a.room_name.localeCompare(b.room_name)
          })

          sortedRooms.forEach((room) => {
            const isUnitRoom = room.room_name === unit.unit_name
            // Get devices bound to this room
            const roomDevices = devices.filter((d: any) => d.bound_room_id === room.room_id)
            const roomDeviceNames = roomDevices.map((d: Device) => d.device_name).filter(Boolean)
            
            // Format room display with devices
            let roomDisplayName = isUnitRoom ? unit.unit_name : room.room_name
            if (roomDeviceNames.length > 0) {
              const formattedDevices = roomDeviceNames.map(name => `  --  ${name}`).join('\n')
              roomDisplayName = `${roomDisplayName}\n${formattedDevices}`
            }

            if (room.beds && room.beds.length > 0) {
              // Sort beds by name (alphabetical: BedA, BedB...)
              const sortedBeds = [...room.beds].sort((a, b) => 
                a.bed_name.localeCompare(b.bed_name)
              )
              sortedBeds.forEach((bed) => {
                // Get devices bound to this bed
                const bedDevices = devices.filter((d: any) => d.bound_bed_id === bed.bed_id)
                const bedDeviceNames = bedDevices.map((d: Device) => d.device_name).filter(Boolean)
                
                // Format bed display with devices
                let bedDisplayName = bed.bed_name
                if (bedDeviceNames.length > 0) {
                  const formattedDevices = bedDeviceNames.map(name => `  --  ${name}`).join('\n')
                  bedDisplayName = `${bedDisplayName}\n${formattedDevices}`
                }
                
                roomBedRows.push({ room: roomDisplayName, bed: bedDisplayName, isUnitRoom })
              })
            } else {
              // Room without beds
              roomsWithoutBed.push({ room: roomDisplayName, isUnitRoom })
            }
          })
        }

        // Always add unit row, even if it has no rooms or beds
        const unitKey = `row-${rowIndex++}`
        const children: any[] = []
        
        // Combine and sort: unit_room first, then others
        const allChildren: Array<{ room: string; bed?: string; isUnitRoom: boolean }> = []
        
        // Add rooms with beds (already have isUnitRoom flag)
        allChildren.push(...roomBedRows)
        
        // Add rooms without beds (already have isUnitRoom flag)
        allChildren.push(...roomsWithoutBed.map(({ room, isUnitRoom }) => ({ room, isUnitRoom })))
        
        // Sort: unit_room first, then others
        allChildren.sort((a, b) => {
          if (a.isUnitRoom && !b.isUnitRoom) return -1
          if (!a.isUnitRoom && b.isUnitRoom) return 1
          return 0
        })
        
        // Add sorted children
        allChildren.forEach(({ room, bed }) => {
          children.push({
            key: `row-${rowIndex++}`,
            branch_name: '',
            Building: '',
            Floor: '',
            area_name: '',
            UnitName: '',
            UnitNumb: '',
            UnitType: '',
            room: room,
            bed: bed,
            isChild: true,
          })
        })
        
        // Unit row (with or without children)
        rows.push({
          key: unitKey,
          branch_name: branchTag || '',
          Building: buildingName || '',
          Floor: floor || '',
          area_name: areaTag || '',
          UnitName: unit.unit_name || '',
          UnitNumb: unit.unit_number || '',
          UnitType: unit.unit_type || '',
          hasChildren: children.length > 0, // Only has children if there are rooms/beds
          children: children.length > 0 ? children : undefined,
          isExpanded: false, // Default collapsed
        })
      })
    })
  }

  // Generate table rows
  let rowIndex = 0

  // Process units with buildings
  const allBranchTags = new Set<string>()
  buildingsByBranchTag.forEach((_, branchTag) => allBranchTags.add(branchTag))
  unitsWithoutBuildingByBranchTag.forEach((_, branchTag) => allBranchTags.add(branchTag))
  
  // Sort branch_names alphabetically
  const sortedBranchTags = Array.from(allBranchTags).sort()

  sortedBranchTags.forEach((branchTag) => {
    const buildingsInTag = buildingsByBranchTag.get(branchTag) || []
    
    // Sort Buildings by name (alphabetical)
    const sortedBuildings = [...buildingsInTag].sort((a, b) => 
      (a.building_name || '').localeCompare(b.building_name || '')
    )

    sortedBuildings.forEach((building) => {
      // Get all floors from units in this building
      const floorsInBuilding = new Set<string>()
      const buildingName = building.building_name || ''
      unitsWithBuilding.forEach((unit) => {
        // Extract building value (handle both string and object format)
        const unitBuildingValue = getBuildingValue(unit.building)
        const unitBuilding = (unitBuildingValue != null && unitBuildingValue !== '' && unitBuildingValue !== '-') ? String(unitBuildingValue) : ''
        if (unitBuilding === buildingName) {
          // Normalize floor: ensure it has "F" suffix (e.g., "1" -> "1F", "1F" -> "1F")
          const normalizedFloor = unit.floor 
            ? (unit.floor.match(/^\d+$/) ? `${unit.floor}F` : unit.floor)
            : '1F'
          floorsInBuilding.add(normalizedFloor)
        }
      })
      
      // Sort floors by number (extract number from "1F", "2F", etc.)
      const sortedFloors = Array.from(floorsInBuilding).sort((a, b) => {
        const floorNumA = parseInt(a.replace(/[^0-9]/g, '')) || 0
        const floorNumB = parseInt(b.replace(/[^0-9]/g, '')) || 0
        return floorNumA - floorNumB
      })
      
      // If no units, show at least one floor row
      if (sortedFloors.length === 0) {
        sortedFloors.push('1F')
      }
      
      sortedFloors.forEach((floor) => {
        // Use same logic as key generation: ensure buildingName is normalized
        // Use empty string instead of 'N/A' for null/undefined building
        const normalizedBuildingName = (buildingName != null && buildingName !== '' && buildingName !== '-') ? String(buildingName) : ''
        const key = `${normalizedBuildingName}-${floor}`
        const unitsInFloor = unitsByBuildingAndFloor.get(key) || []

        if (unitsInFloor.length === 0) {
          // No Units, only show branch_name, Building, Floor
          rows.push({
            key: `row-${rowIndex++}`,
            branch_name: branchTag || '',
            Building: buildingName || '',
            Floor: floor,
          })
        } else {
          processUnits(unitsInFloor, branchTag || '', buildingName || '', floor)
        }
      })
    })

    // Process units without building for this branch_name
    const unitsWithoutBuildingInTag = unitsWithoutBuildingByBranchTag.get(branchTag || '') || []
    if (unitsWithoutBuildingInTag.length > 0) {
      processUnits(unitsWithoutBuildingInTag, branchTag || '', '', '1F')
    }
  })

  return rows
}

// Initialize column resizing
const initColumnResize = () => {
  nextTick(() => {
    const table = document.querySelector('.table-container .ant-table-thead')
    if (!table) {
      // Retry after a short delay if table not ready
      setTimeout(initColumnResize, 100)
      return
    }

    const headers = table.querySelectorAll('th')
    headers.forEach((header, index) => {
      if (index >= tableColumns.value.length) return

      // Remove existing resize handle if any
      const existingHandle = header.querySelector('.column-resize-handle')
      if (existingHandle) {
        existingHandle.remove()
      }

      const resizeHandle = document.createElement('div')
      resizeHandle.className = 'column-resize-handle'
      resizeHandle.style.cssText = `
        position: absolute;
        right: -2px;
        top: 0;
        bottom: 0;
        width: 8px;
        cursor: col-resize;
        background: transparent;
        z-index: 10;
      `
      
      let isResizing = false
      let startX = 0
      let startWidth = 0

      resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true
        startX = e.clientX
        startWidth = (header as HTMLElement).offsetWidth
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'
        e.preventDefault()
        e.stopPropagation()
      })

      const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing) return
        const diff = e.clientX - startX
        // Get minimum width for this column
        const column = tableColumns.value[index]
        const minWidth = getMinWidthForColumn(column?.key || '')
        const newWidth = Math.max(minWidth, startWidth + diff)
        if (column) {
          column.width = newWidth
        }
        e.preventDefault()
      }

      const handleMouseUp = () => {
        if (isResizing) {
          isResizing = false
          document.body.style.cursor = ''
          document.body.style.userSelect = ''
        }
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      // Store cleanup function
      ;(header as any)._resizeCleanup = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      const headerElement = header as HTMLElement
      if (headerElement.style.position !== 'relative') {
        headerElement.style.position = 'relative'
      }
      header.appendChild(resizeHandle)
    })
  })
}

// Watch route changes to refresh data when returning from UnitList
watch(() => route.path, (newPath, oldPath) => {
  // If navigating to UnitView from UnitList, refresh data
  if (newPath === '/units/view' && oldPath === '/units') {
    fetchAllData()
  }
}, { immediate: false })

// Initialize
onMounted(() => {
  fetchAllData().then(() => {
    // Initialize resize after data is loaded
    setTimeout(() => {
      initColumnResize()
    }, 200)
  })
})
</script>

<style scoped>
.unit-view {
  padding: 24px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: center;
}

.view-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.table-container {
  flex: 1;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 16px;
}

/* Enable column resizing */
:deep(.ant-table-thead > tr > th) {
  position: relative;
  user-select: none;
}

:deep(.column-resize-handle) {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: 0;
  width: 8px;
  cursor: col-resize;
  background: transparent;
  z-index: 10;
}

:deep(.column-resize-handle:hover) {
  background: #1890ff;
  opacity: 0.3;
}

/* Hide default expand column from Ant Design Table */
:deep(.ant-table-expand-icon-col),
:deep(.ant-table-row-expand-icon-cell),
:deep(.ant-table-expand-icon-th),
:deep(thead .ant-table-expand-icon-th),
:deep(tbody .ant-table-expand-icon-th),
:deep(.ant-table-thead .ant-table-expand-icon-th),
:deep(.ant-table-tbody .ant-table-expand-icon-th) {
  display: none !important;
  width: 0 !important;
  padding: 0 !important;
  border: none !important;
  visibility: hidden !important;
}

:deep(.ant-table-row-expand-icon),
:deep(.ant-table-expand-icon) {
  display: none !important;
  visibility: hidden !important;
}
</style>

