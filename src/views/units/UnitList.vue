<template>
  <div class="unit-list">
    <!-- Page Header: Branch Container -->
    <div class="page-header">
      <div class="branch-container-header">
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
        <a-button type="default" @click="goToUnitView" class="view-button">
          <EyeOutlined />
          View
        </a-button>
        <a-auto-complete
          id="create-building-location-tag"
          name="create-building-location-tag"
          v-model:value="createBuildingForm.branch_name"
          :options="branchSelectOptions"
          placeholder="Select or input Branch"
          allow-clear
          show-search
          :filter-option="filterBranchOption"
          style="width: 180px"
          @select="handleBranchAutoCompleteSelect"
          @change="handleBranchAutoCompleteChange"
        />
        <a-auto-complete
          id="create-building-name"
          name="create-building-name"
          v-model:value="createBuildingForm.building_name"
          :options="buildingOptions"
          placeholder="input or select Building"
          allow-clear
          style="width: 180px; margin-left: 8px"
          @select="handleBuildingSelect"
          @pressEnter="handleCreateBuildingWrapper"
        />
        <a-button type="primary" @click="handleCreateBuildingWrapper" style="margin-left: 8px">Create</a-button>
        <!-- Branch Container: List all branches (same row) -->
        <div class="branch-container">
          <div
            v-for="branch in availableBranches"
            :key="branch.branch_id"
            class="branch-item"
            :class="{ 'branch-item-selected': selectedBranchId === branch.branch_id }"
            @click="handleBranchContainerClick(branch)"
          >
            <span class="branch-name">{{ branch.branch_name }}</span>
          </div>
          <div v-if="availableBranches.length === 0" class="branch-empty">
            <span>No branches yet</span>
          </div>
        </div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="main-container">
      <!-- Left: Building List (Complete Building Cards and Floor Buttons) -->
      <div class="building-list">
        <div class="buildings">
          <div
            v-for="building in buildingsWithDisplayName"
            :key="building.building_id"
            class="building-card"
            :class="{
              active: selectedBuilding?.building_id === building.building_id,
            }"
          >
            <div class="building-header" @click="handleToggleBuildingCardWrapper(building)">
              <div class="building-name-wrapper">
                <BankOutlined class="building-icon" />
                <span class="building-name">
                  {{ building.displayName }}
                </span>
              </div>
              <DeleteOutlined
                class="building-delete-icon"
                @click.stop="handleDeleteBuildingWrapper(building)"
              />
            </div>
            <div class="floors" v-if="selectedBuilding?.building_id === building.building_id && getBuildingFloors(building).length > 0" @click.stop>
              <div
                v-for="floorNum in getBuildingFloors(building)"
                :key="floorNum"
                class="floor-item"
              >
                <a-button
                  :type="selectedFloor === `${floorNum}F` ? 'primary' : 'default'"
                  class="floor-button"
                  @click.stop="handleSelectFloorWrapper(building, `${floorNum}F`)"
                >
                  floor{{ floorNum }}
                </a-button>
                <DeleteOutlined
                  class="floor-delete-icon"
                  @click.stop="handleDeleteFloorWrapper(building, floorNum)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Unit Grid -->
      <div class="unit-grid-container">
        <div v-if="!selectedBuilding" class="empty-state">
              <p>Please select a building</p>
        </div>
        <div v-else class="unit-grid-wrapper">
          <div class="unit-grid">
            <!-- Display units grouped by floor with dividers -->
            <template v-for="(item, index) in unitGrid" :key="item.type === 'floor-divider' ? `floor-${item.floor}` : item.type === 'add-button' ? `add-${item.floor}` : item.unit?.unit_id || index">
              <!-- Floor divider -->
              <div
                v-if="item.type === 'floor-divider'"
                class="floor-divider"
              >
                <span class="floor-label">{{ item.floor }}</span>
              </div>
              
              <!-- Unit cell -->
              <div
                v-else-if="item.type === 'unit' && item.unit"
                class="unit-cell has-unit"
                @click="handleCellClick(item.unit, -1)"
              >
                <div class="unit-content">
                  {{ item.unit.unit_number }}
                </div>
              </div>
              
              <!-- Add Unit button for this floor -->
              <div
                v-else-if="item.type === 'add-button'"
                class="unit-cell add-unit-cell"
                @click="handleAddUnitForFloor(item.floor || '1F')"
              >
                <div class="empty-cell">
                  <PlusOutlined />
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>


    <!-- Create Unit Modal -->
    <a-modal
      v-model:open="showCreateUnitModal"
      title="Create Unit"
      @ok="handleCreateUnit"
      @cancel="resetCreateUnitForm"
      :width="600"
    >
      <a-form :model="createUnitForm" layout="vertical">
        <a-form-item label="Branch" v-if="selectedBuilding">
          <a-input
            :value="selectedBuilding.branch_name ?? ''"
            disabled
            style="background: #f5f5f5;"
          />
        </a-form-item>
        <a-form-item label="Building" v-if="selectedBuilding">
          <a-input
            :value="selectedBuilding.building_name || '-'"
            disabled
            style="background: #f5f5f5;"
          />
        </a-form-item>
        <a-form-item label="Floor" v-if="selectedBuilding && selectedFloor">
          <a-input
            :value="selectedFloor"
            disabled
            style="background: #f5f5f5;"
          />
        </a-form-item>
        <a-form-item
          label="Unit Name"
          :rules="[{ required: true, message: 'Please input unit name' }]"
          class="unit-name-with-type"
        >
          <div style="display: flex; align-items: center; gap: 0">
            <a-input
              id="create-location-unit-name"
              name="create-location-unit-name"
              v-model:value="createUnitForm.unit_name"
              style="width: 120px; margin-right: 0"
            />
            <a-radio-group 
              v-model:value="createUnitForm.unit_type"
              style="margin-left: 8px"
            >
              <a-radio value="Facility">Facility</a-radio>
              <a-radio value="Home">Home</a-radio>
            </a-radio-group>
          </div>
        </a-form-item>
        <a-form-item v-if="!selectedBuilding || !selectedFloor" style="margin-bottom: 16px;">
          <a-alert
            message="Please select a building and floor first"
            type="warning"
            show-icon
          />
        </a-form-item>
        <a-form-item label="Time Zone">
          <a-select
            id="create-location-timezone"
            name="create-location-timezone"
            v-model:value="createUnitForm.timezone"
            placeholder="Select time zone"
            allow-clear
            show-search
            :filter-option="filterTimeZoneOption"
            style="width: 100%"
          >
            <a-select-option
              v-for="tz in usTimeZones"
              :key="tz.value"
              :value="tz.value"
            >
              {{ tz.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Edit Unit Modal (Room-Bed Management) -->
    <a-modal
      v-model:visible="showEditUnitModal"
      :title="getEditUnitTitle()"
      @cancel="resetEditUnitForm"
      :width="isDeviceMode ? 1300 : 420"
      :footer="null"
      :wrap-class-name="isDeviceMode ? 'edit-unit-modal-device-mode' : 'edit-unit-modal-normal'"
    >
      <div class="modal-content-wrapper" :class="{ 'device-mode': isDeviceMode }">
        <!-- EditUnit Container -->
        <div 
          class="unit-edit-container"
        >
          <!-- Unit Basic Information -->
        <div class="unit-fields">
          <div class="unit-field inline-row">
            <div class="inline-field">
              <label>Floor:</label>
              <a-input-number
                v-model:value="editUnitForm.floor"
                :min="1"
                :max="99"
                placeholder="Floor number"
                style="width: 80px; margin-right: 24px"
              />
            </div>
            <div class="inline-field">
              <label>UnitName<span class="required-star">*</span>:</label>
              <a-input
                v-model:value="editUnitForm.unit_name"
                placeholder="Unit name"
                style="width: 100px"
                @blur="handleUnitNameBlur"
              />
            </div>
          </div>
          <!-- DB fields (editable) -->
          <div class="unit-field inline-row">
            <div class="inline-field">
              <a-radio-group 
                v-model:value="editUnitForm.unit_type"
                size="small"
              >
                <a-radio value="Facility">Facility</a-radio>
                <a-radio value="Home">Home</a-radio>
              </a-radio-group>
            </div>
            <div class="inline-field">
              <a-checkbox v-model:checked="editUnitForm.is_multi_person_room">
                SharedUnit
              </a-checkbox>
            </div>
            <div class="inline-field">
              <a-checkbox v-model:checked="editUnitForm.is_public_space">
                PublicSpace
              </a-checkbox>
            </div>
          </div>
          <div class="unit-field full-row">
            <label>Time Zone:</label>
            <a-select
              v-model:value="editUnitForm.timezone"
              placeholder="Select time zone"
              allow-clear
              show-search
              :filter-option="filterTimeZoneOption"
              style="width: 100%"
            >
              <a-select-option
                v-for="tz in usTimeZones"
                :key="tz.value"
                :value="tz.value"
              >
                {{ tz.label }}
              </a-select-option>
            </a-select>
          </div>
          <!-- Unit action buttons -->
          <div class="unit-field full-row unit-actions-row">
            <span class="unit-action-label">Unit:</span>
            <a-button 
              v-if="editingUnit"
              type="primary" 
              danger 
              @click="handleDeleteUnitWrapper"
              :disabled="!editingUnit"
              style="margin-left: 10px"
            >
              Delete
            </a-button>
            <a-button @click="resetEditUnitForm" style="margin-left: 10px">Cancel</a-button>
            <a-button type="primary" @click="handleSaveUnit" style="margin-left: 10px">Save</a-button>
          </div>
          </div>

          <!-- Room-Bed Tree Structure -->
          <div class="room-bed-section">
          <div class="tree-header">
            <span class="tree-title">Rooms & Beds</span>
            <div class="tree-header-actions">
              <a-button
                type="primary"
                size="small"
                @click="handleToggleAddRoom"
                :disabled="!editingUnit"
                :class="{ 'header-button-active': activeHeaderButton === 'room' }"
                title="Add Room"
              >
                Add Room
              </a-button>
              <a-button
                type="primary"
                size="small"
                @click="handleToggleAddBed"
                :disabled="!editingUnit"
                :class="{ 'header-button-active': activeHeaderButton === 'bed' }"
                title="Expand all rooms"
              >
                Add Bed
              </a-button>
              <a-button
                type="primary"
                size="small"
                @click="handleToggleAddDevice"
                :disabled="!editingUnit"
                :class="{ 'header-button-active': activeHeaderButton === 'device' }"
                title="Expand all rooms and show device container"
              >
                Add Device
              </a-button>
            </div>
          </div>
          <div class="tree-container">
            <div v-if="!editingUnit" class="tree-empty">
              <p>Please create or select a unit first</p>
            </div>
            <template v-else>
              <!-- Tree top actions: Add Bed and Dev - Show based on activeHeaderButton -->
              <div v-if="activeHeaderButton === 'bed' || activeHeaderButton === 'device'" class="tree-top-actions">
                <span v-if="activeHeaderButton === 'bed'" class="action-label">Add Bed to Unit</span>
                <span v-if="activeHeaderButton === 'device'" class="action-label">Add Device to Unit</span>
                <a-button
                  v-if="activeHeaderButton === 'bed'"
                  type="primary"
                  size="small"
                  @click="handleAddBedToFirstRoom"
                  :disabled="!editingUnit"
                  title="Add bed to unit's default room (unit_room)"
                  @mouseenter="bedIconHovered = true"
                  @mouseleave="bedIconHovered = false"
                >
                  Bed
                  <img 
                    :src="bedIconSrc"
                    class="bed-icon-in-button"
                    alt="Bed"
                  />
                </a-button>
                <a-button
                  v-if="activeHeaderButton === 'device'"
                  type="primary"
                  size="small"
                  @click="handleAddDeviceToUnitWrapper"
                  :disabled="!editingUnit"
                  title="Add device to unit"
                >
                  Device
                  <AppstoreAddOutlined />
                </a-button>
              </div>
              
              <div v-if="roomsWithBeds.length === 0 && !showAddRoomForm" class="tree-empty">
                <p>No rooms yet. You can add beds directly to the unit, or create a room first.</p>
              </div>
              <div v-else>
              <div class="tree-list">
              <!-- Add Room Form -->
              <div v-if="showAddRoomForm" class="tree-node add-form">
                <div class="node-content">
                  <a-input
                    v-model:value="newRoomName"
                    placeholder="Room name"
                    size="small"
                    style="width: 150px"
                    @pressEnter="handleAddRoom"
                    ref="roomNameInputRef"
                  />
                  <div class="node-actions">
                    <a-button type="primary" size="small" @click="handleAddRoom">OK</a-button>
                    <a-button size="small" @click="handleCancelAddRoom">Cancel</a-button>
                  </div>
                </div>
              </div>

              <!-- Room Nodes -->
              <div
                v-for="room in roomsWithBeds"
                :key="room.room_id"
                class="tree-node room-node"
                :class="{ 
                  'dev-container-active': devContainerTarget?.type === 'room' && devContainerTarget?.id === room.room_id
                }"
              >
                <div class="node-content">
                  <div class="node-left">
                  <span
                    class="expand-icon"
                    @click="toggleRoom(room.room_id)"
                      v-if="(room.beds && room.beds.length > 0) || getRoomDevices(room.room_id).length > 0"
                  >
                    {{ expandedRooms.has(room.room_id) ? '−' : '+' }}
                  </span>
                  <span class="expand-placeholder" v-else></span>
                  <a-input
                    v-if="editingRoomId === room.room_id"
                    v-model:value="editingRoomName"
                    size="small"
                    style="width: 150px"
                      @pressEnter="handleSaveRoomNameWrapper(room.room_id)"
                      @blur="handleSaveRoomNameWrapper(room.room_id)"
                    ref="roomInputRef"
                  />
                  <span v-else class="node-label" @dblclick="handleEditRoom(room)">
                    {{ room.room_name }}
                  </span>
                    <!-- Edit/Delete icons after room name -->
                  <EditOutlined
                    v-if="editingRoomId !== room.room_id"
                    class="action-icon inline-action"
                    @click="handleEditRoom(room)"
                  />
                  <DeleteOutlined
                    v-if="editingRoomId !== room.room_id"
                    class="action-icon delete-icon inline-action"
                      @click="handleDeleteRoomWrapper(room.room_id)"
                    />
                    <!-- Room icons: bed_icon and device_icon thumbnails after Edit/Delete -->
                    <div v-if="editingRoomId !== room.room_id" class="room-icons">
                      <!-- Bed icons -->
                      <div v-if="room.beds && room.beds.length > 0" class="room-icon-group">
                        <img 
                          v-for="bed in room.beds.slice(0, 3)"
                          :key="bed.bed_id"
                          :src="bedIconSvg"
                          class="room-icon-thumbnail"
                          :title="bed.bed_name"
                        />
                        <span v-if="room.beds.length > 3" class="room-icon-count">+{{ room.beds.length - 3 }}</span>
                      </div>
                      <!-- Device icons -->
                      <div v-if="getRoomDevices(room.room_id).length > 0" class="room-icon-group">
                        <div
                          v-for="device in getRoomDevices(room.room_id).slice(0, 3)"
                          :key="device.device_id"
                          class="device-thumbnail-small"
                          :class="{
                            'monitoring-enabled': device.monitoring_enabled,
                            'monitoring-disabled': !device.monitoring_enabled
                          }"
                          :title="device.device_name"
                        >
                          <img :src="getDeviceTypeIcon(device.device_type)" class="device-icon-svg" />
                          <div class="device-status-dot" :class="`status-${device.status}`"></div>
                        </div>
                        <span v-if="getRoomDevices(room.room_id).length > 3" class="room-icon-count">+{{ getRoomDevices(room.room_id).length - 3 }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="node-right">
                  <AppstoreAddOutlined
                    v-if="editingRoomId !== room.room_id && isDeviceMode"
                    class="action-icon inline-action add-device-icon"
                    @click="handleAddDeviceToRoom(room.room_id)"
                    title="Add device"
                  />
                    <div v-if="!isDeviceMode" class="node-actions">
                    <img 
                      :src="bedIconGreen"
                      class="action-icon inline-action add-bed-icon-room"
                        @click="handleAddBedDirectlyWrapper(room)"
                      :class="{ 'disabled': getAvailableBedLetters(room).length === 0 }"
                      title="Add bed"
                    />
                    </div>
                  </div>
                </div>

                <!-- Bed Nodes (children of Room) -->
                <div
                  v-if="expandedRooms.has(room.room_id) && room.beds && room.beds.length > 0"
                  class="tree-children"
                >
                  <!-- Bed Nodes -->
                  <div
                    v-for="bed in room.beds"
                    :key="bed.bed_id"
                    class="tree-node bed-node"
                    :class="{ 
                      'dev-container-active': devContainerTarget?.type === 'bed' && devContainerTarget?.id === bed.bed_id
                    }"
                  >
                    <div class="node-content">
                      <div class="node-left">
                        <span
                          class="expand-icon"
                          @click="toggleBedDevices(bed.bed_id)"
                          v-if="getBedDevices(bed.bed_id).length > 0"
                        >
                          {{ expandedBedDevices.has(bed.bed_id) ? '−' : '+' }}
                        </span>
                        <span class="expand-placeholder" v-else></span>
                      <a-input
                        v-if="editingBedId === bed.bed_id"
                        v-model:value="editingBedName"
                        size="small"
                        style="width: 150px"
                          @pressEnter="handleSaveBedNameWrapper(bed.bed_id)"
                          @blur="handleSaveBedNameWrapper(bed.bed_id)"
                        ref="bedInputRef"
                        placeholder="BedA-BedZ"
                      />
                        <span v-else class="node-label" @dblclick="handleEditBedWrapper(bed)">
                        {{ bed.bed_name }}
                      </span>
                        <!-- Edit/Delete icons after bed name -->
                      <EditOutlined
                        v-if="editingBedId !== bed.bed_id"
                        class="action-icon inline-action"
                          @click="handleEditBedWrapper(bed)"
                      />
                      <DeleteOutlined
                        v-if="editingBedId !== bed.bed_id"
                        class="action-icon delete-icon inline-action"
                          @click="handleDeleteBedWrapper(bed.bed_id)"
                        />
                        <!-- Device thumbnails when bed devices are not expanded (room is expanded but device list is collapsed) -->
                        <!-- Display after edit/del icons -->
                        <div 
                          v-if="editingBedId !== bed.bed_id && getBedDevices(bed.bed_id).length > 0 && expandedRooms.has(room.room_id) && !expandedBedDevices.has(bed.bed_id)"
                          class="bed-device-thumbnails"
                        >
                          <div
                            v-for="device in getBedDevices(bed.bed_id)"
                            :key="device.device_id"
                            class="device-thumbnail"
                            :class="{
                              'monitoring-enabled': device.monitoring_enabled,
                              'monitoring-disabled': !device.monitoring_enabled
                            }"
                            :title="device.device_name"
                          >
                            <img :src="getDeviceTypeIcon(device.device_type)" class="device-icon-svg-small" />
                            <div class="device-status-dot-small" :class="`status-${device.status}`"></div>
                          </div>
                        </div>
                      </div>
                      <div class="node-right">
                      <AppstoreAddOutlined
                        v-if="editingBedId !== bed.bed_id && isDeviceMode"
                        class="action-icon inline-action add-device-icon"
                        @click="handleAddDeviceToBed(bed.bed_id)"
                        title="Add device"
                      />
                      </div>
                    </div>
                    
                    <!-- Bed Bound Device Nodes (as Children of Bed) -->
                    <!-- Only show when bed devices are expanded -->
                    <div
                      v-if="expandedBedDevices.has(bed.bed_id) && getBedDevices(bed.bed_id).length > 0"
                      class="tree-children"
                    >
                      <div
                        v-for="device in getBedDevices(bed.bed_id)"
                        :key="device.device_id"
                        class="tree-node device-node"
                      >
                        <div class="node-content">
                          <span class="expand-placeholder"></span>
                          <!-- Always show expanded mode (no collapse functionality) -->
                          <div 
                            class="device-expanded-content"
                          >
                            <div
                              class="device-icon-wrapper"
                              :class="{
                                'monitoring-enabled': device.monitoring_enabled,
                                'monitoring-disabled': !device.monitoring_enabled
                              }"
                            >
                              <div class="device-icon-circle">
                                <img :src="getDeviceTypeIcon(device.device_type)" class="device-icon-svg" />
                              </div>
                              <div class="device-status-indicator" :class="`status-${device.status}`">
                                <CheckCircleOutlined v-if="device.status === 'online'" />
                                <span v-else-if="device.status === 'error'" class="error-dot"></span>
                                <CloseCircleOutlined v-else-if="device.status === 'offline'" />
                              </div>
                            </div>
                            <!-- Edit mode: Show input (reuse logic from DeviceList.vue) -->
                            <template v-if="editingDeviceId === device.device_id && editingField === 'device_name'">
                              <a-input
                                v-model:value="editingValue"
                                @blur="handleSaveEdit(device)"
                                @pressEnter="handleSaveEdit(device)"
                                @keydown.esc="handleCancelEdit"
                                style="width: 150px; margin-right: 8px;"
                                autofocus
                              />
                            </template>
                            <!-- Display mode: Show name and actions -->
                            <template v-else>
                              <span 
                                class="node-label"
                                @dblclick="handleStartEdit(device, 'device_name', device.device_name || '')"
                                style="cursor: pointer;"
                                title="Double click to edit"
                              >
                                {{ device.device_name }}
                              </span>
                            <EditOutlined 
                              class="action-icon inline-action"
                                @click="handleStartEdit(device, 'device_name', device.device_name || '')"
                                title="Edit device name"
                            />
                            <DeleteOutlined 
                              class="action-icon delete-icon inline-action"
                              @click="handleDeleteDevice(device)"
                                title="Unbind device"
                              />
                            </template>
                          </div>
                              </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Room Bound Device Nodes (as Children of Room, After Bed) -->
                <!-- Only show when room is expanded -->
                <div
                  v-if="expandedRooms.has(room.room_id) && getRoomDevices(room.room_id).length > 0"
                  class="tree-children"
                >
                  <div
                    v-for="device in getRoomDevices(room.room_id)"
                    :key="device.device_id"
                    class="tree-node device-node"
                  >
                    <div class="node-content">
                      <span class="expand-placeholder"></span>
                      <!-- Always show expanded mode (no collapse functionality) -->
                      <div 
                        class="device-expanded-content"
                      >
                        <div
                          class="device-icon-wrapper"
                          :class="{
                            'monitoring-enabled': device.monitoring_enabled,
                            'monitoring-disabled': !device.monitoring_enabled
                          }"
                        >
                          <div class="device-icon-circle">
                            <img :src="getDeviceTypeIcon(device.device_type)" class="device-icon-svg" />
                          </div>
                          <div class="device-status-indicator" :class="`status-${device.status}`">
                            <CheckCircleOutlined v-if="device.status === 'online'" />
                            <span v-else-if="device.status === 'error'" class="error-dot"></span>
                            <CloseCircleOutlined v-else-if="device.status === 'offline'" />
                          </div>
                        </div>
                        <!-- Edit mode: Show input (reuse logic from DeviceList.vue) -->
                        <template v-if="editingDeviceId === device.device_id && editingField === 'device_name'">
                          <a-input
                            v-model:value="editingValue"
                            @blur="handleSaveEdit(device)"
                            @pressEnter="handleSaveEdit(device)"
                            @keydown.esc="handleCancelEdit"
                            style="width: 150px; margin-right: 8px;"
                            autofocus
                          />
                        </template>
                        <!-- Display mode: Show name and actions -->
                        <template v-else>
                          <span 
                            class="node-label"
                            @dblclick="handleStartEdit(device, 'device_name', device.device_name || '')"
                            style="cursor: pointer;"
                            title="Double click to edit"
                          >
                            {{ device.device_name }}
                          </span>
                        <EditOutlined 
                          class="action-icon inline-action"
                            @click="handleStartEdit(device, 'device_name', device.device_name || '')"
                            title="Edit device name"
                        />
                        <DeleteOutlined 
                          class="action-icon delete-icon inline-action"
                          @click="handleDeleteDevice(device)"
                            title="Unbind device"
                          />
                        </template>
                      </div>
                          </div>
                  </div>
                </div>
              </div>
            </div>
              </div>
            </template>
        </div>
          </div>
        </div>
        
        <!-- Dev Container (Device List) - parallel to unit-edit-container -->
        <div v-if="isDeviceMode" class="device-container">
          <div class="device-list-wrapper">
            <a-table
              :columns="deviceColumns"
              :data-source="devContainerDevices"
              :pagination="false"
              :scroll="{ x: 'max-content', y: 400 }"
              size="small"
              :row-key="(record: Device) => record.device_id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'checkbox'">
                  <a-checkbox
                    :checked="isDeviceBound(record)"
                    :disabled="false"
                    @change="handleDeviceCheckboxChange($event, record)"
                  />
                </template>
                <template v-else-if="column.key === 'monitoring_enabled'">
                  {{ record.monitoring_enabled ? 'T' : 'F' }}
                </template>
                <template v-else-if="column.key === 'device_name'">
                  <span>
                    {{ record.device_name }}
                  </span>
                </template>
              </template>
            </a-table>
          </div>
        </div>
      </div>
    </a-modal>
    
    <!-- Device Selection Modal -->
    <a-modal
      v-model:open="showDeviceSelectModal"
      :title="selectedTarget?.type === 'unit' ? 'Select Devices for Unit' : selectedTarget?.type === 'room' ? 'Select Devices for Room' : 'Select Devices for Bed'"
      width="800px"
      @ok="handleConfirmDeviceSelection"
      @cancel="handleCancelDeviceSelection"
    >
      <a-table
        :columns="deviceSelectColumns"
        :data-source="devicesForSelection"
        :pagination="false"
        :scroll="{ y: 400 }"
        size="small"
        :row-key="(record: Device) => record.device_id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'checkbox'">
            <a-checkbox
              :checked="isDeviceBoundToTargetWrapper(record)"
              @change="handleDeviceSelectChange($event, record)"
            />
          </template>
          <template v-else-if="column.key === 'monitoring_enabled'">
            {{ record.monitoring_enabled ? 'T' : 'F' }}
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, AppstoreAddOutlined, HomeOutlined, ArrowLeftOutlined, BankOutlined } from '@ant-design/icons-vue'
import bedIconBlue from '@/assets/svg/Bed-blue.svg'
import bedIconGreen from '@/assets/svg/Bed-green.svg'
import bedIconSvg from '@/assets/svg/bed_icon.svg'
import sleepadSvg from '@/assets/svg/sleepad.svg'
import radarSvg from '@/assets/svg/radar.svg'
import type { Building, Unit, RoomWithBeds, Bed } from '@/api/units/model/unitModel'
import { getUnitsApi } from '@/api/units/unit'
import { useUserStore } from '@/store/modules/user'
// Note: tags_catalog table has been removed
import type { Device } from '@/api/devices/model/deviceModel'
import { getBranchesApi } from '@/api/admin/branch/branch'
import type { Branch } from '@/api/admin/branch/model/branchModel'
import { useBuilding } from './composables/useBuilding'
import { useUnit } from './composables/useUnit'
import { useRoom } from './composables/useRoom'
import { useBed } from './composables/useBed'
import { useDevice } from './composables/useDevice'

