<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import { getMySuggestAPI, getOrderPerformanceAPI } from '@/services/my'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import type { PageParams } from '@/types/global'
import type { MySuggestItem, OrderStatusItem } from '@/types/my'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

const formatDate = (date: Date) => {
  var year = date.getFullYear()
  var month = addZero(date.getMonth() + 1)
  var day = addZero(date.getDate())
  return year + '-' + month + '-' + day
}

const addZero = (num: number) => {
  return num < 10 ? '0' + num : num
}

// 推荐分页参数
const pageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
const isFinish = ref(false)
// 今天的日期
const today = formatDate(new Date())

// 近七天
const sevenDay = formatDate(new Date(new Date().setDate(new Date().getDate() + 7)))

// 近十五天
const fifteenDay = formatDate(new Date(new Date().setDate(new Date().getDate() + 15)))

// 近三十天
const thirteenDay = formatDate(new Date(new Date().setDate(new Date().getDate() + 30)))

// 获取下单情况数据
const orderList = ref<OrderStatusItem[]>([])
const getOrderPerformanceData = async (dateFilter: string) => {
  // 退出判断
  if (isFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getOrderPerformanceAPI({
    dateFilter,
  })
  const mock = [
    {
      userId: '6280',
      orderTime: '2024-08-11 09:26:19',
      username: '樱木花道1',
      mobile: '13355556666',
    },
    {
      userId: '6280',
      orderTime: '2024-08-11 09:26:19',
      username: '樱木花道1',
      mobile: '13355556666',
    },
    {
      userId: '6280',
      orderTime: '2024-08-11 09:26:19',
      username: '樱木花道1',
      mobile: '13355556666',
    },
  ]
  orderList.value.push(...mock)
  // orderList.value.push(...res.result.list)

  if (pageParams.page < res.result.total) {
    // 页码累加
    pageParams.page++
  } else {
    isFinish.value = true
  }
}

const single = ref('')
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const activeIndex = ref('today')
const onChangeIndex = (index: string) => {
  activeIndex.value = index
  getOrderPerformanceData(index)
}

onLoad(() => {
  getOrderPerformanceData('today')
})
</script>

<template>
  <scroll-view
    @scrolltolower="getOrderPerformanceData"
    class="viewport"
    scroll-y
    enable-back-to-top
  >
    <view class="title" :style="{ paddingTop: safeAreaInsets!.top + 'px' }">
      <text @tap="goback" class="ftysIcon icon-xiangzuojiantou"></text>
      <text class="text">下单情况</text>
    </view>
    <view class="container">
      <view class="login-container">
        <view class="login-type">
          <view
            @tap="($event) => onChangeIndex('today')"
            class="pwd-btn"
            :class="activeIndex === 'today' ? 'checked' : ''"
            >今天
          </view>
          <view
            @tap="($event) => onChangeIndex('7')"
            class="code-btn"
            :class="activeIndex === '7' ? 'checked' : ''"
            >七天
          </view>
          <view
            @tap="($event) => onChangeIndex('15')"
            class="code-btn"
            :class="activeIndex === '15' ? 'checked' : ''"
          >
            十五天
          </view>
          <view
            @tap="($event) => onChangeIndex('30')"
            class="code-btn"
            :class="activeIndex === '30' ? 'checked' : ''"
          >
            三十天
          </view>
        </view>
        <view class="show-time">
          <text class="start-time">{{ today }}</text
          >&nbsp;~
          <text v-if="activeIndex === 'today'" class="end-time">{{ today }}</text>
          <text v-if="activeIndex === '7'" class="end-time">{{ sevenDay }}</text>
          <text v-if="activeIndex === '15'" class="end-time">{{ fifteenDay }}</text>
          <text v-if="activeIndex === '30'" class="end-time">{{ thirteenDay }}</text>
          &nbsp;
          <text class="ftysIcon icon-riqi" />
        </view>
      </view>
      <view class="table-title table-item">
        <text class="name">客户名称</text>
        <text class="time">最近一次下单</text>
        <text class="operate">操作</text>
      </view>
      <view v-for="item in orderList" :key="item.userId" class="table-item">
        <text class="name">{{ item.username }}</text>
        <text class="time">{{ item.orderTime }}</text>
        <text class="ftysIcon icon-dianhua"></text>
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
      left: 50%;
      transform: translateX(-50%);
      bottom: 20rpx;
    }

    .icon-xiangzuojiantou {
      position: absolute;
      left: 20rpx;
      bottom: 20rpx;
    }

    .add-feedback {
      width: 160rpx;
      font-size: 28rpx;
      height: 40rpx;
      text-align: center;
      line-height: 40rpx;
      position: absolute;
      right: 20rpx;
      bottom: 20rpx;
      border-radius: 20rpx;
      background: linear-gradient(90deg, rgba(255, 112, 77, 1) 0%, rgba(255, 95, 77, 1) 100%);
    }
  }

  .container {
    height: 100%;
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    overflow: scroll;
    padding: 30rpx;

    .login-container {
      position: relative;
      height: 180rpx;

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

      .show-time {
        height: 60rpx;
        white-space: nowrap;
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        border-bottom: 1px solid #afb0b2;
        color: #666666;
      }
    }

    .table-item {
      height: 60rpx;
      width: 100%;
      display: flex;
      justify-content: space-between;
      margin-top: 30rpx;
      border-bottom: 1px dashed #afb0b2;
      font-size: 28rpx;
    }

    .table-title {
      border-bottom: 1px solid #afb0b2;
      font-weight: bold;
    }
  }
}
</style>
