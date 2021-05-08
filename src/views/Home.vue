<template>
  <div>
    <v-card color="secondary" dark>
      <v-card-title class="secondary">Procurar por ações, FIIs, BDRs, ETFs...</v-card-title>
      <v-card-text>
        <v-autocomplete
          v-model="model"
          :items="items"
          :loading="isLoading"
          :search-input.sync="search"
          color="white"
          hide-no-data
          hide-selected
          item-text="title"
          item-value="ticker"
          label="Pesquisar"
          placeholder="Ticker ou nome do ativo"
          prepend-icon="mdi-database-search"
          return-object
        ></v-autocomplete>
      </v-card-text>
      <v-divider></v-divider>
      <v-expand-transition>
        <v-list v-if="tickerDataLoaded" class="primary darken-1">
          <v-list-item v-for="(field, i) in fields" :key="i">
            <v-list-item-content>
              <v-list-item-title class="wrap-text" v-text="field.value"></v-list-item-title>
              <v-list-item-subtitle v-text="field.key"></v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-expand-transition>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn :disabled="!model" color="grey darken-3" @click="model = null">
          Limpar
          <v-icon right>mdi-close-circle</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

@Component
export default class Home extends Vue {
  entries = [];
  fields: any = [];
  isLoading = false;
  model: any = null;
  search = '';
  lastKeydown = 0;
  tickerDataLoaded = false;
  get items() {
    return this.entries.map((e: any) => ({ title: `${e.ticker} - ${e.name}`, ...e }));
  }
  intv = 0;
  lastSearch = '';
  loadingTicker = null;
  @Watch('search')
  onSearchChanged() {
    this.lastKeydown = Date.now();
  }
  @Watch('model')
  onModelChanged(model: any) {
    this.tickerDataLoaded = false;
    if(!model) return;
    fetch(`https://market-data.drizer.ml/ticker/info/${encodeURIComponent(model.ticker)}?fields=ticker,name,desc,price,volume`).then(res => res.json())
      .then(res => {
        let tickerData: any = Object.values(res.tickers)[0];
        this.fields = Object.keys(tickerData).map(key => ({ key, value: tickerData[key] || 'null' }));
        this.tickerDataLoaded = true;
      });
  }
  mounted() {
    this.intv = setInterval(() => {
      if (Date.now() - this.lastKeydown > 500 && this.search !== this.lastSearch) {
        if (this.isLoading || this.search == null) return;
        this.lastSearch = this.search;
        if (this.search.match(' - ')) return;
        this.isLoading = true;
        fetch(`https://market-data.drizer.ml/ticker/search?term=${encodeURIComponent(this.search)}`).then(res => res.json()).then(res => {
          if (res && !res.error) {
            this.entries = Object.values(res.results);
          }
        }).catch(err => {
          console.log(err);
        }).finally(() => {
          this.isLoading = false;
        })
      }
    }, 333);
  }
}
</script>
<style scoped>
.wrap-text {
  word-wrap: break-word;
  white-space: normal;
  -webkit-line-clamp: unset !important;
}
</style>