<script setup lang="ts">
import { useMemberStore } from '@/stores'
import type { TopItem } from '@/types/home'

// 获取屏幕边界到安全区域的距离
const { top, height } = uni.getMenuButtonBoundingClientRect()
const { safeAreaInsets } = uni.getSystemInfoSync()
const memberStore = useMemberStore()
let user_role = memberStore.profile?.userinfo.user_role
// 用户type_id
/**  1:业务员 2:司机 3:生鲜 4:干货 5:生鲜&干货
 *  type_id 1 最高权限
    type_id 2 只展示 我的 页面
    type_id 3 4 5 && user_role === 2  客户 客户才有主账号 子账号
 */
const type_id = memberStore.profile?.userinfo.type_id
const isCut = memberStore.profile?.userinfo.isCut
const goToSearch = () => {
  uni.navigateTo({ url: '/PagesOrder/search/search' })
}
const query = defineProps<{
  topList: TopItem[]
}>()
const goToDetail = (data: TopItem) => {
  uni.navigateTo({ url: `/PagesOrder/goods/goods?source=${data.source}&goodsId=${data.goodsId}` })
}
const onChangeAccount = () => {
  uni.navigateTo({ url: '/pagesMember/changeaccount/changeaccount' })
}
</script>

<template>
  <view class="navbar" :style="{ paddingTop: top + height - 26 + 'px' }">
    <view class="current-user">
      <!-- <text class="ftysIcon icon-touxiang"></text> -->
      <text class="username">{{ memberStore.profile?.userinfo.username }}</text>
      <text
        v-if="!(type_id !== 2 && user_role!.toString() === '2' && !isCut)"
        @tap="onChangeAccount"
        ><text class="ftysIcon icon-qiehuanzhanghao"></text> <text class="change">切换</text></text
      >
    </view>
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

  .current-user {
    color: #ffffff;
    margin: 0 20rpx;

    .username {
      font-size: 40rpx;
      margin: 0 20rpx;
    }

    .icon-qiehuanzhanghao,
    .change {
      font-size: 26rpx;
    }
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
