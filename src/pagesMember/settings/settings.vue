<script setup lang="ts">
import { useMemberStore } from '@/stores'

const memberStore = useMemberStore()
// 退出登录
const onLogout = () => {
  uni.showModal({
    content: '是否退出登录？',
    success: (res) => {
      if (res.confirm) {
        // 清理用户信息
        memberStore.clearProfile()
        // 返回上一页
        uni.reLaunch({ url: '/pages/login/login' })
      }
    },
  })
}
const resetPwd = () => {
  uni.navigateTo({
    url: '/pages/register/register?type=resetPwd',
  })
}
const onChangeSwitch = (e: any) => {
  console.log(e.detail.value)
}
</script>

<template>
  <view class="viewport">
    <!-- 列表2 -->
    <view class="list">
      <view class="list-item" @tap="resetPwd">
        <view hover-class="none" class="item arrow">修改登录密码</view>
        <text class="ftysIcon icon-xiangyoujiantou"></text>
      </view>
      <view class="list-item">
        <view hover-class="none" class="item arrow">绑定微信</view>
        <view>
          <text>待绑定</text>
          <text class="ftysIcon icon-xiangyoujiantou"></text>
        </view>
      </view>
      <view class="list-item" v-if="memberStore.profile?.userinfo.type_id.toString() !== '2'">
        <view hover-class="none" class="item arrow">余额支付使用密码</view>
        <switch :checked="true" @change="onChangeSwitch" />
      </view>
    </view>
    <!-- 操作按钮 -->
    <view class="action">
      <view class="button" @tap="onLogout">退出登录</view>
    </view>
  </view>
</template>

<style lang="scss">
page {
  background-color: #f4f4f4;
}

.viewport {
  padding: 20rpx;
}

/* 列表 */
.list {
  padding: 0 20rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
  border-radius: 10rpx;

  .list-item {
    display: flex;
    height: 100rpx;
    width: 100%;
    align-items: center;
    justify-content: space-between;
  }
}

/* 操作按钮 */
.action {
  text-align: center;
  line-height: 90rpx;
  margin-top: 40rpx;
  font-size: 32rpx;
  color: #333;

  .button {
    background-color: #fff;
    margin-bottom: 20rpx;
    border-radius: 10rpx;
  }
}
</style>
