<script setup lang="ts">
import {
  getBannerListAPI,
  getCategoryAPI,
  getHomeBannerAPI,
  getHomeCategoryAPI,
  getHomeHotAPI,
  getHomeTopListAPI,
  getMustBuyGoodsAPI,
  getRecommendGoodsAPI,
} from '@/services/home'
import Customnavbar from './components/Customnavbar.vue'
import CategoryPannel from './components/CategoryPannel.vue'
import HotPannel from './components/HotPannel.vue'
import PageSkeleton from './components/PageSkeleton.vue'
import TodayHasToBuy from './components/TodayHasToBuy.vue'
import GuessLike from './components/GuessLike.vue'
import { onLoad } from '@dcloudio/uni-app'
import type {
  BannerItem,
  BasicCategoryItem,
  CategoryItem,
  HotItem,
  MustBuyItem,
  RecommendItem,
  TopItem,
} from '@/types/home'
import { ref } from 'vue'
import { useGuessList } from '@/composables'

// 获取顶部推荐数据
const topList = ref<TopItem[]>([])
const getTopListData = async () => {
  const res = await getHomeTopListAPI()
  topList.value = res.result
}

// 获取商品分类数据
const top1List = ref<BasicCategoryItem[]>([])
const top2List = ref<BasicCategoryItem[]>([])
const getTypeListData = async () => {
  const res = await getCategoryAPI()
  top1List.value = res.result.top1
  top2List.value = res.result.top2
}

// 获取轮播图数据
const bannerList = ref<BannerItem[]>([])
const getHomeBannerData = async () => {
  const res = await getBannerListAPI()
  bannerList.value = res.result
}

// 获取今日必买
const mustBuyList = ref<MustBuyItem[]>([])
const getMustBuyData = async () => {
  const res = await getMustBuyGoodsAPI()
  mustBuyList.value = res.result
}

// 获取底部推荐数据
const recommendList = ref<RecommendItem[]>([])
const getRecommendData = async () => {
  const res = await getRecommendGoodsAPI()
  recommendList.value = res.result.list
}

// 获取热门推荐数据
const hotList = ref<HotItem[]>([])
const getHomeHotData = async () => {
  const res = await getHomeHotAPI()
  hotList.value = res.result
}

// 是否加载中
const isLoading = ref(false)

// uniapp 生命周期
onLoad(async () => {
  isLoading.value = true
  await Promise.all([
    getTopListData(),
    getTypeListData(),
    getHomeBannerData(),
    getMustBuyData(),
    getRecommendData(),
  ])
  isLoading.value = false
})

const { guessRef, onScrollToLower } = useGuessList()

// 当前下拉刷新状态
const isTriggered = ref(false)
// 自定义下拉刷新被触发
const onRefresherrefresh = async () => {
  // 开始动画
  isTriggered.value = true
  // 加载数据
  // await getHomeBannerData()
  // await getHomeCategoryData()
  // await getHomeHotData()
  // 重置猜你喜欢的数据，然后再调用
  guessRef.value?.resetData()
  await Promise.all([
    getHomeBannerData(),
    // getHomeCategoryData(),
    getHomeHotData(),
    guessRef.value?.getMore(),
  ])
  // 关闭动画
  isTriggered.value = false
}
</script>

<template>
  <!-- 自定义导航栏 -->
  <Customnavbar :topList="topList" />
  <scroll-view
    :refresher-triggered="isTriggered"
    refresher-enabled
    @refresherrefresh="onRefresherrefresh"
    @scrolltolower="onScrollToLower"
    class="sroll-view"
    scroll-y
  >
    <PageSkeleton v-if="isLoading" />
    <template v-else>
      <!-- 分类面板 -->
      <CategoryPannel :list="[...top1List, ...top2List]" />
      <!-- 自定义轮播图 -->
      <!-- <SolaShopSwiper :list="bannerList" /> -->
      <!-- 今日必买 -->
      <TodayHasToBuy :bannerList="bannerList" :mustlist="mustBuyList" />

      <!-- 热门推荐 -->
      <!-- <HotPannel :list="hotList" /> -->
      <!-- 猜你喜欢 -->
      <GuessLike :recommendList="recommendList" />
      <!-- <SolaShopGuess ref="guessRef" /> -->
    </template>
  </scroll-view>
</template>

<style lang="scss">
page {
  height: 100%;
  background-color: #f7f7f7;
  display: flex;
  flex-direction: column;
}

.sroll-view {
  flex: 1;
}
</style>
