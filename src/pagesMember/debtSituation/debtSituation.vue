<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import { getcustomerBillAPI, getMySuggestAPI } from '@/services/my'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import type { PageParams } from '@/types/global'
import type { CustomerBillItem, MySuggestItem } from '@/types/my'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref, watch } from 'vue'
// 推荐分页参数
const pageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
// 查询的客户信息
const customerInfo = ref('')
const isFinish = ref(false)
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
// 获取客户欠款列表
const customerBillList = ref<CustomerBillItem[]>([])
const getCustomerBillListData = async () => {
  // 退出判断
  if (isFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getcustomerBillAPI({ filter: customerInfo.value })
  // 分页数据增加
  customerBillList.value.push(...res.result.list)

  if (pageParams.page < res.result.total) {
    // 页码累加
    pageParams.page++
  } else {
    isFinish.value = true
  }
}

onLoad(() => {
  getCustomerBillListData()
})
const addFeedback = () => {
  uni.navigateTo({ url: '/pagesMember/addfeedback/addfeedback' })
}
const makePhoneCall = (phoneNumber: string) => {
  uni.makePhoneCall({
    phoneNumber, //仅为示例
  })
}
// 金额判断
const judgeAmount = (money: string) => {
  if (money && parseInt(money) < 0) {
    return false
  }
  return true
}
const goback = () => {
  uni.navigateBack()
}
watch(
  () => customerInfo,
  (newValue, oldValue) => {
    pageParams.page = 1
    isFinish.value = false
    customerBillList.value = []
    getCustomerBillListData()
  },
  { immediate: false, deep: true },
)
</script>

<template>
  <scroll-view
    @scrolltolower="getCustomerBillListData"
    class="viewport"
    scroll-y
    enable-back-to-top
  >
    <view class="title" :style="{ paddingTop: safeAreaInsets!.top + 'px' }">
      <text @tap="goback" class="ftysIcon icon-xiangzuojiantou"></text>
      <text class="text">客户账款</text>
    </view>
    <view class="container">
      <view class="search">
        <uni-easyinput
          :inputBorder="false"
          placeholder="请输入名称/手机号/客户id"
          class="search"
          prefixIcon="search"
          v-model="customerInfo"
        >
        </uni-easyinput>
      </view>
      <view class="debt-item" :key="item.orderId" v-for="item in customerBillList">
        <view class="debt-title">
          <text class="name"
            >{{ item.username }} <text class="mobile">{{ item.mobile }}</text></text
          >
          <text @tap="($event) => makePhoneCall(item.mobile)" class="ftysIcon icon-dianhua"></text>
        </view>
        <view class="detail">
          <view class="detail-item">
            <view class="label">生鲜欠款</view>
            <view class="value" :class="judgeAmount(item.SDebt) ? '' : 'red'"
              >￥{{ item.SDebt }}</view
            >
          </view>
          <view class="detail-item">
            <view class="label">调料欠款</view>
            <view class="value" :class="judgeAmount(item.HDebt) ? '' : 'red'"
              >￥{{ item.HDebt }}</view
            >
          </view>
          <view class="detail-item">
            <view class="label">总欠款</view>
            <view class="value" :class="judgeAmount(item.totalDebt) ? '' : 'red'"
              >￥{{ item.totalDebt }}</view
            >
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

    .search {
      border-radius: 40rpx;
      border: 1px solid rgba(255, 80, 64, 1);

      .uni-easyinput {
        width: 90%;
        margin: auto;

        .uni-easyinput__content {
          border-color: rgba(255, 80, 64, 1) !important;
          border-radius: 40rpx !important;
          height: 70rpx;
        }
      }
    }

    .debt-item {
      border-bottom: 1px solid #f2f4f7;
      padding: 20rpx 0;

      .debt-title {
        display: flex;
        height: 60rpx;
        align-items: center;
        justify-content: space-between;
        font-size: 28rpx;

        .mobile {
          color: #afb0b2;
        }

        .icon-dianhua {
          color: #ff5040;
          font-size: 40rpx;
        }
      }

      .detail {
        display: flex;
        justify-content: space-around;
        margin-top: 20rpx;

        .detail-item {
          flex: 1;
          height: 100rpx;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;

          .label {
            color: #afb0b2;
          }

          .red {
            color: #ff5040 !important;
          }
        }
      }
    }
  }
}
</style>
