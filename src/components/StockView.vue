<template>
  <div class="stock-view" @contextmenu="cancelEvent">
    <div v-if="loading" style="text-align:center; margin-top:20px">Carregando {{ticker}}...</div>
    <div v-else>
      <div class="stock-info" v-if="!compact">
        <div class="stock-name">
          <h4 class="stock-title">{{t.name}}</h4>
        </div>
        <div class="stock-ticker">{{ticker}}</div>
        <h1>
          <b>
            <stock-price :price="rtprice" :class="{'stock-variation-shadow': true, 'stock-variation-shadow-red': down}"
            />
          </b>
        </h1>
        <div>
          <span
            :class="{'stock-variation': true, 'stock-variation-red': down}"
          >{{ch}} ({{chp.toFixed(2)}}%)</span>&nbsp;
          <b>Hoje</b>
        </div>
      </div>
      <div v-if="data && data.length === 2" class="stock-chart-unavailable">
        <div style="margin-top:15%">Gráfico não disponível.</div>
      </div>
      <stock-chart v-else-if="ready" @pointChanged="onPointChanged" :data="data" :color="down?'#f55c47':'#9ede73'" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import StockChart from '../components/StockChart.vue';
import StockPrice from '../components/StockPrice.vue';
import moment from 'moment';

@Component({
  components: { StockChart, StockPrice }
})
export default class StockView extends Vue {
  @Prop() ticker!: string;
  @Prop() editable?: boolean;
  @Prop() compact?: boolean;
  loading = true;
  error = false;
  errorMessage: string = null;
  data: any = null;
  t: any = null;
  rtprice = 0;
  ch = 0;
  chp = 0;
  ready = false;
  cancelEvent(e: any) {
    e.preventDefault();
    return false;
  }
  mounted() {
    fetch(`https://market-data.drizer.ml/ticker/info/${this.ticker}?fields=history,priceDate,rtprice,ch,chp,name,intraday`).then(r => r.json()).then((result: any) => {
      let tickerResult = result.tickers[this.ticker];
      if (!tickerResult || result.error) {
        this.error = true;
        this.errorMessage = result.message || result.reason || `Falha ao carregar: ${this.ticker}`;
        return;
      }
      let data = tickerResult.intraday;
      let xdata = [];
      let today = moment.utc().startOf('day');
      for (let i = 1; i < 10; i++) {
        let target = tickerResult.history[tickerResult.history.length - i];
        if (target) {
          if (!today.isSame(moment.utc(target[0]).startOf('day'), 'day')) {
            xdata.push(target);
            break;
          }
        }
      }
      for (let i = 0; i < data.length; i++) {
        let t = moment.utc(data[i][0]);
        if (today.isSameOrBefore(t)) {
          xdata.push(data[i]);
          i += 4;
        }
      }
      xdata.push([tickerResult.priceDate || moment.utc().valueOf(), tickerResult.rtprice]);
      this.data = xdata;
      this.t = tickerResult;
      this.loading = false;
      this.$nextTick(() => {
        this.rtprice = tickerResult.rtprice;
        this.ch = tickerResult.ch;
        this.chp = tickerResult.chp;
        this.ready = true;
      });
    });
  }
  percIncrease(a: number, b: number) {
    let percent;
    if (b !== 0) {
      if (a !== 0) {
        percent = (b - a) / a * 100;
      } else {
        percent = b * 100;
      }
    } else {
      percent = - a * 100;
    }
    return percent;
  }
  onPointChanged(pt: any) {
    if (pt) {
      let chp = this.percIncrease(this.data[0][1], pt);
      this.chp = chp;
      let dch = pt - this.data[0][1];
      this.ch = parseFloat(dch.toFixed(dch < 0.99 ? 3 : 2));
      this.rtprice = pt;
    } else {
      this.rtprice = this.t.rtprice;
      this.ch = this.t.ch;
      this.chp = this.t.chp;
    }
  }
  get down() {
    if (!this.t) return false;
    return this.ch < 0;
  }
}
</script>
<style scoped>
.stock-name {
    color:#DDD;
}
.stock-info {
  margin:10px;
}
.stock-view {
  background:#111;
  user-select: none;
}
.stock-variation {
  color:#9ede73
}
.stock-variation-red {
  color:#f55c47!important;
}
.stock-variation-shadow {
  text-shadow:0 0 5px #9ede7352
}
.stock-variation-shadow-red {
  text-shadow:0 0 5px #f55c4752!important;
}
.stock-name {
  vertical-align: top;
  display:inline-block;
  width:70%;
}
.stock-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width:100%;
}
.stock-ticker {
  overflow: hidden;
  width:30%;
  color:#CCC;
  opacity: 0.8;
  vertical-align: top;
  display:inline-block;
  text-align: right;
}
.stock-chart-unavailable {
  height: 90vh;
  text-align:center;
}
</style>