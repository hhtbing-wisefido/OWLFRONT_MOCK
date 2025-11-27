<template>
  <div class="unit-list">
    <!-- Page Header: Create Form -->
    <div class="page-header">
      <div class="create-building-form">
        <a-button type="default" @click="goToUnitView" class="view-button">
          <EyeOutlined />
          View
        </a-button>
        <span class="create-label">location_tag:</span>
        <a-auto-complete
          id="create-building-location-tag"
          name="create-building-location-tag"
          v-model:value="createBuildingForm.location_tag"
          :options="locationTagOptions.map(tag => ({ value: tag.tag_name }))"
          placeholder="Select or input location_tag"
          allow-clear
          :filter-option="false"
          @search="handleLocationTagSearch"
          @blur="handleLocationTagBlur"
          style="width: 150px"
        />
        <span class="separator">:</span>
        <span class="create-label">Building:</span>
        <a-input
          id="create-building-name"
          name="create-building-name"
          v-model:value="createBuildingForm.building_name"
          placeholder="Building name"
          style="width: 100px"
          @pressEnter="handleCreateBuilding"
        />
        <span class="separator">:</span>
        <span class="create-label">Floors:</span>
        <a-input-number
          id="create-building-floors"
          name="create-building-floors"
          v-model:value="createBuildingForm.floors"
          :min="1"
          :max="99"
          placeholder="Number of floors"
          style="width: 80px"
          @pressEnter="handleCreateBuilding"
        />
        <a-button type="primary" @click="handleCreateBuilding">Create</a-button>
        <div class="building-tags">
          <div
            v-for="building in buildingsWithDisplayName"
            :key="building.building_id"
            class="building-tag-card"
            :class="{
              active: selectedBuilding?.building_id === building.building_id,
              expanded: expandedBuildings.has(building.building_id || ''),
            }"
          >
            <div class="building-tag-header" @click="handleToggleBuildingTag(building)">
              <EditOutlined
                v-if="editingBuildingId !== building.building_id"
                class="building-tag-edit-icon"
                @click.stop="handleEditBuilding(building)"
              />
              <span
                v-if="editingBuildingId !== building.building_id"
                class="building-tag-name"
              >
                {{ building.displayName }}
              </span>
              <div
                v-else
                class="building-tag-edit"
                @click.stop
              >
                <a-auto-complete
                  :id="`edit-building-location-tag-${building.building_id}`"
                  :name="`edit-building-location-tag-${building.building_id}`"
                  v-model:value="editingBuildingForm.location_tag"
                  :options="locationTagOptions.map(tag => ({ value: tag.tag_name }))"
                  placeholder="location_tag"
                  size="small"
                  allow-clear
                  :filter-option="false"
                  @search="handleLocationTagSearch"
                  @blur="handleLocationTagBlur"
                  style="width: 120px"
                  @pressEnter="handleSaveBuilding(building)"
                />
                <span class="separator">:</span>
                <a-input
                  :id="`edit-building-name-tag-${building.building_id}`"
                  :name="`edit-building-name-tag-${building.building_id}`"
                  v-model:value="editingBuildingForm.building_name"
                  placeholder="Building"
                  size="small"
                  style="width: 55px"
                  @pressEnter="handleSaveBuilding(building)"
                  @blur="handleSaveBuilding(building)"
                />
              </div>
              <DeleteOutlined
                v-if="editingBuildingId !== building.building_id"
                class="building-tag-delete-icon"
                @click.stop="handleDeleteBuilding(building)"
              />
            </div>
            <div class="building-tag-floors" v-if="expandedBuildings.has(building.building_id || '')" @click.stop>
              <div
                v-for="floorNum in building.floors"
                :key="floorNum"
                class="floor-item-small"
              >
                <a-button
                  :type="selectedFloor === `${floorNum}F` ? 'primary' : 'default'"
                  class="floor-button-small"
                  @click.stop="handleSelectFloor(building, `${floorNum}F`)"
                >
                  floor{{ floorNum }}
                </a-button>
                <DeleteOutlined
                  class="floor-delete-icon"
                  @click.stop="handleDeleteFloor(building, floorNum)"
                />
              </div>
            </div>
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
            <div class="building-header" @click="handleToggleBuildingCard(building)">
              <EditOutlined
                v-if="editingBuildingId !== building.building_id"
                class="building-edit-icon"
                @click.stop="handleEditBuilding(building)"
              />
              <span
                v-if="editingBuildingId !== building.building_id"
                class="building-name"
              >
                {{ building.displayName }}
              </span>
              <div
                v-else
                class="building-edit"
                @click.stop
              >
                <a-auto-complete
                  :id="`edit-building-location-tag-card-${building.building_id}`"
                  :name="`edit-building-location-tag-card-${building.building_id}`"
                  v-model:value="editingBuildingForm.location_tag"
                  :options="locationTagOptions.map(tag => ({ value: tag.tag_name }))"
                  placeholder="location_tag"
                  size="small"
                  allow-clear
                  :filter-option="false"
                  @search="handleLocationTagSearch"
                  @blur="handleLocationTagBlur"
                  style="width: 120px"
                  @pressEnter="handleSaveBuilding(building)"
                />
                <span class="separator">:</span>
                <a-input
                  :id="`edit-building-name-card-${building.building_id}`"
                  :name="`edit-building-name-card-${building.building_id}`"
                  v-model:value="editingBuildingForm.building_name"
                  placeholder="Building"
                  size="small"
                  style="width: 55px"
                  @pressEnter="handleSaveBuilding(building)"
                  @blur="handleSaveBuilding(building)"
                />
              </div>
              <DeleteOutlined
                v-if="editingBuildingId !== building.building_id"
                class="building-delete-icon"
                @click.stop="handleDeleteBuilding(building)"
              />
            </div>
            <div class="floors" v-if="selectedBuilding?.building_id === building.building_id" @click.stop>
              <div
                v-for="floorNum in building.floors"
                :key="floorNum"
                class="floor-item"
              >
                <a-button
                  :type="selectedFloor === `${floorNum}F` ? 'primary' : 'default'"
                  class="floor-button"
                  @click.stop="handleSelectFloor(building, `${floorNum}F`)"
                >
                  floor{{ floorNum }}
                </a-button>
                <DeleteOutlined
                  class="floor-delete-icon"
                  @click.stop="handleDeleteFloor(building, floorNum)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Unit Grid -->
      <div class="unit-grid-container">
        <div v-if="!selectedBuilding || !selectedFloor" class="empty-state">
              <p>Please select a floor</p>
        </div>
        <div v-else class="unit-grid-wrapper">
          <div class="unit-grid">
            <!-- Display all sorted units -->
            <div
              v-for="unit in unitGrid"
              :key="unit.unit_id"
              class="unit-cell has-unit"
              @click="handleCellClick(unit, -1)"
            >
              <div class="unit-content">
                {{ unit.unit_number }} Unit
              </div>
            </div>
            
            <!-- Add an empty cell for creating a new Unit -->
            <div
              class="unit-cell"
              @click="handleCellClick(null, -1)"
            >
              <div class="empty-cell">
                <PlusOutlined />
              </div>
            </div>
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
        <a-form-item
          label="Unit Number"
          :rules="[{ required: true, message: 'Please input unit number' }]"
        >
          <a-input
            id="create-location-unit-number"
            name="create-location-unit-number"
            v-model:value="createUnitForm.unit_number"
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
        <a-form-item label="Location Tag">
          <a-select
            id="create-location-location-tag"
            name="create-location-location-tag"
            v-model:value="createUnitForm.location_tag"
            placeholder="Select location tag"
            allow-clear
          >
            <a-select-option value="VIP">VIP</a-select-option>
            <a-select-option value="Standard">Standard</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Area Tag">
          <a-select
            id="create-location-area-tag"
            name="create-location-area-tag"
            v-model:value="createUnitForm.area_tag"
            placeholder="Select area tag"
            allow-clear
          >
            <a-select-option value="East">East</a-select-option>
            <a-select-option value="West">West</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Building">
          <a-input
            id="create-location-building"
            name="create-location-building"
            v-model:value="createUnitForm.building"
            placeholder="Enter building (optional)"
          />
        </a-form-item>
        <a-form-item label="Floor">
          <a-input
            id="create-location-floor"
            name="create-location-floor"
            v-model:value="createUnitForm.floor"
            placeholder="Enter floor (optional)"
          />
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
          :class="{ 
            'drag-over': dragOverTarget?.type === 'unit' && dragOverTarget?.id === editingUnit?.unit_id,
            'dev-container-active': devContainerTarget?.type === 'unit' && devContainerTarget?.id === editingUnit?.unit_id
          }"
          
          @dragover.prevent="editingUnit && handleDragOver($event, 'unit', editingUnit.unit_id)"
          @dragleave="handleDragLeave"
          @drop="editingUnit && handleDeviceDrop($event, 'unit', editingUnit.unit_id)"
        >
          <!-- Unit Basic Information -->
        <div class="unit-fields">
          <div class="unit-field full-row">
            <label>UnitName<span class="required-star">*</span>:</label>
            <div style="display: flex; align-items: center; gap: 0">
              <a-input
                v-model:value="editUnitForm.unit_name"
                placeholder="Unit name"
                style="width: 120px; margin-right: 0"
              />
              <a-radio-group 
                v-model:value="editUnitForm.unit_type"
                style="margin-left: 8px"
              >
                <a-radio value="Facility">Facility</a-radio>
                <a-radio value="Home">Home</a-radio>
              </a-radio-group>
            </div>
          </div>
          <div class="unit-field inline-row">
            <div class="inline-field">
              <label>area_tag:</label>
              <a-select
                v-model:value="editUnitForm.area_tag"
                placeholder="Input or select"
                allow-clear
                show-search
                :filter-option="false"
                @search="handleAreaTagSearch"
                @blur="handleAreaTagBlur"
                style="width: 120px"
              >
                <a-select-option
                  v-for="tag in areaTagOptions"
                  :key="tag.tag_name"
                  :value="tag.tag_name"
                >
                  {{ tag.tag_name }}
                </a-select-option>
              </a-select>
            </div>
            <div class="inline-field unitnumber-field">
              <label>UnitNumber<span class="required-star">*</span>:</label>
              <a-input
                v-model:value="editUnitForm.unit_number"
                placeholder="Unit number"
                style="width: 80px"
                :disabled="!!editingUnit"
              />
            </div>
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
                @click="handleShowAddRoomForm"
                :disabled="!editingUnit"
              >
                Add Room
              </a-button>
            </div>
          </div>
          <div class="tree-container">
            <div v-if="!editingUnit" class="tree-empty">
              <p>Please create or select a unit first</p>
            </div>
            <template v-else>
              <!-- Tree top actions: Add Bed and Dev - Always show when editingUnit exists -->
              <div class="tree-top-actions">
                <span class="action-label">Add Bed/Dev to Unit</span>
                <a-button
                  type="primary"
                  size="small"
                  @click="handleAddBedToFirstRoom"
                  :disabled="!editingUnit"
                  title="Add bed to unit"
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
                  type="primary"
                  size="small"
                  @click="handleAddDev"
                  :disabled="!editingUnit"
                  :class="{ 'device-mode-active': isDeviceMode }"
                  :title="isDeviceMode ? 'Exit device mode' : 'Add device'"
                >
                  Dev <AppstoreAddOutlined />
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
                  'drag-over': dragOverTarget?.type === 'room' && dragOverTarget?.id === room.room_id,
                  'dev-container-active': devContainerTarget?.type === 'room' && devContainerTarget?.id === room.room_id
                }"
                @dragover.prevent="handleDragOver($event, 'room', room.room_id)"
                @dragleave="handleDragLeave"
                @drop="handleDeviceDrop($event, 'room', room.room_id)"
              >
                <div class="node-content">
                  <span
                    class="expand-icon"
                    @click="toggleRoom(room.room_id)"
                    v-if="room.beds && room.beds.length > 0"
                  >
                    {{ expandedRooms.has(room.room_id) ? '−' : '+' }}
                  </span>
                  <span class="expand-placeholder" v-else></span>
                  <a-input
                    v-if="editingRoomId === room.room_id"
                    v-model:value="editingRoomName"
                    size="small"
                    style="width: 150px"
                    @pressEnter="handleSaveRoomName(room.room_id)"
                    @blur="handleSaveRoomName(room.room_id)"
                    ref="roomInputRef"
                  />
                  <span v-else class="node-label" @dblclick="handleEditRoom(room)">
                    {{ room.room_name }}
                  </span>
                  <EditOutlined
                    v-if="editingRoomId !== room.room_id"
                    class="action-icon inline-action"
                    @click="handleEditRoom(room)"
                  />
                  <DeleteOutlined
                    v-if="editingRoomId !== room.room_id"
                    class="action-icon delete-icon inline-action"
                    @click="handleDeleteRoom(room.room_id)"
                  />
                  <AppstoreAddOutlined
                    v-if="editingRoomId !== room.room_id && isDeviceMode"
                    class="action-icon inline-action add-device-icon"
                    @click="handleAddDeviceToRoom(room.room_id)"
                    title="Add device"
                  />
                  <div class="node-actions">
                    <img 
                      :src="bedIconGreen"
                      class="action-icon inline-action add-bed-icon-room"
                      @click="handleAddBedDirectly(room)"
                      :class="{ 'disabled': getAvailableBedLetters(room).length === 0 }"
                      title="Add bed"
                    />
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
                      'drag-over': dragOverTarget?.type === 'bed' && dragOverTarget?.id === bed.bed_id,
                      'dev-container-active': devContainerTarget?.type === 'bed' && devContainerTarget?.id === bed.bed_id
                    }"
                    @dragover.prevent="handleDragOver($event, 'bed', bed.bed_id)"
                    @dragleave="handleDragLeave"
                    @drop="handleDeviceDrop($event, 'bed', bed.bed_id)"
                  >
                    <div class="node-content">
                      <span class="expand-placeholder"></span>
                      <a-input
                        v-if="editingBedId === bed.bed_id"
                        v-model:value="editingBedName"
                        size="small"
                        style="width: 150px"
                        @pressEnter="handleSaveBedName(bed.bed_id)"
                        @blur="handleSaveBedName(bed.bed_id)"
                        ref="bedInputRef"
                        placeholder="BedA-BedZ"
                      />
                      <span v-else class="node-label" @dblclick="handleEditBed(bed)">
                        {{ bed.bed_name }}
                      </span>
                      <EditOutlined
                        v-if="editingBedId !== bed.bed_id"
                        class="action-icon inline-action"
                        @click="handleEditBed(bed)"
                      />
                      <DeleteOutlined
                        v-if="editingBedId !== bed.bed_id"
                        class="action-icon delete-icon inline-action"
                        @click="handleDeleteBed(bed.bed_id)"
                      />
                      <AppstoreAddOutlined
                        v-if="editingBedId !== bed.bed_id && isDeviceMode"
                        class="action-icon inline-action add-device-icon"
                        @click="handleAddDeviceToBed(bed.bed_id)"
                        title="Add device"
                      />
                    </div>
                    
                    <!-- Bed Bound Device Nodes (as Children of Bed) -->
                    <div
                      v-if="getBedDevices(bed.bed_id).length > 0"
                      class="tree-children"
                    >
                      <div
                        v-for="device in getBedDevices(bed.bed_id)"
                        :key="device.device_id"
                        class="tree-node device-node"
                      >
                        <div class="node-content">
                          <span class="expand-placeholder"></span>
                          <!-- Expanded Mode: Show Detailed Information -->
                          <div 
                            v-if="expandedDevices.has(`device-${device.device_id}`)" 
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
                                {{ getDeviceTypeIcon(device.device_type) }}
                              </div>
                              <div class="device-status-indicator" :class="`status-${device.status}`">
                                <CheckCircleOutlined v-if="device.status === 'online'" />
                                <span v-else-if="device.status === 'error'" class="error-dot"></span>
                                <CloseCircleOutlined v-else-if="device.status === 'offline'" />
                              </div>
                            </div>
                            <span class="node-label">{{ device.device_name }}</span>
                            <EditOutlined 
                              class="action-icon inline-action"
                              @click="handleEditDevice(device)"
                            />
                            <DeleteOutlined 
                              class="action-icon delete-icon inline-action"
                              @click="handleDeleteDevice(device)"
                            />
                            <span 
                              class="collapse-icon"
                              @click="toggleDevicesExpand(`device-${device.device_id}`)"
                              title="Collapse"
                            >
                              −
                            </span>
                          </div>
                          <!-- Collapsed Mode: Show Icon Only -->
                          <div 
                            v-else 
                            class="device-collapsed-content"
                            @click="toggleDevicesExpand(`device-${device.device_id}`)"
                          >
                            <div
                              class="device-icon-wrapper"
                              :class="{
                                'monitoring-enabled': device.monitoring_enabled,
                                'monitoring-disabled': !device.monitoring_enabled
                              }"
                            >
                              <div class="device-icon-circle">
                                {{ getDeviceTypeIcon(device.device_type) }}
                              </div>
                              <div class="device-status-indicator" :class="`status-${device.status}`">
                                <CheckCircleOutlined v-if="device.status === 'online'" />
                                <span v-else-if="device.status === 'error'" class="error-dot"></span>
                                <CloseCircleOutlined v-else-if="device.status === 'offline'" />
                              </div>
                            </div>
                            <span 
                              v-if="getBedDevices(bed.bed_id).length > 1 && getBedDevices(bed.bed_id).findIndex(d => d.device_id === device.device_id) === 0 && !expandedDevices.has(`device-${device.device_id}`)"
                              class="more-devices-count"
                            >
                              +{{ getBedDevices(bed.bed_id).length - 1 }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Room Bound Device Nodes (as Children of Room, After Bed) -->
                <div
                  v-if="getRoomDevices(room.room_id).length > 0"
                  class="tree-children"
                >
                  <div
                    v-for="device in getRoomDevices(room.room_id)"
                    :key="device.device_id"
                    class="tree-node device-node"
                  >
                    <div class="node-content">
                      <span class="expand-placeholder"></span>
                      <!-- Expanded Mode: Show Detailed Information -->
                      <div 
                        v-if="expandedDevices.has(`device-${device.device_id}`)" 
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
                            {{ getDeviceTypeIcon(device.device_type) }}
                          </div>
                          <div class="device-status-indicator" :class="`status-${device.status}`">
                            <CheckCircleOutlined v-if="device.status === 'online'" />
                            <span v-else-if="device.status === 'error'" class="error-dot"></span>
                            <CloseCircleOutlined v-else-if="device.status === 'offline'" />
                          </div>
                        </div>
                        <span class="node-label">{{ device.device_name }}</span>
                        <EditOutlined 
                          class="action-icon inline-action"
                          @click="handleEditDevice(device)"
                        />
                        <DeleteOutlined 
                          class="action-icon delete-icon inline-action"
                          @click="handleDeleteDevice(device)"
                        />
                        <span 
                          class="collapse-icon"
                          @click="toggleDevicesExpand(`device-${device.device_id}`)"
                          title="Collapse"
                        >
                          −
                        </span>
                      </div>
                      <!-- Collapsed Mode: Show Icon Only -->
                      <div 
                        v-else 
                        class="device-collapsed-content"
                        @click="toggleDevicesExpand(`device-${device.device_id}`)"
                      >
                        <div
                          class="device-icon-wrapper"
                          :class="{
                            'monitoring-enabled': device.monitoring_enabled,
                            'monitoring-disabled': !device.monitoring_enabled
                          }"
                        >
                          <div class="device-icon-circle">
                            {{ getDeviceTypeIcon(device.device_type) }}
                          </div>
                          <div class="device-status-indicator" :class="`status-${device.status}`">
                            <CheckCircleOutlined v-if="device.status === 'online'" />
                            <span v-else-if="device.status === 'error'" class="error-dot"></span>
                            <CloseCircleOutlined v-else-if="device.status === 'offline'" />
                          </div>
                        </div>
                        <span 
                          v-if="getRoomDevices(room.room_id).length > 1 && getRoomDevices(room.room_id).findIndex(d => d.device_id === device.device_id) === 0 && !expandedDevices.has(`device-${device.device_id}`)"
                          class="more-devices-count"
                        >
                          +{{ getRoomDevices(room.room_id).length - 1 }}
                        </span>
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
        
        <!-- Dev Container (Device List) - 与 unit-edit-container 并列 -->
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
                  <span
                    class="device-name-draggable"
                    draggable="true"
                    @dragstart="handleDeviceDragStart($event, record)"
                  >
                    {{ record.device_name }}
                  </span>
                </template>
              </template>
            </a-table>
          </div>
        </div>
      </div>
      <div class="modal-actions">
        <div class="modal-actions-left">
          <a-button 
            v-if="editingUnit"
            type="primary" 
            danger 
            @click="handleDeleteUnit"
            :disabled="!editingUnit"
          >
            <DeleteOutlined /> Delete
          </a-button>
        </div>
        <div class="modal-actions-right">
          <a-button @click="resetEditUnitForm">Cancel</a-button>
          <a-button type="primary" @click="handleSaveUnit">OK</a-button>
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
              :checked="isDeviceBoundToTarget(record)"
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
import { message, Modal } from 'ant-design-vue'
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, AppstoreAddOutlined } from '@ant-design/icons-vue'
import bedIconBlue from '@/assets/svg/Bed-blue.svg'
import bedIconGreen from '@/assets/svg/Bed-green.svg'
import type { ColumnsType } from 'ant-design-vue/es/table'
import type { Building, Unit, RoomWithBeds, Bed } from '@/api/units/model/unitModel'
import {
  createBuildingApi,
  getBuildingsApi,
  updateBuildingApi,
  deleteBuildingApi,
  createUnitApi,
  getUnitsApi,
  updateUnitApi,
  deleteUnitApi,
  getRoomsApi,
  createRoomApi,
  updateRoomApi,
  deleteRoomApi,
  createBedApi,
  updateBedApi,
  deleteBedApi,
} from '@/api/units/unit'
import { getTagsApi, createTagApi } from '@/api/admin/tags/tags'
import type { TagCatalogItem } from '@/api/admin/tags/model/tagsModel'
import { useUserStore } from '@/store/modules/user'
import { getDevicesApi, updateDeviceApi } from '@/api/devices/device'
import type { Device } from '@/api/devices/model/deviceModel'

