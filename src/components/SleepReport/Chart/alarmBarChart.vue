<template>
  <div class="alarmCount" ref="alarmCount">
    <div id="alarmChart" ref="alarmChart"></div>
  </div>
</template>

<script>
import drawChart from '@/utils/chart/drawChart'
// Note: windowStore not needed for basic functionality
// import { defineStore, storeToRefs } from 'pinia'
// import { useWindowStore } from '@/store/modules/window'
// import {mapState} from "vuex";
import * as echarts from 'echarts';

let myChart;
export default {
  name: "alarmBarChart",
  props: ['data'],

  data: function () {
    return {
      xArray: [this.$t('alert_set_sitting_up'), this.$t('leftbed'),this.$t('news_bed'), this.$t('body_movement_frequent'), this.$t('no_moving'), this.$t('heart_slow'), this.$t('heart_fast'), this.$t('breath_slow'), this.$t('breath_fast'), this.$t('breath_pause')],
    }
  },
  watch: {
    data: function (val) {
      console.log('alarm---------',val)
      this.drawAlarmChart(val)
    },
    // Window resize handled by component lifecycle
    // windowInner(val) {
    //   this.winResize()
    // },
  },
  methods: {
    drawAlarmChart: function (value) {
      let yArray = []
      yArray.push(value.sitUp)
      yArray.push(value.leftBed)
      yArray.push(value.goToBed)
      yArray.push(value.manyBodyMove)
      yArray.push(value.noBodyMove)
      yArray.push(value.noTurnOver)
      yArray.push(value.heartSlow)
      yArray.push(value.heartFast)
      yArray.push(value.breathSlow)
      yArray.push(value.breathFast)
      yArray.push(value.breathStop)
      let data = {
        xAxis: this.xArray,
        yAxis: yArray
      }
      myChart.setOption(drawChart.alarmBarChart(data));
    },
    winResize() {
      this.$nextTick(() => {
        if (!this._isDestroyed) {
          myChart.resize()
        }
      })
    },
  },
  created() {

  },
  mounted() {
    myChart = echarts.init(document.getElementById('alarmChart'));
    // let data = {
    //   xAxis: ['111','222','333'],
    //   yAxis: [2,4,8]
    // }
    // myChart.setOption(drawChart.alarmBarChart(data));
    if (this.data){
      this.drawAlarmChart(this.data)
    }
  },
  beforeDestroy() {
    myChart.clear()
  },
  computed: {
    // Window resize handled by component lifecycle
    // ...storeToRefs(useWindowStore()),
    // ...mapState({
    //   windowInner: state => state.app.windowInner,
    // }),
  },
}
</script>

<style scoped>

.alarmCount {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

#alarmChart {
  width: 100%;
  height: 145px;
  /*height: 100%;*/
  /*display: flex;*/
  /*flex: 1;*/
}


</style>
