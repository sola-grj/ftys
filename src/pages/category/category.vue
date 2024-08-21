<script setup lang="ts">
import { getCategoryTopAPI } from '@/services/category'
import { getCategoryAPI, getHomeBannerAPI } from '@/services/home'
import type { CategoryTopItem } from '@/types/category'
import type { BannerItem, BasicCategoryItem, SearchBasicCategoryItem } from '@/types/home'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import PageSkeleton from './components/PageSkeleton.vue'
import { useMemberStore } from '@/stores'
import { getGoodsListByIdAPI, goodsDetailPageRecommendGoodsAPI } from '@/services/goods'
import type { PageParams } from '@/types/global'
import { useAddShoppingCart, useUpdateShoppingCart } from '@/composables'

// 分页参数
const pageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
// 页面是否加载完成 标识
const isFinish = ref(false)
// 获取当前用户角色信息
const memberStore = useMemberStore()

// 查看当前账号是主账号还是子账号 1:主账号 2:子账号
// 用户type_id
/**  1:业务员 2:司机 3:生鲜 4:干货 5:生鲜&干货
 *  type_id 1 最高权限
    type_id 2 只展示 我的 页面
    type_id 3 4 5 && user_role === 2  客户 客户才有主账号 子账号
 */
// 一级分类选中状态
const activeIndex = ref(0) // 0 是生鲜 1是干货
// 二级分类选中状态
const secondActiveIndex = ref(0)
// 三级分类选中状态
const thirdActiveIndex = ref(0)
const onChangeIndex = (index: number) => {
  activeIndex.value = index
}

