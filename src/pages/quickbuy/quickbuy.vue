<script setup lang="ts">
import { useAddShoppingCart, useCollect, useUpdateShoppingCart } from '@/composables'
import { getGoodsCollectsAPI, getRecentlyOrderAPI } from '@/services/order'
import type { PageParams } from '@/types/global'
import type { QuickOrderCategoryItem, QuickOrderListItem } from '@/types/order'
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'

const typepopup = ref<UniHelper.UniPopupInstance>()
const activeIndex = ref(0)
const currentCommonlyType = ref<QuickOrderCategoryItem>({} as QuickOrderCategoryItem)
const currentRecentlyType = ref<QuickOrderCategoryItem>({} as QuickOrderCategoryItem)
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const commonlyUsedIsFinish = ref(false)
const recentlyBuyIsFinish = ref(false)
const CommonlyUsedPageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
const RecentlyBuyPageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
const commonlyCategoryIndex = ref(0)
const recentlyCategoryIndex = ref(0)
// 常用清单
const commonlyUsedList = ref<QuickOrderListItem[]>([])
const commonlyUsedCategoryList = ref<QuickOrderCategoryItem[]>([])
const geCommonlyUsedData = async () => {
  // 退出判断
  if (commonlyUsedIsFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  let res
  if (currentCommonlyType.value && currentCommonlyType.value.categoryId) {
    res = await getGoodsCollectsAPI({
      categoryId: currentCommonlyType.value.categoryId,
      ...CommonlyUsedPageParams,
    })
  } else {
    res = await getGoodsCollectsAPI({ ...CommonlyUsedPageParams })
    commonlyUsedCategoryList.value = [
      { categoryId: '', categoryName: '全部' },
      ...res.result.categories,
    ]
  }
  // 分页数据增加
  commonlyUsedList.value.push(...res.result.list)
  if (CommonlyUsedPageParams.page < res.result.total) {
    // 页码累加
    CommonlyUsedPageParams.page++
  } else {
    commonlyUsedIsFinish.value = true
  }
}
// 最近购买
const recentlyBuyList = ref<QuickOrderListItem[]>([])
const recentlyBuyCategoryList = ref<QuickOrderCategoryItem[]>([])
const geRencentlyBuyData = async () => {
  // 退出判断
  if (recentlyBuyIsFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  let res
  if (currentRecentlyType.value && currentRecentlyType.value.categoryId) {
    res = await getRecentlyOrderAPI({
      categoryId: currentRecentlyType.value.categoryId,
      ...RecentlyBuyPageParams,
    })
  } else {
    res = await getRecentlyOrderAPI({ ...RecentlyBuyPageParams })
    recentlyBuyCategoryList.value = [
      { categoryId: '', categoryName: '全部' },
      ...res.result.categories,
    ]
  }
  // 分页数据增加
  recentlyBuyList.value.push(...res.result.list)
  if (RecentlyBuyPageParams.page < res.result.total) {
    // 页码累加
    RecentlyBuyPageParams.page++
  } else {
    recentlyBuyIsFinish.value = true
  }
}

const onTapCommonlyCategory = (data: QuickOrderCategoryItem, index: number) => {
  commonlyUsedIsFinish.value = false
  currentCommonlyType.value = data
  CommonlyUsedPageParams.page = 1
  commonlyUsedList.value = []
  commonlyCategoryIndex.value = index
  geCommonlyUsedData()
}

const onTapRecentlyCategory = (data: QuickOrderCategoryItem, index: number) => {
  recentlyBuyIsFinish.value = false
  currentRecentlyType.value = data
  RecentlyBuyPageParams.page = 1
  recentlyBuyList.value = []
  recentlyCategoryIndex.value = index
  geRencentlyBuyData()
}

const goToDetail = (data: QuickOrderListItem) => {
  uni.navigateTo({ url: `/PagesOrder/goods/goods?source=${data.source}&goodsId=${data.goodsId}` })
}
// 商品收藏 取消收藏
const onCollect = async (data: QuickOrderListItem) => {
  const res = await useCollect(data.source, data.goodsId)
  if (res.code === '1' && res.msg === '收藏成功') {
    uni.showToast({ icon: 'success', title: '收藏成功' })
    if (activeIndex.value === 0) {
      commonlyUsedList.value.forEach((item) => {
        if (item.goodsId === data.goodsId && item.source === data.source) {
          item.isCollect = '1'
        }
      })
    }
    if (activeIndex.value === 1) {
      recentlyBuyList.value.forEach((item) => {
        if (item.goodsId === data.goodsId && item.source === data.source) {
          item.isCollect = '1'
        }
      })
    }

    return
  }
  if (res.code === '1' && res.msg === '取消收藏') {
    uni.showToast({ icon: 'success', title: '取消收藏' })
    if (activeIndex.value === 0) {
      commonlyUsedList.value.forEach((item) => {
        if (item.goodsId === data.goodsId && item.source === data.source) {
          item.isCollect = '0'
        }
      })
    }
    if (activeIndex.value === 1) {
      recentlyBuyList.value.forEach((item) => {
        if (item.goodsId === data.goodsId && item.source === data.source) {
          item.isCollect = '0'
        }
      })
    }

    return
  }
}
// 更新购物车
// 添加购物车
const currentCartId = ref('')
const addShoppingCart = async (data: QuickOrderListItem, num: number, type: string) => {
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
const onChangeIndex = (index: number) => {
  activeIndex.value = index
}
onShow(() => {
  geCommonlyUsedData()
  geRencentlyBuyData()
})
</script>
<template>
  <scroll-view class="viewport" scroll-y enable-back-to-top>
    <SolaShopHeader title="快捷下单" />
    <scroll-view
      @scrolltolower="activeIndex === 0 ? geCommonlyUsedData() : geRencentlyBuyData()"
      scroll-y
      enable-back-to-top
      class="container"
    >
      <view class="login-container">
        <view class="login-type">
          <view
            @tap="($event) => onChangeIndex(0)"
            class="pwd-btn"
            :class="activeIndex === 0 ? 'checked' : ''"
            >常用清单
          </view>
          <view
            @tap="($event) => onChangeIndex(1)"
            class="code-btn"
            :class="activeIndex === 1 ? 'checked' : ''"
            >最近购买
          </view>
        </view>
      </view>
      <view class="fourth-category">
        <view class="spred-container">
          <view
            :class="{
              active:
                activeIndex === 0
                  ? commonlyCategoryIndex === index
                  : recentlyCategoryIndex === index,
            }"
            @tap="
              ($event) =>
                activeIndex === 0
                  ? onTapCommonlyCategory(item, index)
                  : onTapRecentlyCategory(item, index)
            "
            class="fourth-item"
            v-for="(item, index) in activeIndex === 0
              ? commonlyUsedCategoryList
              : recentlyBuyCategoryList"
            :key="item.categoryId"
            >{{ item.categoryName }}
          </view>
        </view>

        <view class="spread" @tap="typepopup?.open?.('top')">
          <text class="ftysIcon icon-xiangxiajiantou" />
        </view>

        <uni-popup ref="typepopup" background-color="#fff">
          <view class="popup-content" :style="{ paddingTop: safeAreaInsets!.top + 'px' }">
            <view class="text">分类</view>
            <view
              class="type-item"
              :key="item.categoryId"
              @tap="
                ($event) =>
                  activeIndex === 0
                    ? onTapCommonlyCategory(item, index)
                    : onTapRecentlyCategory(item, index)
              "
              v-for="(item, index) in activeIndex === 0
                ? commonlyUsedCategoryList
                : recentlyBuyCategoryList"
            >
              {{ item.categoryName }}
            </view>
          </view>
        </uni-popup>
      </view>
      <view class="list-container">
        <view
          class="item"
          @tap="($event) => goToDetail(item)"
          v-for="item in activeIndex === 0 ? commonlyUsedList : recentlyBuyList"
          :key="item.goodsId"
        >
          <image :src="item.images[0]" />
          <view class="info">
            <view class="infotitle">{{ item.name }}</view>
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
              v-if="item?.cartGoodsNum"
              v-model="item.cartGoodsNum"
              @change="($event) => addShoppingCart(item, $event, '')"
            />
            <view
              @tap="($event) => addShoppingCart(item, 1, 'first')"
              v-else
              class="ftysIcon icon-a-jiagou2x"
            ></view>
          </view>
        </view>
      </view>
    </scroll-view>
  </scroll-view>
</template>
<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
  background-color: #f7f7f8;
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

::-webkit-scrollbar {
  width: 0;
  height: 0;
  background-color: transparent;
}

.viewport {
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 112, 64, 1) 0%, rgba(255, 80, 64, 1) 100%);

  .container {
    height: 100%;
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    overflow: scroll;
    padding: 30rpx;

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

    .fourth-category {
      position: relative;
      height: 100rpx;
      display: flex;
      width: 100%;

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

    .list-container {
      .item {
        display: flex;
        border-bottom: 1px solid #eee2e2;
        margin-top: 30rpx;

        image {
          height: 200rpx;
          width: 200rpx;
        }

        .info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
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
}
</style>
