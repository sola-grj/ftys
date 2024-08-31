<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import { getMySuggestAPI } from '@/services/my'
import {
  getShippedOrderListAPI,
  getUnShipCustomerAPI,
  type ShipedOrderItem,
  type UnShipCustomerItem,
} from '@/services/order'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import type { PageParams } from '@/types/global'
import type { MySuggestItem } from '@/types/my'
import { onLoad } from '@dcloudio/uni-app'
import { computed, onMounted, ref, watch, watchEffect } from 'vue'

const props = defineProps<{
  keyword: string
  changeCompleteDetailStatus: (data: ShipedOrderItem) => void
}>()

// 推荐分页参数
const pageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
const isShipedOrderFinish = ref(false)
const ShipedOrderPageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
const shipedOrderList = ref<ShipedOrderItem[]>([])
const getShipedOrderListData = async () => {
  // 退出判断
  if (isShipedOrderFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getShippedOrderListAPI({ account: props.keyword, ...ShipedOrderPageParams })

  shipedOrderList.value.push(...res.result.list)
  // suggestList.value.push(...mockList)
  if (ShipedOrderPageParams.page < res.result.total) {
    // 页码累加
    ShipedOrderPageParams.page++
  } else {
    isShipedOrderFinish.value = true
  }
}
onMounted(() => {
  getShipedOrderListData()
})
const addFeedback = () => {
  uni.navigateTo({ url: '/pagesMember/addfeedback/addfeedback' })
}

const makePhoneCall = (phoneNumber: string) => {
  uni.makePhoneCall({
    phoneNumber, //仅为示例
  })
}

watch(
  () => props.keyword,
  (newValue, oldValue) => {
    console.log('workOrder变化了', newValue, oldValue)
    ShipedOrderPageParams.page = 1
    isShipedOrderFinish.value = false
    shipedOrderList.value = []
    getShipedOrderListData()
  },
  { immediate: false, deep: true },
)
</script>

<template>
  <scroll-view @scrolltolower="getShipedOrderListData" class="viewport" scroll-y enable-back-to-top>
    <view class="container">
      <view
        v-for="item in shipedOrderList"
        @tap="($event) => changeCompleteDetailStatus(item)"
        :key="item.userId"
        class="item"
      >
        <view class="top">
          <view class="customer-name">
            <view class="text">{{ item.orderNo }}</view>
          </view>
          <view class="more">去发货</view>
        </view>
        <view class="bottom">
          <view class="b-item">
            <view class="label">客户名称</view>
            <view class="value">{{ item.username }}</view>
          </view>
          <view class="b-item">
            <view class="label">联系电话</view>
            <view class="value phone">
              <text @tap="($event) => makePhoneCall(item.mobile)" class="ftysIcon icon-dianhua">{{
                item.mobile
              }}</text>
            </view>
          </view>
          <view class="b-item">
            <view class="label">下单日期</view>
            <view class="value">{{ item.createTime }}</view>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<style lang="scss">
.viewport {
  // height: 100%;
  // overflow: hidden;

  .container {
    height: 100%;
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    // overflow: scroll;
    padding: 20rpx;

    .item {
      display: flex;
      flex-direction: column;
      width: 100%;
      padding: 0 30rpx;
      font-size: 28rpx;
      border-bottom: 1px solid rgba(175, 176, 178, 1);
      margin-top: 20rpx;

      .top {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30rpx;

        .customer-name {
          display: flex;

          .num {
            font-size: 20rpx;
            width: 44rpx;
            height: 44rpx;
            margin-left: 20rpx;
            line-height: 40rpx;
            text-align: center;
            background-image: url('@/static/images/number.png');
            background-size: 100%;
          }
        }

        .more {
          color: rgba(175, 176, 178, 1);
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

          .phone {
            color: rgba(255, 80, 64, 1);
          }
        }
      }
    }
  }
}
</style>