// 获取商品分类数据
const top1List = ref<BasicCategoryItem[]>([])
const top2List = ref<BasicCategoryItem[]>([])
// 二级分类
const fruitCategory = ref<BasicCategoryItem[]>([])
const dryCargoCategory = ref<BasicCategoryItem[]>([])
// 三级分类
const currentThirdTypeCategory = ref<BasicCategoryItem[]>([])
// 查询当前选中三级分类对应的商品
const fiveTypeCategory = ref<SearchBasicCategoryItem[]>([])
const getFiveTypeCategoryData = async (source: string, category: string) => {
  // 退出判断
  if (isFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getGoodsListByIdAPI({
    source,
    category,
    ...pageParams,
  })
  fiveTypeCategory.value.push(...res.result.list)
  if (pageParams.page < res.result.total) {
    // 页码累加
    pageParams.page++
  } else {
    isFinish.value = true
  }
}

// 首次初始化数据
const getTypeListData = async () => {
  const res = await getCategoryAPI()
  fruitCategory.value = res.result.fruitCategory.filter(
    (item: BasicCategoryItem) => item.childlist.length > 0,
  )
  dryCargoCategory.value = res.result.dryCargoCategory.filter(
    (item: BasicCategoryItem) => item.childlist.length > 0,
  )
  top1List.value = res.result.top1
  top2List.value = res.result.top2
  currentThirdTypeCategory.value = fruitCategory.value[0].childlist
  getFiveTypeCategoryData(
    fruitCategory.value[0].childlist[0].source,
    fruitCategory.value[0].childlist[0].id,
  )
}

// 获取首页参数
const query = defineProps<{
  type: string
}>()
// 获取轮播图数据
const bannerList = ref<BannerItem[]>([])
const getBannerListData = async () => {
  const res = await getHomeBannerAPI(2)
  bannerList.value = res.result
}

// 获取分类列表数据
const categoryList = ref<CategoryTopItem[]>([])
const getCategoryTopData = async () => {
  const res = await getCategoryTopAPI()
  categoryList.value = res.result
}

// 页面加载
onLoad(async () => {
  await Promise.all([getTypeListData()])
  if (query.type) {
    categoryList.value.forEach((item, index) => {
      if (item.id === query.type) {
        activeIndex.value = index
      }
    })
  }
})
const goToSearch = () => {
  uni.navigateTo({ url: '/pages/search/search' })
}

// 点击二级分类
const onTapTwoLevel = (data: BasicCategoryItem) => {
  // 重置分页器
  pageParams.page = 1
  pageParams.pageSize = 10
  isFinish.value = false
  fiveTypeCategory.value = []
  if (activeIndex.value === 0) {
    const fruit: BasicCategoryItem[] = fruitCategory.value.find((item) => item.id === data.id)
      ?.childlist as BasicCategoryItem[]
    currentThirdTypeCategory.value = fruit
    console.log('fruit', fruit)
    getFiveTypeCategoryData(fruit[0].source, fruit[0].id)
  }
  if (activeIndex.value === 1) {
    const dry: BasicCategoryItem[] = fruitCategory.value.find((item) => item.id === data.id)
      ?.childlist as BasicCategoryItem[]
    currentThirdTypeCategory.value = dry
    console.log('fruit', dry)
    getFiveTypeCategoryData(dry[0].source, dry[0].id)
  }
}

// 点击三级分类
const onTapThirdType = (data: BasicCategoryItem, index: number) => {
  // 重置分页器
  pageParams.page = 1
  pageParams.pageSize = 10
  isFinish.value = false
  fiveTypeCategory.value = []
  thirdActiveIndex.value = index
  getFiveTypeCategoryData(data.source, data.id)
}

const addShoppingCart = async (data: SearchBasicCategoryItem, num: number, type: string) => {
  let orderId = ''
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
      orderId = res.result.orderId
      data.cartGoodsNum = res.result.goodsNum
    }
  } else {
    const res = await useUpdateShoppingCart(
      {
        cartId: data.cartId,
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

// 更新购物车数量
const changeCartNum = async (value: number, data: SearchBasicCategoryItem) => {
  console.log('888888', value, data)
  await addShoppingCart(data, value, '')
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
      <view
        class="head-types-item"
        @tap="($event) => onTapTwoLevel(item)"
        v-for="item in activeIndex === 0 ? fruitCategory : dryCargoCategory"
        :key="item.id"
      >
        <view class="image-containers">
          <image class="icon" :src="item.image" mode="aspectFit" />
        </view>
        <text class="text"> {{ item.name }}</text>
      </view>
    </view>
    <!-- 分类 -->
    <view class="categories">
      <!-- 左侧：二级分类 -->
      <scroll-view class="primary" scroll-y>
        <view
          @tap="($event) => onTapThirdType(item, index)"
          v-for="(item, index) in currentThirdTypeCategory"
          :key="item.id"
          class="item"
          :class="{ active: index === thirdActiveIndex }"
        >
          <text class="name"> {{ item.name }} </text>
        </view>
      </scroll-view>
      <!-- 右侧：三级分类 -->
      <scroll-view
        class="secondary"
        @scrolltolower="
          ($event) =>
            getFiveTypeCategoryData(
              currentThirdTypeCategory[thirdActiveIndex].source,
              currentThirdTypeCategory[thirdActiveIndex].id,
            )
        "
        scroll-y
      >
        <!-- 内容区域 -->
        <view class="search-list">
          <view class="order">
            <view>默认</view>
            <view>单价</view>
          </view>
          <view class="list-container">
            <view class="item" v-for="item in fiveTypeCategory" :key="item.goodsId">
              <image :src="item.images[0]" mode="scaleToFill" />
              <view class="info">
                <view class="title">{{ item.name }}</view>
                <view class="price">￥{{ item.price }}</view>
              </view>
              <view class="right">
                <view
                  @tap="($event) => onCollect(item)"
                  :class="`ftysIcon ${
                    item.isCollect === '1' ? 'icon-huangsexingxing' : 'icon-shoucang'
                  }`"
                ></view>
                <uni-number-box
                  class="number-box"
                  v-if="item.cartGoodsNum"
                  @change="($event) => changeCartNum($event, item)"
                  v-model="item.cartGoodsNum"
                />
                <view
                  v-else
                  @tap="($event) => addShoppingCart(item, 1, 'first')"
                  class="ftysIcon icon-a-jiagou2x"
                ></view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
  <!-- <PageSkeleton v-else /> -->
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
  overflow-x: scroll;
  display: flex;

  .head-types-item {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    margin: 20rpx;

    .icon {
      width: 120rpx;
      height: 120rpx;
    }

    .text {
      font-size: 26rpx;
      color: #666;
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
      background-color: #27ba9b;
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

    .order {
      display: flex;
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
    line-height: 60rpx;
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