const userStore = useUserStore()
// Note: tags_catalog table has been removed, tagsStore is no longer available
const router = useRouter()

// Navigate to home page
// Go back
const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/monitoring/overview')
}

// Use composables
const buildingComposable = useBuilding()
const unitComposable = useUnit()
const roomComposable = useRoom()
const bedComposable = useBed()
const deviceComposable = useDevice()

// Extract state from composables
const {
  buildings,
  selectedFloor,
  selectedBranchTag,
  expandedBuildings,
  selectedBuilding,
  currentBuildingForGrid,
  createBuildingForm,
  fetchBuildings,
  handleToggleBuildingCard,
  handleSelectFloor,
  handleCreateBuilding,
  handleDeleteFloor,
  handleDeleteBuilding,
} = buildingComposable

// Wrapper for handleCreateBuilding that handles response and updates UI
const handleCreateBuildingWrapper = async () => {
  try {
    const createdBranchName = createBuildingForm.value.branch_name
    
    // Call the composable's handleCreateBuilding
    // It will handle the API call, show success message, reset form, and fetch buildings
    await handleCreateBuilding()
    
    // After successful creation, refresh buildings and branches lists
    await fetchBuildings()
    await fetchBranches()
    
    // 需求4&5: 新建后自动在下拉菜单显示，并保持Branch选中状态
    await nextTick()
    
    if (createdBranchName) {
      const newBranch = availableBranches.value.find(b => b.branch_name === createdBranchName)
      if (newBranch) {
        // 保持Branch选中状态，这样新创建的Building会在过滤后的列表中可见
        selectedBranchId.value = newBranch.branch_id
        createBuildingForm.value.branch_id = newBranch.branch_id
        createBuildingForm.value.branch_name = newBranch.branch_name
      }
    }
  } catch (error) {
    // Error is already handled in handleCreateBuilding
    // Just re-throw to prevent further execution
    throw error
  }
}

