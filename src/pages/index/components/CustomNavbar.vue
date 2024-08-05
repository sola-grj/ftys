<script setup lang="ts">
// 获取屏幕边界到安全区域的距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const goToSearch = () => {
  uni.navigateTo({ url: '/pages/search/search' })
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
    <view class="search">
      <text @tap="goToSearch" class="icon-search">搜索商品</text>
    </view>
    <!-- <view class="recommand-list">
      <view class="recommand-item" v-for="item in 6">苹果</view>
    </view> -->
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
    display: flex;
    justify-content: space-around;
    margin-bottom: 12rpx;

    .recommand-item {
      width: 100rpx;
      height: 50rpx;
      line-height: 50rpx;
      text-align: center;
      border-radius: 26rpx;
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
    }
  }
}
</style>
