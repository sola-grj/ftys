<script setup lang="ts">
import {
  getSmsAPI,
  postLoginWxMinAPI,
  postLoginWxMinSimpleAPI,
  userLoginAPI,
  verifyCodeLoginAPI,
} from '@/services/login'
import { preLoginAPI, wxLoginAPI } from '@/services/my'
import { useMemberStore } from '@/stores'
import type { LoginResult } from '@/types/member'
import type { PreLoginRes } from '@/types/my'
import { onLoad } from '@dcloudio/uni-app'
import { ref, computed } from 'vue'

// 弹出层组件
const typepopup = ref<UniHelper.UniPopupInstance>()
const typeMap = {
  1: '业务员',
  2: '司机',
  3: '生鲜',
  4: '干货',
  5: '生鲜&干货',
  99: '集团',
}
const currentUserType = ref<number>()
const current = ref(0)
const phone = ref('')
const pwd = ref('')
const verifyCode = ref('')
const userTypes = ref<
  {
    typeId: number
    userId: number
    username: string
  }[]
>([])

// 获取验证码按钮的点击状态
const countDown = ref(60)
const checked = ref(false)

const onGetSmsTap = async () => {
  if (checked.value) {
    uni.showToast({ icon: 'error', title: '请稍后再试' })
    return
  }
  if (!phone.value) {
    uni.showToast({ icon: 'error', title: '请输入手机号' })
    return
  }
  const res = await getSmsAPI({ mobile: phone.value })
  console.log('======>>>>>', res)

  checked.value = true
  setInterval(() => {
    if (countDown.value === 0) {
      checked.value = false
      countDown.value = 60
    }
    countDown.value--
  }, 1000)
}

const activeIndex = ref(0) // 0 是密码登录 1是短信
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
const radioChange = (evt) => {
  currentUserType.value = evt.detail.value
}
const chooseUserRole = () => {
  if (currentLoginIsWx.value) {
    wxLogin()
  } else {
    goToLogin()
  }
  //  @ts-ignore
  typepopup!.value?.close()
}
const goToLogin = async () => {
  if (phone.value.length !== 11) {
    uni.showToast({ icon: 'error', title: '手机号有误！' })
    return
  }
  let res
  if (activeIndex.value === 0) {
    res = await userLoginAPI({
      account: phone.value,
      password: pwd.value,
      typeId: currentUserType.value as number,
    })
  } else if (activeIndex.value === 1) {
    res = await verifyCodeLoginAPI({
      mobile: phone.value,
      captcha: verifyCode.value,
      typeId: currentUserType.value as number,
    })
  }
  // 保存会员信息
  const memberStore = useMemberStore()
  memberStore.setProfile(res!.result)
  if (res?.code.toString() === '1') {
    uni.showToast({ icon: 'success', title: '登录成功' })
    setTimeout(() => {
      // 页面跳转
      // @ts-ignore
      if (res.result.userinfo.type_id.toString() === '2') {
        uni.hideTabBar({
          animation: true,
        })
        uni.reLaunch({ url: '/pages/my/my' })
      } else {
        uni.showTabBar({
          animation: true,
        })
        uni.reLaunch({ url: '/pages/index/index' })
      }
    }, 500)
  } else {
    uni.showToast({ icon: 'error', title: res?.msg })
  }
}
const currentLoginIsWx = ref(false)
const preLogin = async (type?: string) => {
  if (type === 'wx') {
    currentLoginIsWx.value = true
    uni.login({
      provider: 'weixin', //使用微信登录
      success: async function (loginRes) {
        const preRes = await preLoginAPI({
          loginType: 'wx',
          mobile: phone.value,
          code: loginRes.code,
        })
        if (preRes.result.userList.length === 0) {
          wxLogin()
        } else {
          userTypes.value = preRes.result.userList
          typepopup.value!.open?.('top')
          currentUserType.value = userTypes.value[0].typeId
        }
      },
      fail: function (e) {
        console.log('e===', e)
      },
    })
  } else {
    if (activeIndex.value === 0) {
      const preRes = await preLoginAPI({
        loginType: 'password',
        mobile: phone.value,
      })
      if (preRes.result.userList.length === 0) {
        goToLogin()
      } else {
        userTypes.value = preRes.result.userList
        typepopup.value!.open?.('top')
        currentUserType.value = userTypes.value[0].typeId
      }
    } else if (activeIndex.value === 1) {
      const preRes = await preLoginAPI({
        loginType: 'mobile',
        mobile: phone.value,
      })
      if (preRes.result.userList.length === 0) {
        goToLogin()
      } else {
        userTypes.value = preRes.result.userList
        typepopup.value!.open?.('top')
        currentUserType.value = userTypes.value[0].typeId
      }
    }
  }
}
const goToRegister = () => {
  uni.navigateTo({
    url: '/PagesOrder/register/register?type=register',
  })
}
const goToFindPwd = () => {
  uni.navigateTo({
    url: '/PagesOrder/register/register?type=findPwd',
  })
}
const disabled = computed(() => {
  if (activeIndex.value === 0) {
    if (phone.value && pwd.value) {
      return '1'
    } else {
      return ''
    }
  } else {
    if (phone.value && verifyCode.value) {
      return '1'
    } else {
      return ''
    }
  }
})

