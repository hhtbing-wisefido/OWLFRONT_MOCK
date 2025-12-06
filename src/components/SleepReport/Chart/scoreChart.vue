<template>
  <div class="score-content">
    <div id="score-chart"></div>
<!--    <div class="title-content">-->
<!--      <div class="title-p1">{{ score }}</div>-->
<!--      <div class="title-p2">睡眠评分</div>-->
<!--    </div>-->
  </div>
</template>

<script>
import drawChart from '@/utils/chart/drawChart'
// Note: windowStore not needed for basic functionality
// import { defineStore, storeToRefs } from 'pinia'
// import { useWindowStore } from '@/store/modules/window'
// import {mapState} from "vuex";
import * as echarts from 'echarts';

// let myChart;

export default {
  name: "scoreChart",
  props: ['score'],
  data: function () {
    return {
      myChart: null
    }
  },

  watch: {
    score: function (val) {
      this.drawScoreChart(val)
    },
    // Window resize handled by component lifecycle
    // windowInner() {
    //   this.winResize()
    // },
  },

  methods: {
    drawScoreChart: function (value) {
      let data = {
        value : value,
        color : '#729B54'
      }
      this.myChart.setOption(drawChart.scoreChart(data));
    },
    winResize() {
      this.$nextTick(() => {
        // if (!this._isDestroyed) {
        if (this.myChart) {
          this.myChart.resize()
        }
      })
    },
  },
  created() {

  },
  mounted() {
    this.$nextTick(() => {
      if (!this.myChart) {
        this.myChart = echarts.init(document.getElementById('score-chart'));
      }
    })
    //数据
    // this.drawScoreChart()
  },
  beforeDestroy() {
    if (this.myChart) {
      this.myChart.dispose()
      this.myChart = null
    }
    // myChart.clear()
  },
  beforeUnmount() {
    if (this.myChart) {
      this.myChart.dispose()
      this.myChart = null
    }
  },
  activated() {
    if (!this.myChart) {
      this.myChart = echarts.init(document.getElementById('score-chart'));
    } else {
      this.myChart.resize();
    }
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
.score-content {
  /*width: 100%;*/
  /*height: 100%;*/
  /*padding-bottom: 24px;*/
  /*position: relative;*/
  width: 200px;
  height: 200px;
}

#score-chart {
  /*width: 100%;*/
  /*height: 100%;*/
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-content {
  position: absolute;
  z-index: 90;
  display: flex;
  width: 50%;
  top: 40%;
  left: 25%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.title-p1 {
  font-family: SourceHanSansCN-Medium;
  font-size: 36px;
  color: #FFFFFF;
}

.title-p2 {
  font-family: SourceHanSansCN-Medium;
  font-size: 18px;
  color: #FFFFFF;
}
</style>
