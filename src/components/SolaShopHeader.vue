<script setup lang="ts">
import { defineProps } from 'vue'
// 状态栏高度
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0
// 胶囊数据
const { top, height } = wx.getMenuButtonBoundingClientRect()
// 自定义导航栏高度 = 胶囊高度 + 胶囊的padding*2, 如果获取不到设置为38
const barHeight = height ? height + (top - statusBarHeight) * 2 : 38
console.log('public==========', statusBarHeight, barHeight)

// 接收数据
defineProps<{
  title?: string
}>()

const goback = () => {
  uni.navigateBack()
}
const goToSearch = () => {
  uni.navigateTo({ url: '/PagesOrder/search/search' })
}
</script>

<template>
  <view class="sola-header">
    <view :style="{ height: `${statusBarHeight}px` }"></view>
    <view
      v-if="title"
      class="title"
      :style="{
        height: `${barHeight}px`,
        'line-height': `${barHeight}px`,
        'text-align': 'center',
      }"
    >
      <text @tap="goback" class="ftysIcon icon-xiangzuojiantou"></text>
      <text>{{ title }}</text>
    </view>
    <view
      v-else
      class="navbar"
      :style="{
        height: `${barHeight}px`,
        'line-height': `${barHeight}px`,
        'text-align': 'center',
      }"
    >
      <view @tap="goback" class="back ftysIcon icon-xiangzuojiantou"></view>
      <!-- 搜索条 -->
      <view class="search" @tap="goToSearch">
        <input @tap="goToSearch" disabled class="uni-input" confirm-type="search" />
        <button class="search-btn" hover-class="button-hover">搜索</button>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
:host {
  display: block;
  // height: 280rpx;
}

.sola-header {
  // position: fixed;
  // top: 0;
  .title {
    position: relative;
    text-align: center;
    color: #fff;
    width: 100%;

    .text {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: 20rpx;
    }

    .icon-xiangzuojiantou {
      position: absolute;
      left: 20rpx;
      top: 50%;
      transform: translateY(-50%);
    }
  }

  .navbar {
    background-size: cover;
    position: relative;
    display: flex;
    align-items: center;
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
}
</style>
