<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import { getMySuggestAPI } from '@/services/my'
import { commodityTraceAPI, type CommondityTraceResult } from '@/services/order'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import type { PageParams } from '@/types/global'
import type { MySuggestItem } from '@/types/my'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

const query = defineProps<{
  orderId: string
  goodsId: string
  fGoodsId: string
  source: string
}>()

// 获取意见反馈列表
const sourceData = ref<CommondityTraceResult>({} as CommondityTraceResult)
const getSourceData = async () => {
  const res = await commodityTraceAPI({
    orderId: query.orderId,
    goodsId: query.goodsId,
    fGoodsId: query.fGoodsId,
    source: query.source,
  })
  sourceData.value = res.result
}

onLoad(() => {
  getSourceData()
})
const addFeedback = () => {
  uni.navigateTo({ url: '/pagesMember/addfeedback/addfeedback' })
}
const goback = () => {
  uni.navigateBack()
}
</script>

<template>
  <view class="viewport">
    <view class="search-info container">
      <view class="title">—查询信息—</view>
      <view class="item">
        <view class="label">溯源编码</view>
        <view class="value">xxx</view>
      </view>
      <view class="item">
        <view class="label">当前查询次数</view>
        <view class="value">xxx</view>
      </view>
      <view class="item">
        <view class="label">首次查询时间</view>
        <view class="value">xxx</view>
      </view>
    </view>
    <view class="goods-info container">
      <view class="title">—商品信息—</view>
      <view class="item">
        <view class="label">商品名称</view>
        <view class="value">xxx</view>
      </view>
      <view class="item">
        <view class="label">商品分类</view>
        <view class="value">xxx</view>
      </view>
      <view class="item">
        <view class="label">商品单位</view>
        <view class="value">xxx</view>
      </view>
      <view class="item">
        <view class="label">商品描述</view>
        <view class="value">xxx</view>
      </view>
      <view class="item">
        <view class="label">商品单位</view>
        <view class="value">xxx</view>
      </view>
    </view>
    <view class="apply-info container">
      <view class="title">—供应商信息—</view>
      <view class="item">
        <view class="label">供应商</view>
        <view class="value">xxx</view>
      </view>
    </view>
    <view class="source-info container">
      <view class="title">—溯源信息—</view>
      <view class="item">
        <view class="label">供应商</view>
        <view class="value">xxx</view>
      </view>
    </view>
    <view class="order-info container">
      <view class="title">—订单信息—</view>
      <view class="item">
        <view class="label">下单客户</view>
        <view class="value">xxx</view>
      </view>
      <view class="item">
        <view class="label">下单数量</view>
        <view class="value">xxx</view>
      </view>
      <view class="item">
        <view class="label">发货数量</view>
        <view class="value">xxx</view>
      </view>
      <view class="item">
        <view class="label">归属单号</view>
        <view class="value">xxx</view>
      </view>
      <view class="item">
        <view class="label">退货数量</view>
        <view class="value">xxx</view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
  background-color: #f7f7f8;
}

.viewport {
  height: 100%;

  .container {
    min-height: 300rpx;
    background: #fff;
    border-radius: 10rpx;
    margin: 20rpx;
    display: flex;
    flex-direction: column;
    padding: 10rpx;

    .title {
      text-align: center;
      margin-top: 20rpx;
      color: chocolate;
    }

    .item {
      height: 100rpx;
      display: flex;
      justify-content: space-between;
      line-height: 100rpx;
    }
  }
}
</style>