// Wrapper for handleDeleteBuilding that clears units
const handleDeleteBuildingWrapper = async (building: Building) => {
  await handleDeleteBuilding(building)
  if (selectedBuilding.value?.building_id === building.building_id) {
    units.value = []
  }
  if (expandedBuildings.value.has(building.building_id || '')) {
    units.value = []
  }
}

const {
  units,
  allUnits,
  showCreateUnitModal,
  showEditUnitModal,
  editingUnit,
  roomsWithBeds,
  createUnitForm,
  editUnitForm,
  fetchAllUnits,
  fetchRoomsWithBeds,
  ensureUnitRoom,
  handleCellClick: handleCellClickBase,
  handleCreateUnit: handleCreateUnitBase,
  resetCreateUnitForm,
  resetEditUnitForm,
  handleSaveUnit: handleSaveUnitBase,
  handleDeleteUnit,
} = unitComposable

const {
  showAddRoomForm,
  newRoomName,
  expandedRooms,
  editingRoomId,
  editingRoomName,
  roomNameInputRef,
  roomInputRef,
  toggleRoom,
  handleToggleAddRoom: handleToggleAddRoomBase,
  handleCancelAddRoom: handleCancelAddRoomBase,
  handleAddRoom: handleAddRoomBase,
  handleEditRoom,
  handleSaveRoomName,
  handleDeleteRoom,
} = roomComposable

const {
  editingBedId,
  editingBedName,
  bedInputRef,
  getAvailableBedLetters,
  handleAddBedDirectly,
  handleAddBedToFirstRoom: handleAddBedToFirstRoomBase,
  handleToggleAddBed: handleToggleAddBedBase,
  handleEditBed,
  handleSaveBedName,
  handleDeleteBed,
} = bedComposable

