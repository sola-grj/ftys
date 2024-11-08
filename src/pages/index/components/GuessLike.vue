<script setup lang="ts">
import { removeShoppingCart, useAddShoppingCart, useUpdateShoppingCart } from '@/composables'
import type { CartItem } from '@/types/cart'
import type { PageParams } from '@/types/global'
import type { RecommendItem } from '@/types/home'
import { ref } from 'vue'

defineProps<{
  historyList: RecommendItem[]
  recommendList: RecommendItem[]
  activeIndex: number
  onActiveChange: (activeIndex: number) => void
}>()
const goToCoupon = () => {
  uni.navigateTo({ url: '/PagesOrder/coupon/coupon?from=home' })
}
// 更新购物车
// 添加购物车
const currentCartId = ref('')
const addShoppingCart = async (data: CartItem & RecommendItem, num: number, type: string) => {
  if (type === 'first') {
    const res = await useAddShoppingCart(
      {
        source: data.source,
        goodsId: data.goodsId,
        fGoodsId: data.fGoodsId,
        num,
        units: data.units,
        unitPrice: data.price,
      },
      num,
    )
    if (res.code === '1') {
      currentCartId.value = res.result.cartId
      data.cartGoodsNum = res.result.goodsNum
      if (res.result.shoppingCartNum !== 0) {
        uni.setTabBarBadge({
          //显示数字
          index: 3, //tabbar下标
          text: `${res.result.shoppingCartNum}`, //数字
        })
      } else {
        uni.removeTabBarBadge({
          //显示数字
          index: 3, //tabbar下标
        })
      }
    }
  } else {
    if (num === 0) {
      // 弹窗二次确认
      uni.showModal({
        content: '是否删除',
        success: async (res) => {
          if (res.confirm) {
            // 后端删除单品
            const res = await removeShoppingCart(currentCartId.value || data.id || data.cartId)
            if (res.code === '1') {
              data.num = 0
              if (res.result.shoppingCartNum !== 0) {
                uni.setTabBarBadge({
                  //显示数字
                  index: 3, //tabbar下标
                  text: `${res.result.shoppingCartNum}`, //数字
                })
              } else {
                uni.removeTabBarBadge({
                  //显示数字
                  index: 3, //tabbar下标
                })
              }
            } else {
              uni.showToast({ icon: 'error', title: res.msg })
            }
            // // 重新获取列表
            // getMemberCartData()
          } else {
            // data.num = data.num
          }
        },
        fail: (fail) => {
          console.log(fail)
        },
      })
    } else {
      const res = await useUpdateShoppingCart(
        {
          cartId: currentCartId.value || data.cartId,
          num,
          unitPrice: data.price,
          units: data.units,
        },
        num,
      )
      if (res.code === '1') {
        data.cartGoodsNum = res.result.goodsNum
        if (res.result.shoppingCartNum !== 0) {
          uni.setTabBarBadge({
            //显示数字
            index: 3, //tabbar下标
            text: `${res.result.shoppingCartNum}`, //数字
          })
        } else {
          uni.removeTabBarBadge({
            //显示数字
            index: 3, //tabbar下标
          })
        }
      }
    }
  }
}

const goToDetail = (data: RecommendItem) => {
  uni.navigateTo({ url: `/PagesOrder/goods/goods?source=${data.source}&goodsId=${data.goodsId}` })
}
</script>

<template>
  <view class="btns">
    <view class="left">
      <view
        @tap="($event) => onActiveChange(0)"
        :class="`left-item ${activeIndex === 0 ? 'checked' : ''}`"
      >
        <view class="title">推荐</view>
        <view class="desc">为你定制</view>
      </view>
      <view
        @tap="($event) => onActiveChange(1)"
        :class="`left-item ${activeIndex === 1 ? 'checked' : ''}`"
      >
        <view class="title">浏览</view>
        <view class="desc">历史记录</view>
      </view>
    </view>

    <view class="right" @tap="goToCoupon">
      <image
        src="https://img.js.design/assets/img/647f508ef4cf090efd244f0d.png#abcd9de40757a3e271102c0dfedec16e"
      />
      <view>领优惠券</view>
    </view>
  </view>
  <view v-if="activeIndex === 0" class="list-container">
    <view
      @tap="($event) => goToDetail(item)"
      class="item"
      v-for="item in recommendList"
      :key="item.goodsId"
    >
      <view class="item-container">
        <image :src="item.images[0]" />
        <view class="name">{{ item.name }}</view>
        <view class="info" @tap.stop.prevent>
          <view class="price">￥{{ item.price }}</view>
          <uni-number-box
            class="number-box"
            v-if="item.cartGoodsNum"
            @change.stop="($event) => addShoppingCart(item, $event, '')"
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
  <view v-if="activeIndex === 1" class="list-container">
    <view
      @tap="($event) => goToDetail(item)"
      class="item"
      v-for="item in historyList"
      :key="item.goodsId"
    >
      <view class="item-container">
        <image :src="item.images[0]" />
        <view class="name">{{ item.name }}</view>
        <view class="info" @tap.stop.prevent>
          <view class="price">￥{{ item.price }}</view>
          <uni-number-box
            class="number-box"
            v-if="item.cartGoodsNum"
            @change.stop="($event) => addShoppingCart(item, $event, '')"
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
</template>

<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
  background-color: #f7f7f8;
}

.viewport {
  height: 100%;
}

.btns {
  margin: 20rpx 20rpx 0;
  display: flex;

  .left {
    width: 50%;
    display: flex;

    .left-item {
      width: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 20rpx;

      .title {
        font-size: 40rpx;
        font-weight: 600;
        margin-bottom: 5rpx;
      }

      .desc {
        font-size: 20rpx;
        font-weight: 400;
        color: #323233;
      }
    }

    .checked {
      background: linear-gradient(90deg, rgba(255, 112, 64, 1) 0%, rgba(255, 80, 64, 1) 100%);
      color: #fff;

      .desc {
        color: #fff;
      }
    }
  }

  .right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 80, 64, 1);
    font-size: 30rpx;
    font-weight: 700;
    background-color: #fff;
    border-radius: 20rpx;

    image {
      width: 150rpx;
      height: 150rpx;
    }
  }
}

.list-container {
  margin: 20rpx 20rpx 0;
  display: flex;
  flex-wrap: wrap;

  .item {
    width: 50%;
    display: inline-block;

    .item-container {
      background-color: #fff;
      margin: 10rpx;
      padding: 10rpx;
      border-radius: 10rpx;
      min-height: 480rpx;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: space-around;

      .name {
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-line-clamp: 2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        text-align: left;
      }
    }

    image {
      width: 300rpx;
      height: 300rpx;
    }

    .name {
      display: flex;
    }

    .info {
      display: flex;
      justify-content: space-between;

      .price {
        color: #ff5040;
      }
    }
  }
}
</style>
