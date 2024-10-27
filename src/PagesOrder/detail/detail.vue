<script setup lang="ts">
import { useGuessList, useUpdateShoppingCart } from '@/composables'
import { OrderState, orderStateList } from '@/services/constants'
import {
  deleteMemberOrderAPI,
  editOrderAPI,
  getMemberOrderByIdAPI,
  getMemberOrderCancelByIdAPI,
  getMemberOrderConsignmentByIdAPI,
  getMemberOrderLogisticsByIdAPI,
  orderDetailAPI,
  putMemberOrderReceiptByIdAPI,
  type OrderDetailResult,
} from '@/services/order'
import type { DetailItem, LogisticItem, OrderResult } from '@/types/order'
import { onLoad, onReady } from '@dcloudio/uni-app'
import PageSkeleton from './components/PageSkeleton.vue'
import { ref } from 'vue'
import { cal } from '@/utils/cal'

// 获取页面参数
const query = defineProps<{
  orderId: string
  type: string
}>()

// 获取页面栈
const pages = getCurrentPages()
// 获取当前页面示例,数组最后一项
const pageInstance = pages.at(-1) as any

// 页面渲染完毕
onReady(() => {
  // 动画效果,导航栏背景色
  pageInstance.animate(
    '.navbar', // 选择器
    [{ backgroundColor: 'transparent' }, { backgroundColor: '#f8f8f8' }], // 关键帧信息
    1000, // 动画持续时长
    {
      scrollSource: '#scroller', // scroll-view 的选择器
      startScrollOffset: 0, // 开始滚动偏移量
      endScrollOffset: 50, // 停止滚动偏移量
      timeRange: 1000, // 时间长度
    },
  )
  // 动画效果,导航栏标题
  pageInstance.animate('.navbar .title', [{ color: 'transparent' }, { color: '#000' }], 1000, {
    scrollSource: '#scroller',
    timeRange: 1000,
    startScrollOffset: 0,
    endScrollOffset: 50,
  })
  // 动画效果,导航栏返回按钮
  pageInstance.animate('.navbar .back', [{ color: '#fff' }, { color: '#000' }], 1000, {
    scrollSource: '#scroller',
    timeRange: 1000,
    startScrollOffset: 0,
    endScrollOffset: 50,
  })
})

// 获取订单详情
const order = ref<OrderDetailResult>({} as OrderDetailResult)
const getMemberOrderByIdData = async () => {
  const res = await orderDetailAPI({ orderId: query.orderId })
  order.value = res.result
}

// 是否加载中
const isLoading = ref(false)

// 获取物流信息
const logisticList = ref<LogisticItem[]>([])
const getMemberOrderLogisticsByIdData = async () => {
  const res = await getMemberOrderLogisticsByIdAPI(query.id)
  logisticList.value = res.result.list
}

onLoad(async () => {
  isLoading.value = true
  await getMemberOrderByIdData()
  isLoading.value = false
  totalPrice.value = order.value.orderPrice
})

// 是否为开发环境
const isDev = import.meta.env.DEV

// 确认收货
const onOrderConfirm = () => {
  uni.showModal({
    content: '为保障您的权益，请收到货并确认无误后，再确认收货',
    success: async (res) => {
      if (res.confirm) {
        const res = await putMemberOrderReceiptByIdAPI(query.id)
        order.value = res.result
      }
    },
  })
}

