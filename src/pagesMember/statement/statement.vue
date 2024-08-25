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

const onTimeChange = (e: string[]) => {
  startTime.value = e[0]
  endTime.value = e[1]
  console.log(e)
}
const onReconciliationChange = (e: any) => {
  console.log(e.detail.value)
  // @ts-ignore
  reconciliationStatus.value = reconciliation.value[0][e.detail.value[0]]
}
const onSettlementChange = (e: any) => {
  // @ts-ignore
  settlementStatus.value = settlement.value[0][e.detail.value[0]]
}
const startTime = ref('')
const endTime = ref('')
const reconciliationStatus = ref('全部')
const settlementStatus = ref('全部')

const reconciliation = ref([['全部', '未对账', '已对账']])
const settlement = ref([['全部', '未结算', '已结算']])

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
      <text class="text">导出对账单</text>
    </view>
    <view class="container form-content">
      <uni-forms class="form" ref="formRef" :rules="rules" :modelValue="form">
        <uni-forms-item class="form-item" name="title">
          <text class="label">*按发货日期</text>
          <uni-datetime-picker type="daterange" @change="onTimeChange" />
        </uni-forms-item>
        <uni-forms-item class="form-item" name="title">
          <text class="label">*对账状态</text>
          <view class="value">
            <picker mode="multiSelector" :range="reconciliation" @change="onReconciliationChange"
              >{{ reconciliationStatus }}
            </picker>
          </view>
        </uni-forms-item>
        <uni-forms-item class="form-item" name="content">
          <text class="label">*结算状态</text>
          <view class="value">
            <picker mode="multiSelector" :range="settlement" @change="onSettlementChange">{{
              settlementStatus
            }}</picker>
          </view>
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

::v-deep .uni-date-editor {
  display: flex;
  justify-content: flex-end;

  .uni-date-x--border {
    width: 450rpx;
    border: none !important;
  }
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

    .uni-forms-item {
      .uni-forms-item__content {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #f2f4f7;

        .label {
          width: 200rpx;
        }

        .value {
          flex: 1;
          display: flex;
          justify-content: flex-end;
          padding-right: 40rpx;
        }

        .input {
          flex: 1;
          text-align: right;
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
