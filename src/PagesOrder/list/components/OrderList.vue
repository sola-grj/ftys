<script setup lang="ts">
import { OrderState, orderStateList } from '@/services/constants'
import { getMemberOrderAPI, getOrderListAPI } from '@/services/order'
import { getPayMockAPI, getPayWxPayMiniPayAPI } from '@/services/pay'
import type { OrderItem, OrderListParams } from '@/types/order'
import { onMounted, ref } from 'vue'

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
// 定义props
const props = defineProps<{
  orderState: number
}>()

// 全部 请求参数
const allQueryParams = {
  page: 1,
  pageSize: 5,
  status: props.orderState,
}
// 待支付
const dzfQueryParams = {
  page: 1,
  pageSize: 5,
  status: props.orderState,
}
// 待发货
const dfhQueryParams = {
  page: 1,
  pageSize: 5,
  status: props.orderState,
}
// 待收货
const dshQueryParams = {
  page: 1,
  pageSize: 5,
  status: props.orderState,
}
// 待售后
const dpjQueryParams = {
  page: 1,
  pageSize: 5,
  status: props.orderState,
}
const isAllFinish = ref(false)
const isDzfFinish = ref(false)
const isDfhFinish = ref(false)
const isDshFinish = ref(false)
const isDpjFinish = ref(false)

// 获取订单列表
const orderList = ref<OrderItem[]>([])
const getMemberOrderData = async () => {
  const res = await getOrderListAPI(allQueryParams)

  orderList.value = res.result.list
}

onMounted(() => {
  getMemberOrderData()
})

// 去支付
const onOrderPay = async (id: string) => {
  if (import.meta.env.DEV) {
    await getPayMockAPI({ orderId: id })
  } else {
    // #ifdef MP-WEIXIN
    const res = await getPayWxPayMiniPayAPI({ orderId: id })
    wx.requestPayment(res.result)
    // #endif
  }
  uni.showToast({ title: '支付成功' })
  // 更新订单状态
  const order = orderList.value.find((v) => v.id === id)
  order!.orderState = OrderState.DaiFaHuo
}
</script>
<template>
  <scroll-view scroll-y class="orders">
    <view class="card" v-for="order in orderList" :key="order.orderId">
      <view class="top">
        <view class="order-id">{{ order.orderNo }} <text class="copy">复制</text> </view>
        <view class="wait">等待付款30分钟 </view>
      </view>
      <view class="mid">
        <image
          class="image"
          src="https://img.js.design/assets/img/6691ec1357bbf24e7d84d155.png#d1470ccbdcf1e16c04752d2922557bae"
        />
        <view class="name">{{ order.detail[0].goodsName }}</view>
        <view class="info">
          <view class="price">￥{{ order.detail[0].unitPrice }}</view>
          <view class="num">共 {{ order.detail[0].num }} {{ order.detail[0].units }}</view>
        </view>
      </view>
      <view class="bottom">
        <view class="btn">取消订单</view>
        <view class="btn">编辑</view>
        <view class="btn">再来一单</view>
        <view class="btn pay-btn">去支付</view>
      </view>
    </view>
    <!-- 底部提示文字 -->
    <view class="loading-text" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }">
      {{ true ? '没有更多数据~' : '正在加载...' }}
    </view>
  </scroll-view>
</template>
<style lang="scss">
// 订单列表
.orders {
  .card {
    min-height: 100rpx;
    padding: 20rpx;
    margin: 20rpx 20rpx 0;
    border-radius: 10rpx;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    font-size: 26rpx;

    .top {
      display: flex;
      justify-content: space-around;

      .order-id {
        .copy {
          color: rgba(255, 80, 64, 1);
        }
      }
    }

    .mid {
      display: flex;
      justify-content: space-between;
      height: 200rpx;
      align-items: center;

      .image {
        width: 200rpx;
        height: 200rpx;
      }

      .name {
        flex: 1;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-left: 10rpx;
      }

      .info {
        width: 140rpx;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-end;

        .price {
          color: rgba(255, 80, 64, 1);
        }

        .num {
          color: rgba(175, 176, 178, 1);
          font-size: 24rpx;
          margin-top: 10rpx;
        }
      }
    }

    .bottom {
      display: flex;
      justify-content: space-around;

      .btn {
        width: 140rpx;
        height: 60rpx;
        border: 1rpx solid rgba(175, 176, 178, 1);
        border-radius: 40rpx;
        line-height: 60rpx;
        text-align: center;
      }

      .pay-btn {
        border: 1rpx solid rgba(255, 80, 64, 1);
      }
    }

    &:last-child {
      padding-bottom: 40rpx;
    }
  }

  .status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 28rpx;
    color: #999;
    margin-bottom: 15rpx;

    .date {
      color: #666;
      flex: 1;
    }

    .primary {
      color: #ff9240;
    }

    .icon-delete {
      line-height: 1;
      margin-left: 10rpx;
      padding-left: 10rpx;
      border-left: 1rpx solid #e3e3e3;
    }
  }

  .goods {
    display: flex;
    margin-bottom: 20rpx;

    .cover {
      width: 170rpx;
      height: 170rpx;
      margin-right: 20rpx;
      border-radius: 10rpx;
      overflow: hidden;
      position: relative;
    }

    .quantity {
      position: absolute;
      bottom: 0;
      right: 0;
      line-height: 1;
      padding: 6rpx 4rpx 6rpx 8rpx;
      font-size: 24rpx;
      color: #fff;
      border-radius: 10rpx 0 0 0;
      background-color: rgba(0, 0, 0, 0.6);
    }

    .meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .name {
      height: 80rpx;
      font-size: 26rpx;
      color: #444;
    }

    .type {
      line-height: 1.8;
      padding: 0 15rpx;
      margin-top: 10rpx;
      font-size: 24rpx;
      align-self: flex-start;
      border-radius: 4rpx;
      color: #888;
      background-color: #f7f7f8;
    }

    .more {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22rpx;
      color: #333;
    }
  }

  .payment {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    line-height: 1;
    padding: 20rpx 0;
    text-align: right;
    color: #999;
    font-size: 28rpx;
    border-bottom: 1rpx solid #eee;

    .quantity {
      font-size: 24rpx;
      margin-right: 16rpx;
    }

    .amount {
      color: #444;
      margin-left: 6rpx;
    }

    .symbol {
      font-size: 20rpx;
    }
  }

  .action {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-top: 20rpx;

    .button {
      width: 180rpx;
      height: 60rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-left: 20rpx;
      border-radius: 60rpx;
      border: 1rpx solid #ccc;
      font-size: 26rpx;
      color: #444;
    }

    .secondary {
      color: #27ba9b;
      border-color: #27ba9b;
    }

    .primary {
      color: #fff;
      background-color: #27ba9b;
    }
  }

  .loading-text {
    text-align: center;
    font-size: 28rpx;
    color: #666;
    padding: 20rpx 0;
  }
}
</style>
