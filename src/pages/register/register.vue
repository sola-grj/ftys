<script setup lang="ts">
import { getSmsAPI, userRegisterAPI, resetPwdAPI } from '@/services/login'
import { getMemberProfileAPI, putMemberProfileAPI } from '@/services/profile'
import { useMemberStore } from '@/stores'
import type { Gender, ProfileDetail } from '@/types/member'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

const query = defineProps<{
  type: string
}>()

// 第一页
const page = ref(0)

// 表单数据
// 第一页数据
const phone = ref('')
const imgCode = ref('')
const smsCode = ref('')
const pwd = ref('')
const buyType = ref('3') // sx生鲜 gh干货
const showPassword = ref(false)

const changePassword = () => (showPassword.value = !showPassword.value)
type Location = {
  address: string
  name: string
  latitude: number
  longitude: number
}
//第二页数据
const contactPerson = ref('')
const company = ref('')
const companyLocation = ref<Location>({
  address: '',
  name: '',
  latitude: 0,
  longitude: 0,
})
const deliverLocation = ref<Location>({
  address: '',
  name: '',
  latitude: 0,
  longitude: 0,
})
const detailLocation = ref('')
const inviteCode = ref('')
const imageList = ref([])

// 注册表单数据
const form = ref({
  phone,
  imgCode,
  smsCode,
  pwd,
  contactPerson,
  company,
  companyLocationStr: '',
  deliverLocationStr: '',
  detailLocation,
  inviteCode,
  images: '',
})
// 找回密码数据
const findPwdForm = ref({
  phone,
  imgCode,
  smsCode,
  pwd,
})
// 注册定义校验规则
const rules: UniHelper.UniFormsRules = {
  phone: {
    rules: [
      { required: true, errorMessage: '请输入手机号码' },
      { pattern: /^1[3-9]\d{9}$/, errorMessage: '手机号格式不正确' },
    ],
  },
  imgCode: {
    rules: [{ required: true, errorMessage: '请输入图形验证码' }],
  },
  smsCode: {
    rules: [{ required: true, errorMessage: '请输入短信验证码' }],
  },
  pwd: {
    rules: [{ required: true, errorMessage: '请输入密码' }],
  },
  contactPerson: {
    rules: [{ required: true, errorMessage: '请输入联系人' }],
  },
  company: {
    rules: [{ required: true, errorMessage: '请输入公司' }],
  },
  companyLocationStr: {
    rules: [{ required: true, errorMessage: '请选择公司地址' }],
  },
  deliverLocationStr: {
    rules: [{ required: true, errorMessage: '请选择发货地址' }],
  },
  detailLocation: {
    rules: [{ required: true, errorMessage: '请填写详细地址' }],
  },
  inviteCode: {
    rules: [{ required: true, errorMessage: '请填写邀请码' }],
  },
  images: {
    rules: [{ required: true, errorMessage: '请至少上传一张图片' }],
  },
}
// 找回密码定义校验规则
const findPwdrules: UniHelper.UniFormsRules = {
  phone: {
    rules: [
      { required: true, errorMessage: '请输入手机号码' },
      { pattern: /^1[3-9]\d{9}$/, errorMessage: '手机号格式不正确' },
    ],
  },
  imgCode: {
    rules: [{ required: true, errorMessage: '请输入图形验证码' }],
  },
  smsCode: {
    rules: [{ required: true, errorMessage: '请输入短信验证码' }],
  },
  pwd: {
    rules: [{ required: true, errorMessage: '请输入密码' }],
  },
}
// 获取验证码按钮的点击状态
const countDown = ref(60)
const checked = ref(false)

