<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import { getMySuggestAPI, getSubAccountAPI, type SubAccountItem } from '@/services/my'
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
// 获取意见反馈列表
const subaccountList = ref<SubAccountItem[]>([])
const getSubAccountListData = async () => {
  // 退出判断
  if (isFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getSubAccountAPI({ ...pageParams })

  subaccountList.value.push(...res.result.list)
  if (pageParams.page < res.result.total) {
    // 页码累加
    pageParams.page++
  } else {
    isFinish.value = true
  }
}

onLoad(() => {
  getSubAccountListData()
})
const addSubAccount = () => {
  uni.navigateTo({ url: '/pagesMember/subaccount/addaccount' })
}
const goback = () => {
  uni.navigateBack()
}
</script>

<template>
  <scroll-view @scrolltolower="getSubAccountListData" class="viewport" scroll-y enable-back-to-top>
    <view class="title" :style="{ paddingTop: safeAreaInsets!.top + 'px' }">
      <text @tap="goback" class="ftysIcon icon-xiangzuojiantou"></text>
      <text class="text">子账号</text>
      <view @tap="addSubAccount" class="add-feedback">新增</view>
    </view>
    <view class="container">
      <view class="item" v-for="item in subaccountList" :key="item.userId">
        <view class="left">
          <view class="top">{{ item.sub_account_name || '联系人' }}</view>
          <view class="bottom">
            <text class="contact">{{ item.username }}</text>
            <text>{{ item.mobile }}</text>
          </view>
        </view>
        <view class="right">
          <text class="ftysIcon icon-xiugaioryijian" />
          <text class="ftysIcon icon-shanchu" />
        </view>
      </view>
      <view v-if="subaccountList.length === 0" class="bg">
        <image
          src="https://img.js.design/assets/img/66909fda4fc21e83fb682df4.png#52a35c0ee65bdb8ba63bcefcce2ce6e6"
          mode="aspectFit"
        />
        <text>暂无内容</text>
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

    .item {
      display: flex;
      height: 150rpx;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f2f4f7;

      .left {
        display: flex;
        flex-direction: column;

        .bottom {
          color: rgba(175, 176, 178, 1);
          margin-top: 20rpx;

          .contact {
            margin-right: 50rpx;
          }
        }
      }

      .right {
        display: flex;
        height: 100%;
        width: 180rpx;
        align-items: center;
        justify-content: space-around;
        font-size: 40rpx;
      }
    }

    .bg {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      color: rgba(175, 177, 178, 1);

      image {
        height: 500rpx;
        width: 500rpx;
      }
    }
  }
}
</style>