const {
  isDeviceMode,
  showDeviceSelectModal,
  selectedTarget,
  devicesForSelection,
  devContainerTarget,
  deviceColumns,
  deviceSelectColumns,
  devContainerDevices,
  isDeviceBound,
  getRoomDevices,
  getBedDevices,
  getUnitDevices,
  openDeviceSelection,
  handleToggleAddDevice: handleToggleAddDeviceBase,
  handleAddDeviceToRoom: handleAddDeviceToRoomBase,
  handleAddDeviceToBed: handleAddDeviceToBedBase,
  handleStartEdit,
  handleSaveEdit,
  handleCancelEdit,
  editingDeviceId,
  editingField,
  editingValue,
  handleDeviceCheckboxChange: handleDeviceCheckboxChangeBase,
  handleDeleteDevice,
  isDeviceBoundToTarget,
  handleDeviceSelectChange: handleDeviceSelectChangeBase,
  handleConfirmDeviceSelection: handleConfirmDeviceSelectionBase,
  handleCancelDeviceSelection,
} = deviceComposable

// Navigate to view mode
const goToUnitView = () => {
  router.push('/unitview')
}

// Local state (not in composables)
const activeHeaderButton = ref<'room' | 'bed' | 'device' | null>(null)
const bedIconHovered = ref(false)
const bedIconSrc = computed(() => bedIconHovered.value ? bedIconGreen : bedIconBlue)
// Track expanded bed devices (for +/- toggle)
const expandedBedDevices = ref<Set<string>>(new Set())

// Toggle bed devices expansion
const toggleBedDevices = (bedId: string) => {
  if (expandedBedDevices.value.has(bedId)) {
    expandedBedDevices.value.delete(bedId)
  } else {
    expandedBedDevices.value.add(bedId)
  }
}

// Fetch branches from branches table
const availableBranches = ref<Array<Branch & { buildingCount: number }>>([])
const selectedBranchId = ref<string | undefined>(undefined)

// Fetch branches from API
const fetchBranches = async () => {
  try {
    const result = await getBranchesApi()
    const branches = result.items || []
    
    // Calculate building count for each branch
    const branchMap = new Map<string, number>()
    buildings.value.forEach(building => {
      if (building.branch_id) {
        branchMap.set(building.branch_id, (branchMap.get(building.branch_id) || 0) + 1)
      }
    })
    
    availableBranches.value = branches.map(branch => ({
      ...branch,
      buildingCount: branchMap.get(branch.branch_id) || 0,
    }))
  } catch (error: any) {
    console.error('Failed to fetch branches:', error)
    message.error('Failed to fetch branches: ' + (error.message || 'Unknown error'))
    availableBranches.value = []
  }
}

// Branch select options for dropdown (AutoComplete format)
const branchSelectOptions = computed(() => {
  return availableBranches.value.map((branch: Branch & { buildingCount: number }) => ({
    value: branch.branch_name,
    label: branch.branch_name,
  }))
})

// Filter function for branch select
const filterBranchOption = (input: string, option: any) => {
  const searchText = input.toLowerCase()
  const label = option.label?.toLowerCase() || ''
  return label.includes(searchText)
}

// Handle branch auto-complete select (existing branch)
const handleBranchAutoCompleteSelect = (value: string) => {
  const branch = availableBranches.value.find(b => b.branch_name === value)
  console.log('[Branch Select] value:', value, 'found branch:', branch)
  console.log('[Branch Select] all buildings:', buildings.value.length)
  
  if (branch) {
    createBuildingForm.value.branch_id = branch.branch_id
    createBuildingForm.value.branch_name = branch.branch_name
    selectedBranchId.value = branch.branch_id
    
    // 选择Branch时，自动展开该Branch下所有Buildings（显示Floors）
    const branchBuildings = buildings.value.filter(b => b.branch_id === branch.branch_id)
    console.log('[Branch Select] filtered buildings for branch_id', branch.branch_id, ':', branchBuildings.length)
    console.log('[Branch Select] buildings detail:', branchBuildings.map(b => ({ id: b.building_id, name: b.building_name, branch_id: b.branch_id })))
    
    branchBuildings.forEach(building => {
      if (building.building_id) {
        expandedBuildings.value.add(building.building_id)
      }
    })
  }
}

// Handle branch auto-complete change (user input new branch)
const handleBranchAutoCompleteChange = (value: string | undefined) => {
  if (!value) {
    createBuildingForm.value.branch_id = undefined
    createBuildingForm.value.branch_name = undefined
    selectedBranchId.value = undefined
  } else {
    // 用户输入新Branch名称
    createBuildingForm.value.branch_name = value
    // 不设置branch_id，让后端创建新Branch
    createBuildingForm.value.branch_id = undefined
    selectedBranchId.value = undefined
  }
}

// Building Options: Extract unique building names from buildings with building_id
const buildingOptions = computed(() => {
  // Extract unique buildings (with building_id and building_name)
  const buildingMap = new Map<string, { building_id?: string; building_name: string }>()
  buildings.value.forEach(building => {
    const buildingName = building.building_name || ''
    if (buildingName && buildingName !== '-') {
      if (!buildingMap.has(buildingName)) {
        buildingMap.set(buildingName, {
          building_id: building.building_id,
          building_name: buildingName,
        })
      }
    }
  })
  const buildingNames: Array<{ value: string; label: string; building_id?: string }> = []
  buildingMap.forEach((building, buildingName) => {
    buildingNames.push({ 
      value: buildingName, 
      label: buildingName,
      building_id: building.building_id,
    })
  })
  return buildingNames.sort((a, b) => a.label.localeCompare(b.label))
})

// Handle branch selection from dropdown
const handleBranchSelectChange = (branchId: string | undefined) => {
  if (branchId) {
    const branch = availableBranches.value.find((b: Branch & { buildingCount: number }) => b.branch_id === branchId)
    if (branch) {
      createBuildingForm.value.branch_id = branch.branch_id
      createBuildingForm.value.branch_name = branch.branch_name
      selectedBranchId.value = branch.branch_id
      
      // 需求1: 选择Branch时，展开所有该Branch的Buildings
      const branchBuildings = buildings.value.filter(b => b.branch_id === branchId)
      branchBuildings.forEach(building => {
        if (building.building_id) {
          expandedBuildings.value.add(building.building_id)
        }
      })
    }
  } else {
    // Clear selection
    createBuildingForm.value.branch_id = undefined
    createBuildingForm.value.branch_name = undefined
    selectedBranchId.value = undefined
    // 清除所有展开状态
    expandedBuildings.value.clear()
  }
}

// Handle branch click from branch container
const handleBranchContainerClick = (branch: Branch & { buildingCount: number }) => {
  if (selectedBranchId.value === branch.branch_id) {
    // Deselect if already selected - 收起所有Buildings
    selectedBranchId.value = undefined
    createBuildingForm.value.branch_id = undefined
    createBuildingForm.value.branch_name = undefined
    
    // 收起该Branch下的所有Buildings
    const branchBuildings = buildings.value.filter(b => b.branch_id === branch.branch_id)
    branchBuildings.forEach(building => {
      if (building.building_id) {
        expandedBuildings.value.delete(building.building_id)
      }
    })
  } else {
    // Select branch - 展开所有Buildings
    selectedBranchId.value = branch.branch_id
    createBuildingForm.value.branch_id = branch.branch_id
    createBuildingForm.value.branch_name = branch.branch_name
    
    // 展开该Branch下的所有Buildings（显示Floors）
    const branchBuildings = buildings.value.filter(b => b.branch_id === branch.branch_id)
    branchBuildings.forEach(building => {
      if (building.building_id) {
        expandedBuildings.value.add(building.building_id)
      }
    })
  }
}

// Handle building selection from auto-complete
const handleBuildingSelect = (value: string) => {
  // Find the selected building option to get building_id
  const selectedBuilding = buildingOptions.value.find(opt => opt.value === value)
  if (selectedBuilding) {
    createBuildingForm.value.building_id = selectedBuilding.building_id
    createBuildingForm.value.building_name = selectedBuilding.value
  } else {
    // User typed a new building name (not selected from options)
    createBuildingForm.value.building_id = undefined
    createBuildingForm.value.building_name = value
  }
}


// Timezone list: Display user-friendly names, store IANA identifiers
// 前端显示用户友好的名称，但存储和传递 IANA 标识符（自动处理夏令时）
const usTimeZones = [
  // Asia timezones
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST, UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST, UTC+9)' },
  // US timezones - Display IANA identifier with timezone info
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT, UTC-8/-7)' },
  { value: 'America/Denver', label: 'America/Denver (MST/MDT, UTC-7/-6)' },
  { value: 'America/Phoenix', label: 'America/Phoenix (MST, UTC-7, No DST)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST/CDT, UTC-6/-5)' },
  { value: 'America/New_York', label: 'America/New_York (EST/EDT, UTC-5/-4)' },
  { value: 'America/Anchorage', label: 'America/Anchorage (AKST/AKDT, UTC-9/-8)' },
  { value: 'America/Adak', label: 'America/Adak (HAST/HADT, UTC-10/-9)' },
  { value: 'Pacific/Honolulu', label: 'Pacific/Honolulu (HST, UTC-10, No DST)' },
  { value: 'Pacific/Pago_Pago', label: 'Pacific/Pago_Pago (SST, UTC-11, No DST)' },
]

// Timezone selector filter function
const filterTimeZoneOption = (input: string, option: any) => {
  const searchText = input.toLowerCase()
  const value = option.value?.toLowerCase() || ''
  const label = option.children?.toLowerCase() || ''
  return value.includes(searchText) || label.includes(searchText)
}

// Get distinct floors for a building from units
const getBuildingFloors = (building: Building | null): number[] => {
  if (!building) return []
  
  const buildingUnits = units.value.filter((unit) => {
    return (
      unit.building === building.building_name &&
      unit.branch_name === (building.branch_name ?? '')
    )
  })
  
  // Extract unique floor numbers from units
  const floorSet = new Set<number>()
  buildingUnits.forEach((unit) => {
    const floorStr = unit.floor || '1F'
    const floorNum = parseInt(floorStr.replace(/[^0-9]/g, '')) || 1
    floorSet.add(floorNum)
  })
  
  // Sort and return
  return Array.from(floorSet).sort((a, b) => a - b)
}

