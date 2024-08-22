<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import { getFullPerformanceAPI, getMySuggestAPI } from '@/services/my'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import type { PageParams } from '@/types/global'
import type { DeliverItem, MyPerformanceResult, MySuggestItem, ProfitItem } from '@/types/my'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

const currentMonth = ref('')
const now = new Date()
const month = (now.getMonth() + 1).toString().padStart(2, '0')
currentMonth.value = month + '月'
const activeIndex = ref('1') // 0 是密码登录 1是短信
const onChangeIndex = (index: string) => {
  activeIndex.value = index
}
const monthData = ref([
  { value: 1, text: '01月' },
  { value: 2, text: '02月' },
  { value: 3, text: '03月' },
  { value: 4, text: '04月' },
  { value: 5, text: '05月' },
  { value: 6, text: '06月' },
  { value: 7, text: '07月' },
  { value: 8, text: '08月' },
  { value: 9, text: '09月' },
  { value: 10, text: '10月' },
  { value: 11, text: '11月' },
  { value: 12, text: '12月' },
])
// 推荐分页参数
const pageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

// 获取业绩信息
const performance = ref<MyPerformanceResult>()
const profitLineData = ref({
  categories: [] as string[],
  series: [
    {
      name: '业绩',
      data: [] as number[],
    },
  ],
})
const deliverLineData = ref({
  categories: [] as string[],
  series: [
    {
      name: '毛利率',
      data: [] as number[],
    },
  ],
})
const getFullPerformanceData = async (month: string) => {
  profitLineData.value.categories = []
  profitLineData.value.series[0].data = []
  deliverLineData.value.categories = []
  deliverLineData.value.series[0].data = []
  const res = await getFullPerformanceAPI({
    month: monthData.value.filter((item) => item.text === month)[0].value.toString(),
  })
  performance.value = res.result
  res.result.picData.profit.forEach((item) => {
    profitLineData.value.categories.push(item.data)
    profitLineData.value.series[0].data.push(parseInt(item.value))
  })
  res.result.picData.deliver.forEach((item) => {
    deliverLineData.value.categories.push(item.data)
    deliverLineData.value.series[0].data.push(parseInt(item.value))
  })
}

const selectedDate = ref('1yue')
const range = ref([
  ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'],
])

const onPickerChange = (event: any) => {
  const values = event.detail.value
  const month = range.value[0][values[0]]
  currentMonth.value = month
  getFullPerformanceData(month)
}

onLoad(() => {
  getFullPerformanceData(currentMonth.value)
})

// 图表相关
const opts = {
  color: [
    '#1890FF',
    '#91CB74',
    '#FAC858',
    '#EE6666',
    '#73C0DE',
    '#3CA272',
    '#FC8452',
    '#9A60B4',
    '#ea7ccc',
  ],
  padding: [15, 10, 0, 15],
  enableScroll: false,
  legend: {},
  xAxis: {
    disableGrid: true,
  },
  yAxis: {
    gridType: 'dash',
    dashLength: 2,
  },
  extra: {
    line: {
      type: 'curve',
      width: 2,
      activeType: 'hollow',
    },
  },
}

const lineData = {
  categories: ['2018', '2019', '2020', '2021', '2022', '2023'],
  series: [
    {
      name: '成交量A',
      // lineType: "dash",
      data: [35, 8, 25, 37, 4, 20],
    },
  ],
}
</script>

