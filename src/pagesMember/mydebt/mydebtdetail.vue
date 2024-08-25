<script setup lang="ts">
import type { GetMyGoodsApplyItem } from '@/services/goods'
import type { CreditItem } from '@/services/order'
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
const debtDetail = ref<CreditItem>({} as CreditItem)
onLoad(() => {
  uni.$on('debtDetail', (data) => {
    debtDetail.value = data.debtDetail
  })
})
const goBack = () => {
  uni.navigateBack()
}
</script>

<template>
  <scroll-view class="viewport" scroll-y enable-back-to-top>
    <view class="title" :style="{ paddingTop: safeAreaInsets!.top + 'px' }">
      <text @tap="goBack" class="ftysIcon icon-xiangzuojiantou"></text>
      <text class="text">欠款详情</text>
    </view>
    <view class="container">
      <view class="detail-item">
        <text class="dtitle">欠款金额</text>
        <text class="value">{{ debtDetail.money }}</text>
      </view>
      <view class="detail-item">
        <text class="dtitle">订单时间</text>
        <text class="value">{{ debtDetail.createTime }}</text>
      </view>
      <view class="detail-item">
        <text class="dtitle">订单编号</text>
        <text class="value">{{ debtDetail.orderNo }}</text>
      </view>
      <view class="detail-item">
        <text class="dtitle">备注</text>
        <text class="value">{{ debtDetail.memo }}</text>
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
