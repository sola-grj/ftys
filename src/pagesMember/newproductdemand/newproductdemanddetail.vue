<script setup lang="ts">
import type { GetMyGoodsApplyItem } from '@/services/goods'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { ref } from 'vue'
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const currentInfo = ref<GetMyGoodsApplyItem>({} as GetMyGoodsApplyItem)
onUnload(() => {
  uni.$off('detail')
})
onLoad(() => {
  uni.$on('detail', (data) => {
    currentInfo.value = data.currentInfo
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
      <text class="text">新品需求详情</text>
    </view>
    <view class="container">
      <view class="detail-item">
        <text class="dtitle">商品名称</text>
        <text class="value">{{ currentInfo.goods_name }}</text>
      </view>
      <view class="detail-item">
        <text class="dtitle">分类</text>
        <text class="value">{{ currentInfo.goods_category_name }}</text>
      </view>
      <view class="detail-item">
        <text class="dtitle">商品品牌</text>
        <text class="value">{{ currentInfo.goods_brand }}</text>
      </view>
      <view class="detail-item">
        <text class="dtitle">商品规格</text>
        <text class="value">{{ currentInfo.goods_specification }}</text>
      </view>
      <view class="detail-item">
        <text class="dtitle">供应商</text>
        <text class="value">{{ currentInfo.goods_supplier }}</text>
      </view>
      <view class="detail-item">
        <text class="dtitle">参考价格</text>
        <text class="value">{{ currentInfo.goods_price }}</text>
      </view>
      <view class="detail-item">
        <text class="dtitle">商品描述</text>
        <text class="value">{{ currentInfo.goods_remark }}</text>
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

    .detail-item {
      display: flex;
      justify-content: space-between;
      height: 80rpx;
      border-bottom: 1px solid #f2f4f7;
      align-items: center;
    }

    .detail-item:nth-last-child(1) {
      border-bottom: none;
    }
  }
}
</style>
