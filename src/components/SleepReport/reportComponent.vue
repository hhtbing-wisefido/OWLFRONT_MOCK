<template>
  <div class="app-container m-page">
    <!--    <div class="print-box" v-show="showPrint && hasReport">-->
    <!--      <div class="content-box" @click="downLoad()">-->
    <!--        <img src="../assets/images/common_icon_pdf_download.png" alt/>-->
    <!--        <p>导出PDF</p>-->
    <!--      </div>-->
    <!--    </div>-->
    <div class="print-all">
      <!-- <div class="info-box"> -->
        <!--        <el-date-picker-->
        <!--            v-model="datePickers"-->
        <!--            @change="dateChange"-->
        <!--            value-format="timestamp"-->
        <!--            type="date"-->
        <!--            :picker-options="pickerOptions0"-->
        <!--            placeholder="请选择">-->
        <!--        </el-date-picker>-->
        <!--        <span style="margin-left: 20px">姓名：{{ name || '未知' }}</span>-->
        <!--        <span>住址：{{ bunk || '未知' }}</span>-->
        <!-- <span>Date：{{ dateDuration }}</span>
      </div> -->
      <div class="chart-main" v-show="hasReport">
        <div class="dis-box">
          <div class="title">Daily Sleep Distribution</div>
          <ul>
            <li v-if="sitBoolean">
              <span class="color-box" style="background: #8fb571; opacity: 0.4" />
              <span class="text-box">Situp</span>
            </li>
            <li>
              <span class="color-box" style="background: #e2a166; opacity: 0.4" />
              <span class="text-box">Awake</span>
            </li>
            <li>
              <span class="color-box" style="background: #3a93d4; opacity: 0.4" />
              <span class="text-box">Light Sleep</span>
            </li>
            <li>
              <span class="color-box" style="background: #b59beb; opacity: 0.4" />
              <span class="text-box">Deep Sleep</span>
            </li>
            <li>
              <span
                class="color-box"
                style="
                  background: #ffffff;
                  border: 1px solid rgba(132, 154, 115, 0.3);
                  opacity: 0.4;
                "
              />
              <span class="text-box">Not in Bed</span>
            </li>
            <li>
              <span class="color-box" style="background: #ababab; opacity: 0.4" />
              <span class="text-box">Not Monitoring</span>
            </li>
            <li>
              <span class="image-box"> <img src="@/assets/images/icon_xinlv.png" /></span>
              <span class="text-box">Resting Heart Rate(bpm)</span>
            </li>
            <li>
              <span class="image-box"> <img src="@/assets/images/icon_huxilv.png" /></span>
              <span class="text-box">Respiratory Rate(rpm)</span>
            </li>
            <li>
              <span class="color-box" style="background: #8fb571" />
              <span class="text-box">Body Movement</span>
            </li>
          </ul>
        </div>
        <div id="myChartLine" />
        <div id="myChartSecond" />
        <!--        <div id="myChart"/>-->
        <div class="message-box">
          <div class="des-text">
            {{ inbedDescriptionTips(inbedArray) }}
          </div>
        </div>
      </div>
      <div class="msg-box" v-show="hasReport">
        <div v-if="showReportData" class="msg-content">
          <div class="title">Statistics of the Longest Sleep</div>
          <div class="content-top">
            <div class="sleep-box">
              <div class="score-view">
                <score-chart :score="score"></score-chart>
                <div class="socredescription">{{ scoreDescription(score) }}</div>
              </div>
              <div class="sleep-detail">
                <a-row :gutter="20">
                  <!--         睡着时刻         -->
                  <a-col
                    :xs="{ span: 24 }"
                    :sm="{ span: 12 }"
                    :md="{ span: 12 }"
                    :lg="{ span: 4 }"
                    :xl="{ span: 4 }"
                    v-for="(sleep, index) in sleepTimeArray"
                    :key="index + 'sleepTimeArray'"
                  >
                    <div class="chart-box">
                      <div class="chart-box-top">
                        <div class="dis-title">{{ sleep.title }}</div>
                      </div>
                      <div class="chart-box-bottom">
                        <div class="dis">{{ sleep.value }}</div>
                      </div>
                    </div>
                  </a-col>
                  <!--         睡眠比例         -->
                  <a-col
                    :xs="{ span: 24 }"
                    :sm="{ span: 12 }"
                    :md="{ span: 12 }"
                    :lg="{ span: 4 }"
                    :xl="{ span: 4 }"
                    v-for="(scoreItem, index) in scoreDetailArray"
                    :key="index + 'scoreDetailArray'"
                  >
                    <div class="chart-box">
                      <div class="chart-box-top">
                        <div class="dis-title">{{ scoreItem.title }}</div>
                        <a-tooltip
                          class="item"
                          effect="light"
                          popper-class="tool-tip"
                          placement="topLeft"
                        >
                          <template #title>
                            <div
                              slot="content"
                              style="white-space: pre-line"
                              v-html="showScoreExplain(index, scoreItem.deduction)"
                            >
                            </div>
                          </template>
                          <QuestionCircleOutlined style="color: #1890ff; cursor: pointer;" />
                        </a-tooltip>
                      </div>
                      <div class="chart-box-middle" v-if="scoreItem.subtitle.length > 0">
                        <div class="dis-title">{{ scoreItem.subtitle }}</div>
                      </div>
                      <div class="chart-box-bottom">
                        <div
                          class="dis"
                          v-if="index < 5 || (index == 5 && parseInt(scoreItem.value) >= 5)"
                          >{{ scoreItem.value }}
                        </div>
                        <div class="dis-right" :style="{ color: analyColor(scoreItem.key) }">
                          {{ analyDes(scoreItem.key) }}
                        </div>
                      </div>
                    </div>
                  </a-col>

                  <!--                  兼容房颤-->
                  <a-col
                    :xs="{ span: 24 }"
                    :sm="{ span: 12 }"
                    :md="{ span: 12 }"
                    :lg="{ span: 4 }"
                    :xl="{ span: 4 }"
                    v-if="hrvValue >= 0"
                  >
                    <div class="chart-box">
                      <div class="chart-box-top">
                        <div class="dis-title">Suspected Risk Level Of Atrial Fibrillation</div>
                        <a-tooltip
                          class="item"
                          effect="light"
                          popper-class="tool-tip"
                          placement="topLeft"
                        >
                          <template #title>
                            <div
                              slot="content"
                              style="white-space: pre-line"
                              v-html="showScoreExplain(6)"
                            ></div>
                          </template>
                          <QuestionCircleOutlined style="color: #1890ff; cursor: pointer;" />
                        </a-tooltip>
                      </div>
                      <div class="chart-box-bottom">
                        <div class="dis-right" :style="{ color: analyHRVColor(hrvValue) }">
                          {{ analysisHRV(hrvValue) }}
                        </div>
                      </div>
                    </div>
                  </a-col>
                </a-row>
              </div>
            </div>
          </div>
          <div class="content-bottom">
            <a-row :gutter="20">
              <!--            睡眠状态-->
              <a-col
                :xs="{ span: 24 }"
                :sm="{ span: 12 }"
                :md="{ span: 12 }"
                :lg="{ span: 12 }"
                :xl="{ span: 12 }"
              >
                <div class="col-state-box">
                  <div
                    class="sleep-state-box"
                    v-for="(percentItem, index) in sleepPercentArray"
                    :key="index + 'sleepPercentArray'"
                  >
                    <div class="color-box" :style="percentItem.style"></div>
                    <div class="row1">{{ percentItem.title }}</div>
                    <div class="row2">{{ percentItem.percent }}</div>
                    <div class="row3">{{ percentItem.time }}</div>
                  </div>
                </div>
              </a-col>

              <a-col
                :xs="{ span: 24 }"
                :sm="{ span: 12 }"
                :md="{ span: 12 }"
                :lg="{ span: 12 }"
                :xl="{ span: 12 }"
              >
                <div class="chart-box">
                  <p class="title-dis">
                    <span class="dis-left">
                      Heart Rate During Sleep
                      <a-tooltip
                        class="item"
                        effect="light"
                        popper-class="tool-tip"
                        placement="topLeft"
                      >
                        <template #title>
                          <div
                            slot="content"
                            style="white-space: pre-line"
                            v-html="showExplain('HEART')"
                          ></div>
                        </template>
                        <QuestionCircleOutlined v-show="showExplainImg()" style="color: #1890ff; cursor: pointer;" />
                      </a-tooltip>
                    </span>
                  </p>
                  <div class="table-cloum">
                    <table
                      class="table-box-bottom"
                      v-for="(heart, index) in heartDesArray"
                      :key="index + 'heartDesArray'"
                      :style="{
                        paddingLeft: (index == 1 ? 0 : 10) + 'px',
                        paddingRight: (index == 1 ? 0 : 10) + 'px',
                      }"
                    >
                      <div class="row1">{{ heart.title }}</div>
                      <div class="row2">{{ heart.hidden ? 'No' : heart.value }}</div>
                      <div class="row3" v-if="!heart.hidden">{{ heart.valueDes }}</div>
                    </table>
                  </div>
                </div>
              </a-col>
              <a-col
                :xs="{ span: 24 }"
                :sm="{ span: 12 }"
                :md="{ span: 12 }"
                :lg="{ span: 12 }"
                :xl="{ span: 12 }"
              >
                <div class="chart-box">
                  <p class="title-dis">
                    <span class="dis-left">
                      Respiratory Rate During Sleep
                      <a-tooltip
                        class="item"
                        effect="light"
                        popper-class="tool-tip"
                        placement="topLeft"
                      >
                        <template #title>
                          <div
                            slot="content"
                            style="white-space: pre-line"
                            v-html="showExplain('BREATH')"
                          ></div>
                        </template>
                        <QuestionCircleOutlined v-show="showExplainImg()" style="color: #1890ff; cursor: pointer;" />
                      </a-tooltip>
                    </span>
                  </p>
                  <div class="table-cloum">
                    <table
                      class="table-box-bottom"
                      v-for="(breath, index) in breathDesArray"
                      :key="index + 'breathDesArray'"
                      :style="{
                        paddingLeft: (index == 1 ? 0 : 10) + 'px',
                        paddingRight: (index == 1 ? 0 : 10) + 'px',
                      }"
                    >
                      <div class="row1">{{ breath.title }}</div>
                      <div class="row2">{{ breath.hidden ? 'No' : breath.value }}</div>
                      <div class="row3" v-if="!breath.hidden">{{ breath.valueDes }}</div>
                    </table>
                  </div>
                </div>
              </a-col>
              <a-col
                :xs="{ span: 24 }"
                :sm="{ span: 12 }"
                :md="{ span: 12 }"
                :lg="{ span: 6 }"
                :xl="{ span: 6 }"
                v-if="wakeArray.length"
              >
                <div class="chart-box">
                  <p class="title-dis">
                    <span class="dis-left">
                      Wakefulness During Sleep
                      <a-tooltip
                        class="item"
                        effect="light"
                        popper-class="tool-tip"
                        placement="topLeft"
                      >
                        <template #title>
                          <div
                            slot="content"
                            style="white-space: pre-line"
                            v-html="showExplain('AWAKE')"
                          ></div>
                        </template>
                        <QuestionCircleOutlined v-show="showExplainImg()" style="color: #1890ff; cursor: pointer;" />
                      </a-tooltip>
                    </span>
                    <span class="dis-right">{{ wakeArray.length }} times</span>
                  </p>
                  <table class="table-box">
                    <thead>
                      <tr>
                        <td>Times</td>
                        <td>Time</td>
                        <td>Duration</td>
                        <td v-if="wakeArray.length > 3" style="width: 15px"></td>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(value, index) in wakeArray"
                        :key="index + 'wakeArray'"
                        class="content-box"
                      >
                        <td>{{ index + 1 }}</td>
                        <td>{{ getTimeStamp(value.startTime) }}</td>
                        <td>{{ getTimeDis(value.duration) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </a-col>
              <a-col
                :xs="{ span: 24 }"
                :sm="{ span: 12 }"
                :md="{ span: 12 }"
                :lg="{ span: 6 }"
                :xl="{ span: 6 }"
                v-if="leftbedArray.length"
              >
                <div class="chart-box">
                  <p class="title-dis">
                    <span class="dis-left">
                      Leaving Bed During Sleep
                      <a-tooltip
                        class="item"
                        effect="light"
                        popper-class="tool-tip"
                        placement="topLeft"
                      >
                        <template #title>
                          <div
                            slot="content"
                            style="white-space: pre-line"
                            v-html="showExplain('LEFT_BED')"
                          ></div>
                        </template>
                        <QuestionCircleOutlined v-show="showExplainImg()" style="color: #1890ff; cursor: pointer;" />
                      </a-tooltip>
                    </span>
                    <span class="dis-right">{{ leftbedArray.length }}次</span>
                  </p>
                  <table class="table-box">
                    <thead>
                      <tr>
                        <td>Times</td>
                        <td>Time</td>
                        <td>Duration</td>
                        <td v-if="leftbedArray.length > 3" style="width: 15px"></td>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(value, index) in leftbedArray"
                        :key="index + 'leftbedArray'"
                        class="content-box"
                      >
                        <td>{{ index + 1 }}</td>
                        <td>{{ getTimeStamp(value.startTime) }}</td>
                        <td>{{ getTimeDis(value.duration) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </a-col>
              <a-col
                :xs="{ span: 24 }"
                :sm="{ span: 12 }"
                :md="{ span: 12 }"
                :lg="{ span: 12 }"
                :xl="{ span: 12 }"
              >
                <div class="chart-box">
                  <p class="title-dis">
                    <span class="dis-left">
                      Sleep Apnea/Hypopnea
                      <a-tooltip
                        class="item"
                        effect="light"
                        overly-class="tool-tip"
                        placement="topLeft"
                      >
                        <template #title>
                          <div
                            slot="content"
                            style="white-space: pre-line"
                            v-html="showExplain('AHI')"
                          ></div>
                        </template>
                        <!-- <div
                          slot="content"
                          style="white-space: pre-line"
                          v-html="showExplain('AHI')"
                        ></div> -->
                        <QuestionCircleOutlined v-show="showExplainImg()" style="color: #1890ff; cursor: pointer;" />
                      </a-tooltip>
                    </span>
                  </p>
                  <div class="slide-cloum">
                    <table
                      class="dangerous-box-bottom"
                      v-for="(dangerous, index) in dangerousArray"
                      :key="index + 'dangerousArray'"
                      :style="{
                        paddingLeft: (index == 1 ? 0 : 10) + 'px',
                        paddingRight: (index == 1 ? 0 : 10) + 'px',
                      }"
                    >
                      <div class="row1">{{ dangerous.title }}</div>
                      <div class="row2">{{ dangerous.hidden ? 'No' : dangerous.value }}</div>
                    </table>
                  </div>
                </div>
              </a-col>
              <a-col
                v-if="heartMutateData && heartMutateData.length > 0"
                class="heart-mutate"
                :xs="{ span: 24 }"
                :sm="{ span: 12 }"
                :md="{ span: 12 }"
                :lg="{ span: 12 }"
                :xl="{ span: 12 }"
              >
                <div class="chart-box m-flex-column">
                  <p class="title-dis">
                    <span class="dis-left">
                      Heart Rate Variability (HRV)
                      <a-tooltip
                        class="item"
                        effect="light"
                        popper-class="tool-tip"
                        placement="topLeft"
                      >
                        <template #title>
                          <div
                            slot="content"
                            style="white-space: pre-line"
                            v-html="showExplain('HEART_MUTATE')"
                          ></div>
                        </template>
                        <QuestionCircleOutlined v-show="showExplainImg()" style="color: #1890ff; cursor: pointer;" />
                      </a-tooltip>
                    </span>
                    <span class="dis-right">Mean {{ heartMutateAverage }}ms</span>
                  </p>
                  <heartMutateChart :data="heartMutateData"></heartMutateChart>
                </div>
              </a-col>
            </a-row>
          </div>
        </div>
        <div v-else class="msg-content m-flex-column">
          <div class="title">Statistics of the Longest Sleep</div>
          <div class="msg-tip">
            <img src="@/assets/images/icon_no_data.png" />
            <div class="tip-text"
              >{{
                inbedArray.length == 0
                  ? 'Unable to analyze as sleep time is less than 10 mins'
                  : 'Unable to analyze for there is only awake time'
              }}
            </div>
          </div>
        </div>
      </div>
      <div class="empty" v-show="!hasReport">
        <img src="@/assets/images/icon_no_data.png" />
        <div>There is no report at this movement</div>
      </div>
    </div>
  </div>
</template>

<script>
  // import { mapState } from 'vuex'
  import { defineStore, storeToRefs } from 'pinia'
  // Note: windowStore and sidebarStore are not needed for basic functionality
  // import { useWindowStore } from '@/store/modules/window'
  // import { useSidebarStore } from '@/store/modules/sidebar'
  import { getTime, prefixInteger } from '@/utils/tools'
  import { formatDate } from '@/utils/conversion'
  // import { reportDetail } from "@/api/deviceManage";
  import scoreChart from './Chart/scoreChart.vue'
  import * as echarts from 'echarts'
  import heartMutateChart from './Chart/heartMutateChart.vue'
  import { QuestionCircleOutlined } from '@ant-design/icons-vue'

  // import '@/assets/styles/element-variables.scss'
  // import '@/assets/styles/index.scss' // global css
  // import '@/assets/styles/ruoyi.scss' // ruoyi css - not needed

  let myChart, myChartLine, myChartSecond, that

  export default {
    name: 'reportComponent',
    props: ['data'],
    components: {
      scoreChart: scoreChart,
      heartMutateChart: heartMutateChart,
      QuestionCircleOutlined,
    },
    data: function () {
      return {
        // myChart: null,
        // myChartLine: null,
        // myChartSecond: null,
        hasReport: true,
        loading: true,
        sitBoolean: false,
        dataZoom: null,
        name: null,
        bunk: null,
        id: null,
        startTime: null,
        dateDuration: null,
        avgBreathRate: '',
        avgHeartRate: '',
        score: '',
        tableData: [],
        dataArray: [],
        sleepSummary: null,
        mostSleepDurationAvg: null,
        awakeDurationAvg: null,
        sleepRateAvg: null,
        sleepRest: null,
        customInBed: null,
        customWakeUp: null,
        awakeAvg: null,
        customAwake: null,
        nightUpAvg: null,
        customNightUp: null,
        showPrint: false,
        flag: 12, //报告开始采集的时间点数，默认12点
        hrvValue: '', //房颤
        scoreDetailArray: [
          {
            title: 'Sleep Duration',
            subtitle: '',
            value: '--',
            key: '',
            deduction: 0,
          },
          {
            title: 'Sleep Efficiency',
            subtitle: '',
            value: '--',
            key: '',
            deduction: 0,
          },
          {
            title: 'Proportion Of Deep Sleep',
            subtitle: '',
            value: '--',
            key: '',
            deduction: 0,
          },
          {
            title: 'Sleep Continuity',
            subtitle: 'Interruptions No. / h',
            value: '--',
            key: '',
            deduction: 0,
          },
          {
            title: 'Body Movement Index',
            subtitle: 'Body movements / h',
            value: '--',
            key: '',
            deduction: 0,
          },
          {
            title: 'Risk of Sleep Apnea/ Hypopnea',
            subtitle: '',
            value: '--',
            key: '',
            deduction: 0,
          },
        ],
        sleepTimeArray: [
          {
            title: 'Fall Asleep Time',
            value: '--',
          },
          {
            title: 'Woke-Up Time',
            value: '--',
          },
          {
            title: 'In-Bed Period',
            value: '--',
          },
        ],
        sleepPercentArray: [
          {
            style: { backgroundColor: '#E2A166', opacity: 0.4 },
            title: 'Awake',
            percent: '--',
            time: '--',
          },
          {
            style: { backgroundColor: '#3A93D4', opacity: 0.4 },
            title: 'Light Sleep',
            percent: '--',
            time: '--',
          },
          {
            style: { backgroundColor: '#B59BEB', opacity: 0.4 },
            title: 'Deep Sleep',
            percent: '--',
            time: '--',
          },
          {
            style: {
              backgroundColor: '#ffffff',
              border: '1px solid rgba(132,154,115,0.30)',
              opacity: 0.4,
            },
            title: 'Not in Bed',
            percent: '--',
            time: '--',
          },
          {
            style: { backgroundColor: '#ABABAB', opacity: 0.4 },
            title: 'Not Monitoring',
            percent: '--',
            time: '--',
          },
        ],
        heartDesArray: [
          {
            title: 'Avg. Resting Heart Rate',
            value: '--',
            valueDes: '--',
            hidden: false,
          },
          {
            title: 'The Cumulative Duration of Tachycardia',
            value: '--',
            valueDes: '--',
            hidden: false,
          },
          {
            title: 'The Cumulative Duration of Bradycardia',
            value: '--',
            valueDes: '--',
            hidden: false,
          },
        ],
        breathDesArray: [
          {
            title: 'Avg. Respiratory Rate',
            value: '--',
            valueDes: '--',
            hidden: false,
          },
          {
            title: 'The Cumulative Duration of Tachypnea',
            value: '--',
            valueDes: '--',
            hidden: false,
          },
          {
            title: 'The Cumulative Duration of Bradypnea',
            value: '--',
            valueDes: '--',
            hidden: false,
          },
        ],
        slideArray: [
          {
            title: 'Normal',
            color: '#61A9DD',
          },
          {
            title: 'Suspected low risk',
            color: '#E8CE85',
          },
          {
            title: 'Suspected middle risk',
            color: '#E8B484',
          },
          {
            title: 'Suspected high risk',
            color: '#E48B8B',
          },
        ],
        dangerousArray: [
          {
            title: 'The Number Of OSA / Hypopneas',
            value: '--',
            hidden: false,
          },
          {
            title: 'The Number of CSA',
            value: '--',
            hidden: false,
          },
          {
            title: 'The Cumulative Duration Of Apnea / Hypopneas',
            value: '--',
            hidden: false,
          },
        ],
        levelValue: 0,
        alarm: '',
        heartMutateData: [],
        heartMutateAverage: null,
        sumAlarm: 0, //报警次数
        wakeArray: [],
        leftbedArray: [],
        inbedArray: [], //在床时段数组
        showReportData: true,
        datePickers: '', //日期
        pickerOptions0: {
          // 设置禁用状态，参数为当前日期，要求返回 Boolean
          disabledDate: this.disabledDate,
        },
        historyDate: [], //报告日期集合
      }
    },
    watch: {
      // Window resize handled by component lifecycle
      // windowInner() {
      //   this.winResize()
      // },
      listenSlider(val) {
        console.log('listenSlider---', val)
        setTimeout(() => {
          // myChart.resize();
          myChartLine.resize()
          myChartSecond.resize()
        }, 200)
      },
      data: function (val) {
        console.log('his------', val)
        this.drawReportData(val)
      },
    },
    computed: {
      windowInner() {
        // Window resize handling - using window object directly
        return window.innerWidth
      },
      // ...storeToRefs(useWindowStore()),
      // ...mapState({
      //   windowInner: (state) => state.app.windowInner,
      // }),
      // ...storeToRefs(useSidebarStore()),
      listenSlider() {
        const { isSidebarOpened } = storeToRefs(useSidebarStore());
        console.log('computed listenSlider---', isSidebarOpened.value)
        return isSidebarOpened.value;
        // return this.isSidebarOpened
        // return this.$store.getters?.sidebar?.opened || false;
      },
      // 是否展示无统计数据提示
      noStatisticalResults() {
        console.log('noStatisticalResults---')
        if (!this.dataArray || !this.dataArray[0] || !this.sleepSummary) {
          return null
        }

        let recordCount = this.dataArray[0].summary.recordCount

        let sleepState = this.dataArray[0].analysis.stageAry
        let onBedCount = sleepState.reduce((total, val) => {
          return total + (val > 1 ? 1 : 0)
        }, 0)
        return !!(recordCount < 10 || !this.sleepSummary.length || onBedCount < 10)
      },
    },
    created() {
      that = this
      this.dataZoom = [
        {
          type: 'slider',
          filterMode: 'weakFilter',
          showDataShadow: false,
          top: 75,
          height: 10,
          borderColor: 'transparent',
          backgroundColor: '#F4F8F9',
          fillerColor: '#BCD5A9',
          moveHandleSize: 0,
          handleIcon:
            'image://data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAHKADAAQAAAABAAAAHAAAAABkvfSiAAAE/UlEQVRIDbVWz28bVRCe92N3bW9jx6FpAo1aKgSUFIlKVQ70AggOFUIqB8KFv4Ace0YkQYg/AAkOPSAhxIVcQAoVB0SSQ+GAqOCQ0IJUEZSIpCVx7Hi9P7zvDTMb1nIdJ5BS3sH73tuZ7/O8nffNCPiHgYhidnZWsNny+LKY7LGfo/W5lXPI29PT0yiEyOY9Zp1lBtRZdU1yonEi+bpWlV7sSZ1qWfED0WyEmd+xchHrgY+pTm3sxfalas2uEPlhxPsIu4lqRHQz8LVXiArDY95locQrAsR5ABzd+29iAwF/RIPzd9fiL+KoEJ31g7R6CPE9hDkZgcmhoS21Fgbuw0+VXwUt3gGER7sOYP9UwG+Q4tt//Nz4fKzoJ9vbDxkysr3Rdgi7yerluuMVNgsnxkbeFQqm9qMfvIMGPryztvlWHI1ElUal3Uuqclf62JLmkskqouZVzwy/J49IxliEMlEqD5RFrbZU9wQW4gIuLS3B4uJilkxMAhwdJwcfo+sHbulU+TUp8U1+dz+DfRmDsRiTsZmDsbIIOTqtU7XajD1Hu5WB487H9K5yP2S5j9LyfLSNn+60wnYRfDM/fwM5SplHx9mo/KJbfsS5TE6ncsf/8DzFWIzJ2HmUiqP7iaLzW6GLTloqDxWvCAGP9yOSlEEXn3wZLj3zBlw48zwUXR/Wt29TAve/64QNuzvNayqO0xWK8gZFqRmYL7W0SkMaF8jm6X5kvPfsE5dg4rEXO6/z+fVbX3b2uieMJVMogPVCL9acL0ayXLGCCD/SwliXvuxwt1P3fPzkRPcym/fby40YK8MkbOZgLsnayHIlrJLCoSgf8GBMxmYO5pKkfXvaiFICCklfY+sgzpX17/e96reXG2VYhAmEzfrLXPsissb+Sik9ljt1P7/75atsmR8jk+V73Xb5nLHyef7kdMWVWhWT0FoQaJOWvV4syxdyg+6nJd3iBDkoSbptec5YjEmSarmyjJ9eRsn1jEsMSmOxbdLmVrKIFjd7nY+6ZowMizAZmzmYS3Lx5HqGQSFFJZM0NkHcTD86KkGvPWMwFmMyNnMwV6alXDytjFOrIbIKWvWN1jftlp3vBfm3a/ZlDMbKMAmbOdhfLSwsQHT7E1gNTghXk+wCKgVGR7vJLbfkVJQj+6rOQeTt0FyrrTevUqexjVLXtfSCBPz4uZE76dTUByhJfpDbAq7UJggTx0DLoGqkVta2fm9dDXeS90lv7x5EkO+zDduyD/syRoZFmIzNHMxFYrBXnubmXpcbG6N63aMCFtsBG+OgcnHQohrUAqrHjnsX3ZK6ILU8LcVeJbEIdZva1aRlfmj+GX+bItSkMDsmETvSEzvCk7snYy8aHd1IJyc/s0yY3UOezMzMsAKbpFxPqAA3W54GNMJokbZNW8WNzYguIS7RX3RIq7NvDwIs9WhU1UVIyd/S2jSMVQ3pwW6JEr4eVJPtRsVQu9Hp5rII8yj/bgezqo9U9UvgFtsKSmitLw2USIsK1oBDRW2vjlphqCto0w3Okk1IGfAxtiAJBVbjfi1Gh7CXNG+iuJ4ZDD1W/UyIWW9ZrnjQpea7y6nP2ahEkS5CmBzWRN0jbXy0NIAitXTu6NWq9mbgpk47TLjEAKk+HWKmjRkhKQi4wkLgpUCpHzluenawTW3ihuVj7O3Ysv+457j/l4izjpsr9f/aCPdS58S8/yBa/b8AOR4TrWtM31EAAAAASUVORK5CYII=', // jshint ignore:line
          handleSize: 30,
          handleStyle: {
            color: '#8FB571',
            shadowBlur: 6,
            shadowColor: '#8FB571',
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
      ]
      console.log('dataZoom:', this.dataZoom)

      //外链传入画图
      // this.id = this.$store.getters.userId
      // this.getReportData({startTime: -1, endTime: -1})
    },
    mounted() {
      console.log('mounted')
      // window.addEventListener('resize', this.updateWindowSize);
      this.getMount()
    },

    methods: {
      disabledDate(time) {
        // return !this.historyDate.includes(time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate())
      },

      getMount() {
        console.log('getMount')
        // this.$nextTick(() => {
          // if (!this.myChartLine) {
            myChartLine = echarts.init(document.getElementById('myChartLine'))
          // }
          // if (!this.myChartSecond) {
            myChartSecond = echarts.init(document.getElementById('myChartSecond'))
          // }
          echarts.connect([myChartLine, myChartSecond])
          console.log('getMount end')
        // })
        setTimeout(() => {
          this.showPrint = true
        }, 1000)
      },
      //选中日期

      // updateWindowSize() {
      //   useWindowStore().updateWindowInner()
      // },

      winResize() {
        this.$nextTick(() => {
          // if (!this._isDestroyed) {
            // myChart.resize();
            myChartLine.resize()
            myChartSecond.resize()
          // }
        })
      },
      //导出pdf文件
      // downLoad() {
      //   let startTime = this.startTime;
      //   let ele = document.getElementsByClassName("print-all")[0];
      //   let yearAndMonth =
      //       new Date(startTime).getFullYear() +
      //       "-" +
      //       prefixInteger(new Date(startTime).getMonth() + 1, 2) +
      //       "-" +
      //       prefixInteger(new Date(startTime).getDate(), 2);
      //   downLoadPDF(ele, this.bunk + "-" + yearAndMonth);
      // },
      // dateChange(val) {
      //   console.log('dateChange', val)
      //   if (!val) return
      //   const queryStartTime = val / 1000
      //   const queryEndTime = queryStartTime + 24 * 60 * 60
      //   this.getReportData({startTime: queryStartTime, endTime: queryEndTime})
      //   let endTime = val + 24 * 60 * 60 * 1000;
      //   this.dateDuration =
      //       new Date(val).getFullYear() +
      //       "/" +
      //       (new Date(val).getMonth() + 1) +
      //       "/" +
      //       new Date(val).getDate() +
      //       "~" +
      //       (new Date(val).getFullYear() == new Date(endTime).getFullYear()
      //           ? ""
      //           : new Date(endTime).getFullYear() + "/") +
      //       (new Date(endTime).getMonth() + 1) +
      //       "/" +
      //       new Date(endTime).getDate();
      //   // this.getMount()
      // },

      // //获取图表接口信息
      // getReportData(queryData) {
      //   this.loading = true
      //   reportDetail({startTime: queryData.startTime, endTime: queryData.endTime, userId: this.id}).then(response => {
      //     this.loading = false
      //     console.log('reportDetail', response)
      //     if (response.data && response.data.length > 0) {
      //       this.drawReportData(response.data)
      //     } else {
      //       this.hasReport = false
      //     }
      //   })
      // },

      //处理报告数据
      drawReportData(data) {
        if (data) {
          let reportData = null
          data.map((item) => {
            item.analysis.stageAry = JSON.parse(item.analysis.sleepStateStr)
            console.log('item.analysis.stageAry', item.analysis.stageAry)
            this.historyDate.push(
              new Date(item.detail.startTime * 1000).getFullYear() +
                '-' +
                (new Date(item.detail.startTime * 1000).getMonth() + 1) +
                '-' +
                new Date(item.detail.startTime * 1000).getDate(),
            )
            if (!reportData) {
              reportData = item
              this.parseSleepData(reportData)
              this.hasReport = true
              this.startTime = item.detail.startTime * 1000
              let endTime = this.startTime + 24 * 60 * 60 * 1000
              this.dateDuration =
                new Date(this.startTime).getFullYear() +
                '/' +
                (new Date(this.startTime).getMonth() + 1) +
                '/' +
                new Date(this.startTime).getDate() +
                '~' +
                (new Date(this.startTime).getFullYear() == new Date(endTime).getFullYear()
                  ? ''
                  : new Date(endTime).getFullYear() + '/') +
                (new Date(endTime).getMonth() + 1) +
                '/' +
                new Date(endTime).getDate()
              this.datePickers = parseInt(new Date(this.startTime).getTime())
            }
          })
          if (!reportData) this.hasReport = false
        }
      },

      //最后一个点固件经常获取失败，做处理和上一个点一样
      parseSleepData(response) {
        console.log(response, 11111111)
        this.dataArray = [response]
        this.avgBreathRate = this.dataArray[0].analysis.maxReport.brMean
        this.avgHeartRate = this.dataArray[0].analysis.maxReport.hrMean
        let timeFlag = this.dataArray[0].detail.startTime * 1000
        let OriginFlag =
          new Date(timeFlag).getHours() +
          (this.dataArray[0].summary.timezone - new Date().getTimezoneOffset() * -60) / 3600
        if (OriginFlag > 23) {
          this.flag = OriginFlag - 24
        } else if (OriginFlag < 0) {
          this.flag = OriginFlag + 24
        } else {
          this.flag = OriginFlag
        }

        this.showReportData = this.dataArray[0].analysis.maxReport.scale !== 0
        setTimeout(() => {
          this.score = this.dataArray[0].analysis.maxReport.scale
          console.log('hasReport', this.hasReport)
        }, 100)

        //心率变异性
        if (
          this.dataArray[0].analysis.maxReport.hrvArray &&
          this.dataArray[0].analysis.maxReport.hrvArray.length > 0
        ) {
          let hrvStartTime = this.dataArray[0].analysis.maxReport.inBedTime
          let hrvStartHour =
            (hrvStartTime +
              (this.dataArray[0].summary.timezone - new Date().getTimezoneOffset() * -60)) /
            3600 // 加上时区处理
          if (hrvStartHour > 23) {
            hrvStartHour = hrvStartHour - 24
          } else if (hrvStartHour < 0) {
            hrvStartHour = hrvStartHour + 24
          }
          hrvStartTime = hrvStartHour * 3600 // 转换成秒
          console.log(
            '心率变异性',
            formatDate(new Date(hrvStartTime * 1000), 'YYYY/MM/DD HH:mm:ss'),
          )
          let heartMutateData = []
          let dataStart = false
          this.dataArray[0].analysis.maxReport.hrvArray.map((item, index) => {
            const time = hrvStartTime + index * 300 // 5分钟一个点
            // 前段有0留空
            if (item === 0 && !dataStart)
              heartMutateData.push([formatDate(new Date(time * 1000), 'YYYY/MM/DD HH:mm'), null])
            if (item > 0) {
              dataStart = true
              heartMutateData.push([formatDate(new Date(time * 1000), 'YYYY/MM/DD HH:mm'), item])
            }
          })
          // 后段有0留空
          let dataEnd = false
          this.dataArray[0].analysis.maxReport.hrvArray.reverse().map((item, index) => {
            const time =
              hrvStartTime + (this.dataArray[0].analysis.maxReport.hrvArray.length - index) * 300 // 5分钟一个点
            if (item === 0 && !dataEnd)
              heartMutateData.push([formatDate(new Date(time * 1000), 'YYYY/MM/DD HH:mm'), null])
            if (item > 0) dataEnd = true
          })
          console.log('heartMutateData', heartMutateData)
          this.heartMutateData = heartMutateData
          this.heartMutateAverage = this.dataArray[0].analysis.maxReport.hrvRmssd
        } else {
          this.heartMutateData = []
        }

        if (this.dataArray[0].analysis) {
          this.scoreDetailArray[0].value = this.getTimeDis(
            this.dataArray[0].analysis.maxReport.tsTime,
          )
          this.scoreDetailArray[1].value = this.dataArray[0].analysis.maxReport.seIndex + '%'
          this.scoreDetailArray[2].value = this.dataArray[0].analysis.maxReport.deepPct + '%'
          this.scoreDetailArray[3].value = (
            this.dataArray[0].analysis.maxReport.contIndex / 100.0
          ).toFixed(1)
          this.scoreDetailArray[4].value = this.dataArray[0].analysis.maxReport.bmIndex
          this.scoreDetailArray[5].value = this.dataArray[0].analysis.maxReport.ahIndex
          this.scoreDetailArray[5].subtitle =
            this.dataArray[0].analysis.maxReport.ahIndex < 5 ? '' : 'AHI'
          this.scoreDetailArray[0].deduction =
            this.dataArray[0].analysis.maxReport.markLong +
            this.dataArray[0].analysis.maxReport.markShort
          this.scoreDetailArray[1].deduction = this.dataArray[0].analysis.maxReport.markEfficiency
          this.scoreDetailArray[2].deduction = this.dataArray[0].analysis.maxReport.markDeep
          this.scoreDetailArray[3].deduction = this.dataArray[0].analysis.maxReport.markContinuity
          this.scoreDetailArray[4].deduction = this.dataArray[0].analysis.maxReport.markBM
          this.scoreDetailArray[5].deduction = this.dataArray[0].analysis.maxReport.markAHI

          if (this.dataArray[0].analysis.maxReport.hrvIndex != null) {
            //兼容旧版本，如无房颤不显示
            this.hrvValue = this.dataArray[0].analysis.maxReport.hrvIndex
          }

          console.log('hrvValue', this.hrvValue)
          this.scoreDetailArray[0].key = this.analysisSleepTime(
            this.dataArray[0].analysis.maxReport.tsTime,
          )
          this.scoreDetailArray[1].key = this.analysisEff(
            this.dataArray[0].analysis.maxReport.seIndex,
          )
          this.scoreDetailArray[2].key = this.analysisPercent(
            this.dataArray[0].analysis.maxReport.deepPct,
          )
          this.scoreDetailArray[3].key = this.analysiscontIndex(
            this.dataArray[0].analysis.maxReport.contIndex / 100.0,
          )
          this.scoreDetailArray[4].key = this.analysisbmIndex(
            this.dataArray[0].analysis.maxReport.bmIndex,
          )
          this.scoreDetailArray[5].key = this.analysisahIndex(
            this.dataArray[0].analysis.maxReport.ahIndex,
          )

          this.sleepTimeArray[0].value = this.getTimeStamp(
            this.dataArray[0].analysis.maxReport.onsetTime,
          )
          this.sleepTimeArray[1].value = this.getTimeStamp(
            this.dataArray[0].analysis.maxReport.wakeupTime,
          )
          this.sleepTimeArray[2].value =
            this.getTimeStamp(this.dataArray[0].analysis.maxReport.inBedTime) +
            '~' +
            this.getTimeStamp(this.dataArray[0].analysis.maxReport.getupTime)

          this.sleepPercentArray[0].percent = this.countPercentValue(
            this.dataArray[0].analysis.maxReport.awakePct,
            this.dataArray[0].analysis.maxReport.awakeDur,
          )
          this.sleepPercentArray[1].percent = this.countPercentValue(
            this.dataArray[0].analysis.maxReport.lightPct,
            this.dataArray[0].analysis.maxReport.lightDur,
          )
          this.sleepPercentArray[2].percent = this.countPercentValue(
            this.dataArray[0].analysis.maxReport.deepPct,
            this.dataArray[0].analysis.maxReport.deepDur,
          )
          this.sleepPercentArray[3].percent = this.countPercentValue(
            this.dataArray[0].analysis.maxReport.offBedPct,
            this.dataArray[0].analysis.maxReport.offBedDur,
          )
          this.sleepPercentArray[4].percent = this.countPercentValue(
            this.dataArray[0].analysis.maxReport.discPct,
            this.dataArray[0].analysis.maxReport.discDur,
          )

          this.sleepPercentArray[0].time = this.getTimeDis(
            this.dataArray[0].analysis.maxReport.awakeDur,
          )
          this.sleepPercentArray[1].time = this.getTimeDis(
            this.dataArray[0].analysis.maxReport.lightDur,
          )
          this.sleepPercentArray[2].time = this.getTimeDis(
            this.dataArray[0].analysis.maxReport.deepDur,
          )
          this.sleepPercentArray[3].time = this.getTimeDis(
            this.dataArray[0].analysis.maxReport.offBedDur,
          )
          this.sleepPercentArray[4].time = this.getTimeDis(
            this.dataArray[0].analysis.maxReport.discDur,
          )

          this.heartDesArray[0].value =
            this.dataArray[0].analysis.maxReport.hrMean === 255
              ? 'No'
              : this.dataArray[0].analysis.maxReport.hrMean + ' bpm'
          this.heartDesArray[1].value = this.getTimeDis(
            this.dataArray[0].analysis.maxReport.hrHiDur,
          )
          this.heartDesArray[2].value = this.getTimeDis(
            this.dataArray[0].analysis.maxReport.hrLoDur,
          )
          this.heartDesArray[0].hidden =
            parseInt(this.dataArray[0].analysis.maxReport.hrMean) > 0 ? false : true
          this.heartDesArray[1].hidden =
            parseInt(this.dataArray[0].analysis.maxReport.hrHiDur) > 0 ? false : true
          this.heartDesArray[2].hidden =
            parseInt(this.dataArray[0].analysis.maxReport.hrLoDur) > 0 ? false : true
          this.heartDesArray[0].valueDes =
            this.dataArray[0].analysis.maxReport.hrMin === 255 ||
            this.dataArray[0].analysis.maxReport.hrMax === 255
              ? 'No'
              : this.dataArray[0].analysis.maxReport.hrMin +
                '~' +
                this.dataArray[0].analysis.maxReport.hrMax +
                ' bpm'
          this.heartDesArray[1].valueDes =
            'Ratio:' +
            this.countPercentValue(
              this.dataArray[0].analysis.maxReport.hrHiPct,
              this.dataArray[0].analysis.maxReport.hrHiDur,
            )
          this.heartDesArray[2].valueDes =
            'Ratio:' +
            this.countPercentValue(
              this.dataArray[0].analysis.maxReport.hrLoPct,
              this.dataArray[0].analysis.maxReport.hrLoDur,
            )

          this.breathDesArray[0].value =
            this.dataArray[0].analysis.maxReport.brMean === 255
              ? 'No'
              : this.dataArray[0].analysis.maxReport.brMean + ' rpm'
          this.breathDesArray[1].value = this.getTimeDis(
            this.dataArray[0].analysis.maxReport.brHiDur,
          )
          this.breathDesArray[2].value = this.getTimeDis(
            this.dataArray[0].analysis.maxReport.brLoDur,
          )
          this.breathDesArray[0].hidden =
            parseInt(this.dataArray[0].analysis.maxReport.brMean) > 0 ? false : true
          this.breathDesArray[1].hidden =
            parseInt(this.dataArray[0].analysis.maxReport.brHiDur) > 0 ? false : true
          this.breathDesArray[2].hidden =
            parseInt(this.dataArray[0].analysis.maxReport.brLoDur) > 0 ? false : true

          this.breathDesArray[0].valueDes =
            this.dataArray[0].analysis.maxReport.brMin === 255 ||
            this.dataArray[0].analysis.maxReport.brMax === 255
              ? 'No'
              : this.dataArray[0].analysis.maxReport.brMin +
                '~' +
                this.dataArray[0].analysis.maxReport.brMax +
                ' rpm'
          this.breathDesArray[1].valueDes =
            'Ratio:' +
            this.countPercentValue(
              this.dataArray[0].analysis.maxReport.brHiPct,
              this.dataArray[0].analysis.maxReport.brHiDur,
            )
          this.breathDesArray[2].valueDes =
            'Ratio:' +
            this.countPercentValue(
              this.dataArray[0].analysis.maxReport.brLoPct,
              this.dataArray[0].analysis.maxReport.brLoDur,
            )

          this.levelValue = this.dataArray[0].analysis.maxReport.ahIndex
          this.dangerousArray[0].value = this.dataArray[0].analysis.maxReport.osaCnt + ' Times'
          this.dangerousArray[1].value = this.dataArray[0].analysis.maxReport.csaCnt + ' Times'
          this.dangerousArray[2].value = this.getTimeSecond(
            this.dataArray[0].analysis.maxReport.ahiDur,
          )
          this.dangerousArray[0].hidden =
            parseInt(this.dataArray[0].analysis.maxReport.osaCnt) > 0 ? false : true
          this.dangerousArray[1].hidden =
            parseInt(this.dataArray[0].analysis.maxReport.csaCnt) > 0 ? false : true
          this.dangerousArray[2].hidden =
            parseInt(this.dataArray[0].analysis.maxReport.ahiDur) > 0 ? false : true

          this.inbedArray = this.dataArray[0].analysis.sleepArray
          this.wakeArray = this.dataArray[0].analysis.maxReport.awakeEvent
          this.leftbedArray = this.dataArray[0].analysis.maxReport.leftBedEvent
        }
        // this.drowChart();
        this.drowChartLine()
        this.drowChartSecond()
      },
      //体动分布
      drowChart() {
        var data = []
        var dataCount = 1440
        let dataList = this.dataArray
        var startTime = 0
        var categories = ['State Distribution']
        var types = [
          { name: 'Not Monitoring', color: '#ABABAB' },
          { name: 'Not in Bed', color: '#FFFFFF' },

          { name: 'Awake', color: '#E2A166' },
          { name: 'Sleep', color: '#B59BEB' },
          { name: 'Sleep', color: '#B59BEB' },
          { name: 'Sleep', color: '#B59BEB' }, //标准版，统一显示为在床
        ]

        //时间轴设置
        var oneDay = 24 * 3600 * 1000
        var fiveMinutes = 60 * 1000
        var timestr = '2016/2/18 ' + this.flag + ':00:00'
        var startTime = +new Date(timestr) - fiveMinutes

        //把new Date出来的时间格式转换为data123中的日期格式
        function riqigeshi(now) {
          return (
            now.toLocaleDateString() + ' ' + now.getHours() + now.toLocaleTimeString().substr(-6, 6)
          )
        }

        //用来返回data123一样的数据格式
        function chartData(i, data, now) {
          return {
            value: [riqigeshi(now), data[i] / 1024],
          }
        }

        //把原数据改成data123一样的格式
        function changeData(datain) {
          var liuru = []
          for (var i = 0; i < 289; i++) {
            startTime = new Date(+startTime + fiveMinutes)
            liuru.push(chartData(i, datain, startTime))
          }
          return liuru
        }

        console.log('stageAry', dataList[0].analysis.stageAry)
        let sleepArrayList = dataList[0].analysis.stageAry
        let len = sleepArrayList.length
        for (var i = 0; i < len; i++) {
          if (sleepArrayList[i] == 3 || sleepArrayList[i] == 4) {
            sleepArrayList[i] = 5
          }
        }

        for (var j = 0; j < 1; j++) {
          var baseTime = +new Date(timestr)
          for (var i = 0; i < dataCount; i++) {
            if (sleepArrayList[i] == 0) {
              var typeItem = types[0]
            } else if (sleepArrayList[i] == 1) {
              var typeItem = types[1]
            } else if (sleepArrayList[i] == 2) {
              var typeItem = types[2]
            } else if (sleepArrayList[i] == 3) {
              var typeItem = types[5]
            } else if (sleepArrayList[i] == 4) {
              // 兼容FH601W设备深睡浅睡统一展示为睡着
              var typeItem = types[5]
            } else if (sleepArrayList[i] == 5) {
              var typeItem = types[5]
            }
            var duration = 1
            data.push({
              name: typeItem.name,
              value: [j, baseTime, (baseTime += fiveMinutes), duration],
              itemStyle: {
                normal: {
                  color: typeItem.color,
                  borderColor: typeItem.color,
                  borderWidth: 1,
                },
              },
            })
          }
        }

        function renderItem(params, api) {
          var categoryIndex = api.value(0)
          var start = api.coord([api.value(1), categoryIndex])
          var end = api.coord([api.value(2), categoryIndex])
          var height = api.size([0, 1])[1]

          var rectShape = echarts.graphic.clipRectByRect(
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

          return (
            rectShape && {
              type: 'rect',
              shape: rectShape,
              style: api.style(),
            }
          )
        }

        myChart.setOption({
          tooltip: {
            formatter: function (params) {
              let state
              switch (params.color) {
                case '#E2A166': //清醒
                  state = 1
                  break
                case '#3A93D4': //浅睡
                  state = 2
                  break
                case '#B59BEB': //深睡
                  state = 3
                  break
                case '#B59BEB': //睡着
                  state = 4
                  break
                case '#D8D8D8': //不在床
                  state = 5
                  break
                case '#A7A8AD': //未在监测
                  state = 6
                  break
              }

              return state != 5 && state != 6
                ? getTime(params.dataIndex, that.flag) +
                    `<br />` +
                    `<br />` +
                    'Status' +
                    ' : ' +
                    params.name +
                    `<br />` +
                    'Heart Rate' +
                    ' : ' +
                    ((JSON.parse(dataList[0].detail.heartRate)[params.dataIndex] > 0 &&
                      JSON.parse(dataList[0].detail.heartRate)[params.dataIndex] < 255) ||
                    JSON.parse(dataList[0].detail.heartRate)[params.dataIndex] < -1
                      ? JSON.parse(dataList[0].detail.heartRate)[params.dataIndex] & 0xff
                      : '--') +
                    'bpm' +
                    `<br />` +
                    'Respiratory Rate' +
                    ' : ' +
                    ((JSON.parse(dataList[0].detail.breathRate)[params.dataIndex] >= 0 &&
                      JSON.parse(dataList[0].detail.breathRate)[params.dataIndex] < 255) ||
                    JSON.parse(dataList[0].detail.breathRate)[params.dataIndex] < -1
                      ? JSON.parse(dataList[0].detail.breathRate)[params.dataIndex] & 0xff
                      : '--') +
                    'rpm' +
                    `<br />` +
                    'Body Movement' +
                    ' : ' +
                    (JSON.parse(dataList[0].detail.status)[params.dataIndex] === 4 ? 'Yes' : 'No')
                : getTime(params.dataIndex, that.flag) +
                    `<br />` +
                    `<br />` +
                    'Status' +
                    ' : ' +
                    params.name
            },
            padding: 20,
            backgroundColor: 'white',
            opacity: 1,
            extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
            textStyle: {
              color: 'black',
            },
          },
          // title: {
          //   text: "Profile",
          //   left: "center"
          // },
          dataZoom: this.dataZoom,
          grid: { x: 84, y: 0, y2: '60%', x2: 70 },
          xAxis: [
            {
              type: 'time',
              splitNumber: 12,
              axisLabel: {
                formatter: function (value, index) {
                  return (
                    prefixInteger(new Date(value).getHours(), 2) +
                    ':' +
                    prefixInteger(new Date(value).getMinutes(), 2)
                  )
                },
                color: 'rgba(50,52,64,0.60)',
                fontWeight: 'bold',
                fontSize: 14,
              },
              axisTick: {
                lineStyle: {
                  width: 0,
                },
              },
              axisLine: {
                lineStyle: {
                  color: 'rgba(203,203,225,0.50)',
                },
              },
              splitLine: {
                lineStyle: {
                  color: '#E5E5F0',
                },
              },
            },
          ],
          yAxis: {
            zlevel: 10,
            data: categories,
            axisLine: {
              lineStyle: {
                color: 'rgba(203,203,225,0.50)',
              },
            },
            axisTick: {
              lineStyle: {
                width: 0,
              },
            },
            axisLabel: {
              color: 'rgba(50,52,64,0.60)',
              fontWeight: 'bold',
              fontSize: 14,
            },
            splitLine: {
              lineStyle: {
                color: '#E5E5F0',
              },
            },
          },
          series: [
            {
              type: 'custom',
              data: [],
            },
            {
              type: 'custom',
              renderItem: renderItem,
              itemStyle: {
                opacity: 1,
              },
              encode: {
                x: [1, 2],
                y: 0,
              },
              data: data,
            },
          ],
        })
      },

      // 心率呼吸率
      drowChartLine() {
        var dataHeart = []
        var dataBreath = []
        var dataCount = 1440
        let dataList = this.dataArray
        var startTime = 0
        let maxHeartRate = 0
        let yInterval = 0
        let yMax = 0

        var data = []
        var categories = ['State Distribution']
        var types = [
          { name: 'Not Monitoring', color: '#ABABAB', borderWidth: 0 },
          { name: 'Not in Bed', color: '#FFFFFF', borderWidth: 0 },
          { name: 'Awake', color: '#E2A166', borderWidth: 0 },
          {
            name: 'Light Sleep',
            color: '#3A93D4',
            borderWidth: 0,
          }, //light sleep
          {
            name: 'Deep Sleep',
            color: '#B59BEB',
            borderWidth: 0,
          }, ////deep sleep
          {
            name: 'Sleep',
            color: '#B59BEB',
            borderWidth: 0,
          }, //标准版，统一显示为睡着
          {
            name: 'Sitting',
            color: '#8FB571',
            borderWidth: 0,
          }, //坐着
        ]

        //时间轴设置
        var oneDay = 24 * 3600 * 1000
        var fiveMinutes = 60 * 1000
        var timestr = '2016/2/18 ' + this.flag + ':00:00'
        var startTime = +new Date(timestr) - fiveMinutes

        //把new Date出来的时间格式转换为data123中的日期格式
        function riqigeshi(now) {
          return (
            now.toLocaleDateString() + ' ' + now.getHours() + now.toLocaleTimeString().substr(-6, 6)
          )
        }

        //用来返回data123一样的数据格式
        function chartData(i, data, now) {
          return {
            value: [riqigeshi(now), data[i] / 1024],
          }
        }

        //把原数据改成data123一样的格式
        function changeData(datain) {
          var liuru = []
          for (var i = 0; i < 289; i++) {
            startTime = new Date(+startTime + fiveMinutes)
            liuru.push(chartData(i, datain, startTime))
          }
          return liuru
        }

        var baseTime = +new Date(timestr)
        let heartRateArr = JSON.parse(this.dataArray[0].detail.heartRate)
        for (var i = 0; i < dataCount; i++) {
          let heartRate = heartRateArr[i]
          if (heartRate != 255 && heartRate > maxHeartRate) {
            maxHeartRate = heartRate
          }

          var duration = 1
          dataHeart.push({
            value: [
              baseTime,
              heartRate == 255 ||
              heartRate == -1 ||
              heartRate == 0 ||
              JSON.parse(this.dataArray[0].detail.breathRate)[i] == 255 ||
              JSON.parse(this.dataArray[0].detail.breathRate)[i] == -1 ||
              this.dataArray[0].analysis.stageAry[i] == 1 ||
              this.dataArray[0].analysis.stageAry[i] == 0
                ? ''
                : heartRate & 0xff,
              duration,
            ],
            itemStyle: {
              normal: {
                color: '#AA0909',
                opacity: 0.4,
              },
            },
          })
          dataBreath.push({
            value: [
              baseTime,
              heartRate == 255 ||
              heartRate == -1 ||
              heartRate == 0 ||
              JSON.parse(this.dataArray[0].detail.breathRate)[i] == 255 ||
              JSON.parse(this.dataArray[0].detail.breathRate)[i] == -1 ||
              this.dataArray[0].analysis.stageAry[i] == 1 ||
              this.dataArray[0].analysis.stageAry[i] == 0
                ? ''
                : JSON.parse(this.dataArray[0].detail.breathRate)[i] == 0 &&
                  JSON.parse(this.dataArray[0].detail.status)[i] != 17 &&
                  JSON.parse(this.dataArray[0].detail.status)[i] != 0
                ? ''
                : JSON.parse(this.dataArray[0].detail.breathRate)[i] & 0xff,
              duration,
            ],
            itemStyle: {
              normal: {
                color: '#015B46',
                opacity: 0.4,
              },
            },
          })

          baseTime += fiveMinutes
        }

        if (maxHeartRate <= 100) {
          yInterval = 10
          if (maxHeartRate == 100) {
            yMax = 110
          } else {
            yMax = 100
          }
        } else if (maxHeartRate <= 150) {
          yInterval = 15
          if (maxHeartRate == 150) {
            yMax = 165
          } else {
            yMax = 150
          }
        } else {
          //maxHeartRate <= 200
          yInterval = 20
          if (maxHeartRate == 200) {
            yMax = 220
          } else {
            yMax = 200
          }
        }

        //***********状态分布数据
        let sleepArrayList = dataList[0].analysis.stageAry

        for (var j = 0; j < 1; j++) {
          var baseTime = +new Date(timestr)
          for (var i = 0; i < dataCount; i++) {
            if (sleepArrayList[i] == 0) {
              var typeItem = types[0]
            } else if (sleepArrayList[i] == 1) {
              var typeItem = types[1]
            } else if (sleepArrayList[i] == 2) {
              var typeItem = types[2]
            } else if (sleepArrayList[i] == 4) {
              //浅睡
              var typeItem = types[3]
            } else if (sleepArrayList[i] == 3) {
              //深睡
              // 兼容FH601W设备深睡浅睡统一展示为睡着
              var typeItem = types[4]
            } else if (sleepArrayList[i] == 5) {
              var typeItem = types[5]
            } else if (sleepArrayList[i] == 6) {
              var typeItem = types[6]
              this.sitBoolean = true
            }
            var duration = 1
            data.push({
              name: typeItem.name,
              value: [j, baseTime, (baseTime += fiveMinutes), duration],
              itemStyle: {
                normal: {
                  color: typeItem.color,
                  borderColor: typeItem.color,
                  borderWidth: typeItem.borderWidth,
                  opacity: 0.4,
                },
              },
            })
          }
        }

        function renderItem(params, api) {
          var categoryIndex = api.value(0)
          var start = api.coord([api.value(1), categoryIndex])
          var end = api.coord([api.value(2), categoryIndex])
          var height = yMax * 10

          var rectShape = echarts.graphic.clipRectByRect(
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

          return (
            rectShape && {
              type: 'rect',
              shape: rectShape,
              style: api.style(),
            }
          )
        }

        // ************
        // var option = {
        myChartLine.setOption({
          //提示框组件
          tooltip: {
            formatter: function (params) {
              let state
              switch (params.color) {
                case '#E2A166': //清醒
                  state = 1
                  break
                case '#3A93D4': //浅睡
                  state = 2
                  break
                case '#B59BEB': //深睡
                  state = 3
                  break
                case '#B59BEB': //睡着
                  state = 4
                  break
                case '#FFFFFF': //不在床
                  state = 5
                  break
                case '#ABABAB': //未在监测
                  state = 6
                  break
                case '#8FB571': //坐着
                  state = 7
                  break
              }
              return state != 5 && state != 6
                ? getTime(params.dataIndex, that.flag) +
                    `<br />` +
                    'Status' +
                    ' : ' +
                    params.name +
                    `<br />` +
                    'Heart Rate' +
                    ' : ' +
                    ((JSON.parse(dataList[0].detail.heartRate)[params.dataIndex] > 0 &&
                      JSON.parse(dataList[0].detail.heartRate)[params.dataIndex] < 255) ||
                    JSON.parse(dataList[0].detail.heartRate)[params.dataIndex] < -1
                      ? JSON.parse(dataList[0].detail.heartRate)[params.dataIndex] & 0xff
                      : '--') +
                    'bpm' +
                    `<br />` +
                    'Respiratory Rate' +
                    ' : ' +
                    ((JSON.parse(dataList[0].detail.breathRate)[params.dataIndex] >= 0 &&
                      JSON.parse(dataList[0].detail.breathRate)[params.dataIndex] < 255) ||
                    JSON.parse(dataList[0].detail.breathRate)[params.dataIndex] < -1
                      ? JSON.parse(dataList[0].detail.breathRate)[params.dataIndex] == 0 &&
                        JSON.parse(dataList[0].detail.status)[params.dataIndex] != 17 &&
                        JSON.parse(dataList[0].detail.status)[params.dataIndex] != 0
                        ? '--'
                        : JSON.parse(dataList[0].detail.breathRate)[params.dataIndex] & 0xff
                      : '--') +
                    'rpm' +
                    `<br />` +
                    'Body Movement' +
                    ' : ' +
                    (JSON.parse(dataList[0].detail.status)[params.dataIndex] == 0x22 ||
                    JSON.parse(dataList[0].detail.status)[params.dataIndex] == 0x23
                      ? 'Yes'
                      : 'No')
                : getTime(params.dataIndex, that.flag) + `<br />` + 'Status' + ' : ' + params.name
            },
            padding: 10,
            backgroundColor: 'white',
            opacity: 0.4,
            // position: function(point, params, dom, rect, size) {
            //   // 固定在顶部
            //   return [point[0] + 20, point[1] + 20];
            // },
            extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
            textStyle: {
              color: 'black',
            },
          },
          // toolbox: {
          //   feature: {
          //     dataView: { show: true, readOnly: false },
          //     magicType: { show: true, type: ["line", "scatter"] },
          //     restore: { show: true },
          //     saveAsImage: { show: true }
          //   }
          // },]
          //缩放
          dataZoom: [
            {
              type: 'inside',
              show: false,
              minSpan: 2,
            },

            {
              type: 'slider',
              show: false,
              minSpan: 2,
            },
          ],
          xAxis: [
            {
              type: 'time',
              splitNumber: 12,
              axisLabel: {
                color: 'rgba(50,52,64,0.60)',
                fontWeight: 'bold',
                fontSize: 14,
                formatter: function (value, index) {
                  return (
                    prefixInteger(new Date(value).getHours(), 2) +
                    ':' +
                    prefixInteger(new Date(value).getMinutes(), 2)
                  )
                },
                show: false,
              },
              axisTick: {
                lineStyle: {
                  width: 0,
                },
              },
              axisLine: {
                lineStyle: {
                  color: 'rgba(203,203,225,0.50)',
                },
              },
              splitLine: {
                lineStyle: {
                  color: '#E5E5F0',
                },
              },
            },
          ],
          yAxis: {
            type: 'value',
            // data: [0, 10, 20, 30,40,50,60,70,80,90,100,110,120,130,140,150],
            min: 0,
            max: yMax,
            interval: yInterval,
            axisTick: {
              lineStyle: {
                width: 0,
              },
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(203,203,225,0.50)',
              },
            },
            axisLabel: {
              color: 'rgba(50,52,64,0.60)',
              fontWeight: 'bold',
              fontSize: 14,
            },
            splitLine: {
              lineStyle: {
                color: '#E5E5F0',
              },
            },
          },
          //直角坐标系内绘图网格
          grid: { x: 84, y: '7%', y2: '5', x2: 70 },
          series: [
            {
              name: 'Respiratory Rate',
              type: 'line',
              data: dataBreath,
              symbolSize: 2,
              showSymbol: false,
              itemStyle: {
                color: '#015B46',
              },
              lineStyle: {
                width: 1,
              },
              markLine: {
                silent: true,
                symbol: 'none',
                animation: true,
                lineStyle: {
                  width: 1,
                  normal: {
                    type: 'dashed',
                  },
                },
                data: [
                  {
                    name: 'Line of average value',
                    yAxis: that.dataArray[0].analysis.avgBreathRate, // 数值类型，对应y轴坐标
                  },
                ],
              },
            },
            {
              name: 'Heart Rate',
              type: 'line',
              data: dataHeart,
              showSymbol: false,
              symbolSize: 2,
              itemStyle: {
                color: '#AA0909',
              },
              lineStyle: {
                width: 1,
              },
              markLine: {
                silent: true,
                symbol: 'none',
                animation: true,
                lineStyle: {
                  normal: {
                    type: 'dashed',
                  },
                },
                data: [
                  {
                    name: 'Line of average value',
                    yAxis: that.dataArray[0].analysis.avgHeartRate, // 数值类型，对应y轴坐标
                  },
                ],
              },
            },
            {
              type: 'custom',
              renderItem: renderItem,
              itemStyle: {
                opacity: 1,
              },
              encode: {
                x: [1, 2],
                y: 0,
              },
              data: data,
            },
          ],
        }, {lazyUpdate: true})
        // this.myChartLine.setOption(option)
      },
      // 体动
      drowChartSecond() {
        var data = []
        var dataCount = 1440
        let dataList = this.dataArray
        var startTime = 0
        var categories = ['Body Movement']
        var types = [
          { name: 'Body Movement', color: '#8FB571' },
          { name: 'No Body Movement', color: '#F4F8F9' },
        ]
        //时间轴设置
        var oneDay = 24 * 3600 * 1000
        var fiveMinutes = 60 * 1000
        var timestr = '2016/2/18 ' + this.flag + ':00:00'
        var startTime = +new Date(timestr) - fiveMinutes

        //把new Date出来的时间格式转换为data123中的日期格式
        function riqigeshi(now) {
          return (
            now.toLocaleDateString() + ' ' + now.getHours() + now.toLocaleTimeString().substr(-6, 6)
          )
        }

        //用来返回data123一样的数据格式
        function chartData(i, data, now) {
          return {
            value: [riqigeshi(now), data[i] / 1024],
          }
        }

        //把原数据改成data123一样的格式
        function changeData(datain) {
          var liuru = []
          for (var i = 0; i < 289; i++) {
            startTime = new Date(+startTime + fiveMinutes)
            liuru.push(chartData(i, datain, startTime))
          }
          return liuru
        }

        for (var j = 0; j < 1; j++) {
          var baseTime = +new Date(timestr)
          for (var i = 0; i < dataCount; i++) {
            //0x22，0x23表示有体动
            if (
              (JSON.parse(dataList[0].detail.status)[i] == 0x22 ||
                JSON.parse(dataList[0].detail.status)[i] == 0x23) &&
              JSON.parse(dataList[0].detail.statusValue)[i] > 0
            ) {
              var typeItem = types[0]
            } else {
              var typeItem = types[1]
            }
            var duration = 1
            data.push({
              name: typeItem.name,
              value: [j, baseTime, (baseTime += fiveMinutes), duration],
              itemStyle: {
                normal: {
                  color: typeItem.color,
                  borderColor: typeItem.color,
                  borderWidth: 1,
                },
              },
            })
          }
        }

        function renderItem(params, api) {
          var categoryIndex = api.value(0)
          var start = api.coord([api.value(1), categoryIndex])
          var end = api.coord([api.value(2), categoryIndex])
          var height = api.size([0, 1])[1] * 0.74

          var rectShape = echarts.graphic.clipRectByRect(
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

          return (
            rectShape && {
              type: 'rect',
              shape: rectShape,
              style: api.style(),
            }
          )
        }

        myChartSecond.setOption({
          tooltip: {
            formatter: function (params) {
              return 'Body Movement' + ' : ' + (params.color == '#8FB571' ? 'Yes' : 'No')
            },
            padding: 20,
            backgroundColor: 'white',
            opacity: 1,
            extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);',
            textStyle: {
              color: 'black',
            },
          },
          // title: {
          //   text: "Profile",
          //   left: "center"
          // },
          dataZoom: this.dataZoom,
          grid: { x: 84, y: 0, y2: 0, x2: 70, height: 45 },
          xAxis: [
            {
              type: 'time',
              splitNumber: innerWidth > 1024 ? 12 : 4,
              axisLabel: {
                color: 'rgba(50,52,64,0.60)',
                fontWeight: 'bold',
                formatter: function (value, index) {
                  return (
                    prefixInteger(new Date(value).getHours(), 2) +
                    ':' +
                    prefixInteger(new Date(value).getMinutes(), 2)
                  )
                },
              },
              axisTick: {
                lineStyle: {
                  width: 0,
                },
              },
              axisLine: {
                lineStyle: {
                  color: 'rgba(203,203,225,0.50)',
                },
              },
              splitLine: {
                lineStyle: {
                  color: 'red',
                },
              },
            },
          ],
          yAxis: {
            zlevel: 10,
            data: categories,
            axisLine: {
              lineStyle: {
                color: 'rgba(203,203,225,0.50)',
              },
              show: false,
            },
            axisTick: {
              lineStyle: {
                width: 0,
              },
            },
            axisLabel: {
              color: 'rgba(50,52,64,0.60)',
              fontWeight: 'bold',
              fontSize: 12,
              width: 80,
              overflow: 'break',
            },
            splitLine: {
              lineStyle: {
                color: '#E5E5F0',
              },
            },
          },
          series: [
            {
              type: 'custom',
              renderItem: renderItem,
              itemStyle: {
                opacity: 1,
              },
              encode: {
                x: [1, 2],
                y: 0,
              },
              data: data,
            },
          ],
        }, {lazyUpdate: true})
      },
      getTimeString(val) {
        let hour = parseInt(val / 60)
        let min = val % 60
        let h_str = hour < 10 ? '0' + hour : hour
        let m_str = min < 10 ? '0' + min : min
        return h_str + ':' + m_str
      },
      getTimeDis(val) {
        if (val > 59) {
          return parseInt(val / 60) + ' hr ' + (val % 60 == 0 ? '' : (val % 60) + ' min')
        } else {
          return val + ' min'
        }
      },
      getTimeSecond(val) {
        if (val > 59) {
          return parseInt(val / 60) + ' min ' + (val % 60 == 0 ? '' : (val % 60) + ' sec')
        } else {
          return val + ' sec'
        }
      },

      getCountAndMintutes(count, val) {
        if (count > 0) {
          if (val > 59) {
            return (
              count + ' times' + '(' + (parseInt(val / 60) + ' hr ' + (val % 60) + ' min') + ')'
            )
          } else {
            return count + ' times' + '(' + 'total ' + val + ' min' + ')'
          }
        } else {
          return count + ' times'
        }
      },
      getTimeDuration(val, type) {
        if (
          type == 'BREATH_FAST' ||
          type == 'BREATH_SLOW' ||
          type == 'BREATH_STOP' ||
          type == 'HEART_SLOW' ||
          type == 'HEART_FAST'
        ) {
          //以上四种情况服务器传过来的是秒，单独处理
          if (val > 3599) {
            let min = Math.floor(val % 3600)
            return (
              parseInt(val / 3600) + ' 小时' + parseInt(min / 60) + ' 分钟' + (val % 60) + ' 秒'
            )
          } else if (val > 59) {
            return parseInt(val / 60) + ' 分钟' + (val % 60) + ' 秒'
          } else {
            return val + ' 秒'
          }
        } else {
          if (val > 59) {
            return parseInt(val / 60) + ' 小时' + (val % 60) + ' 分钟'
          } else {
            return val + ' 分钟'
          }
        }
      },
      getTimeStamp(val) {
        if (val <= 0) {
          return '--'
        } else {
          return (
            (new Date(val * 1000).getHours() < 10
              ? '0' + new Date(val * 1000).getHours()
              : new Date(val * 1000).getHours()) +
            ':' +
            (new Date(val * 1000).getMinutes() < 10
              ? '0' + new Date(val * 1000).getMinutes()
              : new Date(val * 1000).getMinutes())
          )
        }
      },
      getTitleDis(val) {
        if (val == 'AWAKE') {
          return 'Awake'
        } else if (val == 'LEFT_BED') {
          return 'Left Bed'
        } else if (val == 'BREATH_STOP') {
          return 'Breath Pause'
        } else if (val == 'BREATH_SLOW') {
          return 'Breath Rate Low than {0} times/min'
        } else if (val == 'BREATH_FAST') {
          return 'Breath Rate High than {0} times/min'
        } else if (val == 'HEART_SLOW') {
          return 'Heart Rate Low than {0} times/min'
        } else if (val == 'HEART_FAST') {
          return 'Heart Rate High than {0} times/min'
        }
      },
      showExplain(val) {
        if (val == 'AWAKE') {
          return 'Only wake-up events occurred during the sleep are counted, and if the user leaves bed, the wake-up time before and after leaving bed is counted as a wake-up time.'
        } else if (val == 'LEFT_BED') {
          return 'Only monitor the out of bed events during this sleeping period.'
        } else if (val == 'BREATH_STOP') {
          return '仅统计本次睡眠时段内出现的呼吸暂停次数。'
        } else if (val == 'BREATH_SLOW') {
          return this.$t('exp_bradypnea')
        } else if (val == 'BREATH_FAST') {
          return this.$t('exp_tachypnea')
        } else if (val == 'HEART_SLOW') {
          return this.$t('exp_bradycardia')
        } else if (val == 'HEART_FAST') {
          return this.$t('exp_tachycardia')
        } else if (val == 'HEART') {
          return (
            `According to the normal resting heart rate chart published by the National Institutes of Health (NIH), the normal heart rate of adults is 60 to 100 beats per minute. Resting heart rate decreases with age, with an average upper limit of 90 beats/min in people over 50 years of age. The normal heart rate during sleep is usually between 40 and 50 beats per minute, but it varies from person to person and from a variety of factors. After falling asleep, the heart rate begins to slow down during light sleep and reaches its lowest level during deep sleep. During rapid eye movement (REM) sleep, heart rate generally increases to levels similar to those while you are awake.<br>` +
            `Stress and anxiety, bad sleep habits, fever, caffeine intake, and certain medications may also increase heart rate, high heart rate is associated with longer time to fall asleep, reduced sleep quality, and increased risk for cardiovascular disease.<br>` +
            `"Underlying health conditions such as heart disease, rheumatic fever, hypothyroidism and sleep apnea, and certain medications can sometimes cause heart rate to decrease."<br>` +
            `A transient fast/slow speed does not indicate a physical abnormality. If your resting heart rate is persistently higher or lower than the average level, please seek medical attention in time.<br>` +
            `Note: Only the heart rate during this sleep is counted.<br>` +
            `[1]Jay Summer,"What Is a Normal Sleeping Heart Rate?".SleepFoundation.org.<br>` +
            `Retrieved on March 29, 2022`
          )
        } else if (val == 'BREATH') {
          return (
            `The normal respiratory rate of adults at rest is 12 to 20 breaths per min The respiratory rate changes with age. In adults from 65 to 80 years of age, the respiratory rate ranges from 12 to 28 breaths per min, whereas in persons over 80 years of age, the respiratory rate from 10 to 30 breaths per min is normal.<br>` +
            `The reasons for high respiratory rate during sleep include psychological causes (anxiety, fear), pathological causes (asthma or other lung diseases, heart failure, hyperthyroidism, fever, etc.), and medication causes (medications such as aspirin, stimulants, and cannabis).<br>` +
            `Sleep apnea, if present, causes breathing to slow and stop briefly during sleep. In the absence of sleep apnea, other causes of low respiratory rate during sleep include psychological causes (emotional stress and chronic anxiety disorders, etc.), pathological causes (hypothyroidism, pulmonary diseases, allergies, heart disease), medication use (especially central nervous system inhibitors), and overdrinking.<br>` +
            `A transient rapid/slow breathing does not indicate a physical abnormality. If you have a long time of rapid/slow breathing, or the duration of rapid/slow breathing becomes longer, or the respiratory rate is much higher/lower than before, or you have some physical or psychological symptoms (such as drowsiness, anxiety, fever, difficult breathing, chest pain, gray or blue complexion, etc.), please seek medical examination in time.<br>` +
            `Note: Only monitor the respiratory rate during this sleep period.<br>` +
            `[1] What to know about tachypnea.MEDICAL NEW TODAY. Retrieved on September 15, 2020<br>` +
            `[2]What to know about bradypnea.MEDICAL NEW TODAY. Retrieve on September 15, 2020<br>` +
            `[3] Sleep Respiratory Rate.SleepFoundation.org.<br>` +
            `Retrieved on March 29, 2022`
          )
        } else if (val == 'ALARM') {
          return 'Note: Only monitor alarm events occurred during the in bed period.'
        } else if (val == 'AHI') {
          return (
            `Sleep apnea is a kind of sleep-related breathing disorder, which is divided into obstructive sleep apnea (OSA) and central sleep apnea (CSA). People with sleep apnea have recurrent, brief episodes of spanopnea or apnea during sleep, most often resulting in micro-arousal (not fully awake) that is unaware of, and reducing the sleep quality and blood oxygen levels. Common symptoms include snoring during sleep, accompanied by apnea, frequent night wake-up, daytime sleepiness, short of breath when waking up, headache in the morning, and amnesia, which seriously affect the living quality and lifespan of patients. In the long run, it will cause a variety of health problems, such as cardiovascular diseases, metabolic disorders, pulmonary hypertension, and emotional disorders.<br>` +
            `The monitoring results of the device are for reference only, and further observation is needed. If this situation continues for a long time, please seek medical examination in time.<br>` +
            `Note: Only monitor the apnea events after falling asleep.<br>` +
            `[1] Austin Meadows, ""Apnea-Hypopnea Index (AHI)"". www. SleepFoundation.org.<br>` +
            `[2] Eric Suni, ""Sleep Apnea"". www. SleepFoundation.org.<br>` +
            `Retrieved on September 26, 2022`
          )
        } else if (val == 'HEART_MUTATE') {
          return (
            `Heart rate variability (HRV) is an indicator that measures subtle changes in the intervals between heartbeats, measured in millisecs (ms). A healthy heart does not beat as mechanically uniform as a metronome, but rather exhibits natural fluctuations between consecutive heartbeats. For example, even with a heart rate of 60 beats per minute, it does not mean that the heart beats every second exactly. In reality, you may experience one interval of 1.12 secs followed by a shorter interval of 0.86 secs, averaging 60 beats per min HRV is considered a key physiological indicator reflecting cardiovascular health, autonomic nervous system activity levels, and the ability to respond to and recover from stress.<br>` +
            `There is no standard range for HRV, with values typically fluctuating between 20 and 80 millisecs, but readings of 90 to 100 millisecs or higher may also occur. This variability depends on factors such as age, gender, lifestyle, genetic background, and health status. Generally, a higher HRV indicates better cardiovascular function and body adaptability, while a lower HRV suggests higher risks of anxiety, depression, and cardiovascular diseases.<br>` +
            `Monitoring nighttime HRV can reflect the body's recovery after a night's sleep. Ideally, good sleep promotes recovery of the heart and autonomic nervous system, thus increasing HRV values. Conversely, poor sleep quality or sleep disorders may lead to lower HRV, indicating insufficient rest and recovery.<br>` +
            `"[1]""What Is Heart Rate Variability?"". www.webmd.com<br>` +
            `Retrieved on March 19, 2024"`
          )
        }
      },
      showExplainImg(val) {
        return true
        let lang = localStorage.getItem('language')
        if (lang == 'ja') {
          if (val == 'AWAKE' || val == 'LEFT_BED') {
            return true
          } else {
            return false
          }
        } else {
          return true
        }
      },
      showScoreExplain(index, deduction) {
        switch (index) {
          case 0:
            {
              return (
                this.pointsCount(index, deduction) +
                '\n' +
                'Recommendation is 7 to 8 hrs' +
                '\n' +
                `The guidelines of the National Sleep Foundation recommend seven to nine hrs of sleep a night for healthy adults, and seven to eight hrs of sleep a night for people over the age of 65, no more than nine hrs and no less than five hrs.<br>` +
                `Occasional episodes of excessive sleep duration may be caused by fatigue and sleep deprivation, but long-term excessive sleep duration may be associated with sleep disorders, psychological disorders, or other chronic diseases, such as anxiety and depression, obesity, and cardiovascular disease. In addition, long-term excessive sleep duration will cause harm to physiological and psychological status, such as gastrointestinal discomfort, dizziness, and low mood.<br>` +
                `Chronic sleep deprivation is prone to metabolic and endocrine problems. For example, lack of sleep increases the risk of diabetes and cardiovascular disease, accelerates cognitive decline, and thereby increasing the risk of dementia.<br>` +
                `[1]NationalSleepFoundation's sleeptime duration recommendations: methodologyandresultssummary. "Sleep Health". <br>` +
                `[2] Short sleep linked to aging brain AASM, SLEEP EDUCATION. <br>` +
                `Retrieved on August 9, 2021.`
              )
            }
            break
          case 1:
            {
              return (
                this.pointsCount(index, deduction) +
                '\n' +
                'Recommendation ≥80%' +
                '\n' +
                `Sleep efficiency is defined as the percentage of the total time staying asleep divided by the total time in bed. The higher the sleep efficiency, the more effective the sleep. Sleep efficiency drops significantly with the increase of age, the healthy sleep efficiency of adults is about 85% or higher, the sleep efficiency of the elderly over 60~70 years old is lower, which is about 80%, and the sleep efficiency of the elderly over 80 years old will drop to 75%.<br>` +
                '[1]Sophie Desjardins, Sylvie Lapierre, Carol Hudon and Alain Desgagné, Factors involved in sleep efficiency: a population-based study of community-dwelling elderly persons. Sleep Research Society. SLEEPJ, 2019, 1–10'
              )
            }
            break
          case 2:
            {
              return (
                this.pointsCount(index, deduction) +
                '\n' +
                'Recommendation ≥20%' +
                '\n' +
                `Sleep is composed of several sleep cycles, and a whole night sleep generally has 4 to 6 sleep cycles, each cycle lasts about 90 to 120 mins or so, but also varies from person to person. Sleep goes from light to deep, deep sleep is a very important part of the sleep cycle, which can allow the body to recover and grow, strengthen the immune system, and so on. Generally, the longer the deep sleep, the better the sleep quality.<br>` +
                `For adults, deep sleep accounts for 13% to 23% of the total night's sleep, and it is getting shorter with age.<br>` +
                `[1]Danielle Pacheco,Deep Sleep: How Much Do You Need?.SleepFoundation.org.<br>` +
                `Retrieved on March 29, 2022`
              )
            }
            break
          case 3:
            {
              return (
                this.pointsCount(index, deduction) +
                '\n' +
                'Recommendation: Wake-up times ≤0.4 times/hr, and the time staying awake is less than 20%' +
                '\n' +
                `The sleep continuity index is the average wake-up times per hour after fall asleep. The lower the sleep continuity index, the less the waking time, and the better the sleep continuity.<br>` +
                `Recurrent wake-up during sleep can occur for a variety of reasons, such as illness, emotional problems, and unhealthy living habits. The elderly are more likely to wake up and be disturbed due to natural changes in sleep mode, resulting in less deep sleep and more light sleep. Secondly, a urological survey found that about half of people in their 60s and nearly 80 percent of the elderly wake up because of nocturnal urination. Recurrent wake-up may also be an early symptom of neurodegenerative diseases, including age-related cognitive impairment, Alzheimer's dementia, and Parkinson's disease. In the long run, the rate of occurrence of cardiovascular disease, weight gain, and metabolic problems (including diabetes mellitus type 2) also increases.<br>` +
                `Seek medical attention if you wake up more frequently or for longer periods of time and experience significant daytime sleepiness.<br>` +
                `Note: Only monitor the number of times of being awake for more than 5 mins after falling asleep.<br>` +
                `[1] Eric Suni, Interrupted Sleep. www. SleepFoundation.org.<br>` +
                `[2] Duffy, J. F., Scheuermaier, K., Loughlin, K. R. (2016). Age-Related Sleep Disruption and Reduction in the Circadian Rhythm of Urine Output: Contribution to Nocturia?. Current aging science, 9(1), 34–43.<br>` +
                `Retrieved on March 29, 2022.`
              )
            }
            break
          case 4:
            {
              return (
                this.pointsCount(index, deduction) +
                '\n' +
                'Recommendation ≤5 times/hr' +
                '\n' +
                `Body movements refer to the movements of your body during sleep, such as turning over or moving of the limbs. Body movement index is the average number of body movements per hr after sleep. Body movement during sleep may be closely related to the transition of sleep state. For example, body movements during light sleep may delay the transition from sleep to deep sleep. Body movements decrease with age, but they are more likely to disrupt your sleep. In the sleep of the elderly, the occurrence of physical movement is often followed by spontaneous wake-up, which may lead to the disruption of sleep continuity.<br>` +
                `Note: Only monitor the number of body movements after falling asleep.<br>` +
                `[1] Giganti F , Ficca G , Gori S , et al. Body movements during night sleep and their relationship with sleep stages are further modified in very old subjects'J'. Brain Research Bulletin, 2008, 75(1):66-69.`
              )
            }
            break
          case 5:
            {
              return (
                this.pointsCount(index, deduction) +
                '\n' +
                'Recommendation < 5 events/hr' +
                '\n' +
                `Apnea/hypopnea risk The risk of sleep apnea is determined by the average number of apnea and hypopnea events per hr during sleep (apnea-hypopnea index, or AHI). An AHI of less than 5 is defined as no risk, 5 to 15 is defined as low risk, 15 to 30 is defined as medium risk, and 30 or more is defined as high risk.<br>` +
                `Sleep apnea is a type of sleep-related breathing disorder, which is divided into obstructive sleep apnea (OSA) and central sleep apnea (CSA). People with sleep apnea have recurrent, brief episodes of spanopnea or apnea during sleep, most often resulting in micro-arousal (not fully awake) that is unaware of, and reducing the sleep quality and blood oxygen levels. Common symptoms include snoring during sleep, accompanied by apnea, frequent night wake-up, daytime sleepiness, short of breath when waking up, headache in the morning, and amnesia, which seriously affect the living quality and lifespan of patients.<br>` +
                `Approximately 20% of old people are affected by sleep apnea, and men are two to three times more likely than women. In the long run, it will cause a variety of health problems, such as cardiovascular diseases, metabolic disorders, pulmonary hypertension, and emotional disorders.<br>` +
                `The monitoring results of the device are for reference only, and further observation is needed. If this situation continues for a long time, please seek medical examination in time.<br>` +
                `Note: Only apnea events during sleep are counted.<br>` +
                `[1] Austin Meadows, Apnea-Hypopnea Index (AHI). www. SleepFoundation.org.<br>` +
                `[2] Eric Suni, Sleep Apnea. www. SleepFoundation.org.<br>` +
                `Retrieved on September 26, 2022.`
              )
            }
            break
          case 6:
            {
              return (
                'Recommendation: No risk' +
                '\n' +
                `Atrial fibrillation is a flutter or irregular heartbeat (arrhythmia). By collecting heart rate data, our sleep monitor further analyzes the user's suspected atrial fibrillation risk level, which is divided into four levels: no risk, low risk, moderate risk, and high risk.<br>` +
                `Patients with atrial fibrillation have one or more symptoms, such as fatigue, rapid and irregular heart rate, chest flutter or "thumping", dizziness, short of breath and anxiety, fainting or clouding of consciousness, chest pain or chest distress, and so on. It can lead to blood clots, stroke, heart failure and other heart-related complications. Those with atrial fibrillation are nearly five times more likely to have a stroke than those without. But some people with atrial fibrillation have no symptoms and can only be found out after seeing a doctor.<br>` +
                `If two people share a bed, the regularity of heart rate will be affected, and thus affecting the judgment on the risk of atrial fibrillation. The monitoring results of the device are for reference only. If the suspected risk of AF continues to occur, please seek medical examination in time.<br>` +
                `Note: Only the atrial fibrillation in this sleep period is counted.<br>` +
                `[1]What are the Symptoms of Atrial Fibrillation (AFib or AF)?.<br>` +
                `AHA/ASA retrieved on August 8, 2022.`
              )
            }
            break
        }
      },

      slideColor(percent) {
        if (percent < 5) {
          return '#61A9DD'
        } else if (percent < 15) {
          return '#E8CE85'
        } else if (percent < 30) {
          return '#E8B484'
        } else return '#E48B8B'
      },
      parseEventArray(event) {
        let n1 = event[0]
        let n2 = event[1]
        let n3 = event[2]
        let inbedEvent = event.slice(3, 2 * n1 + 3)
        let wakeEvent = event.slice(2 * n1 + 3, 2 * (n1 + n2) + 3)
        let leftbedEvent = event.slice(2 * (n1 + n2) + 3, 2 * (n1 + n2 + n3) + 3)
        let inbedArray = []
        let wakeArray = []
        let leftArray = []

        for (let i = 0; i < inbedEvent.length / 2; i++) {
          let item = {
            time: inbedEvent[2 * i] * 60 + this.dataArray[0].analysis.startTime,
            duration: inbedEvent[2 * i + 1],
          }
          inbedArray.push(item)
        }

        for (let i = 0; i < wakeEvent.length / 2; i++) {
          let item = {
            time: wakeEvent[2 * i] * 60 + this.dataArray[0].analysis.startTime,
            duration: wakeEvent[2 * i + 1],
          }
          wakeArray.push(item)
        }
        for (let i = 0; i < leftbedEvent.length / 2; i++) {
          let item = {
            time: leftbedEvent[2 * i] * 60 + this.dataArray[0].analysis.startTime,
            duration: leftbedEvent[2 * i + 1],
          }
          leftArray.push(item)
        }
        this.inbedArray = inbedArray
        this.wakeArray = wakeArray
        this.leftbedArray = leftArray
      },
      analysisSleepTime(min) {
        if (min > 9 * 60) {
          return 'MORE'
        } else if (min <= 5 * 60) {
          return 'LITTLE'
        } else if (min <= 8 * 60 && min > 7 * 60) {
          return 'PERFECT'
        } else return 'NORMAL'
      },
      analysisWake(times) {
        if (times > 1) {
          return 'MORE'
        } else return 'NORMAL'
      },
      analysisEff(value) {
        if (value >= 80) {
          return 'PERFECT'
        } else if (value >= 70 && value < 80) {
          return 'NORMAL'
        } else return 'LITTLE'
      },
      analysisPercent(value) {
        if (value >= 20) {
          return 'PERFECT'
        } else if (value >= 15 && value < 20) {
          return 'NORMAL'
        } else return 'LITTLE'
      },
      analysiscontIndex(value) {
        if (value <= 0.4) {
          return 'PERFECT'
        } else if (value > 0.4 && value <= 1.25) {
          return 'NORMAL'
        } else if (value > 1.25) {
          return 'MORE'
        } else {
          return 'MORE'
        }
      },
      analysisbmIndex(value) {
        if (value <= 5) {
          return 'PERFECT'
        } else if (value > 5 && value <= 15) {
          return 'NORMAL'
        } else {
          return 'MORE'
        }
      },
      analysisahIndex(value) {
        if (value < 5) {
          return 'NO_RISKS'
        } else if (value >= 5 && value < 15) {
          return 'LOW_RISKS'
        } else if (value >= 15 && value < 30) {
          return 'MID_RISKS'
        } else {
          return 'HIGHT_RISKS'
        }
      },
      pointsCount(index, deduction) {
        //扣分
        return 'Penalty：' + (deduction > 0 ? '-' : '') + deduction + ' points'
      },
      analysisHRV(index) {
        if (index == 0) {
          return 'Unknown'
        } else if (index && index == 1) {
          return 'No Risk'
        } else if (index && index == 2) {
          return 'Low Risk'
        } else if (index && index == 3) {
          return 'Mid Risk'
        } else if (index && index == 4) {
          return 'High Risk'
        } else {
          return 'Unknown'
        }
      },
      analyColor(key) {
        if (key == 'NORMAL') {
          return '#87A66F'
        } else if (key == 'MORE') {
          return '#D89D50'
        } else if (key == 'LITTLE') {
          return '#D89D50'
        } else if (key == 'GENNERAL') {
          return '#D89D50'
        } else if (key == 'PERFECT') {
          return '#87A66F'
        } else if (key == 'BAD') {
          return '#D89D50'
        } else if (key == 'TOO_BAD') {
          return '#EE6C59'
        } else if (key == 'NO_RISKS') {
          return '#87A66F'
        } else if (key == 'LOW_RISKS' || key == 'MID_RISKS' || key == 'HIGHT_RISKS') {
          return '#D89D50'
        } else {
          return '#323440'
        }
      },
      analyHRVColor(index) {
        if (index == 0) {
          return '#87A66F'
        } else if (index && index == 1) {
          return '#87A66F'
        } else if (index && index == 2) {
          return '#DDA571'
        } else if (index && index == 3) {
          return '#DDA571'
        } else if (index && index == 4) {
          return '#DDA571'
        } else {
          return '#87A66F'
        }
      },
      analyDes(key) {
        if (key == 'NORMAL') {
          return 'Normal'
        } else if (key == 'MORE') {
          return 'Higher'
        } else if (key == 'LITTLE') {
          return 'Lower'
        } else if (key == 'GENNERAL') {
          return 'General'
        } else if (key == 'PERFECT') {
          return 'Perfect'
        } else if (key == 'BAD') {
          return 'Bad'
        } else if (key == 'TOO_BAD') {
          return 'Too bad'
        } else if (key == 'NO_RISKS') {
          return 'No risk'
        } else if (key == 'LOW_RISKS') {
          return 'Low risk'
        } else if (key == 'MID_RISKS') {
          return 'Mid risk'
        } else if (key == 'HIGHT_RISKS') {
          return 'High risk'
        } else {
          return '--'
        }
      },
      countPercentValue(percent, duration) {
        if (percent == 0 && duration > 0) {
          return '<1%'
        } else {
          return percent + '%'
        }
      },
      inbedDescriptionTips(inbedArr) {
        let des = ''
        if (inbedArr.length <= 1) {
          //在床段数
          des = `Today, a total of ${inbedArr.length} sleeps, detailed sleep analysis can be viewed below`
        } else {
          //第一段为最长在床时段
          des = `Today, a total of ${
            inbedArr.length
          } sleeps, the longest of which is ${this.getTimeStamp(
            inbedArr[0].startTime,
          )}~${this.getTimeStamp(
            inbedArr[0].startTime + inbedArr[0].duration * 60,
          )}, detailed sleep analysis can be viewed below, and others were:`
          let sleep_str = ''
          inbedArr.find((item, index) => {
            if (index > 0) {
              let sep = index > 1 ? '、' : ''
              sleep_str =
                sleep_str +
                sep +
                this.getTimeStamp(item.startTime) +
                '~' +
                this.getTimeStamp(item.startTime + item.duration * 60)
            }
          })
          des = des + sleep_str
        }
        return des
      },
      scoreDescription(score) {
        if (score && score < 70) {
          return `Sleep quality is average, the body's functions have recovered normally`
        } else if (score && score < 85) {
          return `Slept well, the body's functions have recovered well`
        } else {
          return `A high-quality sleep, the body's functions have recovered very well`
        }
      },
      hrv(score) {
        if (score && score < 70) {
          return `Sleep quality is average, the body's functions have recovered normally`
        } else if (score && score < 85) {
          return `Slept well, the body's functions have recovered well`
        } else {
          return `A high-quality sleep, the body's functions have recovered very well`
        }
      },
    },

    beforeDestroy() {
      // myChart.clear();
      // if (this.myChartLine) {
        myChartLine.dispose()
        myChartLine = null
      // }
      // if (this.myChartSecond) {
        myChartSecond.dispose()
        myChartSecond = null
      // }
    },
    beforeUnmount() {
      // myChart.clear();
      // if (this.myChartLine) {
        myChartLine.dispose()
        myChartLine = null
      // }
      // if (this.myChartSecond) {
        myChartSecond.dispose()
        myChartSecond = null
        // window.removeEventListener('resize', this.updateWindowSize);
      // }
    },
    // activated() {
    //   if (!this.myChartLine) {
    //     this.myChartLine = echarts.init(document.getElementById('myChartLine'))
    //   } else {
    //     this.myChartLine.resize()
    //   }
    //   if (!this.myChartSecond) {
    //     this.myChartSecond = echarts.init(document.getElementById('myChartSecond'))
    //   } else {
    //     this.myChartSecond.resize()
    //   }
    // }
  }
</script>

<style lang="scss">
  @media print {
    .app-main {
      width: 1920px !important;
    }
    #app .hideSidebar .main-container {
      margin-left: 0 !important;
    }
    .app-container .msg-box .msg-content .content-top .ant-col {
      width: 400px;
    }
    .sidebar-container {
      display: none;
    }
    .main-container {
      margin-left: 0px !important;

      .fixed-header {
        display: none;
      }
    }
    .print-box {
      display: none !important;
    }
  }

  .ant-tooltip {
    max-width: 50vw;
  }
</style>

<style scoped lang="scss">
  .app-container {
    padding: 20px;
    .empty {
      text-align: center;
      color: #929b8b;
      font-size: 14px;
      img {
        margin: 30px 0 20px 0;
      }
    }
    .print-box {
      position: absolute;
      top: 25px;
      right: 22px;
      display: flex;
      flex-direction: row;

      .content-box {
        display: flex;
        flex-direction: row;
        align-items: center;
        cursor: pointer;

        img {
          display: inline-block;
          width: 30px;
          height: 30px;
          margin-left: 30px;
        }

        p {
          display: inline-block;
          margin-left: 10px;
          font-size: 14px;
          color: #b59beb;
          text-decoration: underline;
        }
      }
    }

    .info-box {
      height: 88px;
      width: 100%;
      line-height: 88px;
      font-weight: bold;
      font-size: 14px;
      color: rgba(50, 52, 64, 0.8);

      ::v-deep .ant-input {
        border: 1px solid rgba(132, 154, 115, 0.1);
      }

      span {
        margin-right: 30px;
      }
    }

    .sleep-summary {
      width: 100%;
      height: 181px;
      background: #ffffff;
      border: 1px solid rgba(203, 203, 225, 0.5);
      border-radius: 8px;

      .summary-title {
        width: 100%;
        height: 80px;
        border-bottom: 1px solid rgba(203, 203, 225, 0.5);
        vertical-align: middle;
        padding-top: 27px;
        padding-left: 40px;

        .img {
          vertical-align: middle;
          width: 26px;
          height: 26px;
        }

        .text {
          vertical-align: middle;
          font-size: 18px;
          color: rgba(50, 52, 64, 0.8);
          font-weight: bold;
          padding-left: 16px;
        }
      }

      .summary-dis {
        height: 100px;

        ul {
          display: flex;
          justify-content: space-around;

          li {
            height: 100px;
            line-height: 100px;
            font-size: 16px;
            color: rgba(50, 52, 64, 0.8);
          }
        }
      }
    }

    .chart-main {
      background: #ffffff;
      overflow: hidden;
      border: 1px solid rgba(#849a73, 0.1);
      border-radius: 8px;
      width: 100%;
      //height: 768px;

      .dis-box {
        //height: 124px;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .title {
          padding: 20px 0px 20px 20px;
          font-size: 14px;
          color: rgba(50, 52, 64, 0.8);
        }

        ul {
          //width: 850px;

          display: flex;
          //height: 124px;
          //padding-top: 20px;
          margin-right: 20px;

          .color-box {
            display: inline-block;
            width: 24px;
            height: 12px;
            margin-left: 20px;
            margin-right: 12px;
          }

          .image-box {
            margin-left: 20px;
            margin-right: 12px;
          }

          .text-box {
            vertical-align: top;
            display: inline-block;
            font-size: 16px;
            color: rgba(50, 52, 64, 0.8);
            height: 24px;
            line-height: 24px;
          }

          li {
            display: flex;
            align-items: center;
          }
        }
      }

      #myChartLine {
        width: 100%;
        height: 200px;
      }

      #myChartSecond {
        width: 100%;
        height: 100px;
        margin-top: -4px;
      }

      #myChart {
        height: 135px;
      }

      .message-box {
        //min-height: 62px;
        background: #f4f8f9;
        margin: 20px;
        border-radius: 8px;
        padding: 18px 20px;

        .des-text {
          font-size: 16px;
          color: rgba(50, 52, 64, 0.8);
        }
      }
    }

    .msg-box {
      width: 100%;
      margin: 20px 0;
      border-radius: 16px;

      .msg-content-empty {
        padding: 42px 15px;
        background: #fff;
        border: 1px solid rgba(203, 203, 225, 0.5);
        border-radius: 8px;
        text-align: center;
        margin-top: 20px;
        font-size: 16px;
        color: rgba(50, 52, 64, 0.6);
      }

      .msg-content {
        //box-shadow: 0 2px 4px 0 rgba(132, 154, 115, 0.2);
        border: 1px solid rgba(#849a73, 0.1);
        border-radius: 8px;
        padding: 20px;
        background: #fff;

        .title {
          height: 20px;
          margin-bottom: 20px;
          font-size: 14px;
          color: rgba(50, 52, 64, 0.8);
        }

        .msg-tip {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          flex: 1;

          .tip-text {
            color: #929b8b;
            font-size: 14px;
            padding-top: 31px;
          }
        }

        .content-top {
          display: flex;
          flex-direction: row;

          .ant-row {
            padding: 0;
          }

          .sleep-box {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            width: 100%;
            border: 1px solid rgba(132, 154, 115, 0.3);
            border-radius: 8px;
            background: #ffffff;
          }

          .sleep-box-right {
            width: 40%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            .state-top {
              .ant-col {
                height: 100%;
                margin: 0;
              }

              .nomarl-box {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 25px 20px;
                background: #ffffff;
                border: 1px solid rgba(132, 154, 115, 0.3);
                border-radius: 8px;
                height: 72px;

                .dis-left {
                  font-size: 16px;
                  color: rgba(50, 52, 64, 0.6);
                }

                .dis-right {
                  font-size: 18px;
                  color: rgba(50, 52, 64, 0.8);
                }
              }
            }

            .state-box {
              background: #ffffff;
              border: 1px solid rgba(132, 154, 115, 0.3);
              border-radius: 8px;
              margin-top: 20px;
              margin-left: 20px;

              .ant-row {
                display: flex;
                justify-content: space-between;
              }

              .ant-col {
                height: 100%;
                margin: 0;
              }

              .sleep-state-box {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 24px 10px;

                .color-box {
                  width: 24px;
                  height: 8px;
                }

                .row1 {
                  padding-top: 8px;
                  font-size: 16px;
                  color: rgba(50, 52, 64, 0.6);
                }

                .row2 {
                  padding-top: 8px;
                  font-size: 24px;
                  color: rgba(50, 52, 64, 0.8);
                }

                .row3 {
                  padding-top: 8px;
                  font-size: 16px;
                  color: rgba(50, 52, 64, 0.8);
                  display: flex;
                  text-align: center;
                }
              }
            }
          }

          .score-view {
            //width: 171px;
            //height: 171px;
            width: 20%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            .socredescription {
              padding: 0 15px;
              font-size: 16px;
              color: rgba(50, 52, 64, 0.8);
            }
          }

          .sleep-detail {
            width: 80%;
            display: flex;
            flex-direction: row;
            word-break: break-all;
            word-wrap: break-word;
            padding-right: 20px;
            padding-bottom: 20px;
            .chart-box-bottom {
              padding-top: 20px !important;
              word-break: keep-all;
            }
          }

          .ant-col {
            height: 140px;
            margin-top: 20px;

            .chart-box {
              height: 100%;
              padding: 10px;
              background: #f4f8f9;
              border-radius: 4px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              //align-items: center;

              &-top {
                display: flex;
                flex-direction: row;
                align-items: center;
                // height: 20px;

                .dis-title {
                  line-height: 1.2;
                  font-size: 16px;
                  color: rgba(50, 52, 64, 0.6);
                }

                //.tool-tip{
                //  background: red;
                //}

                img {
                  margin-left: 8px;
                  width: 20px;
                  height: 20px;
                  vertical-align: middle;
                }
              }

              &-middle {
                height: 20px;
                padding: 2px 0;

                .dis-title {
                  font-size: 14px;
                  color: rgba(50, 52, 64, 0.6);
                  padding-top: 5px;
                  display: flex;
                }
              }

              &-bottom {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                padding-top: 8px;

                .dis {
                  font-size: 16px;
                  color: rgba(50, 52, 64, 0.8);
                }

                .dis-right {
                  float: right;
                  font-size: 16px;
                  color: rgba(50, 52, 64, 0.8);
                }
              }
            }
          }
        }

        .content-bottom {
          .ant-col {
            height: 300px;
            margin-top: 20px;

            .col-state-box {
              display: flex;
              height: 100%;
              border: 1px solid rgba(132, 154, 115, 0.3);
              background: #ffffff;
              border-radius: 8px;
              justify-content: space-around;
              align-items: center;

              .sleep-state-box {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 24px 10px;

                .color-box {
                  width: 24px;
                  height: 8px;
                }

                .row1 {
                  padding-top: 15px;
                  font-size: 16px;
                  color: rgba(50, 52, 64, 0.6);
                }

                .row2 {
                  padding-top: 20px;
                  font-size: 24px;
                  color: rgba(50, 52, 64, 0.8);
                }

                .row3 {
                  padding-top: 20px;
                  font-size: 16px;
                  color: rgba(50, 52, 64, 0.8);
                  display: flex;
                  text-align: center;
                }
              }
            }

            .chart-box {
              height: 100%;
              border: 1px solid rgba(132, 154, 115, 0.3);
              background: #ffffff;
              border-radius: 8px;

              .title-dis {
                height: 66px;
                //border: 1px solid rgba(203, 203, 225, 0.5);
                border-bottom: none;
                padding: 20px;
                margin: 0;

                .dis-left {
                  float: left;
                  font-size: 18px;
                  color: rgba(50, 52, 64, 0.8);
                  letter-spacing: 0;
                  font-weight: bold;
                  display: flex;
                  align-items: center;
                  line-height: 1.1;

                  img {
                    width: 20px;
                    height: 20px;
                    vertical-align: middle;
                    margin-left: 8px;
                  }
                }

                .dis-right {
                  float: right;
                  font-size: 16px;
                  color: rgba(50, 52, 64, 0.8);
                }
              }

              .table-cloum {
                display: flex;
                flex-direction: row;
                justify-content: space-around;
                border-top: 1px solid rgba(203, 203, 225, 0.5);
              }

              .table-slide {
                padding: 20px 31px;
                border-top: 1px solid rgba(203, 203, 225, 0.5);

                .slide-bottom {
                  display: flex;
                  flex-direction: row;
                  padding-top: 10px;
                }

                .slide-des {
                  width: 25%;
                  display: flex;
                  flex-direction: row;

                  .slide-color {
                    width: 12px;
                    height: 12px;
                  }

                  .slide-text {
                    padding-left: 5px;
                    font-size: 12px;
                    color: rgba(50, 52, 64, 0.8);
                  }
                }
              }

              .ma-range-item {
                margin-top: 10px;
                margin-bottom: 10px;
                overflow: hidden;
              }

              .table-alarm {
                flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
                border-top: 1px solid rgba(203, 203, 225, 0.5);

                .alram-text {
                  color: #929b8b;
                  font-size: 14px;
                }
              }

              .slide-cloum {
                display: flex;
                flex-direction: row;
                justify-content: space-around;
                border-top: 1px solid rgba(203, 203, 225, 0.5);
                line-height: 1.1;
              }

              .dangerous-box-bottom {
                display: flex;
                flex-direction: column;
                //align-items: center;
                padding: 32px 15px;

                .color-box {
                  width: 24px;
                  height: 8px;
                }

                .row1 {
                  padding-top: 8px;
                  font-size: 16px;
                  color: rgba(50, 52, 64, 0.6);
                }

                .row2 {
                  padding-top: 8px;
                  font-size: 24px;
                  color: rgba(50, 52, 64, 0.8);
                }

                .row3 {
                  padding-top: 8px;
                  font-size: 16px;
                  color: rgba(50, 52, 64, 0.8);
                }
              }

              .table-box-bottom {
                display: flex;
                flex-direction: column;
                //align-items: center;
                padding: 22px 10px;
                // min-width: 125px;
                line-height: 1.1;

                .color-box {
                  width: 24px;
                  height: 8px;
                }

                .row1 {
                  min-height: 40px;
                  //padding-top: 8px;
                  font-size: 16px;
                  color: rgba(50, 52, 64, 0.6);
                  //text-align: left;
                }

                .row2 {
                  padding-top: 8px;
                  font-size: 24px;
                  color: rgba(50, 52, 64, 0.8);
                }

                .row3 {
                  padding-top: 8px;
                  font-size: 16px;
                  color: rgba(50, 52, 64, 0.8);
                }
              }

              .table-box {
                width: 100%;
                height: 164px;
                text-align: center;
                border-collapse: collapse;

                thead {
                  display: table;
                  width: 100%;
                  table-layout: fixed;
                }

                tbody {
                  height: 108px;
                  display: block;
                  overflow-y: auto;
                  width: 100%;
                  table-layout: fixed;

                  &::-webkit-scrollbar {
                    width: 8px;
                    height: 4px;
                    display: block;
                  }

                  &::-webkit-scrollbar-thumb {
                    /*滚动条里面小方块*/
                    border-radius: 5px;
                    background: #8fb571;
                  }
                }

                td {
                  //border: 1px solid rgba(203, 203, 225, 0.5);
                  border-top: 1px solid rgba(203, 203, 225, 0.5);
                  font-size: 16px;
                  color: rgba(50, 52, 64, 0.8);
                  letter-spacing: 0;
                  text-align: center;
                }

                tr {
                  height: 54px;
                  display: table;
                  width: 100%;
                  table-layout: fixed;
                }
              }
            }
          }
        }
      }
    }
  }
</style>
