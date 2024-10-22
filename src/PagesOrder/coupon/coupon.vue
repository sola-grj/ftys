<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

const query = defineProps<{
  from: string
}>()
// 获取我的优惠券列表
const myCouponList = ref<MyCouponItem[]>([])
const myCurrentCouponList = ref<MyCouponItem[]>([])

// 优惠券列表
const couponList = ref<CouponItem[]>([])
const getCouponListData = async () => {
  const res = await getCouponListAPI()
  couponList.value = res.result
}

const getMyCouponListData = async () => {
  const res = await getMyCouponListAPI()
  myCouponList.value = res.result.list

  myCurrentCouponList.value = myCouponList.value.filter((v) => v.status === '1')
}
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const { top, height } = uni.getMenuButtonBoundingClientRect()

const activeIndex = ref('1') // 0 是密码登录 1是短信
const onChangeIndex = (index: string) => {
  activeIndex.value = index
  myCurrentCouponList.value = myCouponList.value.filter((v) => v.status === index)
  console.log('myCurrentCouponList====', myCurrentCouponList.value)
}
const goback = () => {
  uni.navigateBack()
}
const chooseCoupon = ref()
// 从下单页面过来的
const avalibleCouponList = ref<MyCouponItem[]>([])
const currentChooseCoupon = ref<MyCouponItem>({} as MyCouponItem)
onUnload(() => {
  uni.$off('avalibleCouponList')
})
onLoad(() => {
  if (query.from === 'home') {
    getCouponListData()
  } else if (query.from === 'my') {
    getMyCouponListData()
  } else if (query.from === 'order') {
    uni.$on('avalibleCouponList', (data) => {
      ;(avalibleCouponList.value = data.avalibleCouponList),
        (chooseCoupon.value = data.chooseCoupon),
        (currentChooseCoupon.value = data.currentChooseCoupon)
    })
  }
})
// 有效期展示
const showExpireText = (data: MyCouponItem | CouponItem) => {
  // 展示有效期
  if (query.from === 'my') {
    return `有效期 ${data.expire_start_time.slice(2)}-${data.expire_end_time.slice(2)}`
  } else {
    if (data.expire_type === '1') {
      return `有效期 ${data.expire_start_time.slice(2)}-${data.expire_end_time.slice(2)}`
    } else {
      return `${data.expire_days}天后过期`
    }
  }
}
const goToUse = (data: MyCouponItem) => {
  if (data.status === '1') {
    uni.switchTab({ url: '/pages/index/index' })
  }
}
const goToSearch = () => {
  uni.navigateTo({ url: '/PagesOrder/search/search' })
}
// 领取优惠券
const getCoupon = async (data: CouponItem) => {
  const res = await receiveCouponAPI({
    coupon_id: data.id,
    expire_time: data.expire_end_time,
    expire_type: data.expire_type,
    expire_days: data.expire_days,
  })
  uni.showToast({ icon: 'success', title: '领取成功' })
  // 重新加载优惠券信息
  await getCouponListData()
}
const goToUseCoupon = (couponId: string) => {
  uni.navigateTo({ url: `/pagesOrder/create/create?couponId=${couponId}` })
}
</script>