// Unit grid calculation - group by floor, sort by Floor and UnitNumber numerically
// Display all units belonging to the selected building, with floor dividers
const unitGrid = computed(() => {
  const building = currentBuildingForGrid.value

  if (!building) {
    return []
  }

  // All units have branch_name, building, floor (no null values)
  // Filter: match building and branch_name (show all floors for the building)
  // Exclude placeholder units (unit_name starting with __BUILDING__)
  const filteredUnits = units.value.filter((unit) => {
    // Exclude placeholder units used for building representation
    if (unit.unit_name && unit.unit_name.startsWith('__BUILDING__')) {
      return false
    }
    return (
      unit.building === building.building_name &&
      unit.branch_name === building.branch_name
    )
  })

  // Group units by floor
  const unitsByFloor = new Map<string, typeof filteredUnits>()
  filteredUnits.forEach((unit) => {
    // Normalize floor: ensure it has "F" suffix (e.g., "1" -> "1F", "1F" -> "1F")
    const normalizedFloor = unit.floor 
      ? (unit.floor.match(/^\d+$/) ? `${unit.floor}F` : unit.floor)
      : '1F'
    
    if (!unitsByFloor.has(normalizedFloor)) {
      unitsByFloor.set(normalizedFloor, [])
    }
    unitsByFloor.get(normalizedFloor)!.push(unit)
  })

  // Get all possible floors for this building (from existing units or from getBuildingFloors)
  // If building has no units, show at least floor 1F
  const allFloors = new Set<string>()
  
  // Add floors from existing units
  unitsByFloor.forEach((_, floor) => {
    allFloors.add(floor)
  })
  
  // If no units exist, add at least 1F
  if (allFloors.size === 0) {
    allFloors.add('1F')
  }
  
  // Sort floors by number (extract number from "1F", "2F", etc.)
  const sortedFloors = Array.from(allFloors).sort((a, b) => {
    const floorNumA = parseInt(a.replace(/[^0-9]/g, '')) || 0
    const floorNumB = parseInt(b.replace(/[^0-9]/g, '')) || 0
    return floorNumA - floorNumB
  })

  // Build result array with floor dividers, units, and add buttons
  const result: Array<{ type: 'floor-divider' | 'unit' | 'add-button', floor?: string, unit?: typeof filteredUnits[0] }> = []
  
  sortedFloors.forEach((floor) => {
    // Add floor divider
    result.push({ type: 'floor-divider', floor })
    
    // Get units for this floor and sort by unit_number
    const unitsInFloor = unitsByFloor.get(floor) || []
    const sortedUnits = [...unitsInFloor].sort((a, b) => {
      // Sort by unit_number: try numeric sort first, fallback to string sort
      const numA = parseInt(a.unit_number)
      const numB = parseInt(b.unit_number)
      
      // If both are valid numbers, sort numerically
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB
      }
      
      // Otherwise, sort alphabetically
      return a.unit_number.localeCompare(b.unit_number, undefined, { numeric: true, sensitivity: 'base' })
    })
    
    // Add units for this floor
    sortedUnits.forEach((unit) => {
      result.push({ type: 'unit', unit })
    })
    
    // Add "Add Unit" button at the end of each floor
    result.push({ type: 'add-button', floor })
  })

  return result
})

// allUnits is now from composable

// Fetch functions are now in composables, but we need wrapper functions for some cases

// Get Unit list - fetch all units for the selected building (all floors)
const fetchUnits = async () => {
  try {
    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      message.error('Unable to get tenant ID')
      units.value = []
      return
    }

    // According to DB schema (05_units.sql):
    // - building: VARCHAR(50) NOT NULL DEFAULT '-' (always has value)
    // - floor: VARCHAR(50) NOT NULL DEFAULT '1F' (always has value)
    // - branch_name: VARCHAR(255) (can be NULL)
    // - Unique constraint: (tenant_id, branch_name, building, floor, unit_name)

    // All units have branch_name, building, floor (no null values)
    const building = currentBuildingForGrid.value
  
    if (!building) {
      units.value = []
      return
    }

    // Build query parameters - fetch all units for the building (all floors)
    // When building is selected, must pass both branch_name and building:
    // - If branch_name is null/undefined, pass empty string '' (backend will query branch_name IS NULL)
    // - If branch_name has value, pass the value (backend will query branch_name = X)
    const queryParams: any = {
      tenant_id: tenantId,
      building: building.building_name || undefined, // Only pass if building_name exists
      // Always pass branch_name: null/undefined → '' (empty string), otherwise pass the value
      branch_name: building.branch_name != null && building.branch_name !== '' ? building.branch_name : '',
      // Don't filter by floor - get all floors for the building
    }
    
    console.log('[UnitList] Fetching units with params:', queryParams)
    const result = await getUnitsApi(queryParams)
    console.log('[UnitList] Fetched units:', result.items.length, result.items)
    units.value = result.items
  } catch (error: any) {
    console.error('[Fetch Units] Error:', error)
    message.error('Failed to fetch units: ' + (error.message || 'Unknown error'))
    units.value = []
  }
}

// Wrapper functions for building handlers that need to call fetchUnits
const handleToggleBuildingCardWrapper = (building: Building) => {
  handleToggleBuildingCard(building)
    units.value = []
  fetchUnits()
}



// Wrapper for handleSelectFloor that calls fetchUnits
const handleSelectFloorWrapper = async (building: Building, floor: string) => {
  await handleSelectFloor(building, floor)
  await fetchUnits()
}

// Get Building display name - simple format: branch_name-building_name
// When branch_name is null/undefined, use empty string (keep the '-' separator)
// Filter out buildings where both branch_name and building_name are empty
const buildingsWithDisplayName = computed(() => {
  let buildingList = buildings.value
    .filter((building) => {
      // Filter out buildings where both branch_name and building_name are empty
      // Per business rule: branch_name or building_name must have at least one non-empty value
      const tagName = building.branch_name ?? ''
      const buildingName = building.building_name || ''
      return !(tagName === '' && buildingName === '')
    })
  
  console.log('[buildingsWithDisplayName] total buildings after filter:', buildingList.length)
  console.log('[buildingsWithDisplayName] selectedBranchId:', selectedBranchId.value)
  
  // Filter by selected branch if one is selected
  if (selectedBranchId.value) {
    buildingList = buildingList.filter(building => building.branch_id === selectedBranchId.value)
    console.log('[buildingsWithDisplayName] after branch filter:', buildingList.length)
    console.log('[buildingsWithDisplayName] filtered buildings:', buildingList.map(b => ({ id: b.building_id, name: b.building_name, branch_id: b.branch_id })))
  }
  
  const result = buildingList.map((building) => {
    // When branch_name is null/undefined, use empty string (keep the '-' separator)
    // Display format: branch_name-building_name (always show '-' separator)
    const tagName = building.branch_name ?? ''
    const buildingName = building.building_name || '-'
    
    // Display name: always show branch_name-building_name format (keep '-' separator even if branch_name is empty)
    const displayName = `${tagName}-${buildingName}`
    
    return {
      ...building,
      tag_name: tagName,
      displayName,
    }
  })
  
  // Building 已改为实体，不再从 units 表虚拟获取
  // 所有 buildings 都从 buildings 表获取，不再需要虚拟 building 逻辑
  
  return result
})

// Wrapper for handleDeleteFloor that needs to clear units
const handleDeleteFloorWrapper = async (building: Building, floorNum: number) => {
  await handleDeleteFloor(building, floorNum)
  if (selectedBuilding.value?.building_id === building.building_id && selectedFloor.value === `${floorNum}F`) {
    units.value = []
  }
}

// handleDeleteBuilding is now in composable, using wrapper above

// Click grid cell
// Wrapper for handleCellClick that uses fetchRoomsWithBedsWrapper
const handleCellClick = async (unit: Unit | null, _index: number) => {
  // Reset header button state and device mode when selecting a different unit
  activeHeaderButton.value = null
  isDeviceMode.value = false
  devContainerTarget.value = null
  expandedRooms.value.clear()
  showAddRoomForm.value = false
  await handleCellClickBase(unit, _index, fetchRoomsWithBedsWrapper)
}

// Handle add unit button for a specific floor
const handleAddUnitForFloor = async (floor: string) => {
  console.log('[UnitList] handleAddUnitForFloor called with floor:', floor)
  
  // Set selectedFloor to the floor value
  selectedFloor.value = floor
  
  // Ensure selectedBuilding is set (use currentBuildingForGrid if available)
  if (!selectedBuilding.value && currentBuildingForGrid.value) {
    selectedBuilding.value = currentBuildingForGrid.value
  }
  
  // Check if building is selected
  if (!selectedBuilding.value) {
    message.error('Please select a building first')
    return
  }
  
  // Extract floor number from floor string (e.g., "1F" -> 1)
  let floorNum = 1
  if (floor) {
    const floorMatch = floor.match(/\d+/)
    if (floorMatch) {
      floorNum = parseInt(floorMatch[0]) || 1
    }
  }
  
  console.log('[UnitList] Opening edit unit modal for new unit, selectedBuilding:', selectedBuilding.value, 'selectedFloor:', selectedFloor.value, 'floorNum:', floorNum)
  
  // Reset header button state and device mode
  activeHeaderButton.value = null
  isDeviceMode.value = false
  devContainerTarget.value = null
  expandedRooms.value.clear()
  showAddRoomForm.value = false
  
  // Use the same logic as handleCellClick(null, -1) - open edit modal with null unit
  editingUnit.value = null
  roomsWithBeds.value = []
  editUnitForm.value = {
    unit_name: '',
    unit_number: '', // Deprecated field, kept for backward compatibility
    unit_type: 'Facility',
    floor: floorNum as any, // Use the floor number from the button (editUnitForm expects number for input-number)
    is_public_space: false,
    is_multi_person_room: false,
    timezone: 'America/Denver', // Default to Mountain Time (with DST, UTC-7/-6)
  }
  showEditUnitModal.value = true
  await nextTick()
  
  console.log('[UnitList] showEditUnitModal.value:', showEditUnitModal.value)
}