const userStore = useUserStore()
const router = useRouter()

// Navigate to view mode
const goToUnitView = () => {
  router.push('/unitview')
}

// Building list
const buildings = ref<Building[]>([])
const selectedFloor = ref<string>('')

// Selected location_tag (for displaying units without building/floor)
const selectedLocationTag = ref<string>('')

// Headline row: independently manages its own expanded state (independent component instance)
const expandedBuildings = ref<Set<string>>(new Set())

// Left column: independently manages its own expanded state (independent component instance)
const selectedBuilding = ref<Building | null>(null)

// 当前用于 unitGrid 的 building（可能是从 headline 或左侧列选择的）
const currentBuildingForGrid = ref<Building | null>(null)

// Create Building Form (在页首)
const createBuildingForm = ref({
  location_tag: undefined as string | undefined,
  building_name: '',
  floors: 1,
})

// Edit Building Form (内联编辑)
const editingBuildingId = ref<string | null>(null)
const editingBuildingForm = ref({
  location_tag: undefined as string | undefined,
  building_name: '',
})

// Unit 网格
const units = ref<Unit[]>([])
// Note: gridSize 已不再使用，CSS Grid 会自动处理布局

// Create Unit Modal
const showCreateUnitModal = ref(false)
const createUnitForm = ref({
  unit_number: '',
  unit_name: '',
  unit_type: 'Facility' as 'Facility' | 'Home', // Default value is Facility
  location_tag: undefined as string | undefined,
  area_tag: undefined as string | undefined,
  building: '',
  floor: '',
})
// selectedCellIndex 暂时未使用，保留用于后续功能
// const selectedCellIndex = ref<number | null>(null)

