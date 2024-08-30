<script setup lang="ts">
import { updateUserInfoAPI } from '@/services/my'
import { getMemberProfileAPI, putMemberProfileAPI } from '@/services/profile'
import { useMemberStore } from '@/stores'
import type { Gender, LoginResult, ProfileDetail } from '@/types/member'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
// 表单更新数据

const memberStore = useMemberStore()
const form = ref({
  mobile: memberStore.profile?.userinfo.mobile,
  username: memberStore.profile?.userinfo.username,
  company: memberStore.profile?.userinfo.company,
  shipping_addr: memberStore.profile?.userinfo.shipping_addr,
  deliverLocationStr: '',
  images: '',
})
type Location = {
  address: string
  name: string
  latitude: number
  longitude: number
}
const deliverLocation = ref<Location>({
  address: '',
  name: '',
  latitude: 0,
  longitude: 0,
})
const imageList = ref([])
// 选择位置
const chooseAddress = (type: string) => {
  uni.chooseLocation({
    success: function (res) {
      console.log('位置名称：' + res.name)
      console.log('详细地址：' + res.address)
      console.log('纬度：' + res.latitude)
      console.log('经度：' + res.longitude)
      deliverLocation.value = {
        address: res.address,
        name: res.name,
        latitude: res.latitude,
        longitude: res.longitude,
      }
      form.value.deliverLocationStr = res.address
    },
  })
}
// 点击保存
const onSubmit = async () => {
  const images: any = []
  if (imageList.value.length > 0) {
    imageList.value.forEach((item: any) => {
      images.push(item.url)
    })
  }

  const res = await updateUserInfoAPI({
    mobile: form.value.mobile,
    username: form.value.username,
    company: form.value.company,
    shipping_lon: deliverLocation.value.longitude.toString() || 'xxx',
    shipping_lat: deliverLocation.value.latitude.toString() || 'xxx',
    shipping_province: deliverLocation.value.address || 'xxx',
    shipping_city: deliverLocation.value.address || 'xxx',
    shipping_area: deliverLocation.value.address || 'xxx',
    shipping_addr: deliverLocation.value.address || 'xxx',
    images: images.join(','),
  })
  if (res.code === '1') {
    // 更新store中的昵称
    memberStore.profile!.userinfo.username = res.result.username
    memberStore.profile!.userinfo.mobile = res.result.mobile
    memberStore.profile!.userinfo.shipping_addr = res.result.shipping_addr
    memberStore.profile!.userinfo.company = res.result.company
    uni.showToast({ icon: 'success', title: '保存成功' })
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/my/my' })
    }, 300)
  } else {
    uni.showToast({ icon: 'error', title: res.msg })
  }
}
const onDelete = (event: any) => {
  console.log(event)
  // @ts-ignore
  imageList.value = [...imageList.value.filter((item) => item.uuid !== event.tempFile.uuid)]
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
      form.value.images = data!.result.url
    },
  })
}
</script>

<template>
  <view class="viewport">
    <!-- 导航栏 -->
    <view class="navbar" :style="{ paddingTop: safeAreaInsets?.top + 'px' }">
      <navigator
        open-type="navigateBack"
        class="back ftysIcon icon-xiangzuojiantou"
        hover-class="none"
      ></navigator>
      <view class="title">个人信息</view>
    </view>
    <!-- 头像 -->
    <view class="avatar">
      <view class="avatar-content">
        <image class="image" :src="memberStore.profile?.userinfo.avatar" mode="aspectFill" />
      </view>
    </view>
    <view class="form">
      <!-- 表单内容 -->
      <view class="form-content">
        <uni-forms>
          <uni-forms-item class="form-item" name="mobile">
            <text class="label">电话</text>
            <input type="text" v-model="form.mobile" class="input" placeholder="请输入电话" />
          </uni-forms-item>
          <uni-forms-item class="form-item" name="username">
            <text class="label">姓名</text>
            <input type="text" v-model="form.username" class="input" placeholder="请输入姓名" />
          </uni-forms-item>
          <uni-forms-item class="form-item" name="company">
            <text class="label">公司名称</text>
            <input type="tel" v-model="form.company" class="input" placeholder="请输入公司名称" />
          </uni-forms-item>

          <uni-forms-item
            name="deliverLocationStr"
            class="form-item"
            @tap="($event) => chooseAddress('deliver')"
          >
            <text class="label">送货地址</text>
            <text class="content">{{
              form.shipping_addr ? form.shipping_addr : '请点击右边图标选择定位'
            }}</text>
          </uni-forms-item>
          <uni-forms-item class="form-item" name="images">
            <uni-file-picker
              @delete="onDelete"
              @select="onSelect"
              class="choose-img"
              limit="3"
              :title="`营业执照或门头照`"
            ></uni-file-picker>
          </uni-forms-item>
        </uni-forms>
      </view>
      <!-- 提交按钮 -->
      <button @tap="onSubmit" class="form-button">保 存</button>
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

  .uni-forms-item__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1rpx solid rgba(242, 244, 247, 1);

    input {
      text-align: right;
    }

    .content {
      flex: 1;
      text-align: right;
      color: #999999;
    }
  }

  &-content {
    margin: 20rpx 20rpx 0;
    padding: 20rpx;
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
