<script setup lang="ts">
import { getMyCouponListAPI } from '@/services/coupon'
import {
  createOrderAPI,
  getMemberOrderPreAPI,
  getMemberOrderPreNowAPI,
  getMemberOrderRepurchaseByIdAPI,
  orderPayAPI,
  postMemberOrderAPI,
  type CreateOrderCartItem,
} from '@/services/order'
import { useMemberStore } from '@/stores'
import { useAddressStore } from '@/stores/modules/address'
import type { CartItem } from '@/types/cart'
import type { CouponItem, MyCouponItem } from '@/types/coupon'
import type { OrderPreResult } from '@/types/order'
import { cal } from '@/utils/cal'
import { onLoad, onShow, onUnload } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

const couponpopup = ref()
const memberStore = useMemberStore()
const query = defineProps<{
  orderId: string
  orderNo: string
  money: string
  orderPayPrice: string
}>()
const balancePwd = ref('')
const payType = ref('wx')
const changeStatus = (status: string) => {
  payType.value = status
}
const goToRecharge = () => {
  uni.redirectTo({ url: '/pagesMember/recharge/recharge' })
}

const orderPay = async () => {
  if (!balancePwd.value) {
    uni.showToast({ icon: 'error', title: '请输入密码' })
    return
  }
  const res = await orderPayAPI({
    orderId: query.orderId,
    payType: payType.value,
    password: balancePwd.value,
  })
  if (res.code === '1') {
    uni.showToast({ icon: 'success', title: '支付成功' })
    setTimeout(() => {
      uni.redirectTo({ url: '/PagesOrder/list/list' })
    }, 500)
  } else {
    uni.showToast({ icon: 'none', title: res.msg || '支付失败' })
  }
}
const submit = () => {
  if (payType.value === 'wx') {
    console.log('wx===')
  } else {
    orderPay()
  }
}
</script>

<template>
  <scroll-view scroll-y class="viewport">
    <view class="top-title">
      <SolaShopHeader title="订单支付" />
    </view>
    <view class="container">
      <!-- 收货地址 -->
      <view class="pay-type">
        <view class="info-item">
          <view class="label">订单编号</view>
          <view class="value">{{ orderNo }}</view>
        </view>
        <view class="info-item">
          <view class="label">订单金额</view>
          <view class="value money">{{ orderPayPrice }}</view>
        </view>
      </view>
      <!-- 支付方式 -->
      <view class="pay-type">
        <view class="info-item">
          <view class="label">微信支付</view>
          <view class="value">
            <radio color="#ff5040" @tap="() => changeStatus('wx')" :checked="payType === 'wx'" />
          </view>
        </view>
        <view class="info-item">
          <view class="label">
            <text>余额支付</text>
            <text class="sub">余额:{{ money }}￥</text>
            <text @tap="goToRecharge" class="recharge">充值</text>
          </view>
          <view class="value">
            <radio
              color="#ff5040"
              @tap="() => changeStatus('balance')"
              :checked="payType === 'balance'"
            />
          </view>
        </view>
        <view class="info-item">
          <view class="label">余额密码</view>
          <view class="value">
            <uni-easyinput
              :disabled="payType === 'wx'"
              type="password"
              v-model="balancePwd"
              placeholder="请输入密码"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>
      </view>
      <view>
        <button style="background-color: #ff5040; color: #fff; width: 70%" @tap="submit">
          提交订单
        </button>
      </view>
    </view>
  </scroll-view>
</template>

<style lang="scss">
page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: #f4f4f4;
}

// 滚动容器
.scroll-view {
  width: 100%;
  position: relative;
}

