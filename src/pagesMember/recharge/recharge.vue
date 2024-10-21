<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import {
  getMySuggestAPI,
  getRechargeB2BPayAPI,
  getRechargePayAPI,
  getUserMoneyAPI,
  type RechargeResult,
} from '@/services/my'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import type { PageParams } from '@/types/global'
import type { MySuggestItem } from '@/types/my'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

const amount = ref('100')
const activeIndex = ref('100')

const money = ref('')
const getMoney = async () => {
  const res = await getUserMoneyAPI()
  money.value = res.result.money
}
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const goToRecharge = async () => {
  uni.login({
    provider: 'weixin', //使用微信登录
    success: async function (loginRes) {
      console.log('00000000000000000', amount.value)

      const res = await getRechargeB2BPayAPI({
        rechargeMoney: amount.value,
        code: loginRes.code,
      })
      wx.requestCommonPayment({
        signData: res.result.signData,
        paySig: res.result.paySig,
        signature: res.result.signature,
        mode: 'retail_pay_goods',
        success(successRes: any) {
          getMoney()
          console.log('requestCommonPayment success', successRes)
          uni.showToast({ icon: 'success', title: '支付成功' })
        },
        fail({ errMsg, errno }) {
          getMoney()
          console.error(errMsg, errno)
          uni.showToast({ icon: 'error', title: `${errMsg}-${errno}` })
        },
      })
    },
  })

  // uni.requestPayment({
  //   provider: 'wxpay',
  //   timeStamp: res.result.data.timeStamp,
  //   nonceStr: res.result.data.nonceStr,
  //   package: res.result.data.package,
  //   signType: res.result.data.signType,
  //   paySign: res.result.data.paySign,
  //   success: function (res) {
  //     console.log('success:' + JSON.stringify(res));
  //   },
  //   fail: function (err) {
  //     console.log('fail:' + JSON.stringify(err));
  //   }
  // });
}

onLoad(() => {
  // getRechargePay()
  getMoney()
})
const addFeedback = () => {
  uni.navigateTo({ url: '/pagesMember/addfeedback/addfeedback' })
}
const onChangeIndex = (index: string) => {
  if (index !== 'define') {
    amount.value = index
  }
  activeIndex.value = index
}

