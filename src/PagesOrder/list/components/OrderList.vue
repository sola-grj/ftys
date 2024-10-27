<script setup lang="ts">
import { OrderState, orderStateList } from '@/services/constants'
import { cancelOrderAPI, getMemberOrderAPI, getOrderListAPI, orderPayAPI } from '@/services/order'
import { getPayMockAPI, getPayWxPayMiniPayAPI } from '@/services/pay'
import type { OrderItem, OrderListParams, OrderListReqData } from '@/types/order'
import { onMounted, ref } from 'vue'

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
// 定义props
const props = defineProps<{
  orderState: string
}>()
const isFinish = ref(false)
// 全部 请求参数
const allQueryParams = ref<OrderListReqData>({
  page: 1,
  pageSize: 5,
  status: props.orderState,
})

// 根据订单状态生成底部buttons
const createButtons = (order: OrderItem) => {
  switch (props.orderState) {
    case '0':
      if (order.status === '1') {
        return [
          { id: 'pay', name: '去支付' },
          { id: 'edit', name: '编辑' },
          { id: 'cancel', name: '取消订单' },
        ]
      } else if (order.status === '2') {
        return [
          { id: 'cancel', name: '取消订单' },
          { id: 'again', name: '再来一单' },
        ]
      } else if (order.status === '3') {
        return [{ id: 'again', name: '再来一单' }]
      } else if (order.status === '12') {
        return [
          { id: 'cancel', name: '取消订单' },
          { id: 'edit', name: '编辑' },
          { id: 'again', name: '再来一单' },
        ]
      } else if (order.status === '6') {
        return [
          { id: 'finish', name: '再来一单' },
          { id: 'after-sales', name: '申请售后' },
        ]
      }
      break
    case '1':
      // 待支付
      return [
        { id: 'pay', name: '去支付' },
        { id: 'edit', name: '编辑' },
        { id: 'cancel', name: '取消订单' },
      ]
    case '2':
      // 代发货
      return [
        { id: 'cancel', name: '取消订单' },
        { id: 'again', name: '再来一单' },
      ]
    case '3':
      // 待收货
      return [{ id: 'again', name: '再来一单' }]
    case '4':
      // 待售后
      return [
        // { id: 'again', name: '再来一单' },
        // { id: 'after-sales', name: '申请售后' },
      ]
    case '6':
      // 已完成
      return [
        { id: 'finish', name: '再来一单' },
        { id: 'after-sales', name: '申请售后' },
      ]
    case '12':
      // 已完成
      return [
        { id: 'cancel', name: '取消订单' },
        { id: 'edit', name: '编辑' },
        { id: 'again', name: '再来一单' },
      ]

    default:
      break
  }
}
const userBalance = ref('')
// 获取订单列表
const orderList = ref<OrderItem[]>([])
const getMemberOrderData = async () => {
  if (props.orderState === '0') {
    delete allQueryParams.value.status
  }
  // 退出判断
  if (isFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getOrderListAPI(allQueryParams.value)
  userBalance.value = res.result.userInfo.money
  orderList.value.push(...res.result.list)
  if (allQueryParams.value.page < res.result.total) {
    // 页码累加
    allQueryParams.value.page++
  } else {
    isFinish.value = true
  }
}

onMounted(() => {
  getMemberOrderData()
})

const onTapBottom = (order: OrderItem, id: string) => {
  if (id === 'finish') {
    goToOrderDetail(order)
  }
  if (id === 'cancel') {
    cancelOrder(order.orderId)
  }
  if (id === 'edit') {
    goToOrderDetail(order, 'edit')
  }
  if (id === 'again') {
    againBuy(order)
  }
  if (id === 'pay') {
    onOrderPay(order)
  }
  if (id === 'after-sales') {
    goToOrderDetail(order)
  }
}

// 再来一单
const againBuy = (order: OrderItem) => {
  uni.showModal({
    content: '确定再来一单吗',
    success: async (res) => {
      if (res.confirm) {
        uni.reLaunch({
          url: '/pages/cart/cart?from=order',
          success: (res) => {
            uni.$emit('againBuy', { againBuyGoodsOrder: order })
          },
        })
      }
    },
  })
}

// 取消订单
const cancelOrder = (orderId: string) => {
  uni.showModal({
    content: '是否取消订单？',
    success: async (res) => {
      if (res.confirm) {
        const res = await cancelOrderAPI({
          orderId,
        })
        if (res.code === '1') {
          uni.showToast({
            title: '取消订单成功',
            icon: 'success',
          })
          setTimeout(() => {
            uni.reLaunch({
              url: '/PagesOrder/list/list',
            })
          }, 500)
        } else {
          uni.showToast({ icon: 'error', title: res.msg })
        }
      }
    },
  })
}

// 去支付
const onOrderPay = async (order: OrderItem) => {
  uni.navigateTo({
    url: `/PagesOrder/orderpay/orderpay?orderId=${order.orderId}&orderNo=${order.orderNo}&money=${userBalance.value}&orderPayPrice=${order.orderPayPrice}`,
  })
}
// 跳转商品详情
const goToOrderDetail = (order: OrderItem, type?: string) => {
  uni.navigateTo({ url: `/PagesOrder/detail/detail?orderId=${order.orderId}&type=${type}` })
}

// 复制功能
const copy = (orderNo: string) => {
  uni.setClipboardData({
    data: orderNo,
    success: function () {
      uni.showToast({
        icon: 'success',
        title: '已复制到剪贴板',
      })
    },
  })
}
</script>
<template>
  <scroll-view scroll-y class="orders" @scrolltolower="getMemberOrderData" enable-back-to-top>
    <view
      class="card"
      @tap="($event) => goToOrderDetail(order)"
      v-for="order in orderList"
      :key="order.orderId"
    >
      <view class="top" @tap.stop.prevent>
        <view class="order-id"
          >{{ order.orderNo }} <text @tap="($event) => copy(order.orderNo)" class="copy">复制</text>
        </view>
        <view :class="orderState === '1' ? 'wait' : 'other'"
          ><text class="w-desc">等待付款</text> <text class="w-minuate">30分钟</text>
        </view>
      </view>
      <view v-if="order.status !== '4'" class="mid">
        <image class="image" :src="order.detail[0].goodsImage[0]" />
        <view class="name">{{ order.detail[0].goodsName }}</view>
        <view class="info">
          <view class="price">￥{{ order.detail[0].unitPrice }}</view>
          <view class="num">共 {{ order.detail[0].num }} {{ order.detail[0].units }}</view>
        </view>
      </view>
      <view v-else class="mid">
        <image class="image" :src="order.afterSalesDetail[0].goodsImage[0]" />
        <view class="name">{{ order.afterSalesDetail[0].goodsName }}</view>
        <view class="info">
          <view class="price">￥{{ order.afterSalesDetail[0].unitPrice }}</view>
          <view class="num"
            >共 {{ order.afterSalesDetail[0].num }} {{ order.afterSalesDetail[0].units }}</view
          >
        </view>
      </view>
      <view class="bottom" @tap.stop.prevent>
        <view
          @tap="($event) => onTapBottom(order, btn.id)"
          class="btn"
          :class="btn.id === 'pay' ? 'pay-btn' : ''"
          v-for="btn in createButtons(order)"
          :key="btn.id"
          >{{ btn.name }}</view
        >
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
  height: 100vh;

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
      justify-content: space-between;

      .order-id {
        .copy {
          color: rgba(255, 80, 64, 1);
        }
      }

      .wait {
        display: flex;
        width: 200rpx;
        height: 40rpx;
        background-color: rgba(255, 231, 228, 1);
        border-radius: 20rpx;
        font-size: 22rpx;
        align-items: center;

        .w-desc {
          width: 50%;
          height: 100%;
          text-align: center;
          border-radius: 20rpx 0 20rpx 20rpx;
          width: 50%;
          text-align: center;
          background: linear-gradient(90deg, rgba(255, 112, 64, 1) 0%, rgba(255, 80, 64, 1) 100%);
          line-height: 40rpx;
          color: #fff;
        }

        .w-minuate {
          width: 50%;
          text-align: center;
          color: rgba(255, 80, 64, 1);
        }
      }

      .other {
        display: none;
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
      justify-content: flex-end;

      .btn {
        width: 140rpx;
        height: 60rpx;
        border: 1rpx solid rgba(175, 176, 178, 1);
        border-radius: 40rpx;
        line-height: 60rpx;
        text-align: center;
        margin-right: 20rpx;
      }

      .pay-btn {
        color: #ff5040;
        border: 1rpx solid #ff5040;
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
