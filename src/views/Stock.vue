<template>
  <div>
    <stock-view :ticker="ticker" v-if="ticker != ''" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import StockView from '../components/StockView.vue';

@Component({
    components: { StockView }
})
export default class Stock extends Vue {
  ticker = '';
  mounted() {
    this.ticker = this.$route.params.ticker || 'AAPL';
  }
  updated() {
    this.ticker = this.$route.params.ticker || 'AAPL';
  }
}
</script>