const onGetSmsTap = async () => {
  const res = await getSmsAPI({ mobile: phone.value, event: 'login' })
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

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

const memberStore = useMemberStore()
// 修改头像
const onAvatarChange = () => {
  // 调用拍照
  uni.chooseImage({
    success: (chooseImageRes) => {
      const tempFilePaths = chooseImageRes.tempFilePaths
      uni.uploadFile({
        url: 'common/upload', //仅为示例，非真实的接口地址
        filePath: tempFilePaths[0],
        name: 'file',
        formData: {
          user: 'test',
        },
        success: (uploadFileRes) => {
          let { data } = uploadFileRes
          data = JSON.parse(data)
          console.log(uploadFileRes.data)
        },
      })
    },
  })
}

onLoad(() => {
  // getMemberProfileData()
})

// 修改类型
const onTypeChange: UniHelper.RadioGroupOnChange = (ev) => {
  buyType.value = ev.detail.value
}

// 选择位置
const chooseAddress = (type: string) => {
  uni.chooseLocation({
    success: function (res) {
      console.log('位置名称：' + res.name)
      console.log('详细地址：' + res.address)
      console.log('纬度：' + res.latitude)
      console.log('经度：' + res.longitude)
      if (type === 'company') {
        companyLocation.value = {
          address: res.address,
          name: res.name,
          latitude: res.latitude,
          longitude: res.longitude,
        }
        form.value.companyLocationStr = res.address
      }
      if (type === 'deliver') {
        deliverLocation.value = {
          address: res.address,
          name: res.name,
          latitude: res.latitude,
          longitude: res.longitude,
        }
        form.value.deliverLocationStr = res.address
      }
    },
  })
}
const test = ref({})
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
      test.value = data!.result
      // @ts-ignore
      form.value.images = data!.result.url
      console.log('event', event, data)
    },
  })
}
// 表单组件实例
const formRef = ref<UniHelper.UniFormsInstance>()

const onSubmit = async () => {
  await formRef.value?.validate?.()
  console.log('register=====', {
    username: contactPerson.value,
    password: pwd.value,
    mobile: phone.value,
    code: smsCode.value,
    type_id: buyType.value,
    sub_account_level: '1',
    company_lon: companyLocation.value.longitude.toString(),
    company_lat: companyLocation.value.latitude.toString(),
    company_province: companyLocation.value.address,
    compnay_city: companyLocation.value.address,
    company_area: companyLocation.value.address,
    company_addr: companyLocation.value.address,
    company: company.value,
    shipping_lon: deliverLocation.value.longitude.toString(),
    shipping_lat: deliverLocation.value.latitude.toString(),
    shipping_province: deliverLocation.value.address,
    shipping_city: deliverLocation.value.address,
    shipping_area: deliverLocation.value.address,
    shipping_addr: deliverLocation.value.address,
    images: imageList.value.join(','),
    sale_id: inviteCode.value,
  })

  const res = await userRegisterAPI({
    username: contactPerson.value,
    password: pwd.value,
    mobile: phone.value,
    code: smsCode.value,
    type_id: buyType.value,
    sub_account_level: '1',
    company_lon: companyLocation.value.longitude.toString(),
    company_lat: companyLocation.value.latitude.toString(),
    company_province: companyLocation.value.address,
    compnay_city: companyLocation.value.address,
    company_area: companyLocation.value.address,
    company_addr: companyLocation.value.address,
    company: company.value,
    shipping_lon: deliverLocation.value.longitude.toString(),
    shipping_lat: deliverLocation.value.latitude.toString(),
    shipping_province: deliverLocation.value.address,
    shipping_city: deliverLocation.value.address,
    shipping_area: deliverLocation.value.address,
    shipping_addr: deliverLocation.value.address,
    images: imageList.value.join(','),
    sale_id: inviteCode.value,
  })
  uni.navigateTo({ url: '/pages/login/login' })

  console.log('res======', res)
}

