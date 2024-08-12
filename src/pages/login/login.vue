<script setup lang="ts">
import { postLoginWxMinAPI, postLoginWxMinSimpleAPI } from '@/services/login'
import { useMemberStore } from '@/stores'
import type { LoginResult } from '@/types/member'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

const activeIndex = ref(0)
const onChangeIndex = (index: number) => {
  activeIndex.value = index
}
// #ifdef MP-WEIXIN
// 获取code 登录凭证
let code = ''
onLoad(async () => {
  const res = await wx.login()
  code = res.code
})

// 获取用户手机号(企业开发)
const onGetPhoneNumber: UniHelper.ButtonOnGetphonenumber = async (ev) => {
  const encryptedData = ev.detail!.encryptedData!
  const iv = ev.detail!.iv!
  const res = await postLoginWxMinAPI({
    code,
    encryptedData,
    iv,
  })
  loginSuccess(res.result)
}
// #endif

// 模拟手机号码快速登录（练习）
const onGetPhoneNumberSimple = async () => {
  const res = await postLoginWxMinSimpleAPI('18516920921')
  loginSuccess(res.result)
}

const loginSuccess = (profile: LoginResult) => {
  // 保存会员信息
  const memberStore = useMemberStore()
  memberStore.setProfile(profile)
  uni.showToast({ icon: 'success', title: '登录成功' })
  setTimeout(() => {
    // 页面跳转
    // uni.switchTab({ url: '/pages/my/my' })
    uni.navigateBack()
  }, 500)
}
</script>

<template>
  <view class="viewport">
    <view class="logo">
      <image
        src="https://img.js.design/assets/img/6692403947d568b1a5055305.png#f81240010a746c2852f061438722ef64"
      ></image>
    </view>
    <view class="login-type">
      <view
        @tap="($event) => onChangeIndex(0)"
        class="pwd-btn"
        :class="activeIndex === 0 ? 'checked' : ''"
        >密码登录</view
      >
      <view
        @tap="($event) => onChangeIndex(1)"
        class="code-btn"
        :class="activeIndex === 1 ? 'checked' : ''"
        >验证码登录</view
      >
    </view>
    <view class="login">
      <!-- 网页端表单登录 -->
      <!-- #ifdef H5 -->
      <input class="input" type="text" placeholder="请输入用户名/手机号码" />
      <input class="input" type="text" password placeholder="请输入密码" />
      <button class="button phone">登录</button>
      <!-- #endif -->

      <!-- 小程序端授权登录 -->
      <!-- #ifdef MP-WEIXIN -->
      <button class="button phone" open-type="getPhoneNumber" @getphonenumber="onGetPhoneNumber">
        <text class="icon icon-phone"></text>
        手机号快捷登录
      </button>
      <!-- #endif -->

      <view class="extra">
        <view class="caption">
          <text>其他登录方式</text>
        </view>
        <view class="options">
          <!-- 通用模拟登录 -->
          <button @tap="onGetPhoneNumberSimple">
            <text class="icon icon-phone">模拟快捷登录</text>
          </button>
        </view>
      </view>
      <view class="tips">登录/注册即视为你同意《服务条款》和《小兔鲜儿隐私协议》</view>
    </view>
  </view>
</template>

<style lang="scss">
page {
  height: 100%;
}

.viewport {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20rpx 40rpx;
}

.logo {
  flex: 1;
  text-align: center;
  image {
    width: 220rpx;
    height: 220rpx;
    margin-top: 15vh;
  }
}
.login-type {
  display: flex;
  height: 100rpx;
  width: 500rpx;
  background: #f2f4f7;
  border-radius: 50rpx;
  .pwd-btn,
  .code-btn {
    width: 50%;
    line-height: 100rpx;
    text-align: center;
    border-radius: 50rpx;
  }
  .checked {
    color: #fff;
    background-color: #ff5040;
  }
}
.login {
  display: flex;
  flex-direction: column;
  height: 60vh;
  padding: 40rpx 20rpx 20rpx;

  .input {
    width: 100%;
    height: 80rpx;
    font-size: 28rpx;
    border-radius: 72rpx;
    border: 1px solid #ddd;
    padding-left: 30rpx;
    margin-bottom: 20rpx;
  }

  .button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 80rpx;
    font-size: 28rpx;
    border-radius: 72rpx;
    color: #fff;
    .icon {
      font-size: 40rpx;
      margin-right: 6rpx;
    }
  }

  .phone {
    background-color: #28bb9c;
  }

  .wechat {
    background-color: #06c05f;
  }

  .extra {
    flex: 1;
    padding: 70rpx 70rpx 0;
    .caption {
      width: 440rpx;
      line-height: 1;
      border-top: 1rpx solid #ddd;
      font-size: 26rpx;
      color: #999;
      position: relative;
      text {
        transform: translate(-40%);
        background-color: #fff;
        position: absolute;
        top: -12rpx;
        left: 50%;
      }
    }

    .options {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 70rpx;
      button {
        padding: 0;
        background-color: transparent;
      }
    }

    .icon {
      font-size: 24rpx;
      color: #444;
      display: flex;
      flex-direction: column;
      align-items: center;

      &::before {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 80rpx;
        height: 80rpx;
        margin-bottom: 6rpx;
        font-size: 40rpx;
        border: 1rpx solid #444;
        border-radius: 50%;
      }
    }
    .icon-weixin::before {
      border-color: #06c05f;
      color: #06c05f;
    }
  }
}

.tips {
  position: absolute;
  bottom: 80rpx;
  left: 20rpx;
  right: 20rpx;
  font-size: 22rpx;
  color: #999;
  text-align: center;
}
</style>
