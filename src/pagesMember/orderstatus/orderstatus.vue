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
// 获取昨日数据
const getYestDayOrNextDay = () => {
  // 获取当前日期
  const today = new Date()
  // 计算前一天的日期
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate())

  return yesterday.toLocaleDateString().replaceAll('/', '-')
}
// 昨天的日期
const yesterday = getYestDayOrNextDay()
const queryTimeType = ref('today')
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
  getOrderPerformanceData()
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
const sevenDay = formatDate(new Date(new Date().setDate(new Date().getDate() - 7)))

// 近十五天
const fifteenDay = formatDate(new Date(new Date().setDate(new Date().getDate() - 15)))

// 近三十天
const thirteenDay = formatDate(new Date(new Date().setDate(new Date().getDate() - 30)))

// 获取下单情况数据
const orderList = ref<OrderStatusItem[]>([])
const getOrderPerformanceData = async () => {
  // 退出判断
  if (isFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getOrderPerformanceAPI({
    dateFilter: queryTimeType.value,
    startDate: startTime.value,
    endDate: endTime.value,
    ...pageParams,
  })
  orderList.value.push(...res.result.list)

  if (pageParams.page < Math.ceil(res.result.total / 10)) {
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
  if (index === 'today') {
    range.value = [yesterday, yesterday]
  } else if (index === '7') {
    range.value = [sevenDay, yesterday]
  } else if (index === '15') {
    range.value = [fifteenDay, yesterday]
  } else {
    range.value = [thirteenDay, yesterday]
  }
  startTime.value = ''
  endTime.value = ''
  isFinish.value = false
  pageParams.page = 1
  orderList.value = []
  activeIndex.value = index
  queryTimeType.value = index
  getOrderPerformanceData()
}

onLoad(() => {
  getOrderPerformanceData()
})
const goback = () => {
  uni.navigateBack()
}
const makePhoneCall = (phoneNumber: string) => {
  uni.makePhoneCall({
    phoneNumber, //仅为示例
  })
}
</script>

<template>
  <scroll-view
    @scrolltolower="getOrderPerformanceData"
    class="viewport"
    scroll-y
    enable-back-to-top
  >
    <SolaShopHeader title="下单情况" />
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
          <uni-datetime-picker
            :border="false"
            :clear-icon="false"
            v-model="range"
            rangeSeparator="~"
            type="daterange"
            @change="onTimeChange"
          />
          <!-- <text v-if="activeIndex === 'today'" class="end-time">{{ today }}</text>
          <text v-if="activeIndex === '7'" class="end-time">{{ sevenDay }}</text>
          <text v-if="activeIndex === '15'" class="end-time">{{ fifteenDay }}</text>
          <text v-if="activeIndex === '30'" class="end-time">{{ thirteenDay }}</text>
          &nbsp;~
          <text class="start-time">{{ today }}</text>
          <text class="ftysIcon icon-riqi" /> -->
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
        <text @tap="($event) => makePhoneCall(item.mobile)" class="ftysIcon icon-dianhua"></text>
      </view>
      <view v-if="orderList.length === 0" class="bg">
        <image
          src="https://img.js.design/assets/img/66909fda4fc21e83fb682df4.png#52a35c0ee65bdb8ba63bcefcce2ce6e6"
          mode="aspectFit"
        />
        <text>暂无内容</text>
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
    padding: 30rpx;

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

    .login-container {
      position: relative;
      height: 180rpx;

      .login-type {
        display: flex;
        height: 80rpx;
        // width: 500rpx;
        background: #f2f4f7;
        border-radius: 50rpx;
        // position: absolute;
        // left: 50%;
        // transform: translateX(-50%);
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
        margin-top: 10rpx;
        display: flex;
        justify-content: center;

        .uni-date {
          width: 70% !important;
          flex: none !important;
        }

        // height: 60rpx;
        // white-space: nowrap;
        // position: absolute;
        // bottom: 0;
        // left: 50%;
        // transform: translateX(-50%);
        // border-bottom: 1px solid #afb0b2;
        // color: #666666;
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

      .name {
        width: 120rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .table-title {
      border-bottom: 1px solid #afb0b2;
      font-weight: bold;
    }
  }
}
</style>
