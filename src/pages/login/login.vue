<script setup lang="ts">
import { postLoginWxMinAPI, postLoginWxMinSimpleAPI } from '@/services/login'
import { useMemberStore } from '@/stores'
import type { LoginResult } from '@/types/member'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

const phone = ref('')
const pwd = ref('')
const verifyCode = ref('')

const onPhoneChange = (event: any) => {
  phone.value = event.targe.value
}

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
      >
      </image>
    </view>
    <view class="login-container">
      <view class="login-type">
        <view
          @tap="($event) => onChangeIndex(0)"
          class="pwd-btn"
          :class="activeIndex === 0 ? 'checked' : ''"
          >密码登录
        </view>
        <view
          @tap="($event) => onChangeIndex(1)"
          class="code-btn"
          :class="activeIndex === 1 ? 'checked' : ''"
          >验证码登录
        </view>
      </view>
    </view>

    <view class="login">
      <view class="login-item">
        <text class="login-label">手机号码</text>
        <input
          type="tel"
          @change="onPhoneChange"
          class="input"
          placeholder="请输入用户名/手机号码"
        />
      </view>
      <view v-if="activeIndex === 1" class="login-item">
        <text class="login-label">验证码</text>
        <input class="input" type="text" password placeholder="请输入验证码" />
        <view class="getcode-btn">获取验证码</view>
      </view>
      <view v-if="activeIndex === 0" class="login-item">
        <text class="login-label">密码</text>
        <input class="input" type="text" password placeholder="请输入密码" />
      </view>
      <view>
        <button class="button phone">登录</button>
      </view>
      <view class="other">
        <text>注册账号</text>
        <text>找回密码</text>
      </view>

      <view class="extra">
        <view class="caption">
          <text>其他登录方式</text>
        </view>
        <view class="options">
          <!-- 通用模拟登录 -->
          <view class="wechat-login" />
        </view>
      </view>
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
  // flex: 1;
  text-align: center;

  image {
    width: 220rpx;
    height: 220rpx;
    // margin-top: 15vh;
  }
}

.login-container {
  position: relative;
  height: 80rpx;
  margin-top: 20rpx;
}

.login-type {
  display: flex;
  height: 80rpx;
  width: 500rpx;
  background: #f2f4f7;
  border-radius: 50rpx;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);

  .pwd-btn,
  .code-btn {
    width: 50%;
    line-height: 80rpx;
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

  .input-placeholder {
    // margin-top: 10rpx;
  }

  .login-item {
    height: 80rpx;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ddd;

    .login-label {
      width: 200rpx;
    }

    .getcode-btn {
      line-height: 50rpx;
      text-align: center;
      color: #fff;
      width: 300rpx;
      height: 50rpx;
      font-size: 25rpx;
      border-radius: 10rpx;
      background: linear-gradient(90deg, rgba(255, 112, 77, 1) 0%, rgba(255, 95, 77, 1) 100%);
      margin-left: 20rpx;
    }
  }

  .input {
    width: 100%;
    height: 80rpx;
    font-size: 28rpx;
    padding-left: 30rpx;
    margin-bottom: 20rpx;
    text-align: right;
  }

  .button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80%;
    height: 80rpx;
    font-size: 28rpx;
    border-radius: 20rpx;
    background: linear-gradient(90deg, rgba(255, 112, 77, 1) 0%, rgba(255, 95, 77, 1) 100%);
    color: #fff;
    margin-top: 80rpx;

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

  .other {
    margin-top: 80rpx;
    display: flex;
    justify-content: space-evenly;
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

      .wechat-login {
        height: 60rpx;
        width: 120rpx;
        background: url(https://img.js.design/assets/img/6692418c4fc21e83fb7c8cd2.png#625b5174155bc79f15742e5827650f9e);
        background-repeat: no-repeat;
        background-size: 100%;
      }

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