// Edit Unit Modal (Room-Bed Management)
const showEditUnitModal = ref(false)
const editingUnit = ref<Unit | null>(null)
const roomsWithBeds = ref<RoomWithBeds[]>([])
const showAddRoomForm = ref(false)
const newRoomName = ref('')
const expandedRooms = ref<Set<string>>(new Set())
const expandedDevices = ref<Set<string>>(new Set()) // 设备展开状态（Room/Bed ID）
const bedIconHovered = ref(false)
const bedIconSrc = computed(() => bedIconHovered.value ? bedIconGreen : bedIconBlue)
const editingRoomId = ref<string | null>(null)
// 设备选择弹窗
const showDeviceSelectModal = ref(false)
const selectedTarget = ref<{ type: 'unit' | 'room' | 'bed', id: string } | null>(null)
const devicesForSelection = ref<Device[]>([])

// Dev 容器当前显示的容器（用于过滤设备）
const devContainerTarget = ref<{ type: 'unit' | 'room' | 'bed', id: string } | null>(null)
const editingRoomName = ref('')
const editingBedId = ref<string | null>(null)
const editingBedName = ref('')
const roomNameInputRef = ref<any>()
const roomInputRef = ref<any>()
const bedInputRef = ref<any>()
const isDeviceMode = ref(false)

// Device 相关状态
const availableDevices = ref<Device[]>([]) // 可用设备（未绑定）
const allDevices = ref<Device[]>([]) // 所有设备（包括已绑定的）
const deviceColumns: ColumnsType<Device> = [
  {
    title: '',
    key: 'checkbox',
    width: 50,
    align: 'center',
    fixed: 'left',
  },
  {
    title: 'Device_Name',
    dataIndex: 'device_name',
    key: 'device_name',
    width: 150,
    sorter: (a, b) => (a.device_name || '').localeCompare(b.device_name || ''),
  },
  {
    title: 'Device_type',
    dataIndex: 'device_type',
    key: 'device_type',
    width: 100,
    sorter: (a, b) => (a.device_type || '').localeCompare(b.device_type || ''),
  },
  {
    title: 'Device_mode',
    dataIndex: 'device_model',
    key: 'device_model',
    width: 100,
    sorter: (a, b) => (a.device_model || '').localeCompare(b.device_model || ''),
  },
  {
    title: 'Device_code',
    dataIndex: 'device_code',
    key: 'device_code',
    width: 140,
    sorter: (a, b) => (a.device_code || '').localeCompare(b.device_code || ''),
    ellipsis: true,
  },
  {
    title: 'status',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
  },
  {
    title: 'Monitor',
    dataIndex: 'monitoring_enabled',
    key: 'monitoring_enabled',
    width: 70,
    align: 'center',
    sorter: (a, b) => {
      const aVal = a.monitoring_enabled ? 1 : 0
      const bVal = b.monitoring_enabled ? 1 : 0
      return aVal - bVal
    },
  },
]

// 设备选择弹窗的列定义
const deviceSelectColumns: ColumnsType<Device> = [
  {
    title: '',
    key: 'checkbox',
    width: 50,
    align: 'center',
    fixed: 'left',
  },
  {
    title: 'Device_Name',
    dataIndex: 'device_name',
    key: 'device_name',
    width: 150,
    sorter: (a, b) => (a.device_name || '').localeCompare(b.device_name || ''),
  },
  {
    title: 'Device_type',
    dataIndex: 'device_type',
    key: 'device_type',
    width: 100,
    sorter: (a, b) => (a.device_type || '').localeCompare(b.device_type || ''),
  },
  {
    title: 'Device_mode',
    dataIndex: 'device_model',
    key: 'device_model',
    width: 100,
    sorter: (a, b) => (a.device_model || '').localeCompare(b.device_model || ''),
  },
  {
    title: 'Device_code',
    dataIndex: 'device_code',
    key: 'device_code',
    width: 140,
    sorter: (a, b) => (a.device_code || '').localeCompare(b.device_code || ''),
    ellipsis: true,
  },
  {
    title: 'status',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
  },
  {
    title: 'Monitor',
    dataIndex: 'monitoring_enabled',
    key: 'monitoring_enabled',
    width: 70,
    align: 'center',
    sorter: (a, b) => {
      const aVal = a.monitoring_enabled ? 1 : 0
      const bVal = b.monitoring_enabled ? 1 : 0
      return aVal - bVal
    },
  },
]

// Edit Unit Form
const editUnitForm = ref({
  area_tag: undefined as string | undefined,
  unit_name: '',
  unit_number: '',
  unit_type: 'Facility' as 'Facility' | 'Home', // Default value is Facility
})

// Location Tag Options (for Building)
const locationTagOptions = ref<TagCatalogItem[]>([])
const locationTagSearchValue = ref('')

// Area Tag Options
const areaTagOptions = ref<TagCatalogItem[]>([])
const areaTagSearchValue = ref('')

// 获取显示用的 building 和 floor（DB 保证不为空，默认值：building="-", floor="1F"）
const getDisplayBuilding = (unit: Unit): string => {
  return unit.building || '-' // Fallback for safety, but DB guarantees non-null
}

const getDisplayFloor = (unit: Unit): string => {
  return unit.floor || '1F' // Fallback for safety, but DB guarantees non-null
}

// Unit 网格计算 - 按 UnitNumber 数字排序
const unitGrid = computed(() => {
  // 使用 currentBuildingForGrid 而不是 selectedBuilding
  const building = currentBuildingForGrid.value

  // 筛选当前 building 和 floor 的 units
  // Building 为空时显示 "-"，Floor 为空时显示 "1"
  const filteredUnits = units.value.filter((unit) => {
    const displayBuilding = getDisplayBuilding(unit)
    const displayFloor = getDisplayFloor(unit)
    
    // 如果是虚拟的 "-" building，使用 location_tag 匹配
    if (building?.building_name === '-' && building.building_id?.startsWith('na-building-')) {
      const locationTag = building.location_tag || ''
      // DB 保证 building 和 floor 不为空，直接比较
      return (
        unit.building === '-' &&
        unit.floor === (selectedFloor.value || '1F') &&
        unit.location_tag === locationTag
      )
    } else {
      const selectedBuildingName = building?.building_name || '-'
      const selectedFloorValue = selectedFloor.value || '1F'
      
      return (
        displayBuilding === selectedBuildingName &&
        displayFloor === selectedFloorValue
      )
    }
  })

  // 按 unit_number 数字排序（从小到大）
  const sortedUnits = [...filteredUnits].sort((a, b) => {
    const numA = parseInt(a.unit_number) || 0
    const numB = parseInt(b.unit_number) || 0
    return numA - numB
  })

  // 直接返回排序后的数组，CSS Grid 会自动从左到右、从上到下排列
  return sortedUnits
})

// 获取所有 units（用于显示没有 building 的 units）
const allUnits = ref<Unit[]>([])

