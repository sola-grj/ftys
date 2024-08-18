<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import { onLoad } from '@dcloudio/uni-app'
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
  couponList.value = [
    {
      id: '2',
      name: '满减优惠券2',
      type: '1',
      face_value: '10.00',
      amount_limit: '40.00',
      expire_type: '2',
      expire_start_time: '2024-08-04',
      expire_end_time: '2024-08-04',
      expire_days: '7',
      status: '1',
      create_time: '2024-08-04',
      update_time: '2024-08-04',
    },
    {
      id: '1',
      name: '满减优惠券1',
      type: '1',
      face_value: '10.00',
      amount_limit: '40.00',
      expire_type: '1',
      expire_start_time: '2024-08-05',
      expire_end_time: '2024-08-219',
      expire_days: '',
      status: '1',
      create_time: '2024-08-04',
      update_time: '2024-08-04',
    },
  ]
}

const getMyCouponListData = async () => {
  const res = await getMyCouponListAPI()
  myCouponList.value = res.result
  myCouponList.value = [
    {
      name: '满减优惠券2',
      expire_type: '2',
      face_value: '10.00',
      amount_limit: '40.00',
      expire_start_time: '2024-08-11',
      expire_time: '2024-08-11',
      expire_days: '7',
      status: '1',
      receive_time: '2024-08-04',
    },
    {
      name: '满减优惠券3',
      expire_type: '2',
      face_value: '10.00',
      amount_limit: '40.00',
      expire_start_time: '2024-08-11',
      expire_time: '2024-08-11',
      expire_days: '7',
      status: '2',
      receive_time: '2024-08-04',
    },
    {
      name: '满减优惠券4',
      expire_type: '2',
      face_value: '10.00',
      amount_limit: '40.00',
      expire_start_time: '2024-08-11',
      expire_time: '2024-08-03',
      expire_days: '7',
      status: '3',
      receive_time: '2024-08-01',
    },
  ]
  myCurrentCouponList.value = myCouponList.value.filter((v) => v.status === '1')
}
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

const activeIndex = ref('1') // 0 是密码登录 1是短信
const onChangeIndex = (index: string) => {
  activeIndex.value = index
  myCurrentCouponList.value = myCouponList.value.filter((v) => v.status === index)
}
const goback = () => {
  uni.navigateBack()
}
onLoad(() => {
  if (query.from === 'home') {
    getCouponListData()
  } else {
    getMyCouponListData()
  }
})
// 有效期展示
const showExpireText = (data: MyCouponItem | CouponItem) => {
  if (query.from === 'my') {
    // 展示有效期
    if (data.expire_type === '1') {
      return `有效期 ${data.expire_start_time.slice(2)}-${data.expire_time.slice(2)}`
    } else {
      return `有效期 ${data.expire_start_time.slice(2)}-${data.expire_time.slice(2)}`
    }
  } else {
    // 展示有效期
    if (data.expire_type === '1') {
      return `有效期 ${data.expire_start_time.slice(2)}-${data.expire_end_time.slice(2)}`
    } else {
      return `有效期 ${data.expire_start_time.slice(2)}-${data.expire_end_time.slice(2)}`
    }
  }
}
const goToUse = (data: MyCouponItem) => {
  if (data.status === '1') {
    uni.switchTab({ url: '/pages/index/index' })
  }
}
const goToSearch = () => {
  uni.navigateTo({ url: '/pages/search/search' })
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
</script>

<template>
  <scroll-view class="viewport" scroll-y enable-back-to-top>
    <view class="title" :style="{ paddingTop: safeAreaInsets!.top + 'px' }">
      <text v-if="from === 'my'" class="text">我的优惠券</text>
      <!-- 搜索框 -->
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
    </view>
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

  .title {
    position: relative;
    text-align: center;
    color: #fff;
    width: 100%;
    height: 130rpx;

    .text {
      position: absolute;
      bottom: 10rpx;
      left: 50%;
      transform: translateX(-50%);
    }

    .icon-xiangzuojiantou {
      position: absolute;
      bottom: 10rpx;
      left: 20rpx;
    }

    .home-back {
      bottom: 24rpx;
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
      width: 85%;
      position: absolute;
      right: 0;

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
  }

  .container {
    height: 100%;
    background: #fff;
    border-radius: 30rpx;
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
  }
}
</style>
