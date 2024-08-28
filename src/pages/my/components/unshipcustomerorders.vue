<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import { getMySuggestAPI } from '@/services/my'
import {
  getUnShipOrderListAPI,
  getUnShipCustomerAPI,
  type ShipedOrderItem,
  type UnShipCustomerItem,
  type UnShipOrderListItem,
} from '@/services/order'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import type { PageParams } from '@/types/global'
import type { MySuggestItem } from '@/types/my'
import { onLoad } from '@dcloudio/uni-app'
import { computed, onMounted, ref, watch, watchEffect } from 'vue'

const props = defineProps<{
  keyword: string
}>()

const unShipOrderList = ref<UnShipOrderListItem[]>([])

const unshiporder = ref<UnShipCustomerItem>({} as UnShipCustomerItem)
onMounted(() => {
  uni.$on('unshiporder', async (data) => {
    unshiporder.value = data.unshiporder
    const res = await getUnShipOrderListAPI({
      userId: unshiporder.value.userId,
    })
    unShipOrderList.value = res.result
  })
})
const addFeedback = () => {
  uni.navigateTo({ url: '/pagesMember/addfeedback/addfeedback' })
}
</script>

<template>
  <scroll-view class="viewport" scroll-y enable-back-to-top>
    <view class="container">
      <view v-for="item in unShipOrderList" :key="item.orderId" class="item">
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
              <text class="ftysIcon icon-dianhua">{{ item.mobile }}</text>
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
