<script setup lang="ts">
import { getMySuggestAPI, getOrderPerformanceAPI } from '@/services/my'
import { getOrderListAPI } from '@/services/order'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import type { PageParams } from '@/types/global'
import type { MySuggestItem, OrderStatusItem } from '@/types/my'
import type { OrderItem } from '@/types/order'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

// 获取昨日数据
const getYestDayOrNextDay = () => {
  // 获取当前日期
  const today = new Date()
  // 计算前一天的日期
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  return yesterday.toLocaleDateString().replaceAll('/', '-')
}
// 昨天的日期
const yesterday = getYestDayOrNextDay()

// 状态栏高度
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0
// 胶囊数据
const { top, height } = wx.getMenuButtonBoundingClientRect()
// 自定义导航栏高度 = 胶囊高度 + 胶囊的padding*2, 如果获取不到设置为38
const barHeight = height ? height + (top - statusBarHeight) * 2 : 38
console.log('report==========', statusBarHeight, barHeight)

const formatDate = (date: Date) => {
  var year = date.getFullYear()
  var month = addZero(date.getMonth() + 1)
  var day = addZero(date.getDate())
  return year + '-' + month + '-' + day
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
const range = ref([yesterday, yesterday])
const startTime = ref(yesterday)
const endTime = ref(yesterday)
const onTimeChange = (e: string[]) => {
  queryTimeType.value = 'custom'
  startTime.value = e[0]
  endTime.value = e[1]
  orderList.value = []
  pageParams.page = 1
  isFinish.value = false
  getOrderListData()
}
// 推荐分页参数
const pageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
const isFinish = ref(false)
const queryTimeType = ref('yesterday')

// 本周
const { startDate: startDateWeek, endDate: endDateWeek } = getThisWeek()

// 上个月
const { startDate: startDateMonth, endDate: endDateMonth } = getLastMonth()

console.log('======', yesterday, startDateWeek, endDateWeek, startDateMonth, endDateMonth)

const goToOrderDetail = (orderId: string) => {
  uni.navigateTo({ url: `/PagesOrder/detail/detail?orderId=${orderId}` })
}
// 获取下单情况数据
const orderList = ref<OrderItem[]>([])
const totalPrice = ref('')
const getOrderListData = async () => {
  // 退出判断
  if (isFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getOrderListAPI({
    queryTimeType: queryTimeType.value,
    reportFormStartDate: startTime.value,
    reportFormEndDate: endTime.value,
    ...pageParams,
  })
  totalPrice.value = res.result.totalPrice
  orderList.value.push(...res.result.list)

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
const onChangeIndex = (index: string) => {
  startTime.value = ''
  endTime.value = ''
  orderList.value = []
  pageParams.page = 1
  isFinish.value = false
  queryTimeType.value = index
  getOrderListData()
}

onLoad(() => {
  getOrderListData()
})
const goback = () => {
  uni.navigateBack()
}
</script>

<template>
  <view class="viewport">
    <SolaShopHeader title="我的报表" />
    <view
      class="container"
      :style="{ height: `calc(100vh - ${barHeight}px - ${statusBarHeight}px)` }"
    >
      <view class="login-container">
        <view class="login-type">
          <view
            @tap="($event) => onChangeIndex('yesterday')"
            class="pwd-btn"
            :class="queryTimeType === 'yesterday' ? 'checked' : ''"
            >昨日
          </view>
          <view
            @tap="($event) => onChangeIndex('week')"
            class="code-btn"
            :class="queryTimeType === 'week' ? 'checked' : ''"
          >
            本周
          </view>
          <view
            @tap="($event) => onChangeIndex('lastMonth')"
            class="code-btn"
            :class="queryTimeType === 'lastMonth' ? 'checked' : ''"
          >
            上月
          </view>
        </view>
        <!-- <view class="show-time">
          <text class="ftysIcon icon-riqi" />
        </view> -->
        <uni-datetime-picker
          :clear-icon="false"
          v-model="range"
          rangeSeparator="~"
          type="daterange"
          @change="onTimeChange"
        />
      </view>
      <view class="table-title table-item">
        <text class="total">总金额：￥{{ totalPrice }}</text>
      </view>
      <scroll-view
        :style="{ height: `calc(100vh - ${barHeight}px - ${statusBarHeight}px - 260rpx) ` }"
        class="list-container"
        @scrolltolower="getOrderListData"
        scroll-y
        enable-back-to-top
      >
        <view
          v-for="item in orderList"
          :key="item.orderNo"
          class="table-item"
          @tap="() => goToOrderDetail(item.orderId)"
        >
          <view class="left">
            <text class="name">订单号：{{ item.orderNo }} <text class="detail">详情>></text> </text>
            <text class="time">{{ item.createTime }}</text>
          </view>

          <text class="amount">￥{{ item.orderPayPrice }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
  background-color: #f7f7f8;
}

::-webkit-scrollbar {
  width: 0;
  height: 0;
  background-color: transparent;
}

.viewport {
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 112, 64, 1) 0%, rgba(255, 80, 64, 1) 100%);

  .container {
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    padding: 30rpx;

    .login-container {
      position: relative;
      height: 180rpx;

      :deep(.uni-date) {
        margin-top: 30rpx;
      }

      :deep(.uni-date-editor) {
        display: flex;
        justify-content: center;
      }

      :deep(.uni-date-x--border) {
        border: none;
        width: 65%;
      }

      .login-type {
        display: flex;
        height: 80rpx;
        background: #f2f4f7;
        border-radius: 50rpx;

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

    .list-container {
      height: 100%;
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