const goToNext = async () => {
  if (query.type === 'register') {
    page.value++
  }
  if (query.type === 'findPwd') {
    // 找回密码逻辑
    await formRef.value?.validate?.()
    const res = await resetPwdAPI({
      mobile: phone.value,
      newpassword: pwd.value,
      captcha: smsCode.value,
    })
    uni.showToast({ icon: 'success', title: '修改成功' })
    setTimeout(() => {
      uni.navigateBack()
    }, 6000)
  }
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
  <view class="viewport">
    <!-- 导航栏 -->
    <view class="title" :style="{ paddingTop: safeAreaInsets?.top + 'px' }">
      <text @tap="goback" class="ftysIcon icon-xiangzuojiantou"></text>
      <view class="text">{{
        type === 'register' ? '注册账号' : type === 'resetPwd' ? '重置密码' : '找回密码'
      }}</view>
    </view>
    <!-- 表单 -->
    <view class="container">
      <uni-forms
        class="form"
        ref="formRef"
        :rules="type === 'register' ? rules : findPwdrules"
        :modelValue="type === 'register' ? form : findPwdForm"
      >
        <!-- 第一页表单内容 -->
        <view v-show="page === 0" class="form-content">
          <uni-forms-item class="form-item" name="phone">
            <text class="label">手机号码</text>
            <input type="tel" v-model="phone" class="input" placeholder="请输入手机号码" />
          </uni-forms-item>
          <uni-forms-item class="form-item" name="imgCode">
            <text class="label">图片验证码</text>
            <input type="text" v-model="imgCode" class="input" placeholder="请输入图片验证码" />
          </uni-forms-item>
          <uni-forms-item class="form-item" name="smsCode">
            <text class="label">手机验证码</text>
            <input type="tel" v-model="smsCode" class="input" placeholder="请输入手机验证码" />
            <view @tap="onGetSmsTap" class="getcode-btn" :class="checked ? 'checked' : ''">{{
              checked ? `获取中(${countDown})` : '获取验证码'
            }}</view>
          </uni-forms-item>
          <uni-forms-item class="form-item" name="pwd">
            <text class="label">账号密码</text>
            <input
              v-model="pwd"
              class="input"
              type="text"
              :password="showPassword"
              placeholder="请输入密码"
            />
            <icon type="warn" @tap="changePassword" />
            <!-- <text class="uni-icon" :class="[!showPassword ? 'uni-eye-active' : '']"
						@click="changePassword">&#xe568;</text> -->
          </uni-forms-item>
          <uni-forms-item class="form-item" v-if="type === 'register'">
            <text class="label">采购类型</text>
            <radio-group class="radio-group" @change="onTypeChange">
              <label class="radio">
                <radio value="3" color="#27ba9b" :checked="buyType === '3'" />
                生鲜
              </label>
              <label class="radio">
                <radio value="4" color="#27ba9b" :checked="buyType === '4'" />
                干货
              </label>
            </radio-group>
          </uni-forms-item>
        </view>
        <!-- 下一步按钮 -->
        <button v-show="page === 0" @tap="goToNext" class="form-button">
          {{ type === 'register' ? '下一步' : '确定' }}
        </button>
        <!-- 第二页表单内容 -->
        <view v-show="page === 1" class="form-content">
          <uni-forms-item class="form-item" name="contactPerson">
            <text class="label">联系人</text>
            <input type="text" v-model="contactPerson" class="input" placeholder="请输入联系人" />
          </uni-forms-item>
          <uni-forms-item class="form-item" name="company">
            <text class="label">公司名称</text>
            <input type="tel" v-model="company" class="input" placeholder="请输入公司名称" />
          </uni-forms-item>
          <uni-forms-item
            name="companyLocationStr"
            class="form-item"
            @tap="($event) => chooseAddress('company')"
          >
            <text class="label">地址定位</text>
            <text class="content">{{
              companyLocation!.address ? companyLocation!.address : '请点击右边图标选择定位'
            }}</text>
          </uni-forms-item>
          <uni-forms-item
            name="deliverLocationStr"
            class="form-item"
            @tap="($event) => chooseAddress('deliver')"
          >
            <text class="label">送货地址</text>
            <text class="content">{{
              deliverLocation!.address ? deliverLocation!.address : '请点击右边图标选择定位'
            }}</text>
          </uni-forms-item>
          <uni-forms-item class="form-item" name="detailLocation">
            <text class="label">详细地址</text>
            <input
              type="text"
              v-model="detailLocation"
              class="input"
              placeholder="请输入详细地址"
            />
          </uni-forms-item>
          <uni-forms-item class="form-item" name="inviteCode">
            <text class="label">邀请码</text>
            <input type="text" v-model="inviteCode" class="input" placeholder="请输入邀请码" />
          </uni-forms-item>
          <uni-forms-item class="form-item" name="images">
            <!-- <text class="label">营业执照或门头照</text> -->
            <!-- <view @tap="onAvatarChange" class="choose-img"></view> -->
            <uni-file-picker
              @delete="onDelete"
              @select="onSelect"
              class="choose-img"
              limit="3"
              :title="`营业执照或门头照`"
            ></uni-file-picker>
          </uni-forms-item>
        </view>
        <!-- 注册按钮 -->
        <view class="bottom-btns" v-show="page === 1">
          <button @tap="page--" class="form-button">上一步</button>
          <button @tap="onSubmit" class="form-button">提交</button>
          <!-- <u-button type="primary" text="确定"></u-button>
        <u-button type="primary" :plain="true" text="镂空"></u-button> -->
        </view>
      </uni-forms>
    </view>
  </view>
</template>

<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
  background-color: #f7f7f8;
}

