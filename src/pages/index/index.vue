<script setup lang="ts">
import {
  getBannerListAPI,
  getCategoryAPI,
  getFootPrintGoodsAPI,
  getHomeTopListAPI,
  getMustBuyGoodsAPI,
  getRecommendGoodsAPI,
} from '@/services/home'
import Customnavbar from './components/Customnavbar.vue'
import CategoryPannel from './components/CategoryPannel.vue'
import PageSkeleton from './components/PageSkeleton.vue'
import TodayHasToBuy from './components/TodayHasToBuy.vue'
import GuessLike from './components/GuessLike.vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import type {
  BannerItem,
  BasicCategoryItem,
  MustBuyItem,
  RecommendItem,
  TopItem,
} from '@/types/home'
import { ref } from 'vue'
import type { PageParams } from '@/types/global'
import { getShoppingCartAPI } from '@/services/cart'

// 选中Index
const activeIndex = ref(0)
const onActiveChange = (index: number) => {
  if (index === 0) {
    recommendList.value = []
    recommendFinish.value = false
    recommendPageParams.page = 1
    getRecommendData()
  } else {
    historyList.value = []
    historyFinish.value = false
    historyPageParams.page = 1
    getHistoryData()
  }
  activeIndex.value = index
}
// 推荐分页参数
const recommendPageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
// 历史分页参数
const historyPageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
// 推荐已经结束的标记
const recommendFinish = ref(false)
// 历史已经结束的标记
const historyFinish = ref(false)

// 重置数据方法
// const resetData = () => {
//   pageParams.page = 1
//   searchList.value = []
//   finish.value = false
// }

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
  top2List.value.push({
    id: '',
    pid: '',
    name: '更多',
    image: '../../../static/images/more.png',
    source: 'S',
    childlist: [],
  })
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
  // 退出判断
  if (recommendFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getRecommendGoodsAPI({ ...recommendPageParams })
  // 分页数据增加
  recommendList.value.push(...res.result.list)
  if (recommendPageParams.page < Math.ceil(res.result.total / 10)) {
    // 页码累加
    recommendPageParams.page++
  } else {
    recommendFinish.value = true
  }
}

// 获取底部历史数据
const historyList = ref<RecommendItem[]>([])
const getHistoryData = async () => {
  // 退出判断
  if (historyFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getFootPrintGoodsAPI({ ...historyPageParams })
  // 分页数据增加
  historyList.value.push(...res.result.list)
  if (historyPageParams.page < Math.ceil(res.result.total / 10)) {
    // 页码累加
    historyPageParams.page++
  } else {
    historyFinish.value = true
  }
}
const currentCartData = ref(0)
const getShoppingData = async () => {
  const res = await getShoppingCartAPI()
  currentCartData.value = res.result.length
}
// 是否加载中
const isLoading = ref(false)

// uniapp 生命周期
onShow(async () => {
  uni.showTabBar({
    animation: true,
  })
  isLoading.value = true
  await Promise.all([
    getTopListData(),
    getTypeListData(),
    getHomeBannerData(),
    getMustBuyData(),
    getRecommendData(),
    getHistoryData(),
    getShoppingData(),
  ])
  isLoading.value = false
  if (currentCartData.value !== 0) {
    uni.setTabBarBadge({
      //显示数字
      index: 3, //tabbar下标
      text: `${currentCartData.value}`, //数字
    })
  } else {
    uni.removeTabBarBadge({
      //显示数字
      index: 3, //tabbar下标
    })
  }
})

const onScrollToLower = async () => {
  if (activeIndex.value === 0) {
    await getRecommendData()
  } else {
    await getHistoryData()
  }
}
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
  // guessRef.value?.resetData()
  // await Promise.all([
  //   getHomeBannerData(),
  //   // getHomeCategoryData(),
  //   getHomeHotData(),
  //   guessRef.value?.getMore(),
  // ])
  // 关闭动画
  isTriggered.value = false
}
// onShow(() => {
//   uni.showTabBar({
//     animation: true,
//   })
// })
</script>

<template>
  <!-- 自定义导航栏 -->
  <Customnavbar :topList="topList" />
  <scroll-view @scrolltolower="onScrollToLower" class="sroll-view" scroll-y>
    <PageSkeleton v-if="isLoading" />
    <template v-else>
      <!-- 分类面板 -->
      <CategoryPannel :list="[...top1List, ...top2List]" />
      <!-- 自定义轮播图 -->
      <!-- <SolaShopSwiper :list="bannerList" /> -->
      <!-- 今日必买 -->
      <TodayHasToBuy :bannerList="bannerList" :mustlist="mustBuyList" />
      <!-- 猜你喜欢 -->
      <GuessLike
        :activeIndex="activeIndex"
        :onActiveChange="onActiveChange"
        :recommendList="recommendList"
        :historyList="historyList"
      />
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

::v-deep .uni-numbox {
  .uni-numbox-btns {
    padding: 0 4px;
  }

  .uni-numbox__value {
    width: 48rpx !important;
    height: 30rpx !important;
    font-size: 26rpx !important;
  }
}

.sroll-view {
  flex: 1;
  // background-color: #fff;
}
</style>
