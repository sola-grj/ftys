<script setup lang="ts">
import type { TopItem } from '@/types/home'

// 获取屏幕边界到安全区域的距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const goToSearch = () => {
  uni.navigateTo({ url: '/pages/search/search' })
}
const query = defineProps<{
  topList: TopItem[]
}>()
const goToDetail = (data: TopItem) => {
  uni.navigateTo({ url: `/pages/goods/goods?source=${data.source}&goodsId=${data.goodsId}` })
}
</script>

<template>
  <view class="navbar" :style="{ paddingTop: safeAreaInsets?.top + 'px' }">
    <!-- logo文字 -->
    <!-- <view class="logo">
      <image class="logo-image" src="@/static/images/logo.png"></image>
      <text class="logo-text">新鲜 · 亲民 · 快捷</text>
    </view> -->
    <!-- 搜索条 -->
    <!-- <view class="search"> -->
    <!-- <text @tap="goToSearch" class="icon-search">搜索商品</text> -->
    <view @tap="goToSearch" class="search">
      <text class="ftysIcon icon-sousuo"></text>
      <input disabled />
      <button class="search-btn">搜索</button>
    </view>
    <!-- </view> -->
    <view class="recommand-list">
      <view
        class="recommand-item"
        @tap="($event) => goToDetail(item)"
        v-for="item in query.topList"
        :key="item.goodsId"
      >
        {{ item.name }}</view
      >
    </view>
  </view>
</template>

<style lang="scss">
/* 自定义导航条 */
.navbar {
  background-color: #ff6840;
  background-size: cover;
  position: relative;
  display: flex;
  flex-direction: column;
  padding-top: 20px;

  .logo {
    display: flex;
    align-items: center;
    height: 64rpx;
    padding-left: 30rpx;
    padding-top: 20rpx;

    .logo-image {
      width: 166rpx;
      height: 39rpx;
    }

    .logo-text {
      flex: 1;
      line-height: 28rpx;
      color: #fff;
      margin: 2rpx 0 0 20rpx;
      padding-left: 20rpx;
      border-left: 1rpx solid #fff;
      font-size: 26rpx;
    }
  }

  .search {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10rpx 0 26rpx;
    height: 64rpx;
    margin: 16rpx 20rpx;
    color: #fff;
    font-size: 28rpx;
    border-radius: 32rpx;
    background-color: rgba(255, 255, 255, 0.5);

    .search-btn {
      color: #fff;
      border-radius: 30rpx;
      height: 54rpx;
      line-height: 54rpx;
      background: linear-gradient(90deg, rgba(255, 112, 64, 1) 0%, rgba(255, 80, 64, 1) 100%);
      font-size: 26rpx;
      font-weight: 400;
      margin: 0;
      margin: 5rpx;
    }
  }

  .icon-search {
    &::before {
      margin-right: 10rpx;
    }
  }

  .icon-scan {
    font-size: 30rpx;
    padding: 15rpx;
  }

  .recommand-list {
    width: 100%;
    overflow: scroll;
    margin-bottom: 12rpx;
    white-space: nowrap;

    .recommand-item {
      display: inline-block;
      height: 50rpx;
      line-height: 30rpx;
      text-align: center;
      border-radius: 26rpx;
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
      font-size: 24rpx;
      padding: 10rpx;
      margin: 0 10rpx;
    }
  }
}
</style>
