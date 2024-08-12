<script setup lang="ts">
import { getSmsAPI } from '@/services/login'
import { getMemberProfileAPI, putMemberProfileAPI } from '@/services/profile'
import { useMemberStore } from '@/stores'
import type { Gender, ProfileDetail } from '@/types/member'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

// 第一页
const page = ref(0)

// 表单数据
// 第一页数据
const phone = ref('')
const imgCode = ref('')
const smsCode = ref('')
const pwd = ref('')
const buyType = ref('sx') // sx生鲜 gh干货
const showPassword = ref(false)

const changePassword = () => (showPassword.value = !showPassword.value)

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

// 获取个人信息接口
const profile = ref<ProfileDetail>({} as ProfileDetail)
const getMemberProfileData = async () => {
  const res = await getMemberProfileAPI()
  profile.value = res.result
}
const memberStore = useMemberStore()
// 修改头像
const onAvatarChange = () => {
  // 调用拍照
  uni.chooseMedia({
    // 文件个数
    count: 1,
    // 文件类型
    mediaType: ['image'],
    success: (res) => {
      console.log(res)
      // 本地路径
      const { tempFilePath } = res.tempFiles[0]
      // 文件上传
      uni.uploadFile({
        url: '/member/profile/avatar',
        name: 'file',
        filePath: tempFilePath,
        success: (res) => {
          if (res.statusCode === 200) {
            const avatar = JSON.parse(res.data).result.avatar
            // 非空断言 个人信息数据更新
            profile.value!.avatar = avatar
            // store头像更新
            memberStore.profile!.avatar = avatar
            uni.showToast({ icon: 'success', title: '更新成功' })
          } else {
            uni.showToast({ icon: 'error', title: '更新失败' })
          }
        },
      })
    },
  })
}

onLoad(() => {
  getMemberProfileData()
})

// 修改性别
const onGenderChange: UniHelper.RadioGroupOnChange = (ev) => {
  profile.value.gender = ev.detail.value as Gender
}

// 修改生日
const onBirthdayChange: UniHelper.DatePickerOnChange = (ev) => {
  profile.value.birthday = ev.detail.value
}

// 修改城市
let fullLocationCode: [string, string, string] = ['', '', '']
const onFullLocationChange: UniHelper.RegionPickerOnChange = (ev) => {
  profile.value.fullLocation = ev.detail.value.join(' ')
  // 提交后端更新用的
  fullLocationCode = ev.detail.code!
}

// 点击保存
const onSubmit = async () => {
  const res = await putMemberProfileAPI({
    nickname: profile.value?.nickname,
    gender: profile.value?.gender,
    birthday: profile.value?.birthday,
    provinceCode: fullLocationCode[0],
    cityCode: fullLocationCode[1],
    countyCode: fullLocationCode[2],
    profession: profile.value?.profession,
  })
  // 更新store中的昵称
  memberStore.profile!.nickname = res.result.nickname
  uni.showToast({ icon: 'success', title: '保存成功' })
  setTimeout(() => {
    uni.navigateBack()
  }, 300)
}
</script>

<template>
  <view class="viewport">
    <!-- 导航栏 -->
    <view class="navbar" :style="{ paddingTop: safeAreaInsets?.top + 'px' }">
      <navigator open-type="navigateBack" class="back icon-left" hover-class="none"></navigator>
      <view class="title">注册账号</view>
    </view>
    <!-- 表单 -->
    <view class="form">
      <!-- 第一页表单内容 -->
      <view v-if="page === 0" class="form-content">
        <view class="form-item">
          <text class="label">手机号码</text>
          <input type="tel" v-model="phone" class="input" placeholder="请输入手机号码" />
        </view>
        <view class="form-item">
          <text class="label">图片验证码</text>
          <input type="tel" v-model="imgCode" class="input" placeholder="请输入图片验证码" />
        </view>
        <view class="form-item">
          <text class="label">手机验证码</text>
          <input type="tel" v-model="smsCode" class="input" placeholder="请输入手机验证码" />
          <view @tap="onGetSmsTap" class="getcode-btn" :class="checked ? 'checked' : ''">{{
            checked ? `获取中(${countDown})` : '获取验证码'
          }}</view>
        </view>
        <view class="form-item">
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
        </view>
        <view class="form-item">
          <text class="label">采购类型</text>
          <radio-group @change="onGenderChange">
            <label class="radio">
              <radio value="生鲜" color="#27ba9b" :checked="buyType === 'sx'" />
              生鲜
            </label>
            <label class="radio">
              <radio value="干货" color="#27ba9b" :checked="buyType === 'gh'" />
              干货
            </label>
          </radio-group>
        </view>
      </view>
      <!-- 下一步按钮 -->
      <button v-if="page === 0" @tap="page++" class="form-button">下一步</button>
      <!-- 第二页表单内容 -->
      <view v-if="page === 1" class="form-content">
        <view class="form-item">
          <text class="label">联系人</text>
          <text class="account">{{ profile?.account }}</text>
        </view>
        <view class="form-item">
          <text class="label">公司名称</text>
          <text class="account">{{ profile?.account }}</text>
        </view>
        <view class="form-item">
          <text class="label">地址定位</text>
          <text class="account">{{ profile?.account }}</text>
        </view>
        <view class="form-item">
          <text class="label">送货地址</text>
          <text class="account">{{ profile?.account }}</text>
        </view>
        <view class="form-item">
          <text class="label">详细地址</text>
          <text class="account">{{ profile?.account }}</text>
        </view>
        <view class="form-item">
          <text class="label">邀请码</text>
          <text class="account">{{ profile?.account }}</text>
        </view>
        <view class="form-item">
          <text class="label">营业执照或门头照</text>
          <text class="account">{{ profile?.account }}</text>
        </view>
      </view>
      <!-- 注册按钮 -->
      <view v-if="page === 1">
        <button @tap="page--" class="form-button">上一步</button>
        <button @tap="page++" class="form-button">提交</button>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
page {
  background-color: #f4f4f4;
}

.viewport {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/order_bg.png);
  background-size: auto 420rpx;
  background-repeat: no-repeat;
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
    height: 96rpx;
    line-height: 46rpx;
    padding: 25rpx 10rpx;
    background-color: #fff;
    font-size: 28rpx;
    border-bottom: 1rpx solid #ddd;

    &:last-child {
      border: none;
    }

    .label {
      width: 180rpx;
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
    background-color: #27ba9b;
  }
}
</style>
