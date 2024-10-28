<script setup lang="ts">
import { getCategoryTopAPI } from '@/services/category'
import { getCategoryAPI, getHomeBannerAPI } from '@/services/home'
import type { CategoryTopItem } from '@/types/category'
import type {
  BannerItem,
  BasicCategoryItem,
  MustBuyItem,
  SearchBasicCategoryItem,
} from '@/types/home'
import { onLoad, onShow, onTabItemTap, onUnload } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { useMemberStore } from '@/stores'
import { getGoodsListByIdAPI, goodsDetailPageRecommendGoodsAPI } from '@/services/goods'
import type { PageParams } from '@/types/global'
import {
  removeShoppingCart,
  useAddShoppingCart,
  useCollect,
  useUpdateShoppingCart,
} from '@/composables'

// 跳转过来的参数
const query = defineProps<{
  type: string
}>()
const tabId = ref('')
// 弹出层组件
const typepopup = ref<UniHelper.UniPopupInstance>()

// 分页参数
const fruitPageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
const dryPageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
// 页面是否加载完成 标识
const fruitIsFinish = ref(false)
const dryIsFinish = ref(false)
// 排序参数 // default price
const fruitOrderType = ref('up')
const dryOrderType = ref('up')

// 一级分类选中状态
const activeIndex = ref(0) // 0 是生鲜 1是干货
// 二级分类选中状态
const secondActiveFruitIndex = ref(0)
const secondActiveDryIndex = ref(0)
// 三级分类选中状态
const thirdActiveFruitIndex = ref(0)
const thirdActiveDryIndex = ref(0)
// 四级分类选中状态
const FourthActiveFruitIndex = ref(0)
const FourthActiveDryIndex = ref(0)

// 获取商品分类数据
const top1List = ref<BasicCategoryItem[]>([])
const top2List = ref<BasicCategoryItem[]>([])
// 二级分类
const fruitCategory = ref<BasicCategoryItem[]>([])
const dryCargoCategory = ref<BasicCategoryItem[]>([])
// 三级分类
const currentThirdFruitTypeCategory = ref<BasicCategoryItem[]>([])
const currentThirdDryTypeCategory = ref<BasicCategoryItem[]>([])
// 四级分类
const currentFourthFruitTypeCategory = ref<BasicCategoryItem[]>([])
const currentFourthDryTypeCategory = ref<BasicCategoryItem[]>([])
// 查询当前选中三级分类对应的商品
const fiveTypeFruitCategory = ref<SearchBasicCategoryItem[]>([])
const fiveTypeDryCategory = ref<SearchBasicCategoryItem[]>([])

const currentFruitCategoryId = ref('')
const currentDryCategoryId = ref('')

const fiveTypeFruitData = ref<{ source: string; category: string }>(
  {} as { source: string; category: string },
)
const fiveTypeDryData = ref<{ source: string; category: string }>(
  {} as { source: string; category: string },
)

onTabItemTap((e) => {
  console.log('e------', e)
  if (e.text === '分类') {
    getTypeListData()
  }
})