<template>
  <scroll-view class="viewport" scroll-y enable-back-to-top>
    <SolaShopHeader v-if="from === 'my'" title="我的优惠券" />
    <SolaShopHeader v-else-if="from === 'order'" title="选择优惠券" />
    <SolaShopHeader v-else />
    <!-- <view class="title" :style="{ paddingTop: height + top + 'px' }">
      <text v-if="from === 'my'" class="text">我的优惠券</text>
      <text v-else-if="from === 'order'" class="text">选择优惠券</text>
      <view v-else @tap="goToSearch" class="search">
        <text class="ftysIcon icon-sousuo"></text>
        <input disabled />
        <button class="search-btn">搜索</button>
      </view>
      <text
        @tap="goback"
        class="ftysIcon icon-xiangzuojiantou"
        :class="from === 'home' ? 'home-back' : ''"
      ></text>
    </view> -->
    <view class="container">
      <view v-if="from === 'my'" class="login-container">
        <view class="login-type">
          <view
            @tap="($event) => onChangeIndex('1')"
            class="pwd-btn"
            :class="activeIndex === '1' ? 'checked' : ''"
            >未使用
          </view>
          <view
            @tap="($event) => onChangeIndex('2')"
            class="code-btn"
            :class="activeIndex === '2' ? 'checked' : ''"
            >已使用
          </view>
          <view
            @tap="($event) => onChangeIndex('3')"
            class="code-btn"
            :class="activeIndex === '3' ? 'checked' : ''"
            >已过期
          </view>
        </view>
      </view>
      <view v-if="from === 'home'" class="s-title">
        <view class="s-text">优惠券</view>
        <!-- <view class="s-bg" /> -->
      </view>
      <view v-if="from === 'my'" class="coupon-list">
        <view v-for="item in myCurrentCouponList" :key="item.name" class="coupon-item">
          <view class="left">
            <text class="face-value">￥{{ item.face_value }}</text>
            <text class="amount-limit">满{{ item.amount_limit }}元可用</text>
          </view>
          <view class="mid">
            <text class="name">{{ item.name }}</text>
            <text class="expire_type">{{ showExpireText(item) }}</text>
          </view>
          <view class="right" @tap="($event) => goToUse(item)">
            <view v-if="item.status === '1'" class="use-btn">去使用</view>
            <image class="image" v-if="item.status === '2'" src="@/static/images/used.png" />
            <image class="image" v-if="item.status === '3'" src="@/static/images/expired.png" />
          </view>
        </view>
        <view v-if="myCurrentCouponList.length === 0" class="bg">
          <image
            src="https://img.js.design/assets/img/66909fda4fc21e83fb682df4.png#52a35c0ee65bdb8ba63bcefcce2ce6e6"
            mode="aspectFit"
          />
          <text>暂无内容</text>
        </view>
      </view>
      <view v-if="from === 'home'" class="coupon-list">
        <view v-for="item in couponList" :key="item.id" class="coupon-item">
          <view class="left">
            <text class="face-value">￥{{ item.face_value }}</text>
            <text class="amount-limit">满{{ item.amount_limit }}元可用</text>
          </view>
          <view class="mid">
            <text class="name">{{ item.name }}</text>
            <text class="expire_type">{{ showExpireText(item) }}</text>
          </view>
          <view class="right" @tap="($event) => getCoupon(item)">
            <view class="use-btn">领取</view>
          </view>
        </view>
      </view>
      <view v-if="from === 'order'" class="avalible-coupon-list">
        <view v-for="item in avalibleCouponList" :key="item.name" class="avalible-coupon-item">
          <view class="top">
            <view class="left">
              <text class="face-value">￥{{ item.face_value }}</text>
              <text class="amount-limit">满{{ item.amount_limit }}元可用</text>
            </view>
            <view class="right">
              <text class="right-title">邀请好友奖励</text>
              <text class="right-desc">(邀请新用户进入小程序所得，下单支付时可抵扣）</text>
            </view>
          </view>
          <view class="bottom">
            <text class="bottom-title">{{ item.expire_end_time.split(' ')[0] }}过期</text>
            <view class="use-btn" @tap="($event) => chooseCoupon(item.couponId)">{{
              currentChooseCoupon.couponId === item.couponId ? '使用中' : '去使用'
            }}</view>
          </view>
        </view>
      </view>
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
  background: linear-gradient(90deg, rgba(255, 112, 64, 1) 0%, rgba(255, 80, 64, 1) 100%);

  .container {
    height: 100%;
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    overflow: scroll;

    .s-title {
      position: relative;
      height: 20rpx;
      width: 200rpx;
      font-weight: 500;
      font-size: 35rpx;
      white-space: nowrap;
      background: linear-gradient(96.62deg, rgba(255, 116, 88, 1) 0%, rgba(255, 137, 114, 0) 100%);
      margin: 40rpx;

      .s-text {
        position: absolute;
        bottom: 0;
        left: 10rpx;
      }
    }

    .login-container {
      position: relative;
      height: 80rpx;

      .login-type {
        display: flex;
        height: 80rpx;
        width: 500rpx;
        background: #f2f4f7;
        border-radius: 50rpx;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        margin-top: 10rpx;

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

    .coupon-list {
      .coupon-item {
        display: flex;
        min-height: 200rpx;
        align-items: center;
        border-radius: 8px;
        background: linear-gradient(
          174.02deg,
          rgba(255, 250, 192, 1) 0%,
          rgba(255, 255, 255, 1) 100%
        );
        border: 0.5px solid rgba(112, 112, 112, 1);
        margin: 20rpx;

        .left {
          display: flex;
          flex-direction: column;
          font-size: 25rpx;
          width: 30%;
          align-items: center;
          color: #f65332;
          min-height: 200rpx;
          justify-content: center;
          white-space: nowrap;

          .face-value {
            font-size: 35rpx;
          }
        }

        .mid {
          min-height: 200rpx;
          display: flex;
          justify-content: center;
          flex-direction: column;
          font-size: 20rpx;
          width: 50%;
          font-size: 25rpx;
          padding-left: 10rpx;
          border-left: 1px dashed transparent;
          background: linear-gradient(
                174.02deg,
                rgba(255, 250, 192, 1) 0%,
                rgba(255, 255, 255, 1) 100%
              )
              padding-box,
            repeating-linear-gradient(-45deg, #ccc 0, #ccc 0.25em, white 0, white 0.75em);

          .name {
            font-size: 35rpx;
            font-weight: bold;
          }

          .expire_type {
            color: #999;
          }
        }

        .right {
          min-height: 200rpx;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-right: 10rpx;
          flex: 1;

          .use-btn {
            font-size: 26rpx;
            height: 50rpx;
            width: 120rpx;
            border-radius: 30rpx;
            background-color: #f65332;
            color: #fff;
            line-height: 50rpx;
            text-align: center;
          }

          .image {
            width: 120rpx;
            height: 120rpx;
          }
        }
      }
    }

    .avalible-coupon-list {
      .avalible-coupon-item {
        border: 1px solid #f4ba73;
        margin: 20rpx;
        border-radius: 20rpx;

        .top {
          width: 100%;
          height: 200rpx;
          display: flex;
          align-items: center;
          justify-content: space-around;
          border-bottom: 1px solid rgba(238, 238, 238, 1);

          .left {
            height: 100%;
            display: flex;
            flex-direction: column;
            font-size: 25rpx;
            width: 40%;
            align-items: center;
            color: #f65332;
            min-height: 200rpx;
            justify-content: center;
            white-space: nowrap;

            .face-value {
              font-size: 45rpx;
              margin-bottom: 30rpx;
            }
          }

          .right {
            flex: 1;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;

            .right-title {
              margin-bottom: 30rpx;
              font-weight: bold;
            }

            .right-desc {
              color: #666666;
            }
          }
        }

        .bottom {
          width: 100%;
          height: 100rpx;
          display: flex;
          align-items: center;
          justify-content: space-around;

          .bottom-title {
            width: 40%;
            color: #666666;
            font-size: 30rpx;
          }

          .use-btn {
            font-size: 26rpx;
            height: 50rpx;
            width: 120rpx;
            border-radius: 30rpx;
            background-color: #f65332;
            color: #fff;
            line-height: 50rpx;
            text-align: center;
          }
        }
      }
    }
  }

  .bg {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: rgba(175, 177, 178, 1);

    image {
      height: 500rpx;
      width: 500rpx;
    }
  }
}
</style>