// Wrapper for handleCreateUnit that calls fetchUnits after creation
const handleCreateUnit = async () => {
  try {
    // Reset header button state and device mode when creating a new unit
    activeHeaderButton.value = null
    isDeviceMode.value = false
    devContainerTarget.value = null
    expandedRooms.value.clear()
    showAddRoomForm.value = false
    
    if (!selectedBuilding.value || !selectedFloor.value) {
      message.error('Please select a building and floor first')
      return
    }

    // 自动使用 selectedBuilding 和 selectedFloor（不再从表单获取）
    // Note: 以下逻辑仅用于设置 currentBuildingForGrid（UI 显示目的）
    // 实际创建 unit 时，handleCreateUnitBase 传递的是 selectedBuilding.building_name（可能为 undefined）
    const finalBuilding = selectedBuilding.value?.building_name  // 可能为 undefined（不再使用 '-' 作为默认值）
    const finalFloor = selectedFloor.value || '1F'
    const finalBranchName = selectedBuilding.value?.branch_name  // 可能为 undefined（不再使用 '-' 作为默认值）
    
    // 1. Update selectedBranchTag (保持 undefined，不再使用 '-' 作为默认值)
    selectedBranchTag.value = finalBranchName || ''
    
    // 2. Update currentBuildingForGrid to match the building that will be used for creation
    const branchNameForBuilding = finalBranchName || ''
    
    if (!finalBuilding) {
      // Building 为 undefined/null - 使用 branch_name 创建临时 building 对象（仅用于 UI 显示）
      const virtualBuilding = buildings.value.find(b => 
        !b.building_name && b.branch_name === branchNameForBuilding
      ) || {
        building_id: `na-building-${branchNameForBuilding || 'none'}`,
        building_name: undefined as string | undefined,
        branch_name: branchNameForBuilding || undefined,
      } as Building
      
      currentBuildingForGrid.value = virtualBuilding
    } else {
      // For real building, find building with matching building_name and branch_name
      const matchingBuilding = buildings.value.find(b => 
        b.building_name === finalBuilding && b.branch_name === branchNameForBuilding
      )
      
      if (matchingBuilding) {
        currentBuildingForGrid.value = matchingBuilding
        // Also update selectedBuilding if it doesn't match
        if (!selectedBuilding.value || selectedBuilding.value.building_id !== matchingBuilding.building_id) {
          selectedBuilding.value = matchingBuilding
        }
      } else if (selectedBuilding.value && 
                 selectedBuilding.value.building_name === finalBuilding &&
                 selectedBuilding.value.branch_name === branchNameForBuilding) {
        currentBuildingForGrid.value = selectedBuilding.value
      } else {
        // Building not found in list - create temporary building object for querying
        currentBuildingForGrid.value = {
          building_id: `temp-${finalBuilding}-${branchNameForBuilding || 'none'}`,
          building_name: finalBuilding,
          branch_name: branchNameForBuilding || undefined,
        } as Building
      }
    }
    
    // 3. Update selectedFloor to match the floor that will be used for creation
    selectedFloor.value = finalFloor
    
    const createdUnit = await handleCreateUnitBase(selectedBuilding.value, selectedFloor.value)
    
    if (!createdUnit) {
      return
    }

    // Verify created unit has correct values
    const createdBranchName = createdUnit.branch_name || '-'
    if (createdUnit.building !== finalBuilding || createdUnit.floor !== finalFloor || createdBranchName !== finalBranchName) {
      console.error('[Create Unit] Mismatch!', {
        created: { building: createdUnit.building, floor: createdUnit.floor, branch_name: createdBranchName },
        expected: { building: finalBuilding, floor: finalFloor, branch_name: finalBranchName },
        currentBuildingForGrid: currentBuildingForGrid.value,
      })
      message.warning('Unit created but with different values. Please refresh.')
    }
    
    // Ensure currentBuildingForGrid has correct branch_name before fetching
    if (currentBuildingForGrid.value) {
      currentBuildingForGrid.value.branch_name = finalBranchName
    }
    
    // Wait a bit to ensure backend has processed the creation
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Refresh units list - now query params should match creation params
    await fetchUnits()
    
    // If unit was created successfully, try to select it
    if (createdUnit) {
      // Find the created unit in the refreshed list
      const foundUnit = units.value.find(u => 
        u.unit_id === createdUnit.unit_id ||
        (u.unit_number === createdUnit.unit_number && u.unit_name === createdUnit.unit_name)
      )
      if (foundUnit) {
        await handleCellClick(foundUnit, -1)
    } else {
        console.warn('[Create Unit] Created unit not found in list:', createdUnit)
      }
    }
  } catch (error: any) {
    console.error('Create unit wrapper error:', error)
    // Error message already shown in handleCreateUnitBase
  }
}

// Wrapper for fetchRoomsWithBeds with sorting
const fetchRoomsWithBedsWrapper = async (unitId: string) => {
  await fetchRoomsWithBeds(unitId)
  // Sort: Room with RoomName = UnitName placed first
    const unitName = editingUnit.value?.unit_name || ''
    if (unitName) {
      roomsWithBeds.value.sort((a, b) => {
        if (a.room_name === unitName && b.room_name !== unitName) return -1
        if (a.room_name !== unitName && b.room_name === unitName) return 1
        return 0
      })
  }
}

// 获取 Edit Unit 标题
const getEditUnitTitle = () => {
  if (editingUnit.value) {
    const unitName = editUnitForm.value.unit_name || editingUnit.value.unit_name || ''
    if (unitName) {
      return `Edit Unit:  ${unitName}`
    }
  }
  return 'Edit Unit'
}

// resetEditUnitForm is now in composable, no wrapper needed

// Get device type icon (returns SVG path)
const getDeviceTypeIcon = (deviceType: string | undefined): string => {
  if (!deviceType) {
    return radarSvg // Default to radar when device_type is undefined
  }
  const iconMap: Record<string, string> = {
    'Radar': radarSvg,
    'Sleepad': sleepadSvg,
    'SleepPad': sleepadSvg,
  }
  return iconMap[deviceType] || radarSvg
}

// Wrapper for getUnitDevices that uses composable function
const getUnitDevicesWrapper = (unitId: string): Device[] => {
  return getUnitDevices(unitId, roomsWithBeds.value)
}

// 获取已绑定到 Unit 的 Caregiver（占位符函数，待 API 实现）
const getUnitCaregivers = async (_unitId: string): Promise<any[]> => {
  // TODO: 实现获取绑定到 Unit 的 Caregiver 的 API 调用
  // 示例：
  // return await getUnitCaregiversApi(unitId)
  
  // 当前返回空数组，表示没有绑定的 Caregiver
  return []
}

// 获取已绑定到 Unit 的 Residents（占位符函数，待 API 实现）
const getUnitResidents = async (_unitId: string): Promise<any[]> => {
  // TODO: 实现获取绑定到 Unit 的 Residents 的 API 调用
  // 示例：
  // return await getUnitResidentsApi(unitId)
  
  // 当前返回空数组，表示没有绑定的 Residents
  return []
}

// Dev 容器显示的设备列表（显示所有可用设备，包括未绑定的）
// Functions are now in composables

// Wrapper functions that use composables
const handleDeviceCheckboxChange = async (event: any, device: Device) => {
  await handleDeviceCheckboxChangeBase(event, device, devContainerTarget, roomsWithBeds.value, allUnits.value, ensureUnitRoom)
}

// Device drag handlers are now in composables

// 处理设备放置
// Note: Device cannot bind directly to Unit, must bind to Room or Bed

// Wrapper functions for toggle handlers
const handleToggleAddBed = async () => {
  await handleToggleAddBedBase(editingUnit.value, ensureUnitRoom, roomsWithBeds.value, expandedRooms, activeHeaderButton, showAddRoomForm, isDeviceMode, devContainerTarget)
}

const handleToggleAddDevice = async () => {
  await handleToggleAddDeviceBase(editingUnit.value, ensureUnitRoom, roomsWithBeds.value, expandedRooms, activeHeaderButton, showAddRoomForm)
}


// Wrapper for handleSaveUnit that calls fetchUnits and handleCellClick
const handleSaveUnit = async () => {
  const newUnit = await handleSaveUnitBase(selectedBuilding.value, selectedFloor.value)
  if (newUnit) {
      await fetchUnits()
      await handleCellClick(newUnit, -1)
    } else {
      await fetchUnits()
  }
}

// Wrapper for handleDeleteUnit that checks dependencies and calls fetchUnits
const handleDeleteUnitWrapper = async () => {
  if (!editingUnit.value) {
    message.error('No unit selected')
    return
  }

  try {
    // Check dependencies
    const hasRooms = roomsWithBeds.value.length > 0
    const bedCount = roomsWithBeds.value.reduce((total, room) => total + (room.beds?.length || 0), 0)
    const hasBeds = bedCount > 0
    const unitDevices = getUnitDevicesWrapper(editingUnit.value.unit_id)
    const hasDevices = unitDevices.length > 0
    const unitCaregivers = await getUnitCaregivers(editingUnit.value.unit_id)
    const hasCaregivers = unitCaregivers.length > 0
    const unitResidents = await getUnitResidents(editingUnit.value.unit_id)
    const hasResidents = unitResidents.length > 0
    
    if (hasRooms || hasBeds || hasDevices || hasCaregivers || hasResidents) {
      const errors: string[] = []
      if (hasRooms) errors.push(`${roomsWithBeds.value.length} room${roomsWithBeds.value.length > 1 ? 's' : ''}`)
      if (hasBeds) errors.push(`${bedCount} bed${bedCount > 1 ? 's' : ''}`)
      if (hasDevices) errors.push(`${unitDevices.length} device${unitDevices.length > 1 ? 's' : ''}`)
      if (hasCaregivers) errors.push(`${unitCaregivers.length} caregiver${unitCaregivers.length > 1 ? 's' : ''}`)
      if (hasResidents) errors.push(`${unitResidents.length} resident${unitResidents.length > 1 ? 's' : ''}`)
      
      message.error(`Cannot delete unit. The unit still contains: ${errors.join(', ')}. Please delete all associated items first.`)
      return
    }

    await handleDeleteUnit()
    await fetchUnits()
  } catch (error: any) {
    if (error.message !== 'User cancelled') {
      message.error('Failed to delete unit: ' + (error.message || 'Unknown error'))
    }
  }
}

// Wrapper functions for room handlers
const handleToggleAddRoom = () => {
  handleToggleAddRoomBase(activeHeaderButton, isDeviceMode, devContainerTarget, expandedRooms)
}

const handleCancelAddRoom = () => {
  handleCancelAddRoomBase(activeHeaderButton)
}

const handleAddRoom = async () => {
  await handleAddRoomBase(editingUnit.value, fetchRoomsWithBedsWrapper, activeHeaderButton)
}

// Functions are now in composables

// Wrapper functions for bed handlers
const handleAddBedDirectlyWrapper = async (room: RoomWithBeds) => {
  await handleAddBedDirectly(room, editingUnit.value, expandedRooms, fetchRoomsWithBedsWrapper)
}

const handleAddBedToFirstRoom = async () => {
  await handleAddBedToFirstRoomBase(editingUnit.value, ensureUnitRoom, expandedRooms, fetchRoomsWithBedsWrapper)
}

// Wrapper functions for device handlers
const isDeviceBoundToTargetWrapper = (device: Device): boolean => {
  return isDeviceBoundToTarget(device, selectedTarget.value, allUnits.value, roomsWithBeds.value)
}

const handleDeviceSelectChange = async (event: any, device: Device) => {
  await handleDeviceSelectChangeBase(event, device, selectedTarget.value, roomsWithBeds.value, allUnits.value, ensureUnitRoom)
}

