<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import { getMyGoodsApplyAPI, type GetMyGoodsApplyItem } from '@/services/goods'
import { getMySuggestAPI } from '@/services/my'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import type { PageParams } from '@/types/global'
import type { MySuggestItem } from '@/types/my'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

const isDetail = ref('')
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
const myGoodsApply = ref<GetMyGoodsApplyItem[]>([])
const getMyGoodsApplyData = async () => {
  // 退出判断
  if (isFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getMyGoodsApplyAPI({ ...pageParams })
  // 分页数据增加
  myGoodsApply.value.push(...res.result.list)
  if (pageParams.page < res.result.total) {
    // 页码累加
    pageParams.page++
  } else {
    isFinish.value = true
  }
}

onLoad(() => {
  getMyGoodsApplyData()
})
const addFeedback = () => {
  uni.navigateTo({ url: '/pagesMember/addfeedback/addfeedback' })
}
const goToDetail = (item: GetMyGoodsApplyItem) => {
  uni.navigateTo({
    url: '/pagesMember/newproductdemand/newproductdemanddetail',
    success: (res) => {
      uni.$emit('detail', { currentInfo: item })
    },
  })
}

const goback = () => {
  uni.navigateBack()
}
const addNewProduct = () => {
  uni.navigateTo({ url: '/pagesMember/newproductdemand/addnewproductdemand' })
}
</script>

<template>
  <scroll-view @scrolltolower="getMyGoodsApplyData" class="viewport" scroll-y enable-back-to-top>
    <view class="title" :style="{ paddingTop: height + top + 'px' }">
      <text @tap="goback" class="ftysIcon icon-xiangzuojiantou"></text>
      <text class="text">新品需求</text>
      <view @tap="addNewProduct" class="add-feedback">新增需求</view>
    </view>
    <view class="container">
      <view v-for="item in myGoodsApply" :key="item.id" class="feedback-item">
        <view class="left">
          <view class="left-title">{{ item.goods_name }}</view>
          <view class="time">
            <view class="detail-time">{{ item.create_time }}</view>
            <view class="status">{{ item.status === '1' ? '待处理' : '已处理' }}</view>
          </view>
        </view>
        <view class="right" @tap="($event) => goToDetail(item)"> 详情>> </view>
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
      display: flex;
      height: 120rpx;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(242, 244, 247, 1);
      margin-top: 30rpx;

      .left {
        display: flex;
        flex-direction: column;

        .time {
          display: flex;
          margin: 20rpx 0;
          font-size: 28rpx;

          .detail-time {
            color: #afb0b2;
            margin-right: 30rpx;
          }
        }
      }

      .right {
        color: #ff941a;
      }
    }

    .feedback-item:nth-last-child(1) {
      border-bottom: none;
    }
  }
}
</style>
