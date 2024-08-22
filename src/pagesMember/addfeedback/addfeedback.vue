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
</script>

<template>
  <scroll-view class="viewport" scroll-y enable-back-to-top>
    <view class="title" :style="{ paddingTop: safeAreaInsets!.top + 'px' }">
      <text @tap="goback" class="ftysIcon icon-xiangzuojiantou"></text>
      <text class="text">新增反馈</text>
    </view>
    <view class="container form-content">
      <uni-forms class="form" ref="formRef" :rules="rules" :modelValue="form">
        <uni-forms-item class="form-item" name="title">
          <text class="label">*标题</text>
          <input type="tel" v-model="title" class="input" placeholder="请描述您的内容标题" />
        </uni-forms-item>
        <uni-forms-item class="form-item" name="content">
          <text class="label">*问题反馈</text>
          <uni-easyinput class="question" type="textarea" v-model="content"></uni-easyinput>
        </uni-forms-item>
        <uni-forms-item class="form-item" name="images">
          <!-- <text class="label">营业执照或门头照</text> -->
          <!-- <view @tap="onAvatarChange" class="choose-img"></view> -->
          <uni-file-picker
            @delete="onDelete"
            @select="onSelect"
            class="choose-img"
            limit="3"
            :title="`问题截图`"
          ></uni-file-picker>
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

    .uni-forms-item:first-child {
      .uni-forms-item__content {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #f2f4f7;

        .input {
          flex: 1;
          text-align: right;
        }
      }
    }

    .uni-forms-item:nth-child(2) {
      .uni-forms-item__content {
        border-bottom: 1px solid #f2f4f7;
        padding-bottom: 20rpx;

        .uni-easyinput {
          margin-top: 10rpx;
        }
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