// 获取 Building 列表
const fetchBuildings = async () => {
  try {
    buildings.value = await getBuildingsApi()
  } catch (error: any) {
    message.error('Failed to fetch buildings: ' + (error.message || 'Unknown error'))
  }
}

// 获取所有 units（用于显示没有 building 的 units）
const fetchAllUnits = async () => {
  try {
    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      return
    }

    const result = await getUnitsApi({
      tenant_id: tenantId,
      is_active: true,
    })

    allUnits.value = result.items
  } catch (error: any) {
    console.error('Failed to fetch all units:', error)
    allUnits.value = []
  }
}

// 获取 Unit 列表
const fetchUnits = async () => {
  const building = currentBuildingForGrid.value
  
  // Building 为空时使用 "-"，Floor 为空时使用 "1F"（与 DB 默认值一致）
  const displayBuilding = building?.building_name || (selectedLocationTag.value ? '-' : null)
  const displayFloor = selectedFloor.value || '1F'
  
  if (!building && !selectedFloor.value && !selectedLocationTag.value) {
    units.value = []
    return
  }

  try {
    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      message.error('Unable to get tenant ID')
      return
    }

    // 构建查询参数
    const queryParams: any = {
      tenant_id: tenantId,
      is_active: true,
    }

    // 如果 building 是 "-"，查询 building = "-" 的 units（DB 保证不为空）
    if (displayBuilding === '-' || !displayBuilding) {
      // 查询 building = "-" 的 units，按 location_tag 查询
      if (selectedLocationTag.value) {
        queryParams.location_tag = selectedLocationTag.value
        queryParams.building = '-'
      } else {
        // 如果没有 location_tag，查询所有 units 然后过滤
        const result = await getUnitsApi(queryParams)
        units.value = result.items.filter((unit) => unit.building === '-')
        return
      }
    } else {
      // 真实 building：必须同时匹配 building_name 和 location_tag
      queryParams.building = displayBuilding
      if (selectedLocationTag.value) {
        queryParams.location_tag = selectedLocationTag.value
      }
    }

    // 如果 floor 是 "1F"，查询 floor = "1F" 的 units（DB 保证不为空）
    if (displayFloor === '1F') {
      queryParams.floor = '1F'
      const result = await getUnitsApi(queryParams)
      units.value = result.items
    } else {
      queryParams.floor = displayFloor
      const result = await getUnitsApi(queryParams)
      units.value = result.items
    }
  } catch (error: any) {
    message.error('Failed to fetch units: ' + (error.message || 'Unknown error'))
  }
}

// 点击 headline 行的 Building 标签（独立的组件实例，但会同步关闭另一处）
const handleToggleBuildingTag = (building: Building) => {
  const buildingId = building.building_id || ''

  // headline 行：如果点击的是已展开的 Building，收起它
  if (expandedBuildings.value.has(buildingId)) {
    expandedBuildings.value = new Set()
    selectedFloor.value = ''
    units.value = []
    currentBuildingForGrid.value = null
  } else {
    // headline 行：只展开当前点击的 Building，立即关闭其他所有 Building
    expandedBuildings.value = new Set([buildingId])
    // 同步：关闭左侧列的相同 Building（如果之前是展开的）
    if (selectedBuilding.value?.building_id === buildingId) {
      selectedBuilding.value = null
    }
    selectedFloor.value = ''
    units.value = []
    currentBuildingForGrid.value = null
  }
}

// 点击左侧列的 Building 卡片（独立的组件实例，但会同步关闭另一处）
const handleToggleBuildingCard = (building: Building) => {
  const buildingId = building.building_id || ''

  // 左侧列：如果点击的是已选中的 Building，取消选中（收起楼层列表）
  if (selectedBuilding.value?.building_id === buildingId) {
    selectedBuilding.value = null
    selectedFloor.value = ''
    units.value = []
    currentBuildingForGrid.value = null
  } else {
    // 左侧列：只展开当前点击的 Building，立即关闭其他所有 Building
    selectedBuilding.value = building
    // 同步：关闭 headline 行的相同 Building（如果之前是展开的）
    if (expandedBuildings.value.has(buildingId)) {
      expandedBuildings.value = new Set()
    }
    selectedFloor.value = ''
    units.value = []
    currentBuildingForGrid.value = null
  }
}



// 选择楼层
const handleSelectFloor = async (building: Building, floor: string) => {
  const buildingId = building.building_id || ''

  // 设置用于 unitGrid 的 building
  // 如果是虚拟的 "-" building，需要特殊处理
  if (building.building_name === '-' && building.building_id?.startsWith('na-building-')) {
    // 虚拟 building：设置 location_tag 用于查询
    selectedLocationTag.value = building.location_tag || ''
    currentBuildingForGrid.value = null
  } else {
    // 真实 building：保存 building 和 location_tag（用于查询时过滤）
    currentBuildingForGrid.value = building
    selectedLocationTag.value = building.location_tag || '' // 保存 location_tag 用于查询过滤
  }

  // 如果是从 headline 行调用的（expandedBuildings 中有这个 building），不设置 selectedBuilding
  // 如果是从左侧列调用的，设置 selectedBuilding
  if (!expandedBuildings.value.has(buildingId)) {
    // 从左侧列调用：设置 selectedBuilding
    selectedBuilding.value = building
    // 同步：关闭 headline 行的相同 Building（如果之前是展开的）
    if (expandedBuildings.value.has(buildingId)) {
      expandedBuildings.value = new Set()
    }
  } else {
    // 从 headline 行调用：不设置 selectedBuilding，避免左侧列展开
    // 但需要关闭左侧列（如果之前是展开的）
    if (selectedBuilding.value?.building_id === buildingId) {
      selectedBuilding.value = null
    }
  }

  // Floor 为空时默认使用 "1F"（与 DB 默认值一致）
  selectedFloor.value = floor || '1F'

  // 等待 Vue 响应式更新
  await nextTick()

  // 获取 units
  await fetchUnits()
}

// 获取 Building 显示名称（tag_name-Building_name）- 使用 computed 缓存
// UI层将 location_tag 映射为 tag_name 用于显示
const buildingsWithDisplayName = computed(() => {
  const buildingList = buildings.value.map((building) => {
    const tagName = building.location_tag || '' // API返回的是 location_tag
    const buildingName = building.building_name || ''
    
    // 显示名称格式：location_tag-Building_name
    // 如果两者都有，显示 "tag-building"
    // 如果 building_name 是 "-"，显示 "tag--"（表示没有 building_name）
    // 如果只有 building_name，显示 "building"
    let displayName = ''
    if (tagName && buildingName && buildingName !== '-') {
      displayName = `${tagName}-${buildingName}`
    } else if (tagName && buildingName === '-') {
      displayName = `${tagName}--` // building_name 是 "-"，显示 "tag--"
    } else if (tagName) {
      displayName = tagName // 只有 location_tag，显示 "tag"（不应该出现，因为 DB 保证 building_name 不为空）
    } else if (buildingName && buildingName !== '-') {
      displayName = buildingName
    } else {
      displayName = 'Unnamed Building'
    }
    
    return {
      ...building,
      tag_name: tagName, // UI显示用的 tag_name
      displayName,
    }
  })
  
  // 添加虚拟的 "-" building（用于显示 building = "-" 的 units）
  // 检查是否有 building = "-" 的 units（DB 保证不为空）
  const hasUnitsWithoutBuilding = allUnits.value.some((unit) => unit.building === '-')
  if (hasUnitsWithoutBuilding) {
    // 按 location_tag 分组，为每个 location_tag 创建一个虚拟 building
    const locationTags = new Set<string>()
    allUnits.value.forEach((unit) => {
      if (unit.building === '-' && unit.location_tag) {
        locationTags.add(unit.location_tag)
      }
    })
    
    locationTags.forEach((locationTag) => {
      buildingList.push({
        building_id: `na-building-${locationTag}`,
        building_name: '-',
        floors: 1, // 默认 1 层
        tenant_id: 'tenant-1',
        location_tag: locationTag,
        displayName: `${locationTag}--`,
        tag_name: locationTag,
      } as any)
    })
  }
  
  return buildingList
})

// 创建 Building
const handleCreateBuilding = async () => {
  try {
    // location_tag 和 building_name 至少需要一个
    if (!createBuildingForm.value.location_tag && !createBuildingForm.value.building_name) {
      message.error('Please provide either location_tag or Building name')
      return
    }
    
    if (!createBuildingForm.value.floors) {
      message.error('Please fill in floors')
      return
    }

    // 如果 building_name 为空，自动设置为 '-'（保证不为空）
    const buildingName = createBuildingForm.value.building_name?.trim() || '-'

    await createBuildingApi({
      building_name: buildingName,
      floors: createBuildingForm.value.floors,
      location_tag: createBuildingForm.value.location_tag || undefined,
    } as any)

    message.success('Building created successfully')
    resetCreateBuildingForm()
    fetchBuildings()
  } catch (error: any) {
    message.error('Failed to create building: ' + (error.message || 'Unknown error'))
  }
}

// 重置 Create Building 表单
const resetCreateBuildingForm = () => {
  createBuildingForm.value = {
    location_tag: undefined,
    building_name: '',
    floors: 1,
  }
}

// 编辑 Building（进入编辑模式）
// 编辑 Building
const handleEditBuilding = (building: Building) => {
  editingBuildingId.value = building.building_id || null
  editingBuildingForm.value = {
    location_tag: building.location_tag || undefined,
    building_name: building.building_name || '',
  }
}

// 保存 Building（退出编辑模式并提交）
const handleSaveBuilding = async (building: Building) => {
  try {
    if (!building.building_id) {
      message.error('Building ID is missing')
      editingBuildingId.value = null
      return
    }

    // 如果 building_name 为空，自动设置为 '-'（保证不为空）
    const buildingName = editingBuildingForm.value.building_name?.trim() || '-'

    // 提交更新
    await updateBuildingApi(building.building_id, {
      building_name: buildingName,
      location_tag: editingBuildingForm.value.location_tag || undefined,
    } as any)

    message.success('Building updated successfully')

    // 退出编辑模式
    editingBuildingId.value = null

    // 刷新 Building 列表
    await fetchBuildings()

    // 如果修改的是当前选中的 Building，保持选中状态（selectedBuilding 不变）
    // selectedBuilding 是 computed，会自动更新
  } catch (error: any) {
    message.error('Failed to update building: ' + (error.message || 'Unknown error'))
  }
}

