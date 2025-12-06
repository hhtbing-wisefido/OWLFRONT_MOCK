<template>
  <div class="page-container">
    <div class="information-container">
      <div class="information-row">
        <div class="navigation-icons">
          <a-button type="text" @click="goBack" style="padding: 0; border: none; box-shadow: none; margin-right: 8px;">
            <template #icon>
              <ArrowLeftOutlined />
            </template>
          </a-button>
          <a-button type="text" @click="goHome" style="padding: 0; border: none; box-shadow: none; margin-right: 12px;">
            <template #icon>
              <HomeOutlined />
            </template>
          </a-button>
        </div>
        <span
          >Device: {{ relationObjects.deviceName }} / {{ relationObjects.deviceInternalCode }}</span
        >
      </div>
      <div class="information-row">
        <span>Address: {{ relationObjects.addressName }}</span>
      </div>
      <div class="information-row">
        <span>Residents:</span>
        <div style="display: flex; flex-direction: column">
          <div
            v-for="item in relationObjects.residents"
            :key="item.id"
            style="display: flex; flex-direction: row; gap: 10px"
          >
            <span>{{ item.name }}</span>
            <span>/</span>
            <span>{{ genderToString(item.gender) }}</span>
            <span>/</span>
            <span>{{ calculateAge(item.birthday) }} years old</span>
          </div>
        </div>
      </div>
    </div>
    <a-card class="custom-card" style="width: 100%">
      <div style="display: flex; flex-direction: column; border-bottom: 1px solid #E6EBE3;">
        <div
          style="
            display: flex;
            flex-direction: row;
            gap: 20px;
            align-items: center;
            font-size: 18px;
          "
          ><calendar-outlined :style="{ fontSize: '24px' }" /><span>Date: </span
          ><div style="width: 400px"
            ><a-range-picker v-model:value="dateRange" class="date-picker" :allowClear="false" @change="onDateChange" />
          </div>
        </div>
        <div style="display: flex; flex-direction: row; justify-content: end; gap: 30px; padding: 10px 10px">
          <div v-for="state in indicatorStatesDetail" :key="state?.name" style="display: flex; flex-direction: row; align-items: center; gap: 10px">
            <span
              class="color-box"
              :style="{
                backgroundColor: state?.color,
                border: `1px solid ${state?.borderColor}`,
                opacity: state?.opacity,
              }"
            ></span>
            <span class="indicator-text">{{ state?.name }}</span>
          </div>
        </div>
      </div>
      <div style="width: 100%; height: 90vh">
        <VChart @click="handleClick" :option="chartOptions" style="width: 100%; height: 100%" />
      </div>
    </a-card>
    <div style="display: flex; justify-content: center; flex-direction: row; align-items: center">
      <a-pagination
        v-model:current="pagination.page"
        v-model:pageSize="pagination.size"
        :total="pagination.count"
        show-quick-jumper
        @change="onChange"
        :show-total="(total) => `Total ${total} items`"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
  import * as core from 'echarts/core'
  import * as echarts from 'echarts'
  import { CanvasRenderer } from 'echarts/renderers'
  import { LineChart, BarChart } from 'echarts/charts'
  import { EChartsOption } from 'echarts'
  import { GridComponent, TitleComponent, TooltipComponent } from 'echarts/components'
  import VChart from 'vue-echarts'
  import { ref, onMounted, computed } from 'vue'
  import { getSleepaceReportsApi } from '@/api/report/report'
  import { useRoute, useRouter } from 'vue-router'
  import { getDeviceRelationsApi, type DeviceRelations } from '@/api/devices/device'
  import {
    calculateAge,
    formatDateToHHmm,
    formatDateToNumber,
    genderToString,
  } from '@/utils/conversion'
  import dayjs, { Dayjs } from 'dayjs'
  import { prefixInteger } from '@/utils/tools'
  import { BackendPagination } from '@/api/model/pagination'
  import { CalendarOutlined, ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons-vue'
  import { useUserStore } from '@/store/modules/user'
  core.use([CanvasRenderer, LineChart, BarChart, GridComponent, TitleComponent, TooltipComponent])

  const route = useRoute()
  const router = useRouter()
  const userStore = useUserStore()

  const relationObjects = ref<DeviceRelations>({
    deviceId: '',
    deviceName: '',
    deviceInternalCode: '',
    deviceType: 0,
    addressId: '',
    addressName: '',
    addressType: 0,
    residents: [],
  })

  type RangeValue = [Dayjs, Dayjs]
  const dateRange = ref<RangeValue>([dayjs().subtract(1, 'month'), dayjs()])

  const deviceId = ref<string>('')
  const pagination = ref<BackendPagination>({
    page: 1,
    size: 8,
    count: 0,
    sort: '',
    direction: 0,
  })
  const date = ref<number[]>([])
  const data = ref<
    {
      name: string
      value: [number | Date, Date, Date] // Explicitly type the array
      itemStyle: {
        color: string
        borderColor: string
        borderWidth: number
        borderType: string
        opacity: number
      }
    }[]
  >([])
  const states = [
    {
      name: 'Not monitoring',
      color: '#DDDDDD',
      borderColor: '#DDDDDD',
      borderWidth: 1,
      opacity: 0.8,
    },
    { name: 'Not in Bed', color: '#FFFFFF', borderColor: '#F6F8F5', borderWidth: 1, opacity: 0.8 },
    { name: 'Awake', color: '#F3D9C2', borderColor: '#F3D9C2', borderWidth: 1, opacity: 0.8 },
    { name: 'Light sleep', color: '#B0D4EE', borderColor: '#B0D4EE', borderWidth: 1, opacity: 0.8 },
    { name: 'Deep sleep', color: '#E1D7F7', borderColor: '#E1D7F7', borderWidth: 1, opacity: 0.8 },
    { name: 'Unknown', color: '#FFFFFF', borderColor: '#FFFFFF', borderWidth: 1, opacity: 0.8 },
    { name: 'Situp', color: '#8FB571', borderColor: '#8FB571', borderWidth: 1, opacity: 0.8 },
  ]

  const indicatorStates = ['Awake', 'Light sleep', 'Deep sleep', 'Not in Bed', 'Not monitoring']
  const indicatorStatesDetail = computed(() => {
    return indicatorStates
      .map((name) => states.find((state) => state.name === name))
      .filter(Boolean)
  })
  const minTime = ref<Date>(new Date())

  const getDeviceIdFromRoute = () => {
    const deviceId = route.params.deviceId
    if (typeof deviceId === 'string') {
      return deviceId
    } else if (Array.isArray(deviceId)) {
      return deviceId[0]
    } else {
      return ''
    }
  }

  onMounted(() => {
    deviceId.value = getDeviceIdFromRoute()
    getDeviceRelationsApi(deviceId.value)
      .then((res) => {
        relationObjects.value = res
      })
      .catch((err) => {
        console.log(err)
      })

    refreshData()
  })

  const refreshData = () => {
    const params: Record<string, any> = {}
    params['startDate'] = formatDateToNumber(dateRange.value[0])
    params['endDate'] = formatDateToNumber(dateRange.value[1])
    params['size'] = pagination.value.size
    params['page'] = pagination.value.page
    getSleepaceReportsApi(deviceId.value, params).then((res) => {
      pagination.value = res.pagination
      date.value.splice(0, date.value.length)
      data.value.splice(0, data.value.length)
      if (res.items.length === 0) return
      console.log('startTime: ', res.items[0].startTime)
      const defaultStartTime = new Date(res.items[0].startTime * 1000)
      const now = new Date()
      const startTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        defaultStartTime.getHours(),
        defaultStartTime.getMinutes(),
        defaultStartTime.getSeconds(),
      )
      if (res.items.length < pagination.value.size) {
        date.value.push(...new Array(pagination.value.size - res.items.length).fill(0))
      }
      console.log('startTime: ', startTime, 'defaultStartTime: ', defaultStartTime)
      minTime.value = startTime
      res.items.reverse().forEach((item, index) => {
        date.value.push(item.date)
        const dateIndex = date.value.length - 1
        const timeStep = item.timeStep
        const sleepStates = JSON.parse(
          item.sleepState.substring(1, item.sleepState.length - 1),
        ) as number[]
        let lastState = -1
        let lastStart = -1
        console.log('sleepStates: ', sleepStates)
        console.log('isArray: ', Array.isArray(sleepStates))
        sleepStates.forEach((state, index) => {
          if (state !== lastState) {
            if (lastState >= 0) {
              data.value.push({
                name: states[lastState].name,
                value: [
                  dateIndex,
                  new Date(startTime.getTime() + lastStart * timeStep * 1000),
                  new Date(startTime.getTime() + index * timeStep * 1000),
                ],
                itemStyle: {
                  color: states[lastState].color,
                  borderColor: states[lastState].borderColor,
                  borderWidth: states[lastState].borderWidth,
                  borderType: 'solid',
                  opacity: states[lastState].opacity,
                },
              })
            }
            lastState = state
            lastStart = index
          } else {
          }
        })
        if (lastState >= 0) {
          data.value.push({
            name: states[lastState].name,
            value: [
              dateIndex,
              new Date(startTime.getTime() + lastStart * timeStep * 1000),
              new Date(startTime.getTime() + sleepStates.length * timeStep * 1000),
            ],
            itemStyle: {
              color: states[lastState].color,
              borderColor: states[lastState].borderColor,
              borderWidth: states[lastState].borderWidth,
              borderType: 'solid',
              opacity: states[lastState].opacity,
            },
          })
        }
        if (index === 0) {
          console.log('data: ', data.value)
        }
      })
      console.log('date: ', date.value)
      console.log('data: ', data.value)
    })
  }
  const onChange = (page: number) => {
    pagination.value.page = page
    refreshData()
  }

  const onDateChange = (dates: RangeValue, dateStrings: [string, string]) => {
    refreshData()
  }

  function renderItem(params: any, api: any): echarts.CustomSeriesRenderItemReturn {
    const categoryIndex = api.value(0)
    const start = api.coord([api.value(1), categoryIndex])
    const end = api.coord([api.value(2), categoryIndex])
    const height = api.size([0, 1])[1] * 0.8
    const rectShape = echarts.graphic.clipRectByRect(
      {
        x: start[0],
        y: start[1] - height / 2,
        width: end[0] - start[0],
        height: height,
      },
      {
        x: params.coordSys.x,
        y: params.coordSys.y,
        width: params.coordSys.width,
        height: params.coordSys.height,
      },
    )
    return rectShape
      ? {
          type: 'rect',
          transition: ['shape'],
          shape: rectShape,
          style: api.style(),
        }
      : undefined
  }

  const handleClick = (params: any) => {
    console.log('chart clicked, params: ', params)
    console.log('chart clicked, date: ', date.value[params.value[0]])
    const clickedDate = date.value[params.value[0]]
    router.push(`/report/sleepace/${deviceId.value}/detail/${clickedDate}`)
  }

  /**
   * Navigate back to previous page
   */
  const goBack = () => {
    router.go(-1)
  }

  /**
   * Navigate to home page
   */
  const goHome = () => {
    const homePath = userStore.getUserHomePath()
    router.push(homePath)
  }

  const chartOptions = ref<EChartsOption>({
    // title: {
    //   text: 'Sleep Report',
    // },
    tooltip: {
      formatter: (params) => {
        return `<div style="padding: 10px; display: flex; flex-direction: column; gap: 10px">
        <span>${formatDateToHHmm(params.value[1])} ~ ${formatDateToHHmm(params.value[2])}</span>
        <div>${params.marker}Status: ${params.name}</div>
        <span style="color: #5cd7fe; font-size: 16px;">&#x24D8; Click for report details</span>
        </div>`
        // return `<div style="pading: 10px; display: flex; flex-direction: column; gap: 8px">
        // <span>${formatDateToHHmm(params.value[1])} ~ ${formatDateToHHmm(params.value[2])}</span>
        // <div>${params.marker}Status: ${params.name}</div>
        // <div><a-icon type="exclamation-circle-outlined" style="color: #5cd7fe"/><span>Click for report details</span></div>
        // </div>`
      },
    },
    dataZoom: [
      {
        type: 'slider',
        filterMode: 'weakFilter',
        showDataShadow: false,
        bottom: 10,
        height: 10,
        borderColor: 'transparent',
        backgroundColor: '#F4F8F9',
        fillerColor: '#5cd7fe',
        moveHandleSize: 0,
        handleIcon:
          'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAARGVYSWZNTQAqAAAACAABh2kABAAAAAEAAAAaAAAAAAADoAEAAwAAAAEAAQAAoAIABAAAAAEAAAAcoAMABAAAAAEAAAAcAAAAAGS99KIAAAMfSURBVHictZbNaxNBGIef2aZp7JefRaGgQi+pNCBIL+LF9iay9WBdxPbooR76B4h4EP0HevAieElFYi8aSm/tSb0EQVhoC1KoQkHR+NE0bdqkOx72nXSTNJva1heGsJmZ37PvzOxvXkWD0Fqr0UWt5FHZrlPRn06kADRAMq60UkqH6al6HQZku45KJ1IWYJoKzNPSPMCzXcdLJ1I6DFwD3AUUAWLAEHAduAickeFfgY/ANPAGKAClMHAFMLB8FtAERIEbwCPgfL3VkFgGHgKvgS1gG/CqoWVgFaxZsnoM3GsAqo6nwAP8bIvV0IgZVQVrAZ4AY/8IQ15QAffluTi6qD3kYFkmO9t1FDvLeHOfMBNjohEFmmzXUVr7J10BjCx4Zs9iwDHgLXD2AECAL8AV4Df+8m5P9lqeFcguIm80dAgwRGNINCMmS1WVXQfwDLhWT2W8eY4L3f0AzK9kmCgOhEFngLtADsnSko7g99YXBuvvGaQt1klbrJP+nkHGm+fCgH2iGRFG2TkMMAp01ZttMmv0XyC6RNMAlSXeGIQedpRhtutgpRMp443GK7P1Zs6vZPb0XyCyAV2VTqSUtcugT/VmTxQHyCzNki+ski+sklmabXRoarQituvodCJVdnzgHXA1DMqyeQqFIVpGV9uuo9XIgmfcpR04CXQDL4DTjdQaxDfgDrCCv7RrwJbFzn1Wwnf5PPD8gDBEIy+aJWFos4cGWADWgTn8O26/MS0a66JpgFjJuNK26xjgprxVDt9xZvYBm5G5OdHaRC7lZFzp3cy7Hd/ATwEn8E/GbUIMQeI78FIy+wn8wDfuNQLmrcC/nqamblnpRMrYW4dATTsOXAYuAeeAowL5A3wGPgDvgV8CMS0HFGzXKQ0Pv/KUUuVqzGQZvIDbBdwprRU4Iv3BvS8CG/j7tSotJ5ltSr832Wt5EF5itAigFWiT35j0Ncm0bRE0hy0vvxtBWLDE2EsRFRV4jEojNhmaz6kgkC1CiqgKa1NK6WRcafwaM/iZ5GR/sviHI9iy0peTsQWZWwOryXC3bP97IVwPbMYftNT/C2X0eAjsaGgaAAAAAElFTkSuQmCC', // jshint ignore:line'
        handleSize: 30,
        handleStyle: {
          color: '#5cd7fe',
          shadowBlur: 6,
          shadowColor: '#5cd7fe',
          shadowOffsetX: 0,
          shadowOffsetY: 2,
        },
        labelFormatter: '',
        minSpan: 2,
        show: true,
      },
      {
        type: 'inside',
        filterMode: 'weakFilter',
      },
    ],
    grid: {
      // height: 'auto',
      left: '2%',
      right: '2%',
      top: '2%',
      bottom: '5%',
      containLabel: true,
    },
    xAxis: {
      type: 'time',
      splitNumber: 12,
      // scale: true,
      axisLabel: {
        formatter: (value, _index) => {
          return (
            prefixInteger(new Date(value).getHours(), 2) +
            ':' +
            prefixInteger(new Date(value).getMinutes(), 2)
          )
        },
        color: '#5cd7fe',
      },
      axisTick: {
        lineStyle: {
          width: 0,
        },
      },
      axisLine: {
        lineStyle: {
          color: '#dfe4ed',
        },
      },
      splitLine: {
        lineStyle: {
          color: '#dfe4ed',
        },
      },
    },
    yAxis: {
      type: 'category',
      data: date.value,
      axisTick: {
        lineStyle: {
          width: 0,
        },
      },
      axisLine: {
        lineStyle: {
          color: '#dfe4ed',
        },
      },
      axisLabel: {
        color: '#5cd7fe',
        fontWeight: 'bold',
        fontSize: 14,
        formatter: (value, _index) => {
          if (value === '0') {
            return ''
          } else {
            return (Math.floor(Number(value) / 100) % 100) + '/' + (Number(value) % 100)
          }
        },
      },
      splitLine: {
        lineStyle: {
          color: '#dfe4ed',
        },
      },
    },
    // grid: { x: 84, y: '7%', y2: '5', x2: 70 },
    series: [
      {
        type: 'custom',
        renderItem: renderItem,
        itemStyle: {
          opacity: 0.8,
        },
        encode: {
          x: [1, 2],
          y: 0,
          // tooltip: [1, 2, 3],
        },
        data: data.value,
      },
    ],
  })
</script>
<style scoped>
  .page-container {
    display: flex;
    flex-direction: column;
    gap: 16px; /* Add spacing between cards */
    padding: 16px; /* Add padding around the page */
  }

  .navigation-icons {
    display: inline-flex;
    align-items: center;
    margin-right: 8px;
  }

  .information-container {
    display: flex;
    flex-direction: row;
    gap: 10px;
    margin-bottom: 10px;
  }

  .information-row {
    display: flex;
    flex-direction: row;
    gap: 10px;
  }

  .custom-card {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); /* Card shadow */
    border-radius: 5px; /* Optional: rounded corners */
    padding: 8px;
  }

  .custom-card .ant-card-head {
    padding: 10px;
  }

  .date-picker {
    width: 100%;
  }

  ::v-deep(.ant-picker-input > input) {
    text-align: center;
  }

  .color-box {
    width: 30px;
    height: 10px;
    display: inline-block;
  }

  .indicator-text {
    font-size: 16px;
  }
</style>