.top-title {
  height: 400rpx;
  width: 100%;
  background: linear-gradient(to bottom, rgb(241 73 17) 0%, #f7f7f8 100%);
  padding: 20rpx;
}

.container {
  // overflow: scroll;
  position: relative;
  top: -220rpx;
  height: 100%;
  display: inline-block;
  width: 100%;

  .address {
    overflow: hidden;
    margin: 20rpx;
    padding: 0 20rpx;
    border-radius: 10rpx;
    background-color: #fff;

    .add-title {
      margin-top: 40rpx;
      font-weight: bold;
    }

    .add-psz {
      color: #999;
      margin-top: 40rpx;
      font-size: 28rpx;
    }

    .add-detail {
      font-weight: bold;
      margin-top: 20rpx;
    }

    .add-person {
      margin: 30rpx 0;
      color: #999;
      font-size: 28rpx;

      .person-name {
        margin-right: 30rpx;
      }
    }
  }

  .pay-type {
    // overflow: hidden;
    margin: 20rpx;
    padding: 20rpx 20rpx;
    border-radius: 10rpx;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    // justify-content: space-between;

    .pay-value {
      margin-right: 100rpx;
      color: #ff5340;
      font-weight: 600;
    }

    .info-item {
      height: 80rpx;
      line-height: 80rpx;
      display: flex;
      justify-content: space-between;

      .money {
        color: #ff5040;
      }

      .label {
        display: flex;
        align-items: center;

        .sub {
          margin-left: 20rpx;
          font-size: 26rpx;
          color: #999;
        }

        .recharge {
          width: 80rpx;
          height: 50rpx;
          line-height: 50rpx;
          text-align: center;
          color: #fff;
          border-radius: 10rpx;
          background: linear-gradient(90deg, rgba(255, 112, 77, 1) 0%, rgba(255, 95, 77, 1) 100%);
          font-size: 24rpx;
          margin-left: 30rpx;
        }
      }
    }
  }

  .time {
    // overflow: hidden;
    margin: 20rpx;
    padding: 20rpx 20rpx;
    border-radius: 10rpx;
    background-color: #fff;
    display: flex;
    justify-content: space-between;

    .time-value {
      margin-right: 100rpx;
      color: #ff5340;
      font-weight: 600;
    }
  }

  .list-container {
    margin: 20rpx;
    padding: 20rpx 20rpx;
    border-radius: 10rpx;
    background-color: #fff;

    .item {
      display: flex;
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
    }

    .remark {
      margin-top: 30rpx;
      display: flex;

      .title {
        font-size: 30rpx;
        margin-right: 40rpx;
        color: rgba(50, 50, 51, 1);
      }
    }
  }

  /* 结算清单 */
  .settlement {
    margin: 20rpx;
    padding: 20rpx;
    border-radius: 10rpx;
    background-color: #fff;

    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 80rpx;
      font-size: 26rpx;
      color: #333;
    }

    .coupon {
      color: rgba(255, 80, 64, 1);
      border-bottom: 1px solid #d0cbcb;
    }

    .total {
      margin: 30rpx 0;
      text-align: right;

      .total-num {
        color: #cf4444;
      }
    }

    .danger {
      color: #cf4444;
    }
  }
}

// .symbol::before {
//   content: '¥';
//   font-size: 80%;
//   margin-right: 5rpx;
// }

.shipment {
  margin: 20rpx;
  padding: 30rpx 30rpx 30rpx 84rpx;
  font-size: 26rpx;
  border-radius: 10rpx;
  background: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/locate.png)
    20rpx center / 50rpx no-repeat #fff;
  position: relative;

  .icon {
    font-size: 36rpx;
    color: #333;
    transform: translateY(-50%);
    position: absolute;
    top: 50%;
    right: 20rpx;
  }

  .user {
    color: #333;
    margin-bottom: 5rpx;
  }

  .address {
    color: #666;
  }
}

.goods {
  margin: 20rpx;
  padding: 0 20rpx;
  border-radius: 10rpx;
  background-color: #fff;

  .item {
    display: flex;
    padding: 30rpx 0;
    border-top: 1rpx solid #eee;

    &:first-child {
      border-top: none;
    }

    .picture {
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

    .attrs {
      line-height: 1.8;
      padding: 0 15rpx;
      margin-top: 6rpx;
      font-size: 24rpx;
      align-self: flex-start;
      border-radius: 4rpx;
      color: #888;
      background-color: #f7f7f8;
    }

    .prices {
      display: flex;
      align-items: baseline;
      margin-top: 6rpx;
      font-size: 28rpx;

      .pay-price {
        margin-right: 10rpx;
        color: #cf4444;
      }

      .price {
        font-size: 24rpx;
        color: #999;
        text-decoration: line-through;
      }
    }

    .count {
      position: absolute;
      bottom: 0;
      right: 0;
      font-size: 26rpx;
      color: #444;
    }
  }
}

/* 吸底工具栏 */
.toolbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(var(--window-bottom));
  z-index: 1;

  background-color: #fff;
  height: 100rpx;
  padding: 0 20rpx;
  border-top: 1rpx solid #eaeaea;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: content-box;

  .total-pay {
    display: flex;
    flex-direction: column;
    font-size: 40rpx;
    color: #cf4444;

    .decimal {
      font-size: 75%;
    }

    .trans-fee {
      color: #d0cbcb;
      font-size: 22rpx;
    }
  }

  .button {
    width: 220rpx;
    text-align: center;
    line-height: 72rpx;
    font-size: 26rpx;
    color: #fff;
    border-radius: 20rpx;
    background: linear-gradient(90deg, rgba(255, 112, 64, 1) 0%, rgba(255, 80, 64, 1) 100%);
  }

  .disabled {
    opacity: 0.6;
  }
}
</style>
