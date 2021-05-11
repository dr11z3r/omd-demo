<template>
  <div>
      <div class="inline">$</div>
      <div class="inline"><vue-roller class="inline" :text="text" :isNumberFormat="true" /></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import VueRoller from 'vue-roller';
import formatCurrency from '../helpers/formatCurrency';

@Component({
  components: { VueRoller }
})
export default class StockPrice extends Vue {
  @Prop() price!: number;
  get text() {
      return this.price.toString();
  }
}
</script>
<style>
.roller .rollerBlock {
    margin: 0px;
}
.roller ul{
    padding-left:0!important;
}
</style>
<style scoped>
.inline {
    display:inline-block;
    vertical-align: top;
}
</style>