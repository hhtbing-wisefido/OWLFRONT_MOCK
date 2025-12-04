<template>
  <div style="padding: 15px">
    <div class="form-container">
      <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
        <a-tab-pane key="pending" tab="Pending">
          <AlarmRecordList 
            :status="'active'"
            :columns="pendingColumns"
            :filters="filters"
          />
        </a-tab-pane>
        <a-tab-pane key="resolved" tab="Resolved">
          <AlarmRecordList 
            :status="'resolved'"
            :columns="resolvedColumns"
            :filters="filters"
          />
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AlarmRecordList from './components/AlarmRecordList.vue'

const activeTab = ref<'pending' | 'resolved'>('pending')

// Base columns for both pending and resolved
const baseColumns = [
  {
    title: 'Time',
    dataIndex: 'triggered_at',
    key: 'triggered_at',
    width: 180,
    sorter: true,
  },
  {
    title: 'Resident',
    dataIndex: 'resident_name',
    key: 'resident_name',
    width: 150,
  },
  {
    title: 'Address',
    dataIndex: 'address_display',
    key: 'address_display',
    width: 200,
  },
  {
    title: 'DeviceName',
    dataIndex: 'device_name',
    key: 'device_name',
    width: 150,
  },
  {
    title: 'Alarm_Event',
    dataIndex: 'event_type',
    key: 'event_type',
    width: 200,
  },
  {
    title: 'Category',
    dataIndex: 'category',
    key: 'category',
    width: 120,
  },
  {
    title: 'Severity',
    dataIndex: 'alarm_level',
    key: 'alarm_level',
    width: 120,
  },
]

// Columns for pending alarms
const pendingColumns = [
  ...baseColumns,
  {
    title: 'Operation',
    key: 'operation',
    width: 120,
    fixed: 'right' as const,
  },
]

// Columns for resolved alarms (includes handling information)
const resolvedColumns = [
  ...baseColumns,
  {
    title: 'Handling State',
    dataIndex: 'handling_state',
    key: 'handling_state',
    width: 150,
  },
  {
    title: 'Handling Details',
    dataIndex: 'handling_details',
    key: 'handling_details',
    width: 200,
  },
  {
    title: 'Remarks',
    dataIndex: 'handling_details',
    key: 'remarks',
    width: 200,
  },
  {
    title: 'Handler',
    dataIndex: 'handler_name',
    key: 'handler_name',
    width: 150,
  },
  {
    title: 'Handling Time',
    dataIndex: 'handled_at',
    key: 'handled_at',
    width: 180,
    sorter: true,
  },
]

// Filter options
const filters = {
  eventTypes: [
    { value: 'Fall', label: 'Fall' },
    { value: 'Radar_AbnormalHeartRate', label: 'Radar Abnormal Heart Rate' },
    { value: 'Radar_AbnormalRespiratoryRate', label: 'Radar Abnormal Respiratory Rate' },
    { value: 'Radar_ApneaHypopnea', label: 'Radar Apnea/Hypopnea' },
    { value: 'Radar_LeftBed', label: 'Radar Left Bed' },
    { value: 'SleepPad_LeftBed', label: 'SleepPad Left Bed' },
    { value: 'SleepPad_ApneaHypopnea', label: 'SleepPad Apnea/Hypopnea' },
    { value: 'SleepPad_AbnormalHeartRate', label: 'SleepPad Abnormal Heart Rate' },
    { value: 'SleepPad_AbnormalRespiratoryRate', label: 'SleepPad Abnormal Respiratory Rate' },
    { value: 'OfflineAlarm', label: 'Offline Alarm' },
    { value: 'LowBattery', label: 'Low Battery' },
    { value: 'DeviceFailure', label: 'Device Failure' },
    { value: 'Other', label: 'Other' },
  ],
  categories: [
    { value: 'safety', label: 'Safety' },
    { value: 'clinical', label: 'Clinical' },
    { value: 'behavioral', label: 'Behavioral' },
    { value: 'device', label: 'Device' },
  ],
  alarmLevels: [
    { value: '0', label: 'EMERG' },
    { value: '1', label: 'ALERT' },
    { value: '2', label: 'CRIT' },
    { value: '3', label: 'ERR' },
    { value: '4', label: 'WARNING' },
    { value: '5', label: 'NOTICE' },
    { value: '6', label: 'INFO' },
    { value: '7', label: 'DEBUG' },
  ],
}

const handleTabChange = (key: string) => {
  activeTab.value = key as 'pending' | 'resolved'
}
</script>

<style scoped>
.form-container {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}
</style>

