<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import { getMySuggestAPI } from '@/services/my'
import { getUnShipCustomerAPI, type UnShipCustomerItem } from '@/services/order'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import type { PageParams } from '@/types/global'
import type { MySuggestItem } from '@/types/my'
import { onLoad } from '@dcloudio/uni-app'
import { computed, onMounted, ref, watchEffect } from 'vue'

const props = defineProps<{
  keyword: string
}>()
const debounce = (func: () => {}, wait = 500) => {
  // 定义定时器变量
  let timeout = null
  // 清除定时器
  if (timeout !== null) clearTimeout(timeout)
  //设置定时器
  timeout = setTimeout(() => {
    typeof func === 'function' && func()
  }, wait)
}
watchEffect(() => {
  if (props.keyword) {
    console.log(123)
    unShipCustomerPageParams.page = 1
    isUnShipCustomerFinish.value = false
    unShipCustomerList.value = []
    getSuggestListData()
  }
})
// 推荐分页参数
const pageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
const isUnShipCustomerFinish = ref(false)
const unShipCustomerPageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
const unShipCustomerList = ref<UnShipCustomerItem[]>([])
const getSuggestListData = async () => {
  // 退出判断
  if (isUnShipCustomerFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getUnShipCustomerAPI({ account: props.keyword, ...unShipCustomerPageParams })

  unShipCustomerList.value.push(...res.result.list)
  unShipCustomerList.value.push(...res.result.list)
  unShipCustomerList.value.push(...res.result.list)
  unShipCustomerList.value.push(...res.result.list)
  unShipCustomerList.value.push(...res.result.list)
  unShipCustomerList.value.push(...res.result.list)
  unShipCustomerList.value.push(...res.result.list)
  unShipCustomerList.value.push(...res.result.list)
  // suggestList.value.push(...mockList)
  if (unShipCustomerPageParams.page < res.result.total) {
    // 页码累加
    unShipCustomerPageParams.page++
  } else {
    isUnShipCustomerFinish.value = true
  }
}
onMounted(() => {
  getSuggestListData()
})
const addFeedback = () => {
  uni.navigateTo({ url: '/pagesMember/addfeedback/addfeedback' })
}
</script>

<template>
  <scroll-view @scrolltolower="getSuggestListData" class="viewport" scroll-y enable-back-to-top>
    <view class="container">
      <view v-for="item in unShipCustomerList" :key="item.userId" class="item">
        <view class="top">
          <view class="customer-name">
            <view class="text">{{ item.username }}</view>
            <view class="num">{{ 3 }}</view>
          </view>
          <view class="more">查看更多</view>
        </view>
        <view class="bottom">
          <view class="b-item">
            <view class="label">区域</view>
            <view class="value">{{ item.shippingArea }}</view>
          </view>
          <view class="b-item">
            <view class="label">地址</view>
            <view class="value">{{ item.shippingAddr }}</view>
          </view>
          <view class="b-item">
            <view class="label">电话</view>
            <view class="value">{{ item.mobile }}</view>
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
        }
      }
    }
  }
}
</style>
