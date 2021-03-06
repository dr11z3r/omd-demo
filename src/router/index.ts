import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import Stock from '../views/Stock.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/stock/:ticker',
    name: 'Stock',
    component: Stock
  }
]

const router = new VueRouter({
  routes
})

export default router