const handleConfirmDeviceSelection = () => {
  handleConfirmDeviceSelectionBase(editingUnit.value, fetchRoomsWithBedsWrapper)
}

// Wrapper functions for device add handlers
const handleAddDeviceToRoom = async (roomId: string) => {
  await handleAddDeviceToRoomBase(roomId, roomsWithBeds.value, allUnits.value, ensureUnitRoom, expandedRooms)
}

const handleAddDeviceToBed = async (bedId: string) => {
  await handleAddDeviceToBedBase(bedId, roomsWithBeds.value, allUnits.value, ensureUnitRoom, expandedRooms)
}

// Add device to unit (from "Add Bed/Dev to Unit" button)
const handleAddDeviceToUnitWrapper = async () => {
  if (!editingUnit.value) {
    message.error('Please select a unit first')
    return
  }
  // Ensure unit_room exists before opening device selection
  const unitRoom = await ensureUnitRoom(editingUnit.value)
  if (!unitRoom) {
    message.error('Failed to create unit_room for unit')
      return
    }
  // Expand the unit_room if not already expanded
  if (unitRoom.room_id) {
    expandedRooms.value.add(unitRoom.room_id)
  }
  // Open device selection for unit (which will highlight the unit_room)
  await openDeviceSelection('unit', editingUnit.value.unit_id, roomsWithBeds.value, allUnits.value, ensureUnitRoom)
}

// Wrapper functions for room/bed handlers that use fetchRoomsWithBedsWrapper
const handleSaveRoomNameWrapper = async (roomId: string) => {
  await handleSaveRoomName(roomId, editingUnit.value, fetchRoomsWithBedsWrapper)
}

const handleDeleteRoomWrapper = async (roomId: string) => {
  await handleDeleteRoom(roomId, editingUnit.value, fetchRoomsWithBedsWrapper)
}

const handleSaveBedNameWrapper = async (bedId: string) => {
  await handleSaveBedName(bedId, editingUnit.value, fetchRoomsWithBedsWrapper)
}

const handleDeleteBedWrapper = async (bedId: string) => {
  await handleDeleteBed(bedId, editingUnit.value, fetchRoomsWithBedsWrapper)
}

// 编辑 Bed
const handleEditBedWrapper = (bed: Bed) => {
  handleEditBed(bed)
  nextTick(() => {
    if (bedInputRef.value && bedInputRef.value.$el) {
      bedInputRef.value.$el.querySelector('input')?.focus()
    } else if (bedInputRef.value && bedInputRef.value.focus) {
      bedInputRef.value.focus()
    }
  })
}

// 保存 Bed 名称（验证格式：BedA-BedZ）
// Functions are now in composables, using wrapper functions

// Auto-fill unit_number from unit_name when unit_name input loses focus (deprecated, unit_number field removed from UI)
const handleUnitNameBlur = () => {
  // No-op: unit_number field has been removed from the UI
}

// 监听 showEditUnitModal 的变化，在打开 Modal 时立即设置位置为 10%
watch(showEditUnitModal, async (newShowModal) => {
  if (!newShowModal) return
  
  // 立即设置位置，不等待动画
  await nextTick()
  // 使用 MutationObserver 监听 DOM 变化，确保在 Modal 元素出现时立即设置位置
  const observer = new MutationObserver((_mutations, obs) => {
    const modalElement = document.querySelector('.edit-unit-modal-device-mode .ant-modal, .edit-unit-modal-normal .ant-modal') as HTMLElement
    if (modalElement) {
      // 立即设置位置，禁用过渡
      modalElement.style.left = '10%'
      modalElement.style.top = '50%'
      modalElement.style.transform = 'translateY(-50%)'
      modalElement.style.margin = '0'
      modalElement.style.transition = 'none'
      // 找到后停止观察
      obs.disconnect()
    }
  })
  
  // 开始观察 body 的变化
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
  
  // 也立即尝试设置（如果元素已经存在）
  setTimeout(() => {
    const modalElement = document.querySelector('.edit-unit-modal-device-mode .ant-modal, .edit-unit-modal-normal .ant-modal') as HTMLElement
    if (modalElement) {
      modalElement.style.left = '10%'
      modalElement.style.top = '50%'
      modalElement.style.transform = 'translateY(-50%)'
      modalElement.style.margin = '0'
      modalElement.style.transition = 'none'
      observer.disconnect()
    }
  }, 0)
}, { immediate: true })

// 初始化
onMounted(() => {
  fetchBuildings()
  fetchBranches()
  // Note: tags_catalog table has been removed
  fetchAllUnits()
})
</script>

<style scoped>
.unit-list {
  padding: 24px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 16px;
}

.branch-container-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.branch-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 8px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background: #fafafa;
  min-height: 32px;
  margin-left: 8px;
  flex: 1;
  min-width: 200px;
}

.branch-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}

.branch-item:hover {
  border-color: #1890ff;
  background: #f0f9ff;
}

.branch-item-selected {
  border-color: #1890ff;
  background: #e6f7ff;
}

.branch-empty {
  padding: 8px;
  color: #999;
  font-size: 13px;
  font-style: italic;
}