.viewport {
  // display: flex;
  // flex-direction: column;
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
  }
}

.choose-img {
  height: 180rpx;
  width: 180rpx;
  border-radius: 5px;
  background: rgba(229, 229, 229, 1);
  margin-top: 20rpx;
}

// 导航栏
.navbar {
  position: relative;

  .title {
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    color: #fff;
  }

  .back {
    position: absolute;
    height: 40px;
    width: 40px;
    left: 0;
    font-size: 20px;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

input {
  text-align: right;
}

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

// 头像
.avatar {
  text-align: center;
  width: 100%;
  height: 260rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .image {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    background-color: #eee;
  }

  .text {
    display: block;
    padding-top: 20rpx;
    line-height: 1;
    font-size: 26rpx;
    color: #fff;
  }
}

.form-content {
  height: 100%;
  margin: 20rpx 20rpx 0;
  padding: 0 20rpx;
  border-radius: 10rpx;
  background-color: #fff;

  .form-item,
  .uni-forms-item {
    display: flex;
    align-items: center;
    min-height: 96rpx;
    padding: 10rpx 10rpx;
    background-color: #fff;
    font-size: 28rpx;
    border-bottom: 1rpx solid #ddd;
    position: relative;
    margin-bottom: 0;

    // 调整 uni-forms 样式
    .uni-forms-item__content {
      display: flex;

      .content {
        flex: 1;
        text-align: right;
        color: #999999;
      }
    }

    .uni-forms-item__error {
      // margin-left: 200rpx;
      padding-top: 0;
    }

    &:last-child {
      border: none;
    }

    .label {
      width: 200rpx;
      color: #333;
    }

    .input {
      flex: 1;
      display: block;
      height: 46rpx;
    }

    .switch {
      position: absolute;
      right: -20rpx;
      transform: scale(0.8);
    }

    .picker {
      flex: 1;
    }

    .placeholder {
      color: #808080;
    }
  }
}

// 表单
.form {
  background-color: #f4f4f4;

  &-content {
    margin: 20rpx 20rpx 0;
    padding: 0 20rpx;
    border-radius: 10rpx;
    background-color: #fff;
  }

  &-item {
    display: flex;
    min-height: 96rpx;
    line-height: 46rpx;
    padding: 25rpx 10rpx;
    background-color: #fff;
    font-size: 28rpx;
    border-bottom: 1rpx solid #ddd;

    .content {
      flex: 1;
      text-align: right;
      color: #666666;
    }

    &:last-child {
      border: none !important;
    }

    .label {
      min-width: 180rpx;
      color: #333;
    }

    .account {
      color: #666;
    }

    .input {
      flex: 1;
      display: block;
      height: 46rpx;
    }

    .radio {
      margin-right: 20rpx;
    }

    .picker {
      flex: 1;
    }

    .placeholder {
      color: #808080;
    }
  }

  &-button {
    height: 80rpx;
    text-align: center;
    line-height: 80rpx;
    margin: 30rpx 20rpx;
    color: #fff;
    border-radius: 80rpx;
    font-size: 30rpx;
    background-color: rgba(255, 95, 77, 1);
  }
}

.radio-group {
  flex: 1;
  text-align: right;
}

.bottom-btns {
  display: flex;
  justify-content: center;

  .form-button {
    width: 300rpx;
  }
}
</style>
