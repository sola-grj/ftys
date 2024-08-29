<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import { getSmsAPI } from '@/services/login'
import { addSuggestAPI, getMySuggestAPI, setpaypwdAPI } from '@/services/my'
import { useMemberStore } from '@/stores'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import type { PageParams } from '@/types/global'
import type { MySuggestItem } from '@/types/my'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const formRef = ref<UniHelper.UniFormsInstance>()
const imageList = ref([])
const imageUrlList = ref([])
const title = ref('')
const content = ref('')
// 获取验证码按钮的点击状态
const countDown = ref(60)
const checked = ref(false)
// 注册表单数据
const form = ref({
  smsCode: '',
  password: '',
  cpassword: '',
})
const onGetSmsTap = async () => {
  const res = await getSmsAPI({
    mobile: memberStore.profile?.userinfo.mobile as string,
    event: 'login',
  })
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
const memberStore = useMemberStore()
// 注册定义校验规则
const rules: UniHelper.UniFormsRules = {
  smsCode: {
    rules: [{ required: true, errorMessage: '请输入短信验证码' }],
  },
  password: {
    rules: [
      { required: true, errorMessage: '请输入密码' },
      { pattern: /^\d{6}$/, errorMessage: '请输入六位数字密码' },
    ],
  },
  cpassword: {
    rules: [
      { required: true, errorMessage: '请再次确认密码' },
      { pattern: /^\d{6}$/, errorMessage: '请输入六位数字密码' },
    ],
  },
}
const onSave = async () => {
  await formRef.value?.validate?.()
  const res = await setpaypwdAPI({
    paypwd: form.value.password,
  })
  if (res.code === '1') {
    uni.showToast({ icon: 'success', title: '设置成功' })
    uni.navigateTo({ url: '/pagesMember/settings/settings' })
  } else {
    uni.showToast({ icon: 'error', title: res.msg })
  }
}
const onSelect = (event: any) => {
  uni.uploadFile({
    url: '/common/upload', //仅为示例，非真实的接口地址
    filePath: event.tempFilePaths[0],
    name: 'file',
    success: (res) => {
      let { data } = res
      data = JSON.parse(data)
      // @ts-ignore
      imageList.value.push({
        // @ts-ignore
        url: data!.result.url,
        uuid: event.tempFiles[0].uuid,
      })
      // @ts-ignore
      imageUrlList.value.push(data!.result.url)
      // @ts-ignore
      form.value.images = data!.result.url
      console.log('event', event, data)
    },
  })
}
const onDelete = (event: any) => {
  console.log(event)
  // @ts-ignore
  imageList.value = [...imageList.value.filter((item) => item.uuid !== event.tempFile.uuid)]
}
const goback = () => {
  uni.navigateBack()
}
</script>

<template>
  <scroll-view class="viewport" scroll-y enable-back-to-top>
    <view class="title" :style="{ paddingTop: safeAreaInsets!.top + 'px' }">
      <text @tap="goback" class="ftysIcon icon-xiangzuojiantou"></text>
      <text class="text">设置支付密码</text>
    </view>
    <view class="container form-content">
      <uni-forms class="form" ref="formRef" :rules="rules" :modelValue="form">
        <uni-forms-item class="form-item" name="phone">
          <text class="label">手机号码</text>
          <input
            type="tel"
            disabled
            :value="memberStore.profile?.userinfo.mobile"
            class="input"
            placeholder="请输入手机号码"
          />
        </uni-forms-item>
        <uni-forms-item class="form-item" name="smsCode">
          <text class="label">手机验证码</text>
          <input type="tel" v-model="form.smsCode" class="input" placeholder="请输入手机验证码" />
          <view @tap="onGetSmsTap" class="getcode-btn" :class="checked ? 'checked' : ''">{{
            checked ? `获取中(${countDown})` : '获取验证码'
          }}</view>
        </uni-forms-item>
        <uni-forms-item class="form-item" name="password">
          <text class="label">设置支付密码</text>
          <uni-easyinput
            primaryColor="#ff704d"
            :clearable="false"
            :inputBorder="false"
            type="password"
            v-model="form.password"
            placeholder="请输入6位数数字密码"
          ></uni-easyinput>
        </uni-forms-item>
        <uni-forms-item class="form-item" name="cpassword">
          <text class="label">确认支付密码</text>
          <uni-easyinput
            primaryColor="#ff704d"
            :clearable="false"
            :inputBorder="false"
            type="password"
            v-model="form.cpassword"
            placeholder="请再次输入6位数数字密码"
          ></uni-easyinput>
        </uni-forms-item>
        <button @tap="onSave" open-type="" class="save">保存</button>
      </uni-forms>
    </view>
  </scroll-view>
</template>

<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
  background-color: #f7f7f8;
}

.viewport {
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 112, 64, 1) 0%, rgba(255, 80, 64, 1) 100%);

  .title {
    position: relative;
    text-align: center;
    color: #fff;
    width: 100%;
    height: 130rpx;

    .text {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: 20rpx;
    }

    .icon-xiangzuojiantou {
      position: absolute;
      left: 20rpx;
      bottom: 20rpx;
    }
  }

  .container {
    height: 100%;
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    overflow: scroll;
    padding: 30rpx;

    .getcode-btn {
      line-height: 50rpx;
      text-align: center;
      color: #fff;
      width: 150rpx;
      height: 50rpx;
      font-size: 25rpx;
      border-radius: 10rpx;
      background: linear-gradient(90deg, rgba(255, 112, 77, 1) 0%, rgba(255, 95, 77, 1) 100%);
      margin-left: 20rpx;
    }

    .uni-forms-item__content {
      display: flex;
      align-items: center;
      justify-content: space-between;

      input {
        text-align: right;
      }

      .content {
        flex: 1;
        text-align: right;
        color: #999999;
      }

      .uni-easyinput__placeholder-class {
        font-size: 28rpx;
      }
    }

    .save {
      width: 70%;
      border-radius: 8px;
      background: linear-gradient(90deg, rgba(255, 112, 77, 1) 0%, rgba(255, 95, 77, 1) 100%);
      color: #fff;
    }
  }
}
</style>
