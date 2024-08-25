<script setup lang="ts">
import type { GetMyGoodsApplyItem } from '@/services/goods'
import { getCapitalDetailAPI, type CapitalDetail } from '@/services/profile'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

const query = defineProps<{
  type: string
  capitalId: string
  orderId: string
  title: string
}>()
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const capitalDetail = ref<CapitalDetail>({} as CapitalDetail)
const getCapitalDetailData = async () => {
  console.log(query)

  const res = await getCapitalDetailAPI({
    type: query.type,
    capitalId: query.capitalId,
    orderId: query.orderId,
  })
  capitalDetail.value = res.result
}
onLoad(() => {
  getCapitalDetailData()
})
const goBack = () => {
  uni.navigateBack()
}
</script>

<template>
  <scroll-view class="viewport" scroll-y enable-back-to-top>
    <view class="title" :style="{ paddingTop: safeAreaInsets!.top + 'px' }">
      <text @tap="goBack" class="ftysIcon icon-xiangzuojiantou"></text>
      <text class="text">账户明细</text>
    </view>
    <view class="container">
      <view class="top">
        <image
          class="image"
          :src="
            Number(capitalDetail.money) > 0
              ? 'https://img.js.design/assets/img/6691ec1357bbf24e7d84d155.png#d1470ccbdcf1e16c04752d2922557bae'
              : 'https://img.js.design/assets/img/6691ed755633d29b2e6b5f63.png#301e1bf17fb46516ad6eccd70153f3b0'
          "
        />
        <view class="desc">{{ title }}</view>
        <view class="amount">{{ capitalDetail.money }}</view>
      </view>
      <view v-if="Number(capitalDetail.money) > 0" class="bottom">
        <view class="detail-item">
          <text class="dtitle">到账时间</text>
          <text class="value">{{ capitalDetail.create_time }}</text>
        </view>
        <view class="detail-item">
          <text class="dtitle">备注</text>
          <text class="value">{{ capitalDetail.memo }}</text>
        </view>
        <view class="detail-item">
          <text class="dtitle">交易单号</text>
          <text class="value">{{ capitalDetail.capital_no }}</text>
        </view>
      </view>
      <view v-if="Number(capitalDetail.money) < 0" class="bottom">
        <view class="detail-item">
          <text class="dtitle">到账时间</text>
          <text class="value">{{ capitalDetail.create_time }}</text>
        </view>
        <view class="detail-item">
          <text class="dtitle">备注</text>
          <text class="value">{{ capitalDetail.memo }}</text>
        </view>
        <view class="detail-item">
          <text class="dtitle">交易单号</text>
          <text class="value">{{ capitalDetail.capital_no }}</text>
        </view>
        <view class="detail-item">
          <text class="dtitle">支付订单编号</text>
          <text class="value">{{ capitalDetail.order_no }}</text>
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

    .top {
      display: flex;
      flex-direction: column;
      border-bottom: 1px solid rgba(175, 176, 178, 1);
      align-items: center;
      font-weight: bold;

      .image {
        width: 200rpx;
        height: 200rpx;
      }

      .desc {
        margin-top: 20rpx;
      }

      .amount {
        margin: 20rpx 0;
      }
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      height: 80rpx;
      border-bottom: 1px solid #f2f4f7;
      align-items: center;

      .dtitle {
        color: rgba(175, 176, 178, 1);
      }
    }

    .detail-item:nth-last-child(1) {
      border-bottom: none;
    }
  }
}
</style>
