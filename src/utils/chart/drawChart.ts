import * as echarts from 'echarts';
import { formatDate } from '@/utils/conversion'

const drawChart = {
  nightingaleChart: function (data, color) {
    let array = []
    let total = eval(data.value.join('+'));
    data.value.forEach((number, index) => {
      let keyName = ''
      if (data.key) {
        keyName = data.key[index]
      }
      let percent = total > 0 ? (number * 100 / total).toFixed(0) : '--'
      let item = {
        value: parseInt(number),
        name: keyName + '\n' + percent + '%'
      }
      array.push(item)
    })
    var option = {
      legend: {
        show: false,
        top: 'bottom'
      },
      tooltip: {
        trigger: 'item',
        valueFormatter: (value) => ''
      },
      toolbox: {
        show: true,
        feature: {
          mark: {
            show: true
          },
          dataView: {
            show: false,
            readOnly: false
          },
          restore: {
            show: false
          },
          saveAsImage: {
            show: false
          }
        }
      },
      color: total > 0 ? color : '#121024',
      series: [
        {
          name: 'Nightingale Chart',
          type: 'pie',
          radius: [0, '60%'],
          center: ['50%', '50%'],
          roseType: 'area',
          itemStyle: {
            borderRadius: 8
          },
          label: {
            color: '#FFF',
          },
          // labelLayout:{
          //   align: 'left',
          //   verticalAlign: 'middle',
          // },
          data: array
        }
      ]
    };
    return option
  },

  deviceChart: function (dataArr, number, color) {
    let array = []
    dataArr.forEach((item, index) => {
      let percent = number > 0 ? item.value : '--'
      let new_item = {
        value: parseInt(item.value),
        name: item.name + '\n' + percent + '%'
      }
      array.push(new_item)
    })
    var option = {
      title: {
        show: false,
        text: 'Referer of a Website',
        subtext: 'Fake Data',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        valueFormatter: (value) => ''
      },
      legend: {
        show: false,
        orient: 'vertical',
        left: 'left'
      },
      color: number > 0 ? color : '#121024',
      series: [
        {
          name: '',
          type: 'pie',
          radius: ['40%', '60%'],
          label: {
            color: '#FFF',
          },
          data: array,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            },
          }
        }
      ]
    };
    return option
  },

  lineChart: function (data) {
    var option = {
      xAxis: {
        type: 'category',
        name: '月',
        nameGap: 8,
        nameTextStyle: {
          color: 'rgba(255,255,255,0.6)',
          fontSize: 10,
          align: 'left',
        },
        axisLabel: {
          color: 'rgba(255,255,255,0.6)',
          fontSize: 10
        },
        data: data.xAxis
      },
      grid: {
        top: 'center',
        height: '180',
        width: '75%'
      },
      yAxis: {
        type: 'value',
        name: '人数',
        minInterval: 1,
        nameTextStyle: {
          color: 'rgba(255,255,255,0.6)',
          fontSize: 10,
          align: 'left',
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          color: 'rgba(255,255,255,0.6)',
        },
        splitLine: {
          show: true,
          lineStyle: {
            opacity: 0.1,
            color: ['#FFFFFF'],
            width: 1,
          },
        },
      },
      series: [
        {
          data: data.yAxis,
          type: 'line',
          showSymbol: false, //标记点
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {offset: 0, color: '#DC620A'},
                {offset: 1, color: '#FCB647'},
              ]),
            }
          },
        }
      ]
    };
    return option
  },

  sleepTimeBarChart: function (data) {
    const labelSetting = {
      show: true,
      color: '#FFFFFF',
      position: 'top',
      formatter: function (param) {
        return param.value + '%';
      },
    };

    var option = {
      xAxis: {
        type: 'category',
        axisLabel: {
          color: 'rgba(255,255,255,0.6)',
          fontSize: 8
        },
        data: data.xAxis,

      },
      yAxis: {
        type: 'value',
        show: true,
        name: '%',
        nameGap: 10,
        nameTextStyle: {
          color: 'rgba(255,255,255,0.6)',
          fontSize: 10,
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          color: 'rgba(255,255,255,0.6)',
        },
        splitLine: {
          show: true,
          lineStyle: {
            opacity: 0.1,
            color: ['#FFFFFF'],
            width: 1,
          },
        },
        // min: 0,
        // max: 100
      },
      grid: {
        show: false,
        top: 'center',
        height: '180'
      },
      series: [
        {
          data: data.yAxis,
          type: 'bar',
          showBackground: false,
          barWidth: 12,
          label: labelSetting,
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                {offset: 0, color: '#2167EE'},
                {offset: 1, color: '#27C8F9'},
              ]),
              barBorderRadius: [5, 5, 5, 5]
            }
          },
          // barCategoryGap: 50
        }
      ]
    };
    return option
  },

  xBarChart: function () {
    var option = {
      xAxis: {
        type: 'value',
        show: false,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        show: false,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: 'red'
        }
        // scale: true,
        // max: 100,
        // min: 0,
      },
      grid: {
        show: false,
      },
      series: [
        {
          data: [120, 200, 150, 80, 70, 110, 130],
          type: 'bar',
          label: {
            show: true,
            position: 'inside'
          },
          showBackground: true,
          backgroundStyle: {
            color: '#121024',
            barBorderRadius: [5, 5, 5, 5],
          },
          barWidth: 10,
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                {offset: 0, color: '#7B00F9'},
                {offset: 1, color: '#E046FA'}
              ]),
              barBorderRadius: [5, 5, 5, 5]
            },

          },
          barCategoryGap: 50,
        }
      ]
    };
    return option
  },

  genderChart: function (data) {
    const bodyMax = 68;
    const labelSetting = {
      show: true,
      position: 'bottom',
      offset: [0, 10],
      formatter: function (param) {
        let percent = '--'
        if (param.value > 0) {
          percent = ((param.value / bodyMax) * 100).toFixed(0)
        }
        return percent + '%';
      },
      fontSize: 16,
      fontFamily: 'SourceHanSansCN-Regular',
      color: '#FFFFFF',

    };
    var option = {
      legend: {
        show: false
      },
      xAxis: {
        data: ['a'],
        axisTick: {show: false},
        axisLine: {show: false},
        axisLabel: {show: false}
      },
      yAxis: {
        show: false,
        max: bodyMax,
        offset: 0,
        splitLine: {
          show: false
        },
      },
      grid: {
        top: 'top',
        height: bodyMax
      },
      markLine: {
        z: -100
      },
      color: data.color,
      series: [
        {
          name: 'typeA',
          type: 'pictorialBar',
          symbolClip: true, //截断
          symbolBoundingData: bodyMax,
          label: labelSetting,
          symbolSize: [32, 68],//图大小
          colorBy: 'data',
          // color: '#007FFF',
          data: [
            {
              value: data.percentValue > 0 ? bodyMax * data.percentValue / 100 : 0,
              symbol: data.symbol
            }
          ],
          z: 10
        },
        {
          name: 'full',
          type: 'pictorialBar',
          symbolBoundingData: bodyMax,
          animationDuration: 0,
          symbolSize: [32, 68],//图大小
          itemStyle: {
            color: 'rgba(182,221,253,0.4)'
          },
          data: [
            {
              value: 1,
              symbol: data.symbol
            }
          ]
        }
      ]
    };
    return option
  },

  scoreChart: function (data) {
    const gaugeData = [
      {
        value: data.value,
        name: 'Sleep Score',
        title: {
          offsetCenter: ['0%', '40%']
        },
        detail: {
          valueAnimation: true,
          offsetCenter: ['0%', '-10%']
        }
      }
    ];
    var option = {
      series: [
        {
          type: 'gauge',
          startAngle: 90,
          endAngle: -270,
          pointer: {
            show: false
          },
          progress: {
            show: true,
            overlap: false,
            roundCap: true,
            clip: false,
            itemStyle: {
              color: data.color,
              borderWidth: 0,
            }
          },
          axisLine: {
            lineStyle: {
              width: 10,
              // color: [[1, 'rgba(#8FB571, 0.8)']]
            }
          },
          splitLine: {
            show: false,
            distance: 0,
            length: 10
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false,
            distance: 50
          },
          data: gaugeData,
          title: {
            fontSize: 16,
            color: 'rgba(50,52,64,0.80)'
          },
          detail: {
            width: 50,
            height: 14,
            fontSize: 60,
            color: '#323440',
            formatter: '{value}'
          }
        }
      ]
    };
    return option
  },

  alarmBarChart: function (data) {
    const labelSetting = {
      show: false,
      color: 'rgba(50,52,64,0.80)',
      position: 'outside',
      formatter: function (param) {
        return param.value;
      },
    };

    var option = {
      xAxis: {
        type: 'category',
        axisLabel: {
          color: 'rgba(50,52,64,0.80)',
          fontSize: 8,
          interval: 0,
          width: 20,
          showMinLabel: true,
          overflow: 'break'
        },
        data: data.xAxis,

      },
      yAxis: {
        type: 'value',
        show: true,
        nameGap: 10,
        minInterval: 1,
        nameTextStyle: {
          color: 'rgba(50,52,64,0.80)',
          fontSize: 10,
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          color: 'rgba(50,52,64,0.80)',
        },
        splitLine: {
          show: true,
          lineStyle: {
            opacity: 0.1,
            color: ['rgba(132,154,115,0.20'],
            width: 1,
          },
        },
      },
      grid: {
        show: false,
        top: 'center',
        height: '95'
      },
      series: [
        {
          data: data.yAxis,
          type: 'bar',
          showBackground: false,
          barWidth: 8,
          label: labelSetting,
          itemStyle: {
            normal: {
              color: '#8FB571',
              barBorderRadius: [5, 5, 5, 5]
            }
          },
          // barCategoryGap: 50
        }
      ]
    };
    return option
  },

  heartMutateChart: function (data, maxY) {
    return  {
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          if (params[0].data[1] === null) return
          return formatDate(params[0].data[0], 'HH:mm') + "<br/>" + params[0].data[1] + "ms"
        }
      },
      xAxis: {
        type: 'time',
        axisLabel: {
          fontSize: 12,
          color: "rgba(50,52,64,0.80)",
          formatter: function (value, index) {
            // console.log('heartMutateChart formatter', value, new Date(value))
            return formatDate(new Date(value), 'HH:mm');
          },
        },
      },
      yAxis: {
        min: 0,
        max: maxY,
        name: 'ms',
        axisLabel: {
          color: "rgba(50,52,64,0.80)",
          fontSize: 12
        },
      },
      series: [
        {
          data: data,
          markPoint: {
            data: [
              { type: 'max', name: 'Max' },
              { type: 'min', name: 'Min' }
            ]
          },
          type: 'line',
          symbolSize: 2,
          showSymbol: false,
          itemStyle: {
            color: "#8FB571",
          },
          lineStyle: {
            width: 1,
          },
        }
      ]
    }
  },

}
export default drawChart
