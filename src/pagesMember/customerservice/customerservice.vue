<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import { addSuggestAPI, getMySuggestAPI, getServiceInfoAPI, type ServiceType } from '@/services/my'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import type { PageParams } from '@/types/global'
import type { MySuggestItem } from '@/types/my'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

const data = ref<ServiceType[]>([])
onLoad(async () => {
  const res = await getServiceInfoAPI()
  data.value = res.result
})

const makePhoneCall = (phoneNumber: string) => {
  uni.makePhoneCall({
    phoneNumber, //仅为示例
  })
}
</script>

<template>
  <scroll-view class="viewport" scroll-y enable-back-to-top>
    <SolaShopHeader title="联系客服" />
    <view class="container">
      <image class="image" src="@/static/images/customer.png" />
      <view
        class="item"
        v-for="item in data"
        :key="item.id"
        @tap="($event) => makePhoneCall('13455556666')"
      >
        <text :class="`ftysIcon ${item.type === 'phone' ? 'icon-dianhua' : 'icon-weixin'}`">{{
          item.number
        }}</text>
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
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    overflow: scroll;
    padding: 30rpx;

    .image {
      height: 400rpx;
    }

    .item {
      min-width: 300rpx;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      background: linear-gradient(90deg, rgba(255, 112, 77, 1) 0%, rgba(255, 95, 77, 1) 100%);
      border-radius: 20rpx;
      margin-top: 30rpx;
      color: #fff;
    }
  }
}
</style>