const wxLogin = () => {
  uni.login({
    provider: 'weixin', //使用微信登录
    success: async function (loginRes) {
      const res = await wxLoginAPI({ code: loginRes.code, typeId: currentUserType.value })
      if (res.code === '0') {
        uni.showToast({ icon: 'none', title: res.msg })
      } else {
        // 保存会员信息
        const memberStore = useMemberStore()
        memberStore.setProfile(res.result)
        uni.showToast({ icon: 'success', title: '登录成功' })
        setTimeout(() => {
          // 页面跳转
          uni.switchTab({ url: '/pages/my/my' })
        }, 500)
      }
      console.log(res)

      console.log('====', loginRes)
    },
    fail: function (e) {
      console.log('e===', e)
    },
  })
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
        <!-- <input type="tel" v-model="phone" class="input" placeholder="请输入用户名/手机号码" /> -->
        <uni-easyinput
          class="input"
          v-model="phone"
          :inputBorder="false"
          type="text"
          :clearable="false"
          placeholder="请输入手机号码"
        ></uni-easyinput>
      </view>
      <view v-if="activeIndex === 1" class="login-item">
        <text class="login-label">验证码</text>
        <!-- <input v-model="verifyCode" class="input" type="text" placeholder="请输入验证码" /> -->
        <uni-easyinput
          class="input"
          v-model="verifyCode"
          :inputBorder="false"
          type="text"
          :clearable="false"
          placeholder="请输入验证码"
        ></uni-easyinput>
        <view @tap="onGetSmsTap" class="getcode-btn" :class="checked ? 'checked' : ''">{{
          checked ? `获取中(${countDown})` : '获取验证码'
        }}</view>
      </view>
      <view v-if="activeIndex === 0" class="login-item">
        <text class="login-label">密码</text>
        <!-- <input v-model="pwd" class="input" type="text" password placeholder="请输入密码" /> -->
        <uni-easyinput
          class="input"
          ref="password"
          :inputBorder="false"
          type="password"
          v-model="pwd"
          :clearable="false"
          placeholder="请输入密码"
        ></uni-easyinput>
      </view>
      <view>
        <button
          :disabled="!disabled"
          @tap="preLogin"
          class="button phone"
          :class="!disabled ? 'disabled' : ''"
        >
          登录
        </button>
      </view>
      <view class="other">
        <text @tap="goToRegister">注册账号</text>
        <text @tap="goToFindPwd">找回密码</text>
      </view>

      <view class="extra">
        <view class="caption">
          <text>其他登录方式</text>
        </view>
        <view class="options">
          <!-- 通用模拟登录 -->
          <view class="wechat-login" @tap="() => preLogin('wx')" />
        </view>
      </view>
    </view>
  </view>
  <uni-popup ref="typepopup" background-color="#fff">
    <view class="customer-popup-content">
      <view class="title">请选择要登录的用户角色</view>
      <radio-group @change="radioChange">
        <label
          class="uni-list-cell uni-list-cell-pd"
          v-for="(item, index) in userTypes"
          :key="item.typeId"
        >
          <view>{{ typeMap[item.typeId] }}</view>
          <view>
            <radio :value="item.typeId" :checked="index === current" />
          </view>
        </label>
      </radio-group>
      <button class="confirm" @tap="chooseUserRole">确定</button>
    </view>
  </uni-popup>
</template>

<style lang="scss">
page {
  height: 100%;
}

.customer-popup-content {
  min-height: 500rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;

  .title {
    text-align: center;
  }

  radio-group {
    // height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-around;

    .uni-list-cell {
      display: flex;
      height: 100rpx;
      align-items: center;
      padding: 0 20rpx;

      view:first-child {
        margin-right: 40rpx;
      }
    }

    .checked {
      background-color: #f2f4f7;
    }
  }

  .confirm {
    width: 60%;
    background-color: #ff5040;
    color: #fff;
  }
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

    .uni-easyinput {
      text-align: right;

      .uni-easyinput__content {
        input {
          padding-right: 0 !important;
        }
      }
    }

    .login-label {
      width: 200rpx;
    }

    .getcode-btn {
      line-height: 50rpx;
      text-align: center;
      color: #fff;
      width: 160rpx;
      height: 50rpx;
      font-size: 25rpx;
      border-radius: 10rpx;
      background: linear-gradient(90deg, rgba(255, 112, 77, 1) 0%, rgba(255, 95, 77, 1) 100%);
      margin-left: 20rpx;
    }

    .checked {
      background: #dcdcdc;
      color: #666;
    }
  }

  .input {
    width: 100%;
    height: 80rpx;
    font-size: 28rpx;
    padding-left: 30rpx;
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
    background-color: #ff5f4d;
    color: #fff;
    margin-top: 80rpx;

    .icon {
      font-size: 40rpx;
      margin-right: 6rpx;
    }
  }

  .disabled {
    background-color: #fff;
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