// 删除楼层
const handleDeleteFloor = async (building: Building, floorNum: number) => {
  try {
    // 检查该楼层是否有 Location
    const floorStr = `${floorNum}F`
    const unitParams = {
      building: building.building_name,
      floor: floorStr,
      is_active: true,
    }
    const unitResult = await getUnitsApi(unitParams)

    if (unitResult.items && unitResult.items.length > 0) {
      message.error('Still include Unit')
      return
    }

    // 确认删除楼层
    if (!building.building_id) {
      message.error('Building ID is missing')
      return
    }

    // 如果删除的楼层是当前选中的楼层，清空选择
    if (selectedBuilding.value?.building_id === building.building_id && selectedFloor.value === floorStr) {
      selectedFloor.value = ''
      units.value = []
    }

    // 更新 Building 的 floors 数量
    const newFloors = building.floors - 1
    if (newFloors < 1) {
      message.error('Building must have at least one floor')
      return
    }

    await updateBuildingApi(building.building_id, { floors: newFloors })
    message.success('Floor deleted successfully')

    // 刷新 Building 列表
    await fetchBuildings()
  } catch (error: any) {
    message.error('Failed to delete floor: ' + (error.message || 'Unknown error'))
  }
}

// 删除 Building
const handleDeleteBuilding = async (building: Building) => {
  try {
    // 检查是否有 Unit
    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      message.error('Unable to get tenant ID')
      return
    }

    const unitParams = {
      tenant_id: tenantId,
      building: building.building_name,
      is_active: true,
    }
    const unitResult = await getUnitsApi(unitParams)

    if (unitResult.items && unitResult.items.length > 0) {
      message.error('Still include Unit')
      return
    }

    // 确认删除
    if (!building.building_id) {
      message.error('Building ID is missing')
      return
    }

    await deleteBuildingApi(building.building_id)
    message.success('Building deleted successfully')

    // 刷新 Building 列表
    await fetchBuildings()

    // 如果删除的是左侧列选中的 Building，清空选择
    if (selectedBuilding.value?.building_id === building.building_id) {
      selectedBuilding.value = null
      selectedFloor.value = ''
      units.value = []
    }
    // 如果删除的是 headline 行展开的 Building，清空展开状态
    if (expandedBuildings.value.has(building.building_id || '')) {
      expandedBuildings.value = new Set()
    }
  } catch (error: any) {
    message.error('Failed to delete building: ' + (error.message || 'Unknown error'))
  }
}

// 点击网格单元格
const handleCellClick = async (unit: Unit | null, _index: number) => {
  try {
    // 加载 area tag 选项
    await fetchAreaTags()

    if (unit) {
      // Existing Unit: 打开编辑 Unit 界面
      editingUnit.value = unit
      // 初始化表单数据
      editUnitForm.value = {
        area_tag: unit.area_tag,
        unit_name: unit.unit_name,
        unit_number: unit.unit_number,
        unit_type: (unit as any).unit_type || 'Facility',
      }
      await fetchRoomsWithBeds(unit.unit_id)
      showEditUnitModal.value = true
      await nextTick()
    } else {
      // 空白单元格：也打开编辑 Unit 界面，但 editingUnit 为 null
      editingUnit.value = null
      roomsWithBeds.value = []
      // 初始化空表单
      editUnitForm.value = {
        area_tag: undefined,
        unit_name: '',
        unit_number: '',
        unit_type: 'Facility',
      }
      showEditUnitModal.value = true
      await nextTick()
    }
  } catch (error: any) {
    message.error('Failed to handle cell click: ' + (error.message || 'Unknown error'))
  }
}

// 创建 Unit
const handleCreateUnit = async () => {
  try {
    if (!createUnitForm.value.unit_number || !createUnitForm.value.unit_name) {
      message.error('Please fill in all required fields')
      return
    }

    // Building 和 Floor 是可选的，如果为空会使用默认值

    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      message.error('Unable to get tenant ID')
      return
    }

    // Building 和 Floor 的处理逻辑（所有类型都是可选的）
    // 如果为空，使用默认值：building 为 '-'，floor 为 '1F'（与 DB 默认值一致）
    const buildingValue: string = createUnitForm.value.building || selectedBuilding.value?.building_name || '-'
    const floorValue: string = createUnitForm.value.floor || selectedFloor.value || '1F'

    await createUnitApi({
      unit_number: createUnitForm.value.unit_number,
      unit_name: createUnitForm.value.unit_name,
      unit_type: createUnitForm.value.unit_type,
      building: buildingValue,
      floor: floorValue,
      location_tag: createUnitForm.value.location_tag,
      area_tag: createUnitForm.value.area_tag,
    })

    message.success('Unit created successfully')
    showCreateUnitModal.value = false
    resetCreateUnitForm()
    fetchUnits()
  } catch (error: any) {
    message.error('Failed to create unit: ' + (error.message || 'Unknown error'))
  }
}

// 重置 Create Unit 表单
const resetCreateUnitForm = () => {
  createUnitForm.value = {
    unit_number: '',
    unit_name: '',
    unit_type: 'Facility',
    location_tag: undefined,
    area_tag: undefined,
    building: '',
    floor: '',
  }
  // selectedCellIndex.value = null
}

// 获取 Room 和 Bed 列表
const fetchRoomsWithBeds = async (unitId: string) => {
  try {
    const result = await getRoomsApi({ unit_id: unitId })
    roomsWithBeds.value = result
    
    // 排序：RoomName = UnitName 的 Room 放在第一位
    const unitName = editingUnit.value?.unit_name || ''
    if (unitName) {
      roomsWithBeds.value.sort((a, b) => {
        if (a.room_name === unitName && b.room_name !== unitName) return -1
        if (a.room_name !== unitName && b.room_name === unitName) return 1
        return 0
      })
    }
  } catch (error: any) {
    message.error('Failed to fetch rooms and beds: ' + (error.message || 'Unknown error'))
    // 即使出错也显示空列表，让用户可以添加
    roomsWithBeds.value = []
  }
}

// 获取 Location Tag 选项（tag_type 必须是 'location_tag'）
const fetchLocationTags = async () => {
  try {
    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      return
    }

    const result = await getTagsApi({
      tenant_id: tenantId,
      tag_type: 'location_tag',
    })

    locationTagOptions.value = result.items
  } catch (error: any) {
    console.error('Failed to fetch location tags:', error)
    locationTagOptions.value = []
  }
}

// 处理 Location Tag 搜索
const handleLocationTagSearch = (value: string) => {
  locationTagSearchValue.value = value
}

// 处理 Location Tag 失焦（当用户输入新值并离开输入框时）
// 注意：不再立即创建 tag，而是等到点击 OK 时与 Unit 一起创建
const handleLocationTagBlur = async () => {
  // 从搜索值或当前表单值获取输入的值
  // 如果 tag 不存在，先设置为表单值，等点击 OK 时再创建
  // 这里不再立即创建 tag
}

// 获取 Area Tag 选项（tag_type 必须是 'area_tag'）
const fetchAreaTags = async () => {
  try {
    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      return
    }

    const result = await getTagsApi({
      tenant_id: tenantId,
      tag_type: 'area_tag',
    })

    areaTagOptions.value = result.items
  } catch (error: any) {
    console.error('Failed to fetch area tags:', error)
    areaTagOptions.value = []
  }
}

// 处理 Area Tag 搜索
const handleAreaTagSearch = (value: string) => {
  areaTagSearchValue.value = value
}

// 处理 Area Tag 失焦（当用户输入新值并离开输入框时）
// 注意：不再立即创建 tag，而是等到点击 OK 时与 Unit 一起创建
const handleAreaTagBlur = async () => {
  const value = areaTagSearchValue.value.trim()
  if (value && value !== editUnitForm.value.area_tag) {
    // 检查是否是新建的 tag（不在选项中）
    const exists = areaTagOptions.value.some((tag) => tag.tag_name === value)
    if (exists) {
      // 如果 tag 已存在，直接设置为选中值
      editUnitForm.value.area_tag = value
    } else {
      // 如果 tag 不存在，先设置为表单值，等点击 OK 时再创建
      editUnitForm.value.area_tag = value
    }
    // 清空搜索值
    areaTagSearchValue.value = ''
  }
}

// 获取 Edit Unit 标题
const getEditUnitTitle = () => {
  if (editingUnit.value) {
    const areaTag = editUnitForm.value.area_tag || editingUnit.value.area_tag || ''
    const unitName = editUnitForm.value.unit_name || editingUnit.value.unit_name || ''
    if (areaTag && unitName) {
      return `Edit Unit:  ${areaTag} - ${unitName}`
    } else if (unitName) {
      return `Edit Unit:  ${unitName}`
    }
  }
  return 'Edit Unit'
}

// 重置编辑 Unit 表单
const resetEditUnitForm = () => {
  editingUnit.value = null
  roomsWithBeds.value = []
  showAddRoomForm.value = false
  newRoomName.value = ''
  expandedRooms.value = new Set()
  editingRoomId.value = null
  editingRoomName.value = ''
  editUnitForm.value = {
    area_tag: undefined,
    unit_name: '',
    unit_number: '',
    unit_type: 'Facility',
  }
  areaTagSearchValue.value = ''
  isDeviceMode.value = false
}

// 判断设备是否已绑定
const isDeviceBound = (device: Device): boolean => {
  const deviceAny = device as any
  return !!(deviceAny.bound_room_id || deviceAny.bound_bed_id || deviceAny.location_id)
}

// 切换设备展开/收起
const toggleDevicesExpand = (id: string) => {
  if (expandedDevices.value.has(id)) {
    expandedDevices.value.delete(id)
  } else {
    expandedDevices.value.add(id)
  }
}

// 获取设备类型图标文本
const getDeviceTypeIcon = (deviceType: string): string => {
  const iconMap: Record<string, string> = {
    'Radar': '📡', // 雷达图标（可以用 SVG 或图标组件替换）
    'Sleepad': '🛏️', // 板图标
    'SleepPad': '🛏️',
  }
  return iconMap[deviceType] || '📱'
}

// 获取已绑定到 Room 的设备
const getRoomDevices = (roomId: string): Device[] => {
  // 从所有设备中过滤出绑定到该 Room 的设备
  const boundDevices = allDevices.value.filter((device: any) => {
    return device.bound_room_id === roomId
  })
  return boundDevices
}