.branch-name {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.create-building-form {
  display: flex;
  align-items: center;
  gap: 8px;
}

.view-button {
  margin-right: 6px;
}

.create-label {
  font-weight: 500;
}

.separator {
  margin: 0 4px;
}

.divider {
  height: 1px;
  background: #e8e8e8;
  margin-bottom: 24px;
}

.main-container {
  display: flex;
  flex: 1;
  gap: 24px;
  overflow: hidden;
}

/* 左侧：Building 列表（完整的 Building 卡片和楼层按钮） */
.building-list {
  width: 150px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-right: 1px solid #e8e8e8;
  padding-right: 16px;
}

.buildings {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.building-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
}

.building-card:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.building-card.active {
  border-color: #1890ff;
  background: #f0f9ff;
}

.building-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.building-name-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.building-icon {
  color: #1890ff;
  font-size: 16px;
  flex-shrink: 0;
  margin-right: 8px;
}

.building-name {
  font-weight: 600;
  font-size: 16px;
}

.building-edit-icon {
  color: #1890ff;
  cursor: pointer;
  font-size: 16px;
  flex-shrink: 0;
}

.building-edit-icon:hover {
  color: #40a9ff;
}

.building-delete-icon {
  color: #1890ff;
  cursor: pointer;
  font-size: 16px;
  flex-shrink: 0;
  margin-left: auto;
}

.building-delete-icon:hover {
  color: #40a9ff;
}

.building-edit {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.building-edit .separator {
  color: #999;
  font-size: 11px;
  margin: 0 2px;
}

.building-actions {
  display: flex;
  gap: 8px;
  color: #1890ff;
  cursor: pointer;
  flex-shrink: 0;
}

.building-actions :hover {
  color: #40a9ff;
}


.floor-delete-icon {
  color: #ff4d4f;
  cursor: pointer;
  font-size: 12px;
  flex-shrink: 0;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.floor-delete-icon:hover {
  opacity: 1;
}

.floors {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.floor-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.floor-button {
  flex: 1;
  text-align: left;
}

/* 右侧：Unit 网格 */
.unit-grid-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 16px;
}

.unit-grid-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.grid-header {
  margin-bottom: 16px;
}

.grid-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.unit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  overflow-y: auto;
  padding: 8px;
}

.floor-divider {
  grid-column: 1 / -1; /* Span all columns */
  display: flex;
  align-items: center;
  padding: 8px 0;
  margin: 8px 0;
  border-top: 2px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
  background-color: #f5f5f5;
}

.floor-label {
  font-weight: 600;
  font-size: 14px;
  color: #1890ff;
  padding: 0 12px;
}

.location-cell {
  aspect-ratio: 1.5;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}

.location-cell:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.unit-cell.has-unit {
  background: #f0f9ff;
}

.unit-content {
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  padding: 8px;
}

.empty-cell {
  color: #999;
  font-size: 24px;
}

.empty-cell:hover {
  color: #1890ff;
}

/* Edit Unit Modal Styles */
:deep(.ant-modal-body) {
  padding-top: 12px;
  padding-bottom: 16px;
}

/* Modal 内容包装器 - 水平布局 */
.modal-content-wrapper {
  display: flex;
  gap: 0;
}

.modal-content-wrapper.device-mode {
  gap: 24px;
}

.unit-edit-container {
  padding: 0;
  min-width: 0;
  overflow-x: hidden;
  transition: all 0.3s;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

/* Device 模式下，固定宽度为 420px，并距离 Modal 左边界 10px */
.modal-content-wrapper.device-mode .unit-edit-container {
  flex: 0 0 420px;
  max-width: 420px;
  width: 420px;
}

:deep(.edit-unit-modal-device-mode .ant-modal-body .unit-edit-container) {
  margin-left: 10px;
}

/* 拖拽视觉反馈 */
.unit-edit-container.drag-over,
.tree-node.room-node.drag-over,
.tree-node.bed-node.drag-over {
  background: #e6f7ff !important;
  border: 2px dashed #1890ff !important;
  border-radius: 4px;
}

/* Dev 容器激活状态高亮 */
.tree-node.room-node.dev-container-active,
.tree-node.bed-node.dev-container-active {
  background: #f6ffed !important;
  border: 2px solid #52c41a !important;
  border-radius: 4px;
}

.unit-edit-container.dev-container-active {
  background: #f6ffed !important;
  border: 2px solid #52c41a !important;
  border-radius: 4px;
}

/* Dev 容器 */
.device-container {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e8e8e8;
  padding-left: 24px;
}


.device-list-wrapper {
  flex: 1;
  overflow: hidden;
}

/* 可拖拽的设备名称 */
.device-name-draggable {
  cursor: grab;
  user-select: none;
  padding: 2px 4px;
  border-radius: 2px;
  transition: background-color 0.2s;
}

.device-name-draggable:hover {
  background: #f0f0f0;
}

.device-name-draggable:active {
  cursor: grabbing;
}

/* 设备图标样式 */
.device-icon-wrapper {
  position: relative;
  display: inline-block;
  width: 32px;
  height: 32px;
  margin-right: 6px;
  cursor: pointer;
  flex-shrink: 0;
}

/* 圆形图标 */
.device-icon-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s;
  border: 2px solid transparent;
}

/* monitoring_enabled: 蓝色底 */
.device-icon-wrapper.monitoring-enabled .device-icon-circle {
  background: #1890ff;
  color: white;
}

/* monitoring_disabled: 灰色底 */
.device-icon-wrapper.monitoring-disabled .device-icon-circle {
  background: #d9d9d9;
  color: #666;
}

/* SVG/PNG 图标样式 */
.device-icon-svg {
  width: 20px;
  height: 20px;
  object-fit: contain;
  display: block;
}

.device-icon-svg-small {
  width: 16px;
  height: 16px;
  object-fit: contain;
  display: block;
}

/* Bed device thumbnails (shown in bed row when room is expanded) */
.bed-device-thumbnails {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  margin-right: 4px;
}

.device-thumbnail {
  position: relative;
  display: inline-block;
  cursor: pointer;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  overflow: hidden;
}

.device-icon-circle-small {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s;
  border: 1px solid transparent;
  overflow: hidden;
}

/* Status dot for device thumbnails - same position as expanded (top-left), just different size */
.device-status-dot {
  position: absolute;
  top: -2px;
  left: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1px solid white;
  z-index: 1;
}

.device-status-dot.status-online {
  background: #52c41a;
}

.device-status-dot.status-offline {
  background: #999;
}

.device-status-dot.status-error {
  background: #ff4d4f;
}

.device-status-dot-small {
  position: absolute;
  top: -2px;
  left: -2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: 1px solid white;
  z-index: 1;
}

.device-status-dot-small.status-online {
  background: #52c41a;
}

.device-status-dot-small.status-offline {
  background: #999;
}

.device-status-dot-small.status-error {
  background: #ff4d4f;
}

.device-thumbnail.monitoring-enabled .device-icon-circle-small {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.device-thumbnail.monitoring-disabled .device-icon-circle-small {
  background: #d9d9d9;
  color: #666;
  border-color: #d9d9d9;
}

/* Status 指示器（左上角） */
.device-status-indicator {
  position: absolute;
  top: -2px;
  left: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  font-size: 8px;
  z-index: 1;
}

/* online: 绿色对号 */
.device-status-indicator.status-online {
  background: #52c41a;
  color: white;
}

.device-status-indicator.status-online :deep(.anticon) {
  font-size: 8px;
}

/* error: 红色点 */
.device-status-indicator.status-error {
  background: #ff4d4f;
  width: 10px;
  height: 10px;
  border: 2px solid white;
}

.device-status-indicator.status-error .error-dot {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #ff4d4f;
}

/* offline: 红色叉 */
.device-status-indicator.status-offline {
  background: #ff4d4f;
  color: white;
  font-size: 10px;
}

.device-status-indicator.status-offline :deep(.anticon) {
  font-size: 8px;
}

/* 设备列表紧凑模式 */
.bound-devices-section {
  margin-left: 24px;
  margin-top: 4px;
}

.devices-compact {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.more-devices {
  color: #1890ff;
  font-size: 12px;
  cursor: pointer;
  margin: 0 4px;
  user-select: none;
}

.more-devices:hover {
  color: #40a9ff;
  text-decoration: underline;
}

/* 设备列表展开模式 */
.devices-expanded {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.device-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

/* Tree top actions */
.tree-top-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  margin-bottom: 8px;
}

.action-label {
  font-size: 12px;
  color: #666;
  margin-right: 4px;
}

.bed-icon-in-button {
  width: 16px;
  height: 16px;
  margin-left: 4px;
  vertical-align: middle;
  transition: all 0.3s;
  filter: brightness(0) invert(1); /* 转换为白色 */
}

.add-bed-icon-room {
  width: 24px;
  height: 24px;
  cursor: pointer;
  transition: all 0.3s;
}

.add-bed-icon-room:hover:not(.disabled) {
  transform: scale(1.1);
}

.add-bed-icon-room.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Tree bottom actions */
.tree-bottom-actions {
  display: flex;
  gap: 8px;
  padding: 8px 0;
  margin-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.action-icon.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.add-bed-icon {
  color: #1890ff;
}

.add-bed-icon:hover:not(.disabled) {
  background: #e6f7ff;
  color: #40a9ff;
}

.unit-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 0;
  margin-bottom: 8px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.unit-field {
  display: flex;
  align-items: center;
  gap: 4px;
}

.unit-field.full-row label {
  width: 90px;
}

.unit-field.full-row label {
  font-size: 13px;
  color: #555;
}

.unit-field.full-row :deep(.ant-input) {
  width: 150px;
}

.unit-field.inline-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  flex-wrap: wrap;
}

.inline-field {
  display: flex;
  align-items: center;
  gap: 4px;
}

.inline-field label {
  font-size: 13px;
  color: #555;
}

.required-star {
  color: #ff4d4f;
  margin-left: 2px;
}

/* Room-Bed Tree Structure Styles */
.room-bed-section {
  margin-top: 16px;
  border-top: 1px solid #e8e8e8;
  padding-top: 16px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.tree-header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  max-width: 100%;
}

.tree-title {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.tree-container {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 8px;
  background: #fafafa;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.tree-empty {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 13px;
}

.tree-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tree-node {
  display: flex;
  flex-direction: column;
  margin-bottom: 4px;
}

.tree-node.room-node {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 4px 8px;
}

.tree-node.bed-node {
  background: #f9f9f9;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 4px 8px;
  margin-left: 24px;
  margin-top: 4px;
}

.tree-node.device-node {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 4px 8px;
  margin-left: 24px;
  margin-top: 4px;
}

.device-expanded-content {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.device-collapsed-content {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  width: 100%;
}

.collapse-icon {
  cursor: pointer;
  color: #1890ff;
  font-size: 16px;
  font-weight: bold;
  margin-left: auto;
  padding: 0 4px;
}

.collapse-icon:hover {
  color: #40a9ff;
}

.more-devices-count {
  color: #1890ff;
  font-size: 12px;
  margin-left: 4px;
}

.tree-node.add-form {
  background: #f0f9ff;
  border: 1px dashed #1890ff;
}

.node-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.node-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.node-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* Room icons display */
.room-icons {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}

.room-icon-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.room-icon-thumbnail {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.room-icon-count {
  font-size: 12px;
  color: #999;
  margin-left: 2px;
}

.device-thumbnail-small {
  position: relative;
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.device-thumbnail-small.monitoring-enabled {
  background: #1890ff;
}

.device-thumbnail-small.monitoring-disabled {
  background: #d9d9d9;
}

.node-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  min-height: 28px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.node-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.node-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* Room icons display */
.room-icons {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
}

.room-icon-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.room-icon-thumbnail {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.room-icon-count {
  font-size: 12px;
  color: #999;
  margin-left: 2px;
}

.device-thumbnail-small {
  position: relative;
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.device-thumbnail-small.monitoring-enabled {
  background: #1890ff;
}

.device-thumbnail-small.monitoring-disabled {
  background: #d9d9d9;
}

.expand-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  background: #fff;
  font-size: 14px;
  font-weight: bold;
  color: #666;
  user-select: none;
  flex-shrink: 0;
}

.expand-icon:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.expand-placeholder {
  width: 20px;
  flex-shrink: 0;
}

.node-label {
  font-size: 13px;
  color: #333;
  cursor: default;
  padding: 2px 4px;
  border-radius: 2px;
  flex-shrink: 0;
}

.node-label:hover {
  background: #f5f5f5;
}

.node-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  flex-shrink: 0;
}

.action-icon {
  color: #1890ff;
  cursor: pointer;
  font-size: 14px;
  padding: 2px;
  border-radius: 2px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.action-icon:hover {
  background: #e6f7ff;
  color: #40a9ff;
}

.action-icon.delete-icon {
  color: #ff4d4f;
}

.action-icon.delete-icon:hover {
  background: #fff1f0;
  color: #ff7875;
}

.action-icon.inline-action {
  margin-left: 2px;
}

.action-icon.add-device-icon {
  color: #52c41a;
  font-size: 16px;
}

.action-icon.add-device-icon:hover {
  background: #f6ffed;
  color: #73d13d;
}

/* Add Dev 按钮在设备模式下的样式 */
.device-mode-active {
  background: #52c41a !important;
  border-color: #52c41a !important;
}

.device-mode-active:hover {
  background: #73d13d !important;
  border-color: #73d13d !important;
}

.tree-children {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modal-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.modal-actions-center {
  display: flex;
  align-items: center;
  gap: 0;
}

.unit-action-label {
  font-weight: 500;
  margin-right: 0;
}

.unit-actions-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.modal-actions-left {
  display: flex;
  align-items: center;
}

.modal-actions-right {
  display: flex;
  gap: 8px;
  margin-left: auto;
}


.unit-cell {
  cursor: pointer;
  user-select: none;
}

.unit-cell:hover {
  background-color: #f5f5f5;
}

/* Unit Name 和 Unit Type 在同一行，无 gap */
.unit-name-with-type :deep(.ant-form-item-label) {
  padding-bottom: 0;
}

.unit-name-with-type :deep(.ant-form-item-label > label) {
  margin-right: 0;
}

.unit-field.full-row label {
  margin-right: 0;
}

/* 压缩单选按钮间距 */
:deep(.ant-radio-group) {
  display: flex;
  gap: 4px;
}

:deep(.ant-radio-wrapper) {
  margin-right: 0;
  padding-right: 0;
}

/* Location Tag Units (没有 building 的 units) */
.location-tag-units {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e8e8e8;
}

.location-tag-group {
  margin-bottom: 8px;
}

.location-tag-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.location-tag-header:hover {
  background: #f0f0f0;
  border-color: #1890ff;
}

.location-tag-header.active {
  background: #e6f7ff;
  border-color: #1890ff;
  color: #1890ff;
}

.location-tag-name {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.location-tag-header.active .location-tag-name {
  color: #1890ff;
}

.unit-count {
  margin-left: 8px;
  font-size: 12px;
  color: #999;
}

.location-tag-header.active .unit-count {
  color: #1890ff;
}

/* Header button active state */
.header-button-active {
  background: #52c41a !important;
  border-color: #52c41a !important;
  color: #fff !important;
}

.header-button-active:hover {
  background: #73d13d !important;
  border-color: #73d13d !important;
}

/* Edit Unit Modal 位置控制 - 默认位置为 10% */
/* 使用更高优先级的选择器，确保在 Modal 渲染时就应用位置 */
:deep(.edit-unit-modal-normal .ant-modal),
:deep(.edit-unit-modal-device-mode .ant-modal),
:deep(.ant-modal-wrap.edit-unit-modal-normal .ant-modal),
:deep(.ant-modal-wrap.edit-unit-modal-device-mode .ant-modal) {
  left: 10% !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  margin: 0 !important;
  /* 禁用所有过渡动画，确保直接显示在目标位置 */
  transition: none !important;
  animation: none !important;
}
</style>




