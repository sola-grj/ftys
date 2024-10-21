<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import { addSuggestAPI, getMySuggestAPI } from '@/services/my'
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
// 注册表单数据
const form = ref({
  title,
  content,
  images: '',
})

// 注册定义校验规则
const rules: UniHelper.UniFormsRules = {
  title: {
    rules: [{ required: true, errorMessage: '请描述您的内容标题' }],
  },
  content: {
    rules: [{ required: true, errorMessage: '请输入问题反馈' }],
  },
}
const onSave = async () => {
  await addSuggestAPI({
    title: title.value,
    content: content.value,
    images: imageUrlList.value.length > 0 ? imageUrlList.value.join(',') : '',
  })
  uni.navigateTo({ url: '/pagesMember/feedback/feedback' })
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

const makePhoneCall = (phoneNumber: string) => {
  uni.makePhoneCall({
    phoneNumber, //仅为示例
  })
}
</script>

<template>
  <scroll-view class="viewport" scroll-y enable-back-to-top>
    <SolaShopHeader title="联系客服" />
    <view class="container">
      <image class="image" src="@/static/images/customer.png" />
      <view class="item" @tap="($event) => makePhoneCall('13455556666')">
        <text class="ftysIcon icon-dianhua">13455556666</text>
      </view>
      <view class="item" @tap="($event) => makePhoneCall('13455556666')">
        <text class="ftysIcon icon-dianhua">13455556666</text>
      </view>
      <view class="item">
        <text class="ftysIcon icon-weixin">13455556666</text>
      </view>
      <view class="item">
        <text class="ftysIcon icon-weixin">13455556666</text>
      </view>
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

  .container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    overflow: scroll;
    padding: 30rpx;

    .image {
      height: 400rpx;
    }

    .item {
      width: 300rpx;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      background: linear-gradient(90deg, rgba(255, 112, 77, 1) 0%, rgba(255, 95, 77, 1) 100%);
      border-radius: 20rpx;
      margin-top: 30rpx;
      color: #fff;
    }
  }
}
</style>
