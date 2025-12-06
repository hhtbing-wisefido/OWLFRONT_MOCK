<template>
  <div class="heartMutateBox">
    <div id="heartMutateChart" ref="heartMutateChart"></div>
  </div>
</template>

<script>
import drawChart from '@/utils/chart/drawChart'
// Note: windowStore not needed for basic functionality
// import { defineStore, storeToRefs } from 'pinia'
// import { useWindowStore } from '@/store/modules/window'
import * as echarts from 'echarts';

let myChart;
export default {
  name: "heartMutateChart",
  props: ['data'],

  data() {
    return {
    }
  },
  watch: {
    data: function (val) {
      console.log('heartMutateChart---------',val)
      this.drawChart(val)
    },
    // Window resize handled by component lifecycle
    // windowInner() {
    //   this.winResize()
    // },
  },
  methods: {
    drawChart: function (value) {
      let largeValue = 0
      let maxY = 100
      value.map(item => {
        item[0] = new Date(item[0])
        if (item[1] > 100 && item[1] > largeValue) largeValue = item[1]
      })
      if (largeValue) {
        maxY = largeValue + (50 - largeValue % 50)
        console.log('largeValue', largeValue, (50 - largeValue % 50), maxY)
      }
      myChart.setOption(drawChart.heartMutateChart(value, maxY));
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
    myChart = echarts.init(document.getElementById('heartMutateChart'));
    if (this.data){
      this.drawChart(this.data)
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

.heartMutateBox {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

#heartMutateChart {
  width: 100%;
  height: 100%;
}


</style>
