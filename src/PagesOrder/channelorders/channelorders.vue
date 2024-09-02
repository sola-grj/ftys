<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import {
  addSuggestAPI,
  cutAccountAPI,
  getCustomerListAPI,
  getMyMerchantOrderListAPI,
  getMySuggestAPI,
  type CustomerItem,
  type MyMerchantItem,
  type MyMerchantOrderItem,
} from '@/services/my'
import { useMemberStore } from '@/stores'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import type { PageParams } from '@/types/global'
import type { MySuggestItem } from '@/types/my'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const activeIndex = ref(0)
// 点击一级分类
const onChangeIndex = (index: number) => {
  activeIndex.value = index
}
const memberStore = useMemberStore()
// 弹出层组件
const typepopup = ref<UniHelper.UniPopupInstance>()
const items = [
  {
    value: 'USA',
    name: '全部',
    checked: 'true',
  },
  {
    value: 'CHN',
    name: '已支付',
  },
  {
    value: 'BRA',
    name: '未支付',
  },
]
const current = ref(0)
const currentStatus = ref('全部')
const radioChange = (evt) => {
  for (let i = 0; i < items.length; i++) {
    if (items[i].value === evt.detail.value) {
      current.value = i
      currentStatus.value = items[i].name
      break
    }
  }
  //  @ts-ignore
  typepopup!.value?.close()
}
// 推荐分页参数
const pageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
const single = ref('')
const isFinish = ref(false)
const myMerchantOrderList = ref<MyMerchantOrderItem[]>([])
const getMyMerchantOrderListData = async (userId: string) => {
  // 退出判断
  if (isFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getMyMerchantOrderListAPI({ userId, ...pageParams })
  myMerchantOrderList.value.push(...res.result.list)
  if (pageParams.page < res.result.total) {
    // 页码累加
    pageParams.page++
  } else {
    isFinish.value = true
  }
}
const customerinfo = ref<MyMerchantItem>()
onUnload(() => {
  uni.$off('customerinfo')
})
onLoad(() => {
  uni.$on('customerinfo', async (data) => {
    customerinfo.value = data.customerinfo
    // await getMyMerchantOrderListData(customerinfo.value?.userId.toString() as string)
  })
})
const onChangeCustomer = async (data: CustomerItem) => {
  const res = await cutAccountAPI({ userId: data.userId })
  memberStore.setProfile(res!.result)
  uni.showToast({ icon: 'success', title: '账号切换成功' })
  setTimeout(() => {
    uni.reLaunch({ url: '/pages/my/my' })
  }, 500)
}
const goback = () => {
  uni.navigateBack()
}
</script>

<template>
  <scroll-view class="viewport" @scrolltolower="getCustomerData" scroll-y enable-back-to-top>
    <view class="title" :style="{ paddingTop: safeAreaInsets!.top + 'px' }">
      <text @tap="goback" class="ftysIcon icon-xiangzuojiantou"></text>
      <text class="text">渠道订单</text>
    </view>
    <view class="container form-content">
      <view class="condition">
        <view class="date">
          <text class="label">发货日期：</text>
          <uni-datetime-picker :border="false" type="date" :clear-icon="false" v-model="single" />
        </view>
        <view class="status" @tap="typepopup?.open?.('top')"
          ><text class="label">订单状态：</text><text>{{ currentStatus }}</text>
        </view>
      </view>
      <view class="other-container">
        <view v-for="item in 5" :key="item" class="other-item">
          <view class="top">
            <view class="customer-name">
              <view class="text">{{ 'item.orderNo' }}</view>
            </view>
            <view class="more ftysIcon icon-xiangyoujiantou"></view>
          </view>
          <view class="bottom">
            <view class="b-item">
              <view class="label">下单时间</view>
              <view class="value">{{ 'item.createTime' }}</view>
            </view>
            <view class="b-item">
              <view class="label">发货日期</view>
              <view class="value">{{ 'item.shippedTime' }}</view>
            </view>
            <view class="b-item">
              <view class="label">发货金额</view>
              <view class="value">{{ 'item.shippedOrderPrice' }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <uni-popup ref="typepopup" background-color="#fff">
      <view class="customer-popup-content">
        <radio-group @change="radioChange">
          <label
            class="uni-list-cell uni-list-cell-pd"
            :class="index === current ? 'checked' : ''"
            v-for="(item, index) in items"
            :key="item.value"
          >
            <view>{{ item.name }}</view>
            <view>
              <radio :value="item.value" :checked="index === current" />
            </view>
          </label>
        </radio-group>
      </view>
    </uni-popup>
  </scroll-view>
</template>

<style lang="scss">
page {
  height: 100%;
  // overflow: hidden;
  background-color: #f7f7f8;
}

.customer-popup-content {
  height: 400rpx;
  padding: 30rpx;

  radio-group {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;

    .uni-list-cell {
      display: flex;
      height: 100rpx;
      align-items: center;
      padding: 0 20rpx;

      view:first-child {
        margin-right: 40rpx;
      }
    }

    .checked {
      background-color: #f2f4f7;
    }
  }
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
  }

  .container {
    height: calc(100vh - 130rpx);
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    overflow: scroll;
    padding: 30rpx;

    .condition {
      display: flex;
      height: 100rpx;
      align-items: center;
      justify-content: space-around;
      font-size: 28rpx;

      .label {
        color: rgba(175, 176, 178, 1);
        margin-right: 20rpx;
      }

      .date {
        display: flex;
        align-items: center;
      }

      .status {
      }
    }

    .login-container {
      position: relative;
      height: 80rpx;
      margin-top: 20rpx;

      .login-type {
        display: flex;
        height: 80rpx;
        width: 500rpx;
        background: #f2f4f7;
        border-radius: 50rpx;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);

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

    .info-container {
      .info-item {
        display: flex;
        height: 100rpx;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(242, 244, 247, 1);
        font-size: 28rpx;

        .label {
          color: rgba(175, 176, 178, 1);
        }
      }
    }

    .other-container {
      .other-item {
        display: flex;
        flex-direction: column;
        width: 100%;
        padding: 0 30rpx;
        font-size: 28rpx;
        border-bottom: 1px solid rgba(242, 244, 247, 1);
        margin-top: 20rpx;

        .top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30rpx;

          .customer-name {
            display: flex;
          }

          .more {
            color: rgba(255, 80, 64, 1);
          }
        }

        .bottom {
          .b-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20rpx;

            .label {
              color: rgba(175, 176, 178, 1);
            }
          }
        }
      }
    }
  }
}
</style>