// 获取已绑定到 Bed 的设备
const getBedDevices = (bedId: string): Device[] => {
  // 从所有设备中过滤出绑定到该 Bed 的设备
  const boundDevices = allDevices.value.filter((device: any) => {
    return device.bound_bed_id === bedId
  })
  return boundDevices
}

// 获取已绑定到 Unit 的设备
const getUnitDevices = (unitId: string): Device[] => {
  // 从所有设备中过滤出绑定到该 Unit 的设备（通过 location_id）
  const boundDevices = allDevices.value.filter((device: any) => {
    return device.location_id === unitId
  })
  return boundDevices
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
const devContainerDevices = computed(() => {
  // 显示所有可用设备（包括已绑定和未绑定的）
  return allDevices.value
})

// 处理添加设备到 Room
const handleAddDeviceToRoom = async (roomId: string) => {
  // 确保设备列表是最新的
  await fetchAllDevices()
  // 设置设备选择弹窗的目标
  selectedTarget.value = { type: 'room', id: roomId }
  // 显示所有设备（已绑定的会显示为已勾选）
  devicesForSelection.value = [...allDevices.value]
  showDeviceSelectModal.value = true
  
  // 更新 Dev 容器显示该 Room 的设备
  devContainerTarget.value = { type: 'room', id: roomId }
  // 确保设备模式已打开
  if (!isDeviceMode.value) {
    isDeviceMode.value = true
  }
}

// 处理添加设备到 Bed
const handleAddDeviceToBed = async (bedId: string) => {
  // 确保设备列表是最新的
  await fetchAllDevices()
  // 设置设备选择弹窗的目标
  selectedTarget.value = { type: 'bed', id: bedId }
  // 显示所有设备（已绑定的会显示为已勾选）
  devicesForSelection.value = [...allDevices.value]
  showDeviceSelectModal.value = true
  
  // 更新 Dev 容器显示该 Bed 的设备
  devContainerTarget.value = { type: 'bed', id: bedId }
  // 确保设备模式已打开
  if (!isDeviceMode.value) {
    isDeviceMode.value = true
  }
}

// 处理设备编辑
const handleEditDevice = (device: Device) => {
  // TODO: 实现设备编辑功能
  console.log('Edit device:', device)
  message.info('Device edit feature coming soon')
}

// 处理设备 checkbox 点击（绑定/解绑）
const handleDeviceCheckboxChange = async (event: any, device: Device) => {
  const checked = event.target.checked
  
  try {
    if (!device.device_id) {
      message.error('Device ID is required for binding')
      return
    }
    
    if (checked) {
      // 绑定设备到当前 Unit
      if (!editingUnit.value?.unit_id) {
        message.error('Please select a unit first')
        return
      }
      
      await updateDeviceApi(device.device_id, {
        location_id: editingUnit.value.unit_id,
        bound_room_id: null,
        bound_bed_id: null,
      })
      message.success(`Device "${device.device_name}" bound to unit successfully`)
      // 默认展开新绑定的设备
      expandedDevices.value.add(`device-${device.device_id}`)
    } else {
      // 解绑设备
      await updateDeviceApi(device.device_id, {
        location_id: null,
        bound_room_id: null,
        bound_bed_id: null,
      })
      message.success(`Device "${device.device_name}" unbound successfully`)
    }
    
    // 刷新所有设备列表（包括已绑定的）
    await fetchAllDevices()
  } catch (error: any) {
    message.error((checked ? 'Failed to bind device: ' : 'Failed to unbind device: ') + (error.message || 'Unknown error'))
    // 恢复 checkbox 状态
    event.target.checked = !checked
  }
}

// 处理设备删除（解绑）
const handleDeleteDevice = async (device: Device) => {
  try {
    if (!device.device_id) {
      message.error('Device ID is required for unbinding')
      return
    }
    
    // 调用 API 解绑设备（使用 device_id）
    await updateDeviceApi(device.device_id, {
      location_id: null,
      bound_room_id: null,
      bound_bed_id: null,
    })
    message.success(`Device "${device.device_name}" unbound successfully`)
    // 刷新所有设备列表（包括已绑定的）
    await fetchAllDevices()
  } catch (error: any) {
    message.error('Failed to unbind device: ' + (error.message || 'Unknown error'))
  }
}

// 获取所有设备列表（approved，包括已绑定的）
const fetchAllDevices = async () => {
  try {
    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      message.error('No tenant ID available')
      return
    }

    // 获取所有 approved 设备（包括已绑定的）
    // 通过 include_bound: true 参数来获取所有设备（包括已绑定的）
    const result = await getDevicesApi({
      tenant_id: tenantId,
      business_access: 'approved',
      include_bound: true, // 自定义参数，用于获取所有设备（包括已绑定的）
    } as any)

    allDevices.value = result.items
    
    // 过滤出未绑定的设备作为可用设备
    availableDevices.value = result.items.filter((device: any) => {
      return !device.bound_room_id && !device.bound_bed_id && !device.location_id
    })
  } catch (error: any) {
    message.error('Failed to fetch devices: ' + (error.message || 'Unknown error'))
    allDevices.value = []
    availableDevices.value = []
  }
}

// 拖拽相关状态
const draggedDeviceId = ref<string | null>(null)
const dragOverTarget = ref<{ type: 'unit' | 'room' | 'bed'; id: string } | null>(null)

// 处理设备拖拽开始
const handleDeviceDragStart = (event: DragEvent, device: Device) => {
  if (!event.dataTransfer) return
  
  draggedDeviceId.value = device.device_id
  
  // 创建自定义拖拽预览（只显示 DeviceName）
  const dragImage = document.createElement('div')
  dragImage.textContent = device.device_name
  dragImage.style.cssText = 'position: absolute; top: -1000px; padding: 8px 12px; background: #1890ff; color: white; border-radius: 4px; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);'
  document.body.appendChild(dragImage)
  event.dataTransfer.setDragImage(dragImage, 0, 0)
  
  // 传递设备数据
  event.dataTransfer.setData('application/json', JSON.stringify({
    device_id: device.device_id,
    device_name: device.device_name,
  }))
  
  // 设置拖拽效果
  event.dataTransfer.effectAllowed = 'move'
  
  // 清理
  setTimeout(() => {
    if (document.body.contains(dragImage)) {
      document.body.removeChild(dragImage)
    }
  }, 0)
}

// 处理拖拽悬停
const handleDragOver = (event: DragEvent, type: 'unit' | 'room' | 'bed', id: string) => {
  event.preventDefault()
  event.dataTransfer!.dropEffect = 'move'
  dragOverTarget.value = { type, id }
}

// 处理拖拽离开
const handleDragLeave = () => {
  dragOverTarget.value = null
}

// 处理设备放置
const handleDeviceDrop = async (event: DragEvent, type: 'unit' | 'room' | 'bed', id: string) => {
  event.preventDefault()
  dragOverTarget.value = null
  
  if (!event.dataTransfer) return
  
  try {
    const data = JSON.parse(event.dataTransfer.getData('application/json'))
    const deviceId = data.device_id
    
    if (!deviceId) {
      message.error('Device ID is required for binding')
      return
    }
    
    // 调用 API 绑定设备（使用 device_id）
    await updateDeviceApi(deviceId, {
      location_id: type === 'unit' ? id : (editingUnit.value?.unit_id || null),
      bound_room_id: type === 'room' ? id : null,
      bound_bed_id: type === 'bed' ? id : null,
    })
    
    console.log('Device binding:', { deviceId, type, id, deviceName: data.device_name })
    const typeName = type === 'unit' ? 'unit' : type === 'room' ? 'room' : 'bed'
    message.success(`Device "${data.device_name}" bound to ${typeName} successfully`)
    
    // 刷新所有设备列表（包括已绑定的）
    await fetchAllDevices()
    
    // 默认展开新绑定的设备
    expandedDevices.value.add(`device-${deviceId}`)
    
    // 更新 Dev 容器目标（如果拖拽到的是当前目标，或者当前没有目标）
    if (type === 'unit' && editingUnit.value && id === editingUnit.value.unit_id) {
      devContainerTarget.value = { type: 'unit', id: id }
    } else if (type === 'room') {
      devContainerTarget.value = { type: 'room', id: id }
    } else if (type === 'bed') {
      devContainerTarget.value = { type: 'bed', id: id }
    }
  } catch (error: any) {
    message.error('Failed to bind device: ' + (error.message || 'Unknown error'))
  }
}

// 处理 Add Dev 按钮点击（切换展开/收回 Room）
const handleAddDev = async () => {
  if (isDeviceMode.value) {
    // 退出 Device 模式：收回所有 Room
    isDeviceMode.value = false
    expandedRooms.value.clear()
    devContainerTarget.value = null
  } else {
    // 进入 Device 模式：展开所有 Room 并获取所有设备（包括已绑定的）
    isDeviceMode.value = true
    roomsWithBeds.value.forEach((room) => {
      if (room.room_id) {
        expandedRooms.value.add(room.room_id)
      }
    })
    // 获取所有设备列表（包括已绑定的）
    await fetchAllDevices()
    // 默认显示 Unit 的设备
    if (editingUnit.value) {
      devContainerTarget.value = { type: 'unit', id: editingUnit.value.unit_id }
    }
  }
}