// 删除订单
const onOrderDelete = () => {
  uni.showModal({
    content: '是否删除订单？',
    success: async (res) => {
      if (res.confirm) {
        await deleteMemberOrderAPI({ ids: [query.id] })
        uni.redirectTo({ url: '/PagesOrder/list/list' })
      }
    },
  })
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

const goback = () => {
  uni.navigateBack()
}
const totalPrice = ref('')
const payPrice = ref(0)
const currentCartId = ref('')
const addShoppingCart = async (data: DetailItem, num: number, type: string) => {
  if (num === 0) {
    // 弹窗二次确认
    uni.showModal({
      content: '是否删除',
      success: async (res) => {
        if (res.confirm) {
          // 前端页面更新
          order.value.orderDetail = order.value.orderDetail.filter(
            (item) => item.cartId !== data.cartId,
          )
        } else {
          data.num = '1'
          // data.num = data.num
        }
      },
      fail: (fail) => {
        console.log(fail)
      },
    })
  } else {
    totalPrice.value = order.value.orderDetail
      // @ts-ignore
      .reduce((sum, item) => cal.jia(sum, cal.cheng(Number(item.unitPrice), item.num)), 0)
      // @ts-ignore
      .toFixed(2)

    console.log(order.value, totalPrice.value)
  }
}

const editOrder = async () => {
  let cartList = []
  order.value.orderDetail.forEach((item) => {
    cartList.push({
      cartId: item.cartId,
      num: item.num,
      unitPrice: item.unitPrice,
      remark: item.remark,
    })
  })
  const res = await editOrderAPI({
    userCoupon: order.value.useCoupon,
    couponId: order.value.userCouponId,
    couponAmount: order.value.couponInfo.faceValue,
    orderId: order.value.orderId,
    remark: order.value.remark,
    cartList: order.value.orderDetail,
  })
  if (res.code === '1') {
    uni.showToast({ icon: 'success', title: '修改成功' })
    setTimeout(() => {
      uni.navigateTo({ url: `/PagesOrder/list/list?type=0` })
    }, 500)
  } else {
    uni.showToast({ icon: 'none', title: res.msg })
  }
}

//申请售后
const goToApply = () => {
  uni.navigateTo({
    url: '/PagesOrder/detail/applyaftersale',
    success: (success) => {
      uni.$emit('applyaftersale', {
        order: order.value,
      })
    },
  })
}
const goToSource = (data: DetailItem) => {
  uni.navigateTo({
    url: `/PagesOrder/sourcegoods/sourcegoods?goodsId=${data.goodsId}&orderId=${order.value.orderId}&fGoodsId=${data.fGoodsId}&source=${data.source}`,
  })
}
</script>

<template>
  <!-- 自定义导航栏: 默认透明不可见, scroll-view 滚动到 50 时展示 -->
  <!-- <view class="navbar" :style="{ paddingTop: safeAreaInsets?.top + 'px' }">
    <view class="wrap">
      <navigator v-if="pages.length > 1" open-type="navigateBack" class="back icon-left"></navigator>
      <navigator v-else url="/pages/index/index" open-type="switchTab" class="back icon-home">
      </navigator>
      <view class="title">订单详情</view>
    </view>
  </view> -->
  <scroll-view scroll-y class="viewport" id="scroller" @scrolltolower="onScrolltolower">
    <template v-if="order.orderNo">
      <SolaShopHeader title="订单详情" />
      <view class="container">
        <view class="address-info" v-if="order.status === OrderState.YiShouHuo">
          <text class="ftysIcon icon-ditu_dingwei" />
          <view class="desc">
            <view class="address">{{ order.deliveryInfo.shippingAddr }}</view>
            <view class="user"
              >{{ order.deliveryInfo.username }} {{ order.deliveryInfo.mobile }}</view
            >
          </view>
        </view>
        <view class="list-container">
          <view class="item" v-for="item in order.orderDetail" :key="item.orderId">
            <image :src="item.goodsImage[0]" mode="scaleToFill" />
            <view class="info">
              <view class="infotitle">
                <text>{{ item.goodsName }}</text>
                <text
                  v-if="item.source === 'S'"
                  @tap="($event) => goToSource(item)"
                  class="source-btn"
                  >查看溯源</text
                >
              </view>
              <view class="right">
                <view class="price">￥{{ item.unitPrice }}/{{ item.units }}</view>
                <view v-if="type !== 'edit'" class="num"> X{{ item.num }}</view>
                <uni-number-box
                  v-else
                  class="number-box"
                  v-model="item.num"
                  @change="($event) => addShoppingCart(item, $event, '')"
                />
              </view>
              <view class="note">
                <uni-easyinput
                  v-model="item.remark"
                  :disabled="type !== 'edit'"
                  placeholder="请输入商品备注"
                  class="question"
                  type="text"
                ></uni-easyinput>
              </view>
            </view>
          </view>
          <view class="remark">
            <view class="rtitle">备注</view>
            <uni-easyinput
              v-model="order.remark"
              :disabled="type !== 'edit'"
              placeholder="建议备注前先与商家沟通确认"
              class="question"
              type="textarea"
            ></uni-easyinput>
          </view>
        </view>
        <view class="detail-container">
          <view class="detail-item">
            <text class="label">商品总价</text>
            <text class="value">{{ type === 'edit' ? totalPrice : order.orderPrice }}</text>
          </view>
          <view v-if="type !== 'edit'" class="detail-item">
            <text class="label">运费</text>
            <text class="value">0.00</text>
          </view>
          <view v-if="type !== 'edit'" class="detail-item">
            <text class="label"
              >优惠券 <text class="coupon-info">{{ order.couponInfo.couponName }}</text>
            </text>
            <text class="value">{{ order.couponInfo.faceValue }}</text>
          </view>
          <view v-if="type !== 'edit'" class="detail-item">
            <text class="label">实付款</text>
            <text class="value red">￥{{ order.orderPayPrice }}</text>
          </view>
        </view>
        <view class="detail-container">
          <view class="detail-item">
            <text class="label">订单编号</text>
            <text class="value"
              >{{ order.orderNo }} <text class="m">|</text>
              <text class="copy" @tap="($event) => copy(order.orderNo)"> 复制</text>
            </text>
          </view>
          <view class="detail-item">
            <text class="label">下单时间</text>
            <text class="value">{{ order.createTime }}</text>
          </view>
          <view class="detail-item">
            <text class="label">收货地址</text>
            <text class="value">{{ order.deliveryInfo.shippingAddr }}</text>
          </view>
        </view>
        <view class="btn" v-if="order.status === OrderState.YiShouHuo">
          <button open-type="" hover-class="button-hover" @tap="goToApply">申请售后</button>
        </view>
        <view class="btn" v-if="type === 'edit'">
          <button @tap="editOrder" open-type="" hover-class="button-hover">保存修改</button>
        </view>
      </view>
    </template>
    <template v-else>
      <!-- 骨架屏组件 -->
      <PageSkeleton />
    </template>
  </scroll-view>
</template>

<style lang="scss">
page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.navbar {
  width: 750rpx;
  color: #000;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9;
  /* background-color: #f8f8f8; */
  background-color: transparent;

  .wrap {
    position: relative;

    .title {
      height: 44px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 32rpx;
      /* color: #000; */
      color: transparent;
    }

    .back {
      position: absolute;
      left: 0;
      height: 44px;
      width: 44px;
      font-size: 44rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      /* color: #000; */
      color: #fff;
    }
  }
}

.viewport {
  background: linear-gradient(90deg, rgba(255, 112, 64, 1) 0%, rgba(255, 80, 64, 1) 100%);

  .container {
    position: relative;
    height: 100%;
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    overflow: scroll;
    padding: 30rpx;

    .address-info {
      display: flex;

      .icon-ditu_dingwei {
        color: rgba(255, 80, 64, 1);
        font-size: 80rpx;
      }

      .desc {
        display: flex;
        flex-direction: column;
        font-size: 26rpx;

        .address {
          color: rgba(102, 102, 102, 1);
        }

        .user {
          color: rgba(50, 50, 51, 1);
        }
      }
    }

    .list-container {
      padding: 20rpx 20rpx;
      // border-radius: 10rpx;
      background-color: #fff;
      border-bottom: 1px solid rgba(236, 236, 236, 1);

      .item {
        display: flex;
        margin-top: 10rpx;

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

          .infotitle {
            flex: 1;
            display: flex;
            justify-content: space-between;

            .source-btn {
              width: 120rpx;
              height: 50rpx;
              line-height: 50rpx;
              text-align: center;
              color: #fff;
              border-radius: 10rpx;
              background: linear-gradient(
                90deg,
                rgba(255, 112, 77, 1) 0%,
                rgba(255, 95, 77, 1) 100%
              );
              font-size: 24rpx;
            }
          }

          .price {
            margin-top: 10rpx;
            color: #ff5040;
          }
        }

        .right {
          display: flex;
          // flex: 1;
          justify-content: space-between;
          align-items: flex-end;
          color: #ff5040;

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

          .shoucang {
            height: 50%;
          }

          .jiagou {
            flex: 1;
          }

          .num {
            font-weight: bold;
          }
        }

        .note {
          margin-top: 10rpx;

          .uni-easyinput__content {
            height: 60rpx;
          }
        }
      }

      .remark {
        margin-top: 30rpx;
        display: flex;

        .rtitle {
          font-size: 30rpx;
          margin-right: 40rpx;
          color: rgba(50, 50, 51, 1);
        }
      }
    }

    .detail-container {
      padding: 20rpx 20rpx;
      // border-radius: 10rpx;
      background-color: #fff;
      border-bottom: 1px solid rgba(236, 236, 236, 1);

      .detail-item {
        display: flex;
        justify-content: space-between;
        margin-top: 10rpx;
        font-size: 26rpx;

        .label {
          color: rgba(175, 176, 178, 1);

          .coupon-info {
            color: rgba(255, 148, 26, 1);
          }
        }

        .value {
          .copy {
            color: rgba(255, 148, 26, 1);
          }

          .m {
            color: rgba(175, 176, 178, 1);
          }
        }

        .red {
          font-size: 30rpx;
          font-weight: bold;
          color: rgba(255, 80, 64, 1);
        }
      }
    }

    .btn {
      margin-top: 40rpx;

      button {
        color: #fff;
        border-radius: 20rpx;
        background: linear-gradient(90deg, rgba(255, 112, 77, 1) 0%, rgba(255, 95, 77, 1) 100%);
      }
    }
  }
}

