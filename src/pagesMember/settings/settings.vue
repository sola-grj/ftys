<script setup lang="ts">
import { bindWXAPI, checkBindWXAPI } from '@/services/my'
import { useMemberStore } from '@/stores'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

const memberStore = useMemberStore()
const isBindWx = ref(false)
// 检查是否绑定微信
const checkBindWX = async () => {
  const res = await checkBindWXAPI()
  if (res.result.idBindWX === '1') {
    isBindWx.value = true
  }
}
// 退出登录
const onLogout = () => {
  uni.showModal({
    content: '是否退出登录？',
    success: (res) => {
      if (res.confirm) {
        // 清理用户信息
        memberStore.clearProfile()
        // 返回上一页
        uni.reLaunch({ url: '/PagesOrder/login/login' })
      }
    },
  })
}
const bindWx = () => {
  if (isBindWx.value === false) {
    uni.showModal({
      content: '是否绑定当前微信？',
      success: (res) => {
        if (res.confirm) {
          uni.login({
            provider: 'weixin', //使用微信登录
            success: async function (loginRes) {
              const res = await bindWXAPI({ code: loginRes.code })
              if (res.code === '0') {
                uni.showToast({ icon: 'none', title: res.msg })
              } else {
                checkBindWX()
              }
            },
          })
        }
      },
    })
  }
}
const resetPwd = () => {
  uni.navigateTo({
    url: '/PagesOrder/register/register?type=resetPwd',
  })
}
const onChangeSwitch = (e: any) => {
  console.log(e.detail.value)
}
onLoad(() => {
  checkBindWX()
})
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
        <view @tap="bindWx">
          <text>{{ isBindWx ? '已绑定' : '待绑定' }}</text>
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