// 保存 Unit 信息
const handleSaveUnit = async () => {
  try {
    if (!editUnitForm.value.unit_name || !editUnitForm.value.unit_number) {
      message.error('Unit name and Unit number are required')
      return
    }

    const userInfo = userStore.getUserInfo
    const tenantId = userInfo?.tenant_id

    if (!tenantId) {
      message.error('No tenant ID available')
      return
    }

    // 在创建/更新 Unit 之前，先检查并创建需要的 tag
    // 1. 检查并创建 area_tag（如果不存在）
    if (editUnitForm.value.area_tag) {
      const areaTagExists = areaTagOptions.value.some((tag) => tag.tag_name === editUnitForm.value.area_tag)
      if (!areaTagExists) {
        try {
          await createTagApi({
            tenant_id: tenantId,
            tag_type: 'area_tag',
            tag_name: editUnitForm.value.area_tag,
          })
          // 刷新 area tag 选项
          await fetchAreaTags()
        } catch (error: any) {
          message.error('Failed to create area tag: ' + (error.message || 'Unknown error'))
          return
        }
      }
    }

    // 2. 检查并创建 location_tag（如果不存在）
    // 从 currentBuildingForGrid 获取 location_tag，如果没有则从 selectedLocationTag 获取
    const locationTagValue = currentBuildingForGrid.value?.location_tag || selectedLocationTag.value || undefined
    if (locationTagValue) {
      const locationTagExists = locationTagOptions.value.some((tag) => tag.tag_name === locationTagValue)
      if (!locationTagExists) {
        try {
          await createTagApi({
            tenant_id: tenantId,
            tag_type: 'location_tag',
            tag_name: locationTagValue,
          })
          // 刷新 location tag 选项
          await fetchLocationTags()
        } catch (error: any) {
          message.error('Failed to create location tag: ' + (error.message || 'Unknown error'))
          return
        }
      }
    }

    if (!editingUnit.value) {
      // 创建新的 Unit
      // Building 和 Floor 是可选的，如果为空会使用默认值
      // 如果为空，使用默认值：building 为 '-'，floor 为 '1F'（与 DB 默认值一致）
      const buildingValue: string = currentBuildingForGrid.value?.building_name || '-'
      const floorValue: string = selectedFloor.value || '1F'

      const newUnit = await createUnitApi({
        unit_number: editUnitForm.value.unit_number,
        unit_name: editUnitForm.value.unit_name,
        unit_type: editUnitForm.value.unit_type || 'Facility',
        building: buildingValue,
        floor: floorValue,
        location_tag: locationTagValue,
        area_tag: editUnitForm.value.area_tag,
      })

      message.success('Unit created successfully')
      
      // 关闭模态框并重置表单
      resetEditUnitForm()
      showEditUnitModal.value = false
      
      // 刷新 Unit 列表
      await fetchUnits()
      
      // 自动打开新创建的 Unit（复用 handleCellClick 逻辑）
      await handleCellClick(newUnit, -1)
    } else {
      // 更新现有 Unit（unit_number 不能更新）
      await updateUnitApi(editingUnit.value.unit_id, {
        unit_name: editUnitForm.value.unit_name,
        unit_type: editUnitForm.value.unit_type,
        area_tag: editUnitForm.value.area_tag,
      })

      message.success('Unit updated successfully')
      resetEditUnitForm()
      showEditUnitModal.value = false
      await fetchUnits()
    }
  } catch (error: any) {
    message.error('Failed to save unit: ' + (error.message || 'Unknown error'))
  }
}

// 删除 Unit
const handleDeleteUnit = async () => {
  if (!editingUnit.value) {
    message.error('No unit selected')
    return
  }

  try {
    // 检查 Unit 下是否有任何绑定关系
    // 1. 检查 Room 和 Bed
    const hasRooms = roomsWithBeds.value.length > 0
    const bedCount = roomsWithBeds.value.reduce((total, room) => total + (room.beds?.length || 0), 0)
    const hasBeds = bedCount > 0
    
    // 2. 检查 Device
    const unitDevices = getUnitDevices(editingUnit.value.unit_id)
    const hasDevices = unitDevices.length > 0
    
    // 3. 检查 Caregiver
    const unitCaregivers = await getUnitCaregivers(editingUnit.value.unit_id)
    const hasCaregivers = unitCaregivers.length > 0
    
    // 4. 检查 Residents
    const unitResidents = await getUnitResidents(editingUnit.value.unit_id)
    const hasResidents = unitResidents.length > 0
    
    // 如果 Unit 下有任何绑定关系，拒绝删除
    if (hasRooms || hasBeds || hasDevices || hasCaregivers || hasResidents) {
      // 收集所有错误信息
      const errors: string[] = []
      
      if (hasRooms) {
        const roomCount = roomsWithBeds.value.length
        errors.push(`${roomCount} room${roomCount > 1 ? 's' : ''}`)
      }
      
      if (hasBeds) {
        errors.push(`${bedCount} bed${bedCount > 1 ? 's' : ''}`)
      }
      
      if (hasDevices) {
        errors.push(`${unitDevices.length} device${unitDevices.length > 1 ? 's' : ''}`)
      }
      
      if (hasCaregivers) {
        errors.push(`${unitCaregivers.length} caregiver${unitCaregivers.length > 1 ? 's' : ''}`)
      }
      
      if (hasResidents) {
        errors.push(`${unitResidents.length} resident${unitResidents.length > 1 ? 's' : ''}`)
      }
      
      let errorMsg = 'Cannot delete unit. The unit still contains: '
      errorMsg += errors.join(', ')
      errorMsg += '. Please delete all associated items first.'
      
      message.error(errorMsg)
      return
    }

    // 确认删除
    await new Promise<void>((resolve, reject) => {
      Modal.confirm({
        title: 'Confirm Delete',
        content: `Are you sure you want to delete unit "${editingUnit.value?.unit_name}" (${editingUnit.value?.unit_number})? This action cannot be undone.`,
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: () => {
          resolve()
        },
        onCancel: () => {
          reject(new Error('User cancelled'))
        },
      })
    })

    await deleteUnitApi(editingUnit.value.unit_id)
    
    message.success('Unit deleted successfully')
    resetEditUnitForm()
    showEditUnitModal.value = false
    await fetchUnits()
  } catch (error: any) {
    if (error.message !== 'User cancelled') {
      message.error('Failed to delete unit: ' + (error.message || 'Unknown error'))
    }
  }
}

// 展开/收起 Room
const toggleRoom = (roomId: string) => {
  if (expandedRooms.value.has(roomId)) {
    expandedRooms.value.delete(roomId)
  } else {
    expandedRooms.value.add(roomId)
  }
}

// 显示添加 Room 表单
const handleShowAddRoomForm = () => {
  showAddRoomForm.value = true
  newRoomName.value = ''
  nextTick(() => {
    if (roomNameInputRef.value && roomNameInputRef.value.$el) {
      roomNameInputRef.value.$el.querySelector('input')?.focus()
    } else if (roomNameInputRef.value && roomNameInputRef.value.focus) {
      roomNameInputRef.value.focus()
    }
  })
}

// 取消添加 Room
const handleCancelAddRoom = () => {
  showAddRoomForm.value = false
  newRoomName.value = ''
}

// 添加 Room
const handleAddRoom = async () => {
  try {
    if (!editingUnit.value) {
      message.error('No unit selected')
      return
    }

    if (!newRoomName.value.trim()) {
      message.error('Please input room name')
      return
    }

    await createRoomApi({
      unit_id: editingUnit.value.unit_id,
      room_name: newRoomName.value.trim(),
      is_default: false,
    })

    // 刷新列表
    await fetchRoomsWithBeds(editingUnit.value.unit_id)

    message.success('Room added successfully')
    showAddRoomForm.value = false
    newRoomName.value = ''
  } catch (error: any) {
    message.error('Failed to add room: ' + (error.message || 'Unknown error'))
  }
}

// 获取可用的床字母（A-Z）
const getAvailableBedLetters = (room: RoomWithBeds): string[] => {
  const allLetters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)) // A-Z
  const usedLetters = room.beds
    ?.map((bed) => {
      // 提取床名中的字母，支持 "BedA", "Bed A", "A" 等格式
      const match = bed.bed_name.match(/Bed\s*([A-Z])/i) || bed.bed_name.match(/^([A-Z])$/i)
      return match && match[1] ? match[1].toUpperCase() : null
    })
    .filter((letter): letter is string => letter !== null) || []
  
  return allLetters.filter((letter) => !usedLetters.includes(letter))
}

// 验证并格式化 Bed 名称（BedA-BedZ，不区分大小写，自动转换为 Bed[A-Z]）
const validateAndFormatBedName = (bedName: string): string | null => {
  if (!bedName || !bedName.trim()) {
    return null
  }
  
  const trimmed = bedName.trim()
  // 匹配 BedA-BedZ 格式（不区分大小写），支持 "BedA", "bedA", "BEDA", "Bed A", "A", "bed a" 等
  const match = trimmed.match(/^Bed\s*([A-Z])$/i) || trimmed.match(/^([A-Z])$/i)
  
  if (match && match[1]) {
    const letter = match[1].toUpperCase()
    return `Bed${letter}`
  }
  
  return null
}

// 直接添加 Bed（自动选择下一个可用字母）
const handleAddBedDirectly = async (room: RoomWithBeds) => {
  try {
    const availableLetters = getAvailableBedLetters(room)
    
    if (availableLetters.length === 0) {
      message.warning('All beds (A-Z) have been added')
      return
    }

    // 使用第一个可用的字母
    const bedLetter = availableLetters[0]
    const bedName = `Bed${bedLetter}`

    await createBedApi({
      room_id: room.room_id,
      bed_name: bedName,
    })

    // 确保 Room 已展开以显示新添加的床
    expandedRooms.value.add(room.room_id)

    // 刷新列表
    if (editingUnit.value) {
      await fetchRoomsWithBeds(editingUnit.value.unit_id)
    }

    message.success(`Bed ${bedLetter} added successfully`)
  } catch (error: any) {
    message.error('Failed to add bed: ' + (error.message || 'Unknown error'))
  }
}

// 添加 Bed 到第一个 Room
const handleAddBedToFirstRoom = async () => {
  try {
    if (!editingUnit.value) {
      message.error('No unit selected')
      return
    }

    let room = null
    if (roomsWithBeds.value.length === 0) {
      // 如果没有房间，自动创建一个以 Unit 名称命名的房间
      const unitName = editingUnit.value.unit_name
      const unitId = editingUnit.value.unit_id
      
      const newRoom = await createRoomApi({
        unit_id: unitId,
        room_name: unitName,
      })
      
      // 刷新房间列表
      await fetchRoomsWithBeds(unitId)
      
      // 找到新创建的房间
      room = roomsWithBeds.value.find((r) => r.room_id === newRoom.room_id)
    } else {
      // 使用第一个 Room
      room = roomsWithBeds.value[0]
    }
    
    if (!room) {
      message.error('No room available')
      return
    }
    
    const availableLetters = getAvailableBedLetters(room)
    
    if (availableLetters.length === 0) {
      message.warning('All beds (A-Z) have been added for this room')
      return
    }

    // 使用第一个可用的字母
    const bedLetter = availableLetters[0]
    const bedName = `Bed${bedLetter}`

    // 创建 Bed
    await createBedApi({
      room_id: room.room_id,
      bed_name: bedName,
    })

    // 确保 Room 已展开以显示新添加的床
    expandedRooms.value.add(room.room_id)

    // 刷新列表
    await fetchRoomsWithBeds(editingUnit.value.unit_id)

    message.success(`Bed ${bedLetter} added successfully`)
  } catch (error: any) {
    message.error('Failed to add bed: ' + (error.message || 'Unknown error'))
  }
}

