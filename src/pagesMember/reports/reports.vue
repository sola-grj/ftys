<script setup lang="ts">
import { getMySuggestAPI, getOrderPerformanceAPI } from '@/services/my'
import { getOrderListAPI } from '@/services/order'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import type { PageParams } from '@/types/global'
import type { MySuggestItem, OrderStatusItem } from '@/types/my'
import type { OrderItem } from '@/types/order'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

const formatDate = (date: Date) => {
  var year = date.getFullYear()
  var month = addZero(date.getMonth() + 1)
  var day = addZero(date.getDate())
  return year + '-' + month + '-' + day
}
// 获取昨日数据
const getYestDayOrNextDay = () => {
  // 获取当前日期
  const today = new Date()
  // 计算前一天的日期
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  return yesterday.toLocaleDateString().replaceAll('/', '-')
}
// 获取本周首尾数据
const getThisWeek = () => {
  let today = new Date()
  let dayOfWeek = today.getDay() - 1
  let startDate = new Date(today.getTime() - dayOfWeek * 86400000)
  let endDate = new Date(startDate.getTime() + 4 * 86400000)
  return {
    startDate: startDate.toLocaleDateString().replaceAll('/', '-'), // 2023/8/7
    endDate: endDate.toLocaleDateString().replaceAll('/', '-'), // 2023/8/11
  }
}
// 获取当月
const getThisMonth = () => {
  let today = new Date()
  let year = today.getFullYear()
  let month = today.getMonth() + 1
  let daysInMonth = new Date(year, month, 0).getDate()
  let startDate = new Date(year, month - 1, 1)
  let endDate = new Date(year, month - 1, daysInMonth)
  return {
    startDate: startDate.toLocaleDateString(), // 2023/8/1
    endDate: endDate.toLocaleDateString(), // 2023/8/31
  }
}
// 获取上个月首尾
const getLastMonth = () => {
  let thisMonth = getThisMonth()
  let startDate = new Date(
    new Date(thisMonth.startDate).setMonth(new Date(thisMonth.startDate).getMonth() - 1),
  )
  let endDate = new Date(
    new Date(thisMonth.endDate).setMonth(new Date(thisMonth.endDate).getMonth(), 0),
  )
  return {
    startDate: startDate.toLocaleDateString().replaceAll('/', '-'), // 2023/7/1
    endDate: endDate.toLocaleDateString().replaceAll('/', '-'), // 2023/7/31
  }
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
// 昨天的日期
const yesterday = getYestDayOrNextDay()

// 本周
const { startDate: startDateWeek, endDate: endDateWeek } = getThisWeek()

// 上个月
const { startDate: startDateMonth, endDate: endDateMonth } = getLastMonth()

console.log('======', yesterday, startDateWeek, endDateWeek, startDateMonth, endDateMonth)

// 获取下单情况数据
const orderList = ref<OrderItem[]>([])
const getOrderListData = async (queryTimeType: string) => {
  // 退出判断
  if (isFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getOrderListAPI({
    queryTimeType,
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
  // orderList.value.push(...mock)
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
const activeIndex = ref('yesterday')
const onChangeIndex = (index: string) => {
  activeIndex.value = index
  getOrderListData(index)
}

onLoad(() => {
  getOrderListData('week')
})
const goback = () => {
  uni.navigateBack()
}
</script>

<template>
  <scroll-view @scrolltolower="getOrderListData" class="viewport" scroll-y enable-back-to-top>
    <view class="title" :style="{ paddingTop: safeAreaInsets!.top + 'px' }">
      <text @tap="goback" class="ftysIcon icon-xiangzuojiantou"></text>
      <text class="text">我的报表</text>
    </view>
    <view class="container">
      <view class="login-container">
        <view class="login-type">
          <view
            @tap="($event) => onChangeIndex('yesterday')"
            class="pwd-btn"
            :class="activeIndex === 'yesterday' ? 'checked' : ''"
            >昨日
          </view>
          <view
            @tap="($event) => onChangeIndex('week')"
            class="code-btn"
            :class="activeIndex === 'week' ? 'checked' : ''"
          >
            本周
          </view>
          <view
            @tap="($event) => onChangeIndex('lastMonth')"
            class="code-btn"
            :class="activeIndex === 'lastMonth' ? 'checked' : ''"
          >
            上月
          </view>
        </view>
        <view class="show-time">
          <text v-if="activeIndex === 'yesterday'" class="start-time">{{ yesterday }}</text>
          <text v-if="activeIndex === 'week'" class="start-time">{{ startDateWeek }}</text>
          <text v-if="activeIndex === 'lastMonth'" class="start-time">{{ startDateMonth }}</text>
          &nbsp;~
          <text v-if="activeIndex === 'yesterday'" class="end-time">{{ yesterday }}</text>
          <text v-if="activeIndex === 'week'" class="end-time">{{ endDateWeek }}</text>
          <text v-if="activeIndex === 'lastMonth'" class="end-time">{{ endDateMonth }}</text>
          &nbsp;
          <text class="ftysIcon icon-riqi" />
        </view>
      </view>
      <view class="table-title table-item">
        <text class="total">总金额：￥00000</text>
      </view>
      <view v-for="item in 5" :key="item" class="table-item">
        <view class="left">
          <text class="name">订单号：1234567 <text class="detail">详情>></text> </text>
          <text class="time">2024-07-12 12:34:56</text>
        </view>

        <text class="amount">￥10.00</text>
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
      height: 120rpx;
      width: 100%;
      display: flex;
      justify-content: space-between;
      margin-top: 30rpx;
      border-bottom: 1px dashed #afb0b2;
      font-size: 28rpx;

      .left {
        display: flex;
        flex-direction: column;
        justify-content: space-around;

        .name {
        }

        .detail {
          color: #ff941a;
        }
      }

      .amount {
        color: #ff5040;
      }
    }

    .table-title {
      position: relative;
      font-weight: bold;
      border-bottom: none;
      height: 20rpx;
      background: linear-gradient(96.62deg, rgba(255, 116, 88, 1) 0%, rgba(255, 137, 114, 0) 100%);

      .total {
        position: absolute;
        left: 0;
        bottom: 0;
      }
    }
  }
}
</style>
