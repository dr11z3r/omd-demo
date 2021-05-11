<script lang="ts">
import { Line as chartLine } from 'vue-chartjs'
import { Component, Prop, Vue } from "vue-property-decorator";
import moment from 'moment';
import Chart from 'chart.js';
import anotationPlugin from 'chartjs-plugin-annotation';

(Chart as any).plugins.register(anotationPlugin);

@Component({
  name: 'LineChart',
  extends: chartLine,
})
export default class StockChart extends Vue {
  @Prop() data!: any;
  @Prop() color!: string;
  private dataNames: string[] = [];
  private isMouseDown = false;
  private normalizedData: any = null;
  mounted() {
    /* eslint-disable @typescript-eslint/no-this-alias */
    let color = this.color || '#9ede73';
    let _self: any = this;
    this.normalizedData = this.data.map((n: any) => n[1]);
    let datasets: any = [
      {
        fill: false,
        pointBackgroundColor: color,
        pointBorderColor: color,
        backgroundColor: color,
        borderColor: color,
        pointRadius: 0,
        pointHoverRadius: 2,
        type: 'line',
        label: '',
        lineTension: 0.3,
        data: this.normalizedData
      }
    ];
    let chartData = {
      labels: this.data.map((n: any) => moment(n[0]).utc().add(1, 'day').startOf('day').toDate()),
      datasets,
    };
    this.$el.addEventListener('mousedown', () => {
      this.isMouseDown = true;
      _self.$data._chart.draw();
    });
    this.$el.addEventListener('mouseup', () => {
      this.isMouseDown = false;
      _self.$data._chart.draw();
    });
    this.$el.addEventListener('touchstart', () => {
      this.isMouseDown = true;
      _self.$data._chart.draw();
    });
    this.$el.addEventListener('touchend', () => {
      this.isMouseDown = false;
      _self.$data._chart.draw();
    });
    (this as any).addPlugin({
      id: 'line',
      beforeInit: function (chart: any) {
        let origDraw = chart.draw;
        let ctx = chart.ctx;
        let originalStroke = ctx.stroke;
        ctx.stroke = function () {
          ctx.save();
          ctx.shadowColor = color;
          ctx.shadowBlur = 30;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          originalStroke.apply(this, arguments)
          ctx.restore();
        }
        chart.draw = function (ease: any) {
          origDraw.call(chart, ease);

          if (_self.isMouseDown && chart.chart.tooltip._active && chart.chart.tooltip._active.length) {
            let activePoint = chart.chart.tooltip._active[0],
              ctx = chart.chart.ctx,
              x = activePoint.tooltipPosition().x,
              topY = 0,
              bottomY = chart.chart.chartArea.bottom;

            ctx.save();
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(x, topY);
            ctx.lineTo(x, bottomY);
            ctx.lineWidth = 1;
            ctx.strokeStyle = color;
            ctx.stroke();
            ctx.restore();
            _self.$emit('pointChanged', _self.normalizedData[activePoint._index]);
          } else _self.$emit('pointChanged', null);
        };
      }
    });
    (this as any).renderChart(chartData, {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      bezierCurve: true,
      lineTension: 0,
      layout: {
        height: '90vh',
        padding: {
          bottom: 15,
          top: 15,
          left:0,
          right:0,
        },
      },
      legend: {
        display: false,
        position: 'bottom',
        labels: {
          boxWidth: 10,
          fontSize: 9,
        }
      },
      annotation: {
        annotations: [{
          type: 'line',
          mode: 'horizontal',
          scaleID: 'y-axis-0',
          value: this.normalizedData[0],
          borderColor: 'rgba(255,255,255,0.3)',
          borderDash: [2, 5],
          borderWidth: 2,
          label: {
            enabled: false,
          }
        }]
      },
      tooltips: {
        //itemSort: (a: any, b: any, data: any) => b.yLabel - a.yLabel,
        enabled: false,
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function (tooltipItem: any, data: any) {
            let value: any = '';
            if (!_self.money) {
              if (tooltipItem.yLabel < 0) {
                value = '-' + (tooltipItem.yLabel * -1, 2) + ' (lucro)';
              } else {
                value = (tooltipItem.yLabel, 2);
              }
            } else {
              value = (((tooltipItem.yLabel / 100) - 1) * 100).toFixed(2).replace('.', ',') + '%';
            }
            return (_self.dataNames[tooltipItem.datasetIndex] || data.datasets[tooltipItem.datasetIndex].label) + ': ' + value;
          }
        }
      },
      scales: {
        xAxes: [{
          offset: true,
          ticks: {
            autoSkip: true,
            maxTicksLimit: 4,
            display: false,
            minRotation: 0,
            maxRotation: 0,
          },
          gridLines: {
            display: false,
          },
        }],
        yAxes: [{
          gridLines: {
            display: false,
          },
          position: 'right',
          ticks: {
            display: false,
          }
        }]
      },
    });
  }
}
</script>