const getFiveTypeFruitCategoryData = async (source: string, category: string) => {
  if (category !== currentFruitCategoryId.value) {
    currentFruitCategoryId.value = category
    fiveTypeFruitCategory.value = []
    fruitPageParams.page = 1
    fruitIsFinish.value = false
  }

  fiveTypeFruitData.value = { source, category }
  // 退出判断
  if (fruitIsFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getGoodsListByIdAPI({
    source,
    category,
    priceSort: fruitOrderType.value,
    ...fruitPageParams,
  })
  fiveTypeFruitCategory.value.push(...res.result.list)
  if (fruitPageParams.page < Math.ceil(res.result.total / 10)) {
    // 页码累加
    fruitPageParams.page++
  } else {
    fruitIsFinish.value = true
  }
}

const getFiveTypeDryCategoryData = async (source: string, category: string) => {
  fiveTypeDryData.value = { source, category }
  // 退出判断
  if (dryIsFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getGoodsListByIdAPI({
    source,
    category,
    priceSort: dryOrderType.value,
    ...dryPageParams,
  })
  fiveTypeDryCategory.value.push(...res.result.list)
  if (dryPageParams.page < Math.ceil(res.result.total / 10)) {
    // 页码累加
    dryPageParams.page++
  } else {
    dryIsFinish.value = true
  }
}

// 首次初始化数据
const getTypeListData = async (type?: string) => {
  // 重置分页器
  fruitPageParams.page = 1
  fruitPageParams.pageSize = 10
  fruitIsFinish.value = false
  thirdActiveFruitIndex.value = 0
  currentThirdFruitTypeCategory.value = []
  currentFourthFruitTypeCategory.value = []
  fiveTypeFruitCategory.value = []

  dryPageParams.page = 1
  dryPageParams.pageSize = 10
  dryIsFinish.value = false
  thirdActiveDryIndex.value = 0
  currentThirdDryTypeCategory.value = []
  currentFourthDryTypeCategory.value = []
  fiveTypeDryCategory.value = []

  const res = await getCategoryAPI()
  fruitCategory.value = res.result.fruitCategory.filter(
    (item: BasicCategoryItem) => item.childlist.length > 0,
  )
  dryCargoCategory.value = res.result.dryCargoCategory.filter(
    (item: BasicCategoryItem) => item.childlist.length > 0,
  )
  top1List.value = res.result.top1
  top2List.value = res.result.top2
  // 设置三级数据
  currentThirdFruitTypeCategory.value = fruitCategory.value[0] && fruitCategory.value[0].childlist
  currentThirdDryTypeCategory.value =
    dryCargoCategory.value[0] && dryCargoCategory.value[0].childlist
  // 设置四级数据
  currentFourthFruitTypeCategory.value =
    fruitCategory.value[0] && fruitCategory.value[0].childlist.length > 0
      ? fruitCategory.value[0] && fruitCategory.value[0].childlist[0].childlist
      : []
  currentFourthDryTypeCategory.value =
    dryCargoCategory.value[0] && dryCargoCategory.value[0].childlist.length > 0
      ? dryCargoCategory.value[0] && dryCargoCategory.value[0].childlist[0].childlist
      : []
  // @ts-ignore
  // currentFourthFruitTypeCategory.value = [{ name: 'alex' }, { name: 'alex' }, { name: 'alex' }, { name: 'alex' }, { name: 'alex' }, { name: 'alex' }, { name: 'alex' }, ...currentFourthFruitTypeCategory.value]
  if (!type) {
    getFiveTypeFruitCategoryData(
      fruitCategory.value[0] && fruitCategory.value[0].childlist[0].source,
      fruitCategory.value[0] && fruitCategory.value[0].childlist[0].id,
    )
    getFiveTypeDryCategoryData(
      dryCargoCategory.value[0] && dryCargoCategory.value[0].childlist[0].source,
      dryCargoCategory.value[0] && dryCargoCategory.value[0].childlist[0].id,
    )
  }
}
const scrollLeft = ref(0)
onUnload(() => {
  uni.$off('categoryInfo')
})

// 页面加载
onShow(() => {
  uni.$on('categoryInfo', async (data) => {
    if (data.categoryInfo.name === '更多') {
      await getTypeListData('')
    } else {
      await getTypeListData('type')
      const index = fruitCategory.value.findIndex(
        (v) =>
          v.id === (data.categoryInfo.pid === '0' ? data.categoryInfo.id : data.categoryInfo.pid),
      )
      console.log('index====', index)
      if (data.categoryInfo.source === 'S') {
        onTapTwoLevelFruit(data.categoryInfo, index)
      } else {
        // 跳转到干货分类下
        onChangeIndex(1)
        onTapTwoLevelDry(data.categoryInfo, index)
      }
    }
  })
})
const goToSearch = () => {
  uni.navigateTo({ url: '/PagesOrder/search/search' })
}

// 点击一级分类
const onChangeIndex = (index: number) => {
  if (index === 0 && fruitCategory.value.length === 0) {
    uni.showModal({
      content: '当前用户只支持查看干货分类',
      success: async (res) => {
        activeIndex.value = 1
      },
    })
  } else if (index === 1 && dryCargoCategory.value.length === 0) {
    uni.showModal({
      content: '当前用户只支持查看生鲜分类',
      success: async (res) => {
        activeIndex.value = 0
      },
    })
  } else {
    activeIndex.value = index
  }
}

// 点击二级分类
const onTapTwoLevelFruit = (data: BasicCategoryItem, index: number) => {
  tabId.value = data.id
  // 重置分页器
  fruitPageParams.page = 1
  fruitPageParams.pageSize = 10
  fruitIsFinish.value = false
  thirdActiveFruitIndex.value = 0
  currentThirdFruitTypeCategory.value = []
  currentFourthFruitTypeCategory.value = []
  fiveTypeFruitCategory.value = []
  secondActiveFruitIndex.value = index
  if (activeIndex.value === 0) {
    const fruit: BasicCategoryItem[] = fruitCategory.value.find((item) => item.id === data.id)
      ?.childlist as BasicCategoryItem[]
    currentThirdFruitTypeCategory.value = fruit
    currentFourthFruitTypeCategory.value =
      fruit.length > 0 ? (fruit[0].childlist.length > 0 ? fruit[0].childlist : []) : []
    console.log('fruit', fruit)
    getFiveTypeFruitCategoryData(fruit[0].source, fruit[0].id)
  }
}

const onTapTwoLevelDry = (data: BasicCategoryItem, index: number) => {
  // 重置分页器
  dryPageParams.page = 1
  dryPageParams.pageSize = 10
  dryIsFinish.value = false
  thirdActiveDryIndex.value = 0
  currentThirdDryTypeCategory.value = []
  currentFourthDryTypeCategory.value = []
  fiveTypeDryCategory.value = []
  secondActiveDryIndex.value = index
  if (activeIndex.value === 1) {
    const dry: BasicCategoryItem[] = dryCargoCategory.value.find((item) => item.id === data.id)
      ?.childlist as BasicCategoryItem[]
    currentThirdDryTypeCategory.value = dry
    currentFourthDryTypeCategory.value =
      dry.length > 0 ? (dry[0].childlist.length > 0 ? dry[0].childlist : []) : []
    console.log('dry', dry)
    getFiveTypeDryCategoryData(dry[0].source, dry[0].id)
  }
}

// 点击三级分类
const onTapThirdFruitType = (data: BasicCategoryItem, index: number) => {
  // 重置分页器
  fruitPageParams.page = 1
  fruitPageParams.pageSize = 10
  fruitIsFinish.value = false
  fiveTypeFruitCategory.value = []
  thirdActiveFruitIndex.value = index
  currentFourthFruitTypeCategory.value = data.childlist.length > 0 ? data.childlist : []
  getFiveTypeFruitCategoryData(data.source, data.id)
}
const onTapThirdDryType = (data: BasicCategoryItem, index: number) => {
  // 重置分页器
  dryPageParams.page = 1
  dryPageParams.pageSize = 10
  dryIsFinish.value = false
  fiveTypeDryCategory.value = []
  thirdActiveDryIndex.value = index
  currentFourthDryTypeCategory.value = data.childlist.length > 0 ? data.childlist : []
  getFiveTypeDryCategoryData(data.source, data.id)
}

// 点击四级分类
const onTapFourthFruitType = (data: BasicCategoryItem, index: number) => {
  // 重置分页器
  // @ts-ignore
  typepopup!.value?.close()
  fruitPageParams.page = 1
  fruitPageParams.pageSize = 10
  fruitIsFinish.value = false
  fiveTypeFruitCategory.value = []
  FourthActiveFruitIndex.value = index
  getFiveTypeFruitCategoryData(data.source, data.id)
}
const onTapFourthDryType = (data: BasicCategoryItem, index: number) => {
  // 重置分页器
  // @ts-ignore
  typepopup!.value?.close()
  dryPageParams.page = 1
  dryPageParams.pageSize = 10
  dryIsFinish.value = false
  fiveTypeDryCategory.value = []
  FourthActiveDryIndex.value = index
  getFiveTypeDryCategoryData(data.source, data.id)
}

// 添加、更新购物车
const currentCartId = ref('')
const addShoppingCart = async (data: SearchBasicCategoryItem, num: number, type: string) => {
  if (type === 'first') {
    const res = await useAddShoppingCart(
      {
        source: data.source,
        goodsId: data.goodsId,
        fGoodsId: data.fGoodsId,
        num,
        units: data.unit,
        unitPrice: data.price,
      },
      num,
    )
    if (res.code === '1') {
      currentCartId.value = res.result.cartId
      data.cartGoodsNum = res.result.goodsNum
    }
  } else {
    if (num === 0) {
      const res = await removeShoppingCart(currentCartId.value || data.cartId)
      if (res.code === '1') {
        data.cartGoodsNum = 0
      }
    } else {
      const res = await useUpdateShoppingCart(
        {
          cartId: currentCartId.value || data.cartId,
          num,
          unitPrice: data.price,
          units: data.unit,
        },
        num,
      )
      if (res.code === '1') {
        data.cartGoodsNum = res.result.goodsNum
      }
    }
  }
}

// 商品收藏 取消收藏
const onCollect = async (data: SearchBasicCategoryItem) => {
  const res = await useCollect(data.source, data.goodsId)
  if (res.code === '1' && res.msg === '收藏成功') {
    uni.showToast({ icon: 'success', title: '收藏成功' })
    fiveTypeFruitCategory.value.forEach((item) => {
      if (item.goodsId === data.goodsId && item.source === data.source) {
        item.isCollect = '1'
      }
    })
    return
  }
  if (res.code === '1' && res.msg === '取消收藏') {
    uni.showToast({ icon: 'success', title: '取消收藏' })
    fiveTypeFruitCategory.value.forEach((item) => {
      if (item.goodsId === data.goodsId && item.source === data.source) {
        item.isCollect = '0'
      }
    })
    return
  }
}

const orderByPrice = () => {
  if (activeIndex.value === 0) {
    if (fruitOrderType.value === 'up') {
      fruitOrderType.value = 'down'
    } else {
      fruitOrderType.value = 'up'
    }
    // @ts-ignore
    typepopup!.value?.close()
    fruitPageParams.page = 1
    fruitPageParams.pageSize = 10
    fruitIsFinish.value = false
    fiveTypeFruitCategory.value = []
    getFiveTypeFruitCategoryData(fiveTypeFruitData.value.source, fiveTypeFruitData.value.category)
  } else {
    if (dryOrderType.value === 'up') {
      dryOrderType.value = 'down'
    } else {
      dryOrderType.value = 'up'
    }
    // @ts-ignore
    typepopup!.value?.close()
    dryPageParams.page = 1
    dryPageParams.pageSize = 10
    dryIsFinish.value = false
    fiveTypeDryCategory.value = []
    getFiveTypeDryCategoryData(fiveTypeDryData.value.source, fiveTypeDryData.value.category)
  }
}

const goToDetail = (data: MustBuyItem) => {
  uni.navigateTo({ url: `/PagesOrder/goods/goods?source=${data.source}&goodsId=${data.goodsId}` })
}
</script>

<template>
  <view class="viewport">
    <view class="login-container">
      <view class="login-type">
        <view
          @tap="($event) => onChangeIndex(0)"
          class="pwd-btn"
          :class="activeIndex === 0 ? 'checked' : ''"
          >生鲜蔬菜
        </view>
        <view
          @tap="($event) => onChangeIndex(1)"
          class="code-btn"
          :class="activeIndex === 1 ? 'checked' : ''"
          >干货调料
        </view>
      </view>
    </view>
    <!-- 搜索框 -->
    <view @tap="goToSearch" class="search">
      <text class="ftysIcon icon-sousuo"></text>
      <input disabled />
      <button class="search-btn">搜索</button>
    </view>
    <view class="head-types">
      <scroll-view
        scroll-x="true"
        :scroll-left="scrollLeft"
        scroll-with-animation
        :scroll-into-view="'tab' + tabId"
      >
        <view
          :id="'tab' + item.id"
          class="head-types-item"
          @tap="
            ($event) =>
              activeIndex === 0 ? onTapTwoLevelFruit(item, index) : onTapTwoLevelDry(item, index)
          "
          v-for="(item, index) in activeIndex === 0 ? fruitCategory : dryCargoCategory"
          :key="item.id"
          :class="{
            active:
              activeIndex === 0 ? secondActiveFruitIndex === index : secondActiveDryIndex === index,
          }"
        >
          <view
            class="image-containers"
            :class="{
              active:
                activeIndex === 0
                  ? secondActiveFruitIndex === index
                  : secondActiveDryIndex === index,
            }"
          >
            <image class="icon" :src="item.image" mode="aspectFit" />
          </view>
          <text class="text"> {{ item.name }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 分类 -->
    <view class="categories">
      <!-- 左侧：二级分类 -->
      <scroll-view class="primary" scroll-y>
        <view
          @tap="
            ($event) =>
              activeIndex === 0 ? onTapThirdFruitType(item, index) : onTapThirdDryType(item, index)
          "
          v-for="(item, index) in activeIndex === 0
            ? currentThirdFruitTypeCategory
            : currentThirdDryTypeCategory"
          :key="item.id"
          class="item"
          :class="{
            active:
              activeIndex === 0 ? thirdActiveFruitIndex === index : thirdActiveDryIndex === index,
          }"
        >
          <text class="name"> {{ item.name }} </text>
        </view>
      </scroll-view>
      <!-- 右侧：三级分类 -->
      <scroll-view
        class="secondary"
        @scrolltolower="
          ($event) =>
            activeIndex === 0
              ? getFiveTypeFruitCategoryData(
                  currentThirdFruitTypeCategory[thirdActiveFruitIndex].source,
                  currentThirdFruitTypeCategory[thirdActiveFruitIndex].id,
                )
              : getFiveTypeDryCategoryData(
                  currentThirdDryTypeCategory[thirdActiveDryIndex].source,
                  currentThirdDryTypeCategory[thirdActiveDryIndex].id,
                )
        "
        scroll-y
      >
        <!-- 内容区域 -->
        <view class="search-list">
          <view class="fourth-category">
            <view class="spred-container">
              <view
                :class="{
                  active:
                    activeIndex === 0
                      ? FourthActiveFruitIndex === index
                      : FourthActiveDryIndex === index,
                }"
                @tap="
                  ($event) =>
                    activeIndex === 0
                      ? onTapFourthFruitType(item, index)
                      : onTapFourthDryType(item, index)
                "
                class="fourth-item"
                v-for="(item, index) in activeIndex === 0
                  ? currentFourthFruitTypeCategory
                  : currentFourthDryTypeCategory"
                :key="item.id"
                >{{ item.name }}
              </view>
            </view>

            <view class="spread" @tap="typepopup?.open?.('top')">
              <text class="ftysIcon icon-xiangxiajiantou" />
            </view>
            <uni-popup ref="typepopup" background-color="#fff">
              <view
                class="popup-content"
                :class="{ 'popup-height': type === 'left' || type === 'right' }"
              >
                <view class="text">分类</view>
                <view
                  class="type-item"
                  :key="item.id"
                  @tap="
                    ($event) =>
                      activeIndex === 0
                        ? onTapFourthFruitType(item, index)
                        : onTapFourthDryType(item, index)
                  "
                  v-for="(item, index) in activeIndex === 0
                    ? currentFourthFruitTypeCategory
                    : currentFourthDryTypeCategory"
                >
                  {{ item.name }}
                </view>
              </view>
            </uni-popup>
          </view>
          <view class="order">
            <!-- <view>默认</view> -->
            <view @tap="orderByPrice">单价</view>
            <text
              v-if="activeIndex === 0"
              @tap="orderByPrice"
              :class="`ftysIcon ${fruitOrderType === 'up' ? 'icon-shengxu' : 'icon-jiangxu1'}`"
            ></text>
            <text
              v-if="activeIndex === 1"
              @tap="orderByPrice"
              :class="`ftysIcon ${dryOrderType === 'up' ? 'icon-shengxu' : 'icon-jiangxu1'}`"
            ></text>
          </view>
          <view class="list-container">
            <view
              class="item"
              v-for="item in activeIndex === 0 ? fiveTypeFruitCategory : fiveTypeDryCategory"
              :key="item.goodsId"
              @tap="($event) => goToDetail(item)"
            >
              <image :src="item.images[0]" mode="scaleToFill" />
              <view class="info">
                <view class="title">{{ item.name }}</view>
                <view class="price">￥{{ item.price }}</view>
              </view>
              <view class="right" @tap.stop.prevent>
                <view
                  @tap="($event) => onCollect(item)"
                  :class="`ftysIcon ${
                    item.isCollect === '1' ? 'icon-huangsexingxing' : 'icon-shoucang'
                  }`"
                ></view>
                <uni-number-box
                  class="number-box"
                  v-if="item.cartGoodsNum"
                  @change="($event) => addShoppingCart(item, $event, '')"
                  v-model="item.cartGoodsNum"
                />
                <view
                  v-else
                  @tap="($event) => addShoppingCart(item, 1, 'first')"
                  class="ftysIcon icon-a-jiagou2x"
                >
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
}

.viewport {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-content {
  width: 100%;
  min-height: 300rpx;
  padding: 20rpx;

  .type-item {
    font-size: 26rpx;
    color: rgba(50, 50, 51, 1);
    font-weight: 400;
    margin-top: 20rpx;
    margin-right: 20rpx;
    display: inline-block;
    height: 60rpx;
    line-height: 40rpx;
    padding: 10rpx;
    border-radius: 4px;
    background: rgba(242, 244, 247, 1);
    white-space: nowrap;
  }
}

::v-deep .uni-numbox {
  .uni-numbox-btns {
    padding: 0 4px;
    // background-color: #e1d7d7 !important;
  }

  .uni-numbox__value {
    width: 48rpx !important;
    height: 30rpx !important;
    font-size: 26rpx !important;
    // background-color: #e1d7d7 !important;
  }
}

.login-container {
  position: relative;
  height: 80rpx;
  margin-top: 20rpx;

  .login-type {
    display: flex;
    height: 80rpx;
    width: 500rpx;
    background: #f2f4f7;
    border-radius: 50rpx;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);

    .pwd-btn,
    .code-btn {
      width: 50%;
      line-height: 80rpx;
      text-align: center;
      border-radius: 50rpx;
    }

    .checked {
      color: #fff;
      background-color: #ff5040;
    }
  }
}

.search {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4rpx 0 26rpx;
  height: 64rpx;
  margin: 16rpx 20rpx;
  font-size: 28rpx;
  border-radius: 32rpx;
  background-color: rgba(255, 255, 255, 0.5);
  border: 1px solid #ff5040;

  .search-btn {
    color: #fff;
    border-radius: 30rpx;
    height: 54rpx;
    line-height: 54rpx;
    background: linear-gradient(90deg, rgba(255, 112, 64, 1) 0%, rgba(255, 80, 64, 1) 100%);
    font-size: 26rpx;
    font-weight: 400;
    margin: 0;
  }
}

.head-types {
  width: 100%;
  white-space: nowrap;
  // overflow-x: scroll;
  // display: flex;

  .head-types-item {
    display: inline-flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    margin: 20rpx;

    .image-containers {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 130rpx;
      height: 130rpx;
      border-radius: 50%;

      .icon {
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
      }
    }

    .text {
      font-size: 26rpx;
      color: #666;
    }

    .active {
      border: 5rpx solid rgba(255, 80, 64, 1);

      .text {
        color: rgba(255, 80, 64, 1);
      }
    }
  }

  .active {
    .text {
      color: #ff5040;
    }
  }
}

.icon-search {
  &::before {
    margin-right: 10rpx;
  }
}

/* 分类 */
.categories {
  flex: 1;
  min-height: 400rpx;
  display: flex;
}

/* 一级分类 */
.primary {
  overflow: hidden;
  width: 180rpx;
  flex: none;
  background-color: #f6f6f6;

  .item {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 96rpx;
    font-size: 26rpx;
    color: #595c63;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      left: 42rpx;
      bottom: 0;
      width: 96rpx;
      border-top: 1rpx solid #e3e4e7;
    }
  }

  .active {
    background-color: #fff;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 8rpx;
      height: 100%;
      background-color: #ff5040;
    }
  }
}

.primary .item:last-child::after,
.primary .active::after {
  display: none;
}

/* 二级分类 */
.secondary {
  background-color: #fff;

  .search-list {
    margin: 20rpx 20rpx 0;

    .fourth-category {
      position: relative;
      height: 100rpx;
      // display: flex;
      width: 100%;
      // overflow-x: scroll;
      padding-right: 60rpx;

      .spred-container {
        display: flex;
        width: 100%;
        overflow: scroll;
      }

      .spread {
        position: absolute;
        right: 0;
        z-index: 99;
        font-size: 26rpx;
        color: rgba(50, 50, 51, 1);
        font-weight: 400;
        display: inline-block;
        height: 60rpx;
        width: 60rpx;
        line-height: 40rpx;
        padding: 10rpx;
        border-radius: 4px;
        background: #fff;
        white-space: nowrap;
        text-align: center;
        top: 50%;
        transform: translateY(-50%);
      }

      .fourth-item {
        font-size: 26rpx;
        color: rgba(50, 50, 51, 1);
        font-weight: 400;
        margin-top: 20rpx;
        margin-right: 20rpx;
        display: inline-block;
        height: 60rpx;
        line-height: 40rpx;
        padding: 10rpx;
        border-radius: 4px;
        background: rgba(242, 244, 247, 1);
        white-space: nowrap;
      }

      .active {
        background: #ffe8e5;
        color: #ff5040;
      }
    }

    .order {
      display: flex;
      align-items: center;
    }

    .list-container {
      .item {
        display: flex;
        border-bottom: 1px solid #eee2e2;
        margin-top: 30rpx;

        image {
          height: 160rpx;
          width: 160rpx;
        }

        .info {
          flex: 1;
          display: flex;
          flex-direction: column;
          width: 90%;
          padding-left: 20rpx;

          .title {
          }

          .price {
            margin-top: 30rpx;
            color: #ff5040;
          }
        }

        .right {
          display: flex;
          flex-direction: column;
          // flex: 1;
          justify-content: space-around;
          align-items: flex-end;

          .shoucang {
            height: 50%;
          }

          .jiagou {
            flex: 1;
          }
        }
      }
    }
  }

  .carousel {
    height: 200rpx;
    margin: 0 30rpx 20rpx;
    border-radius: 4rpx;
    overflow: hidden;
  }

  .panel {
    margin: 0 30rpx 0rpx;
  }

  .title {
    height: 60rpx;
    color: #333;
    font-size: 28rpx;

    .more {
      float: right;
      padding-left: 20rpx;
      font-size: 24rpx;
      color: #999;
    }
  }

  .more {
    &::after {
      font-family: 'erabbit' !important;
      content: '\e6c2';
    }
  }

  .section {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    padding: 20rpx 0;

    .goods {
      width: 150rpx;
      margin: 0rpx 30rpx 20rpx 0;

      &:nth-child(3n) {
        margin-right: 0;
      }

      image {
        width: 150rpx;
        height: 150rpx;
      }

      .name {
        padding: 5rpx;
        font-size: 22rpx;
        color: #333;
      }

      .price {
        padding: 5rpx;
        font-size: 18rpx;
        color: #cf4444;
      }

      .number {
        font-size: 24rpx;
        margin-left: 2rpx;
      }
    }
  }
}
</style>
