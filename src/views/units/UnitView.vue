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
      </div>
      <a-button type="primary" @click="goToUnitList">
        <EditOutlined />
        Go to Edit Mode
      </a-button>
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
          <template v-if="column.key === 'location_tag'">
            <span v-if="record.location_tag">{{ record.location_tag }}</span>
          </template>
          <template v-else-if="column.key === 'Building'">
            <span v-if="record.Building">{{ record.Building }}</span>
          </template>
          <template v-else-if="column.key === 'Floor'">
            <span v-if="record.Floor">{{ record.Floor }}</span>
          </template>
          <template v-else-if="column.key === 'area_tag'">
            <span v-if="record.area_tag">{{ record.area_tag }}</span>
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
            <span v-if="record.room">{{ record.room }}</span>
          </template>
          <template v-else-if="column.key === 'bed'">
            <span v-if="record.bed">{{ record.bed }}</span>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { EditOutlined, ArrowLeftOutlined, ExpandOutlined, ShrinkOutlined, ArrowUpOutlined, ArrowDownOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons-vue'
import type { Building, Unit, RoomWithBeds } from '@/api/units/model/unitModel'
import { getBuildingsApi, getUnitsApi, getRoomsApi } from '@/api/units/unit'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()

// Loading state
const loading = ref(false)

// Table data
const tableData = ref<any[]>([])
const rawTableData = ref<any[]>([]) // Store original data with children

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
  { title: 'location_tag', key: 'location_tag', dataIndex: 'location_tag', width: 80 },
  { title: 'Building', key: 'Building', dataIndex: 'Building', width: 60 },
  { title: 'Floor', key: 'Floor', dataIndex: 'Floor', width: 50 },
  { title: 'area_tag', key: 'area_tag', dataIndex: 'area_tag', width: 100 },
  { title: 'UnitName', key: 'UnitName', dataIndex: 'UnitName', width: 100 },
  { 
    title: 'UnitNumb', 
    key: 'UnitNumb', 
    dataIndex: 'UnitNumb', 
    width: 100,
  },
  { title: 'UnitType', key: 'UnitType', dataIndex: 'UnitType', width: 80 },
  { title: 'room', key: 'room', dataIndex: 'room', width: 120 },
  { title: 'bed', key: 'bed', dataIndex: 'bed', width: 100 },
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
    const sortedGroups = Array.from(unitGroups.entries()).sort(([keyA, groupA], [keyB, groupB]) => {
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
    location_tag: 50,  // Short values like DV1, SPR
    Building: 20,      // Single characters like A, B
    Floor: 20,         // Short values like 1F, 2F
    area_tag: 50,      // Values like East, West, MemaryCare
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
      is_active: true,
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

    // Transform data to table format
    rawTableData.value = transformToTableData(allBuildings, unitsWithRoomsAndBeds)
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
  units: (Unit & { rooms: RoomWithBeds[] })[]
): any[] => {
  const rows: any[] = []

  // Separate units with and without buildings
  // DB guarantees building is non-null, default value is "-"
  const unitsWithBuilding = units.filter((unit) => unit.building && unit.building !== '-')
  const unitsWithoutBuilding = units.filter((unit) => unit.building === '-')

  // Group Buildings by location_tag
  const buildingsByLocationTag = new Map<string, Building[]>()
  buildings.forEach((building) => {
    const locationTag = building.location_tag || 'N/A'
    if (!buildingsByLocationTag.has(locationTag)) {
      buildingsByLocationTag.set(locationTag, [])
    }
    buildingsByLocationTag.get(locationTag)!.push(building)
  })

  // Group Units by Building and Floor (only for units with building)
  const unitsByBuildingAndFloor = new Map<string, typeof unitsWithBuilding>()
  unitsWithBuilding.forEach((unit) => {
    const key = `${unit.building || 'N/A'}-${unit.floor || 'N/A'}`
    if (!unitsByBuildingAndFloor.has(key)) {
      unitsByBuildingAndFloor.set(key, [])
    }
    unitsByBuildingAndFloor.get(key)!.push(unit)
  })

  // Group units without building by location_tag
  const unitsWithoutBuildingByLocationTag = new Map<string, typeof unitsWithoutBuilding>()
  unitsWithoutBuilding.forEach((unit) => {
    const locationTag = unit.location_tag || 'N/A'
    if (!unitsWithoutBuildingByLocationTag.has(locationTag)) {
      unitsWithoutBuildingByLocationTag.set(locationTag, [])
    }
    unitsWithoutBuildingByLocationTag.get(locationTag)!.push(unit)
  })

  // Helper function to process units and generate rows
  const processUnits = (
    unitsToProcess: typeof units,
    locationTag: string,
    buildingName: string,
    floor: string
  ) => {
    if (unitsToProcess.length === 0) return

    // Group Units by area_tag
    const unitsByAreaTag = new Map<string, typeof unitsToProcess>()
    unitsToProcess.forEach((unit) => {
      const areaTag = unit.area_tag || 'N/A'
      if (!unitsByAreaTag.has(areaTag)) {
        unitsByAreaTag.set(areaTag, [])
      }
      unitsByAreaTag.get(areaTag)!.push(unit)
    })

    // Sort area_tags alphabetically
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
        const roomBedRows: Array<{ room: string; bed?: string }> = []
        const roomsWithoutBed: string[] = []

        if (unit.rooms && unit.rooms.length > 0) {
          // Sort rooms by name (alphabetical)
          const sortedRooms = [...unit.rooms].sort((a, b) => 
            a.room_name.localeCompare(b.room_name)
          )

          sortedRooms.forEach((room) => {
            if (room.beds && room.beds.length > 0) {
              // Sort beds by name (alphabetical: BedA, BedB...)
              const sortedBeds = [...room.beds].sort((a, b) => 
                a.bed_name.localeCompare(b.bed_name)
              )
              sortedBeds.forEach((bed) => {
                // If room_name equals unit_name, display unit_name in room column
                // This indicates the bed is directly under the unit
                const roomDisplayName = room.room_name === unit.unit_name 
                  ? unit.unit_name 
                  : room.room_name
                roomBedRows.push({ room: roomDisplayName, bed: bed.bed_name })
              })
            } else {
              // Room without beds
              roomsWithoutBed.push(room.room_name)
            }
          })
        }

        // Only add unit row if there are rooms or beds
        if (roomBedRows.length > 0 || roomsWithoutBed.length > 0) {
          const unitKey = `row-${rowIndex++}`
          const children: any[] = []
          
          // Add rooms with beds as children
          roomBedRows.forEach(({ room, bed }) => {
            children.push({
              key: `row-${rowIndex++}`,
              location_tag: '',
              Building: '',
              Floor: '',
              area_tag: '',
              UnitName: '',
              UnitNumb: '',
              UnitType: '',
              room: room,
              bed: bed,
              isChild: true,
            })
          })

          // Add rooms without beds as children
          roomsWithoutBed.forEach((roomName) => {
            children.push({
              key: `row-${rowIndex++}`,
              location_tag: '',
              Building: '',
              Floor: '',
              area_tag: '',
              UnitName: '',
              UnitNumb: '',
              UnitType: '',
              room: roomName,
              isChild: true,
            })
          })
          
          // Unit row with children
          rows.push({
            key: unitKey,
            location_tag: locationTag,
            Building: buildingName,
            Floor: floor,
            area_tag: areaTag,
            UnitName: unit.unit_name || '',
            UnitNumb: unit.unit_number,
            UnitType: unit.unit_type || '',
            hasChildren: true,
            children: children,
            isExpanded: false, // Default collapsed
          })
        }
      })
    })
  }

  // Generate table rows
  let rowIndex = 0

  // Process units with buildings
  const allLocationTags = new Set<string>()
  buildingsByLocationTag.forEach((_, locationTag) => allLocationTags.add(locationTag))
  unitsWithoutBuildingByLocationTag.forEach((_, locationTag) => allLocationTags.add(locationTag))
  
  // Sort location_tags alphabetically
  const sortedLocationTags = Array.from(allLocationTags).sort()

  sortedLocationTags.forEach((locationTag) => {
    const buildingsInTag = buildingsByLocationTag.get(locationTag) || []
    
    // Sort Buildings by name (alphabetical)
    const sortedBuildings = [...buildingsInTag].sort((a, b) => 
      a.building_name.localeCompare(b.building_name)
    )

    sortedBuildings.forEach((building) => {
      // Generate floors (sorted by number: 1F, 2F, 3F...)
      for (let floorNum = 1; floorNum <= building.floors; floorNum++) {
        const floor = `${floorNum}F`
        const key = `${building.building_name}-${floor}`
        const unitsInFloor = unitsByBuildingAndFloor.get(key) || []

        if (unitsInFloor.length === 0) {
          // No Units, only show location_tag, Building, Floor
          rows.push({
            key: `row-${rowIndex++}`,
            location_tag: locationTag,
            Building: building.building_name,
            Floor: floor,
          })
        } else {
          processUnits(unitsInFloor, locationTag, building.building_name, floor)
        }
      }
    })

    // Process units without building for this location_tag
    const unitsWithoutBuildingInTag = unitsWithoutBuildingByLocationTag.get(locationTag) || []
    if (unitsWithoutBuildingInTag.length > 0) {
      processUnits(unitsWithoutBuildingInTag, locationTag, '-', '1F')
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
</style>