const goToAccountDetail = () => {
  uni.navigateTo({ url: '/pagesMember/capital/capital' })
}
const goback = () => {
  uni.navigateBack()
}
const maxlength = ref(0)
const checkNum = (e) => {
  let val = e.toString()
  let dot = val.indexOf('.')
  if (dot == 0) {
    val = val.replace(/[^$#$]/g, '0.')
    val = val.replace(/\.{2,}/g, '.')
  } else {
    val = val.replace(/[^\d.]/g, '')
    val = val.replace(/\.{2,}/g, '.')
    val = val.replace(/^0+\./g, '0.')
    val = val.match(/^0+[1-9]+/) ? (val = val.replace(/^0+/g, '')) : val
    val = val.match(/^\d*(\.?\d{0,2})/g)[0] || ''
  }

  if (val.includes('.')) {
    let point = val.toString().split('.')[1].length
    if (point === 2) {
      maxlength.value = val.length // 限制输入框可输入的长度范围只在小数点后两位
    }
  } else {
    maxlength.value = 15 // 如果没有小数点，则输入框可输入长度是最原始长度
  }

  amount.value = val // 如果有改变 给输入框内容赋值
  console.log(amount.value)
}
</script>

<template>
  <scroll-view class="viewport" scroll-y enable-back-to-top>
    <!-- <view class="title" :style="{ paddingTop: safeAreaInsets!.top + 'px' }">
      <text @tap="goback" class="ftysIcon icon-xiangzuojiantou"></text>
      <text class="text">客户余额</text>
    </view> -->
    <SolaShopHeader title="客户余额" />
    <view class="container">
      <view class="image">
        <view class="left"
          >余额 ￥<text class="money">{{ money }}</text>
        </view>
        <view class="detail" @tap="goToAccountDetail">查看明细>> </view>
      </view>
      <view class="recharge-container">
        <view class="recharge-title">
          <text class="text">在线充值</text>
        </view>
        <view class="choose">
          <view
            @tap="($event) => onChangeIndex('100')"
            :class="activeIndex === '100' ? 'selected' : ''"
            class="item"
          >
            ￥100</view
          >
          <view
            @tap="($event) => onChangeIndex('300')"
            :class="activeIndex === '300' ? 'selected' : ''"
            class="item"
          >
            ￥300</view
          >
          <view
            @tap="($event) => onChangeIndex('500')"
            :class="activeIndex === '500' ? 'selected' : ''"
            class="item"
          >
            ￥500</view
          >
          <view
            @tap="($event) => onChangeIndex('800')"
            :class="activeIndex === '800' ? 'selected' : ''"
            class="item"
          >
            ￥800</view
          >
          <view
            @tap="($event) => onChangeIndex('1000')"
            :class="activeIndex === '1000' ? 'selected' : ''"
            class="item"
          >
            ￥1000</view
          >
          <view
            @tap="($event) => onChangeIndex('define')"
            :class="activeIndex === 'define' ? 'selected' : ''"
            class="item"
            >自定义</view
          >
        </view>
        <view class="define" v-if="activeIndex === 'define'">
          <text>自定义金额</text>
          <uni-easyinput @input="checkNum" type="digit" />
        </view>
      </view>
      <view class="btn" @tap="goToRecharge">立即充值</view>
    </view>
  </scroll-view>
</template>

<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
  background-color: #f7f7f8;
}

.viewport {
  height: 100%;
  background: rgba(39, 178, 86, 1);

  .container {
    height: 100%;
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    overflow: scroll;
    padding: 30rpx;

    .image {
      height: 220rpx;
      width: 100%;
      background-image: url('@/static/images/money.png');
      background-size: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      padding: 20rpx 20rpx 20rpx 40rpx;

      .left {
        font-size: 28rpx;
        color: #fff;

        .money {
          margin-left: 20rpx;
        }
      }

      .detail {
        font-size: 24rpx;
      }
    }

    .recharge-container {
      margin-top: 30rpx;

      .recharge-title {
        position: relative;
        font-weight: bold;
        border-bottom: none;
        height: 20rpx;
        background: linear-gradient(
          96.62deg,
          rgba(255, 116, 88, 1) 0%,
          rgba(255, 137, 114, 0) 100%
        );

        .total {
          position: absolute;
          left: 0;
          bottom: 0;
        }

        .text {
          position: absolute;
          bottom: 0;
          left: 0;
        }
      }

      .choose {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;

        .item {
          position: relative;
          width: 200rpx;
          height: 100rpx;
          line-height: 100rpx;
          text-align: center;
          margin-top: 20rpx;
          border-radius: 20rpx;
          border: 1px solid rgba(39, 178, 86, 1);
        }

        .selected {
          color: #4abe84;
          box-shadow: 0 2rpx 7rpx 0 rgba(85, 110, 97, 0.35);
          border-radius: 20rpx;
          // border: 1rpx solid rgba(74, 190, 132, 1);
        }

        .selected:before {
          content: '';
          position: absolute;
          right: 0;
          bottom: 0;
          border: 17rpx solid #4abe84;
          border-top-color: transparent;
          border-left-color: transparent;
        }

        .selected:after {
          content: '';
          width: 5rpx;
          height: 12rpx;
          position: absolute;
          right: 6rpx;
          bottom: 6rpx;
          border: 2rpx solid #fff;
          border-top-color: transparent;
          border-left-color: transparent;
          transform: rotate(45deg);
        }
      }

      .define {
        display: flex;
        height: 100rpx;
        align-items: center;

        .uni-easyinput {
          .uni-easyinput__content {
            border: none;
            border-radius: 0%;
            border-bottom: 1px solid #dcdfe6;
          }
        }
      }
    }

    .btn {
      border-radius: 8px;
      background: rgba(39, 178, 86, 1);
      height: 100rpx;
      width: 300rpx;
      line-height: 100rpx;
      text-align: center;
      color: #fff;
      margin: auto;
      margin-top: 40rpx;
    }
  }
}
</style>
