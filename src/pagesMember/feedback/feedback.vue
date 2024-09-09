<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import { getMySuggestAPI } from '@/services/my'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import type { PageParams } from '@/types/global'
import type { MySuggestItem } from '@/types/my'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
// 推荐分页参数
const pageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
const isFinish = ref(false)
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const { top, height } = uni.getMenuButtonBoundingClientRect()
// 获取意见反馈列表
const suggestList = ref<MySuggestItem[]>([])
const getSuggestListData = async () => {
  // 退出判断
  if (isFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getMySuggestAPI({ ...pageParams })
  suggestList.value.push(...res.result.list)
  if (pageParams.page < res.result.total) {
    // 页码累加
    pageParams.page++
  } else {
    isFinish.value = true
  }
}

onLoad(() => {
  getSuggestListData()
})
const addFeedback = () => {
  uni.navigateTo({ url: '/pagesMember/addfeedback/addfeedback' })
}
const goback = () => {
  uni.navigateBack()
}
</script>

<template>
  <scroll-view @scrolltolower="getSuggestListData" class="viewport" scroll-y enable-back-to-top>
    <view class="title" :style="{ paddingTop: height + top + 'px' }">
      <text @tap="goback" class="ftysIcon icon-xiangzuojiantou"></text>
      <text class="text">意见反馈</text>
      <view @tap="addFeedback" class="add-feedback">新增反馈</view>
    </view>
    <view class="container">
      <view v-for="item in suggestList" :key="item.id" class="feedback-item">
        <view class="f-title">
          <text class="f-text">{{ item.title }}</text>
          <text class="f-time">{{ item.create_time }}</text>
        </view>
        <view class="content">{{ item.content }}</view>
        <view class="images-container" v-if="item.images">
          <image
            class="images"
            :key="img"
            v-for="img in item.images.split(',')"
            :src="'//img.js.design/assets/img/6690dc2515275e6eaeb2e9ab.png#65ae707b4e6dae0ff083f534f478cc2a'"
          />
        </view>
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

  .title {
    position: relative;
    text-align: center;
    color: #fff;
    width: 100%;
    height: 186rpx;

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

    .add-feedback {
      width: 160rpx;
      font-size: 28rpx;
      height: 40rpx;
      text-align: center;
      line-height: 40rpx;
      position: absolute;
      right: 20rpx;
      bottom: 20rpx;
      border-radius: 20rpx;
      background: linear-gradient(90deg, rgba(255, 112, 77, 1) 0%, rgba(255, 95, 77, 1) 100%);
    }
  }

  .container {
    height: 100%;
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    overflow: scroll;
    padding: 30rpx;

    .feedback-item {
      padding: 14rpx;
      border-bottom: 1px solid #f2f4f7;

      .f-title {
        .f-text {
        }

        .f-time {
          margin-left: 15rpx;
          color: #999;
        }
      }

      .content {
        min-height: 300rpx;
        color: #999;
        margin-top: 10rpx;
      }

      .images-container {
        .images {
          width: 120rpx;
          height: 120rpx;
          margin: 10rpx;
        }
      }
    }
  }
}
</style>