.overview {
  display: flex;
  flex-direction: column;
  align-items: center;

  line-height: 1;
  padding-bottom: 30rpx;
  color: #fff;
  background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/order_bg.png);
  background-size: cover;

  .status {
    font-size: 36rpx;
  }

  .status::before {
    margin-right: 6rpx;
    font-weight: 500;
  }

  .tips {
    margin: 30rpx 0;
    display: flex;
    font-size: 14px;
    align-items: center;

    .money {
      margin-right: 30rpx;
    }
  }

  .button-group {
    margin-top: 30rpx;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .button {
    width: 260rpx;
    height: 64rpx;
    margin: 0 10rpx;
    text-align: center;
    line-height: 64rpx;
    font-size: 28rpx;
    color: #27ba9b;
    border-radius: 68rpx;
    background-color: #fff;
  }
}

.shipment {
  line-height: 1.4;
  padding: 0 20rpx;
  margin: 20rpx 20rpx 0;
  border-radius: 10rpx;
  background-color: #fff;

  .locate,
  .item {
    min-height: 120rpx;
    padding: 30rpx 30rpx 25rpx 75rpx;
    background-size: 50rpx;
    background-repeat: no-repeat;
    background-position: 6rpx center;
  }

  .locate {
    background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/locate.png);

    .user {
      font-size: 26rpx;
      color: #444;
    }

    .address {
      font-size: 24rpx;
      color: #666;
    }
  }

  .item {
    background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/car.png);
    border-bottom: 1rpx solid #eee;
    position: relative;

    .message {
      font-size: 26rpx;
      color: #444;
    }

    .date {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.goods {
  margin: 20rpx 20rpx 0;
  padding: 0 20rpx;
  border-radius: 10rpx;
  background-color: #fff;

  .item {
    padding: 30rpx 0;
    border-bottom: 1rpx solid #eee;

    .navigator {
      display: flex;
      margin: 20rpx 0;
    }

    .cover {
      width: 170rpx;
      height: 170rpx;
      border-radius: 10rpx;
      margin-right: 20rpx;
    }

    .meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
    }

    .name {
      height: 80rpx;
      font-size: 26rpx;
      color: #444;
    }

    .type {
      line-height: 1.8;
      padding: 0 15rpx;
      margin-top: 6rpx;
      font-size: 24rpx;
      align-self: flex-start;
      border-radius: 4rpx;
      color: #888;
      background-color: #f7f7f8;
    }

    .price {
      display: flex;
      margin-top: 6rpx;
      font-size: 24rpx;
    }

    .symbol {
      font-size: 20rpx;
    }

    .original {
      color: #999;
      text-decoration: line-through;
    }

    .actual {
      margin-left: 10rpx;
      color: #444;
    }

    .text {
      font-size: 22rpx;
    }

    .quantity {
      position: absolute;
      bottom: 0;
      right: 0;
      font-size: 24rpx;
      color: #444;
    }

    .action {
      display: flex;
      flex-direction: row-reverse;
      justify-content: flex-start;
      padding: 30rpx 0 0;

      .button {
        width: 200rpx;
        height: 60rpx;
        text-align: center;
        justify-content: center;
        line-height: 60rpx;
        margin-left: 20rpx;
        border-radius: 60rpx;
        border: 1rpx solid #ccc;
        font-size: 26rpx;
        color: #444;
      }

      .primary {
        color: #27ba9b;
        border-color: #27ba9b;
      }
    }
  }

  .total {
    line-height: 1;
    font-size: 26rpx;
    padding: 20rpx 0;
    color: #666;

    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10rpx 0;
    }

    .symbol::before {
      content: '¥';
      font-size: 80%;
      margin-right: 3rpx;
    }

    .primary {
      color: #cf4444;
      font-size: 36rpx;
    }
  }
}