// 处理添加设备到 Unit
const handleAddDeviceToUnit = async () => {
  try {
    if (!editingUnit.value) {
      message.error('No unit selected')
      return
    }

    const unitName = editingUnit.value.unit_name
    const unitId = editingUnit.value.unit_id

    // 检查是否存在 RoomName = UnitName 的 Room
    let room = roomsWithBeds.value.find((r) => r.room_name === unitName)

    if (!room) {
      // 创建新 Room，使用 UnitName 作为 room_name
      const newRoom = await createRoomApi({
        unit_id: unitId,
        room_name: unitName,
        is_default: false,
      })
      // 将新 Room 添加到列表
      const newRoomWithBeds: RoomWithBeds = {
        ...newRoom,
        beds: [],
      }
      roomsWithBeds.value.push(newRoomWithBeds)
      
      // 刷新列表并排序
      await fetchRoomsWithBeds(unitId)
      
      // 重新查找 room（因为排序后位置可能改变）
      room = roomsWithBeds.value.find((r) => r.room_name === unitName)
      if (!room) {
        message.error('Failed to create room for unit')
        return
      }
    }

    // 确保设备列表是最新的
    await fetchAllDevices()
    
    // 设置目标为 Unit
    selectedTarget.value = { type: 'unit', id: unitId }
    
    // 显示所有设备（已绑定到该 Unit 的会显示为已勾选）
    devicesForSelection.value = [...allDevices.value]
    showDeviceSelectModal.value = true
  } catch (error: any) {
    message.error('Failed to prepare device selection: ' + (error.message || 'Unknown error'))
  }
}

// 判断设备是否绑定到当前目标
const isDeviceBoundToTarget = (device: Device): boolean => {
  if (!selectedTarget.value) return false
  const deviceAny = device as any
  if (selectedTarget.value.type === 'unit') {
    return deviceAny.location_id === selectedTarget.value.id
  } else if (selectedTarget.value.type === 'room') {
    return deviceAny.bound_room_id === selectedTarget.value.id
  } else {
    return deviceAny.bound_bed_id === selectedTarget.value.id
  }
}

// 处理设备选择弹窗中的 checkbox 变化
const handleDeviceSelectChange = async (event: any, device: Device) => {
  const checked = event.target.checked
  if (!selectedTarget.value || !device.device_id) return
  
  try {
    if (checked) {
      // 绑定到目标
      await updateDeviceApi(device.device_id, {
        location_id: selectedTarget.value.type === 'unit' ? selectedTarget.value.id : null,
        bound_room_id: selectedTarget.value.type === 'room' ? selectedTarget.value.id : null,
        bound_bed_id: selectedTarget.value.type === 'bed' ? selectedTarget.value.id : null,
      })
      // 默认展开新绑定的设备
      expandedDevices.value.add(`device-${device.device_id}`)
    } else {
      // 解绑
      await updateDeviceApi(device.device_id, {
        location_id: null,
        bound_room_id: null,
        bound_bed_id: null,
      })
    }
    await fetchAllDevices()
    
    // 更新设备列表：确保所有设备都在列表中（已绑定的和未绑定的）
    // 使用 allDevices 作为基础，然后根据绑定状态分类
    const allDevicesList = [...allDevices.value]
    
    if (selectedTarget.value.type === 'unit') {
      // 对于 Unit：显示所有设备，已绑定到该 Unit 的显示为已勾选
      devicesForSelection.value = allDevicesList
      // 更新 Dev 容器显示该 Unit 的设备
      devContainerTarget.value = { type: 'unit', id: selectedTarget.value.id }
    } else if (selectedTarget.value.type === 'room') {
      // 对于 Room：显示所有设备，已绑定到该 Room 的显示为已勾选
      devicesForSelection.value = allDevicesList
      // 更新 Dev 容器显示该 Room 的设备
      devContainerTarget.value = { type: 'room', id: selectedTarget.value.id }
    } else {
      // 对于 Bed：显示所有设备，已绑定到该 Bed 的显示为已勾选
      devicesForSelection.value = allDevicesList
      // 更新 Dev 容器显示该 Bed 的设备
      devContainerTarget.value = { type: 'bed', id: selectedTarget.value.id }
    }
  } catch (error: any) {
    message.error('Failed to update device binding')
    event.target.checked = !checked
  }
}

// 确认设备选择
const handleConfirmDeviceSelection = () => {
  showDeviceSelectModal.value = false
  selectedTarget.value = null
  // 刷新 Room 列表（如果创建了新 Room）
  if (editingUnit.value) {
    fetchRoomsWithBeds(editingUnit.value.unit_id)
  }
}

// 取消设备选择
const handleCancelDeviceSelection = () => {
  showDeviceSelectModal.value = false
  selectedTarget.value = null
}

// 编辑 Room
const handleEditRoom = (room: RoomWithBeds) => {
  editingRoomId.value = room.room_id
  editingRoomName.value = room.room_name
  nextTick(() => {
    if (roomInputRef.value && roomInputRef.value.$el) {
      roomInputRef.value.$el.querySelector('input')?.focus()
    } else if (roomInputRef.value && roomInputRef.value.focus) {
      roomInputRef.value.focus()
    }
  })
}

// 保存 Room 名称
const handleSaveRoomName = async (roomId: string) => {
  try {
    if (!editingRoomName.value.trim()) {
      message.warning('Room name cannot be empty')
      if (editingUnit.value) {
        await fetchRoomsWithBeds(editingUnit.value.unit_id)
      }
      editingRoomId.value = null
      return
    }

    await updateRoomApi(roomId, { room_name: editingRoomName.value.trim() })

    if (editingUnit.value) {
      await fetchRoomsWithBeds(editingUnit.value.unit_id)
    }

    message.success('Room name updated successfully')
    editingRoomId.value = null
  } catch (error: any) {
    message.error('Failed to update room name: ' + (error.message || 'Unknown error'))
    if (editingUnit.value) {
      await fetchRoomsWithBeds(editingUnit.value.unit_id)
    }
    editingRoomId.value = null
  }
}


// 删除 Room
const handleDeleteRoom = async (roomId: string) => {
  try {
    await deleteRoomApi(roomId)
    if (editingUnit.value) {
      await fetchRoomsWithBeds(editingUnit.value.unit_id)
    }
    message.success('Room deleted successfully')
  } catch (error: any) {
    message.error('Failed to delete room: ' + (error.message || 'Unknown error'))
  }
}

// 编辑 Bed
const handleEditBed = (bed: Bed) => {
  editingBedId.value = bed.bed_id
  editingBedName.value = bed.bed_name
  nextTick(() => {
    if (bedInputRef.value && bedInputRef.value.$el) {
      bedInputRef.value.$el.querySelector('input')?.focus()
    } else if (bedInputRef.value && bedInputRef.value.focus) {
      bedInputRef.value.focus()
    }
  })
}

// 保存 Bed 名称（验证格式：BedA-BedZ）
const handleSaveBedName = async (bedId: string) => {
  try {
    const formattedName = validateAndFormatBedName(editingBedName.value)
    
    if (!formattedName) {
      message.warning('Bed name must be in format BedA-BedZ (e.g., BedA, bedB, BedZ)')
      if (editingUnit.value) {
        await fetchRoomsWithBeds(editingUnit.value.unit_id)
      }
      editingBedId.value = null
      return
    }

    await updateBedApi(bedId, { bed_name: formattedName })

    if (editingUnit.value) {
      await fetchRoomsWithBeds(editingUnit.value.unit_id)
    }

    message.success('Bed name updated successfully')
    editingBedId.value = null
  } catch (error: any) {
    message.error('Failed to update bed name: ' + (error.message || 'Unknown error'))
    if (editingUnit.value) {
      await fetchRoomsWithBeds(editingUnit.value.unit_id)
    }
    editingBedId.value = null
  }
}

// 删除 Bed
const handleDeleteBed = async (bedId: string) => {
  try {
    await deleteBedApi(bedId)
    if (editingUnit.value) {
      await fetchRoomsWithBeds(editingUnit.value.unit_id)
    }
    message.success('Bed deleted successfully')
  } catch (error: any) {
    message.error('Failed to delete bed: ' + (error.message || 'Unknown error'))
  }
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
  fetchLocationTags()
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

.building-tags {
  display: flex;
  gap: 8px;
  margin-left: 16px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.building-tag-card {
  position: relative;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 8px 12px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
  min-width: 120px;
}

.building-tag-card:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.building-tag-card.active {
  border-color: #1890ff;
  background: #f0f9ff;
}

.building-tag-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.building-tag-name {
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
}

.building-tag-edit-icon {
  color: #1890ff;
  cursor: pointer;
  font-size: 14px;
  flex-shrink: 0;
}

.building-tag-edit-icon:hover {
  color: #40a9ff;
}

.building-tag-delete-icon {
  color: #1890ff;
  cursor: pointer;
  font-size: 14px;
  flex-shrink: 0;
  margin-left: auto;
}

.building-tag-delete-icon:hover {
  color: #40a9ff;
}

.building-tag-edit {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.building-tag-edit .separator {
  color: #999;
  font-size: 11px;
  margin: 0 2px;
}

.building-tag-actions {
  display: flex;
  gap: 6px;
  color: #1890ff;
  cursor: pointer;
  flex-shrink: 0;
  font-size: 14px;
  opacity: 1;
  visibility: visible;
}

.building-tag-actions :hover {
  color: #40a9ff;
}

.building-tag-actions .anticon {
  font-size: 14px;
  display: inline-block;
}

.building-tag-floors {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  padding: 8px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.floor-item-small {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.floor-button-small {
  flex: 1;
  text-align: left;
  font-size: 12px;
  padding: 2px 8px;
  height: auto;
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
  gap: 8px;
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
  justify-content: space-between;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
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
  align-items: center;
  gap: 8px;
  min-height: 28px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
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
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
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

.unitnumber-field {
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




