<script setup lang="ts">
// 获取屏幕边界到安全区域的距离
const { safeAreaInsets } = uni.getSystemInfoSync()
</script>

<template>
  <view class="navbar" :style="{ paddingTop: safeAreaInsets?.top + 'px' }">
    <!-- logo文字 -->
    <!-- <view class="logo">
      <image class="logo-image" src="@/static/images/logo.png"></image>
      <text class="logo-text">新鲜 · 亲民 · 快捷</text>
    </view> -->
    <view class="back icon icon-left"></view>
    <!-- 搜索条 -->
    <view class="search">
      <input class="uni-input" confirm-type="search" placeholder="键盘右下角按钮显示为搜索" />
      <button class="search-btn" hover-class="button-hover">搜索</button>
    </view>
  </view>
  <view class="history">
    <view class="title">
      <view class="text">历史搜索</view>
      <view class="icon icon-delete"></view>
    </view>
    <view class="content">
      <view class="item" :key="item" v-for="item in 10"> 苹果香蕉{{ item }} </view>
    </view>
  </view>
  <view class="history">
    <view class="title">
      <view class="text">搜索发现</view>
      <view class="icon icon-left"></view>
    </view>
    <view class="content">
      <view class="item" :key="item" v-for="item in 10"> 苹果香蕉{{ item }} </view>
    </view>
  </view>
  <view class="search-list">
    <view class="order">
      <view>默认</view>
      <view>单价</view>
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
  align-items: center;
  padding-top: 20px;
  width: 100%;
  .back {
    color: #fff;
    width: 60rpx;
    text-align: center;
  }
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

.history {
  margin: 20rpx 20rpx 0;

  .title {
    display: flex;
    justify-content: space-between;
    font-size: 30rpx;
    font-weight: 400;
    color: #999999;
  }

  .content {
    .item {
      font-size: 26rpx;
      color: rgba(50, 50, 51, 1);
      font-weight: 400;
      margin-top: 20rpx;
      margin-right: 20rpx;
      display: inline-block;
      height: 60rpx;
      line-height: 40rpx;
      padding: 10rpx;
      border-radius: 4px;
      background: rgba(242, 244, 247, 1);
    }
  }
}
</style>