.detail {
  line-height: 1;
  padding: 30rpx 20rpx 0;
  margin: 20rpx 20rpx 0;
  font-size: 26rpx;
  color: #666;
  border-radius: 10rpx;
  background-color: #fff;

  .title {
    font-size: 30rpx;
    color: #444;
  }

  .row {
    padding: 20rpx 0;

    .item {
      padding: 10rpx 0;
      display: flex;
      align-items: center;
    }

    .copy {
      border-radius: 20rpx;
      font-size: 20rpx;
      border: 1px solid #ccc;
      padding: 5rpx 10rpx;
      margin-left: 10rpx;
    }
  }
}

.toolbar-height {
  height: 100rpx;
  box-sizing: content-box;
}

.toolbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(var(--window-bottom));
  z-index: 1;

  height: 100rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  border-top: 1rpx solid #ededed;
  border-bottom: 1rpx solid #ededed;
  background-color: #fff;
  box-sizing: content-box;

  .button {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 200rpx;
    height: 72rpx;
    margin-left: 15rpx;
    font-size: 26rpx;
    border-radius: 72rpx;
    border: 1rpx solid #ccc;
    color: #444;
  }

  .delete {
    order: 4;
  }

  .button {
    order: 3;
  }

  .secondary {
    order: 2;
    color: #27ba9b;
    border-color: #27ba9b;
  }

  .primary {
    order: 1;
    color: #fff;
    background-color: #27ba9b;
  }
}

.popup-root {
  padding: 30rpx 30rpx 0;
  border-radius: 10rpx 10rpx 0 0;
  overflow: hidden;

  .title {
    font-size: 30rpx;
    text-align: center;
    margin-bottom: 30rpx;
  }

  .description {
    font-size: 28rpx;
    padding: 0 20rpx;

    .tips {
      color: #444;
      margin-bottom: 12rpx;
    }

    .cell {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15rpx 0;
      color: #666;
    }

    .icon::before {
      content: '\e6cd';
      font-family: 'erabbit' !important;
      font-size: 38rpx;
      color: #999;
    }

    .icon.checked::before {
      content: '\e6cc';
      font-size: 38rpx;
      color: #27ba9b;
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    padding: 30rpx 0 40rpx;
    font-size: 28rpx;
    color: #444;

    .button {
      flex: 1;
      height: 72rpx;
      text-align: center;
      line-height: 72rpx;
      margin: 0 20rpx;
      color: #444;
      border-radius: 72rpx;
      border: 1rpx solid #ccc;
    }

    .primary {
      color: #fff;
      background-color: #27ba9b;
      border: none;
    }
  }
}
</style>