<template>
  <scroll-view class="viewport" scroll-y enable-back-to-top>
    <view class="title" :style="{ paddingTop: safeAreaInsets!.top + 'px' }">
      <text @tap="goback" class="ftysIcon icon-xiangzuojiantou"></text>
      <text class="text">业绩查看</text>
    </view>
    <view class="container">
      <view class="today">
        <view class="today-data">
          <view class="today-title">今日数据</view>
          <view class="item">
            <view class="label">新增客户：</view>
            <view class="text">{{ performance?.todayNewUserCount }}</view>
          </view>
          <view class="item">
            <view class="label">订单金额：</view>
            <view class="text">￥{{ performance?.todayOrderAmount }}</view>
          </view>
          <view class="item">
            <view class="label">结算金额：</view>
            <view class="text">￥{{ performance?.todayDeliveryAmount }}</view>
          </view>
          <view class="item">
            <view class="label">新增已下单：</view>
            <view class="text">{{ performance?.todayOrderCount }}</view>
          </view>
        </view>
        <view class="week-data">
          <view class="week-title">本周数据</view>
          <view class="item">
            <view class="label">新增客户：</view>
            <view class="text">{{ performance?.weekNewUserCount }}</view>
          </view>
          <view class="item">
            <view class="label">订单金额：</view>
            <view class="text">￥{{ performance?.weekOrderAmount }}</view>
          </view>
          <view class="item">
            <view class="label">结算金额：</view>
            <view class="text">￥{{ performance?.weekDeliveryAmount }}</view>
          </view>
          <view class="item">
            <view class="label">新增已下单：</view>
            <view class="text">{{ performance?.weekOrderCount }}</view>
          </view>
        </view>
      </view>
      <view class="month-data">
        <view class="month-title">
          <view>{{ currentMonth }}业绩</view>
          <select></select>
          <picker mode="multiSelector" :range="range" @change="onPickerChange">
            <view class="change"> 更换 </view>
          </picker>
        </view>
        <view class="item">
          <view class="label">新增客户已下单：</view>
          <view class="text">￥{{ performance?.monthOrderPrice }}</view>
        </view>
        <view class="item">
          <view class="label">新增客户：</view>
          <view class="text">{{ performance?.monthNewUserCount }}</view>
        </view>
        <view class="item">
          <view class="label">发货金额：</view>
          <view class="text">￥{{ performance?.monthOrderCost }}</view>
        </view>
        <view class="item">
          <view class="label">结算金额：</view>
          <view class="text">￥{{ performance?.monthDeliverAmount }}</view>
        </view>
        <view class="item">
          <view class="label">订单数：</view>
          <view class="text">{{ performance?.monthOrderCount }}</view>
        </view>
      </view>
      <view class="month-chart">
        <view class="chart-title">
          <view class="text">30天内业绩变化</view>
          <view class="login-container">
            <view class="login-type">
              <view
                @tap="($event) => onChangeIndex('1')"
                class="pwd-btn"
                :class="activeIndex === '1' ? 'checked' : ''"
              >
                业绩
              </view>
              <view
                @tap="($event) => onChangeIndex('2')"
                class="code-btn"
                :class="activeIndex === '2' ? 'checked' : ''"
                >毛利率
              </view>
            </view>
          </view>
        </view>
        <qiun-data-charts
          type="line"
          :opts="opts"
          :chartData="activeIndex === '1' ? profitLineData : deliverLineData"
        />
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

    .today {
      display: flex;
      padding: 30rpx;
      border-bottom: 3px solid rgba(242, 244, 247, 1);

      .today-data {
        border-right: 1px solid #f2f4f7;
      }

      .week-data {
        margin-left: 30rpx;
      }

      .today-data,
      .week-data {
        width: 50%;

        .today-title {
          font-size: 30rpx;
        }

        .week-title {
          font-size: 30rpx;
        }

        .item {
          display: flex;
          margin-top: 16rpx;

          .label {
            width: 50%;
            font-size: 26rpx;
          }

          .text {
            width: 50%;
            font-size: 26rpx;
          }
        }
      }
    }

    .month-data {
      padding: 30rpx;
      border-bottom: 3px solid rgba(242, 244, 247, 1);

      .month-title {
        display: flex;
        justify-content: space-between;
        font-size: 30rpx;

        .change {
          width: 90rpx;
          height: 50rpx;
          line-height: 50rpx;
          text-align: center;
          color: #fff;
          border-radius: 10rpx;
          background: linear-gradient(90deg, rgba(255, 112, 77, 1) 0%, rgba(255, 95, 77, 1) 100%);
        }
      }

      .item {
        display: flex;
        justify-content: space-between;
        font-size: 26rpx;
        margin-top: 16rpx;

        .label {
          color: #999;
        }
      }
    }

    .month-chart {
      padding: 30rpx;

      .chart-title {
        display: flex;
        justify-content: space-between;
        // align-items: center;
        height: 80rpx;

        .text {
          margin-top: 10rpx;
        }

        .login-container {
          position: relative;
          height: 80rpx;
          font-size: 22rpx;
          width: 200rpx;

          .login-type {
            display: flex;
            height: 40rpx;
            width: 200rpx;
            background: #f2f4f7;
            border-radius: 50rpx;
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            margin-top: 10rpx;

            .pwd-btn,
            .code-btn {
              width: 50%;
              line-height: 40rpx;
              text-align: center;
              border-radius: 50rpx;
            }

            .checked {
              color: #fff;
              background-color: #ff5040;
            }
          }
        }
      }
    }
  }
}
</style>
