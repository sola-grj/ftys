<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import { getMySuggestAPI } from '@/services/my'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import type { PageParams } from '@/types/global'
import type { MySuggestItem } from '@/types/my'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

const amount = ref('')
const activeIndex = ref('100')
// 推荐分页参数
const pageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
const isFinish = ref(false)
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
// 获取意见反馈列表
const suggestList = ref<MySuggestItem[]>([])
const getSuggestListData = async () => {
  // 退出判断
  if (isFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getMySuggestAPI({ ...pageParams })
  // 分页数据增加
  // suggestList.value.push(...res.result.list)
  const mockList = [
    {
      id: '1',
      user_id: '1',
      title: '标题',
      content: '建议内容',
      images: '1,2,3,4,5,6,7,8',
      status: '1',
      create_time: '2024-08-04 23:52:54',
      update_time: 'null',
    },
    {
      id: '2',
      user_id: '1',
      title: '标题2',
      content: '建议内容',
      images: '1,2,3,4,5,6,7,8',
      status: '1',
      create_time: '2024-08-04 23:52:54',
      update_time: 'null',
    },
    {
      id: '3',
      user_id: '1',
      title: '标题3',
      content: '建议内容',
      images: '1,2,3,4,5,6,7,8',
      status: '1',
      create_time: '2024-08-04 23:52:54',
      update_time: 'null',
    },
  ]
  // suggestList.value.push(...res.result.list)
  suggestList.value.push(...mockList)
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
const onChangeIndex = (index: string) => {
  if (index !== 'define') {
    amount.value = index
  }
  activeIndex.value = index
}
const goToRecharge = () => {}
const goToAccountDetail = () => {
  uni.navigateTo({ url: '/pagesMember/capital/capital' })
}
const goback = () => {
  uni.navigateBack()
}
</script>

<template>
  <scroll-view @scrolltolower="getSuggestListData" class="viewport" scroll-y enable-back-to-top>
    <view class="title" :style="{ paddingTop: safeAreaInsets!.top + 'px' }">
      <text @tap="goback" class="ftysIcon icon-xiangzuojiantou"></text>
      <text class="text">客户余额</text>
    </view>
    <view class="container">
      <view class="image">
        <view class="left">余额 ￥<text class="money">1233333</text> </view>
        <view class="detail" @tap="goToAccountDetail">查看明细>> </view>
      </view>
      <view class="recharge-container">
        <view class="recharge-title">
          <text class="text">在线充值</text>
        </view>
        <view class="choose">
          <view
            @tap="($event) => onChangeIndex('100')"
            :class="activeIndex === '100' ? 'selected' : ''"
            class="item"
            >￥100</view
          >
          <view
            @tap="($event) => onChangeIndex('300')"
            :class="activeIndex === '300' ? 'selected' : ''"
            class="item"
            >￥300</view
          >
          <view
            @tap="($event) => onChangeIndex('500')"
            :class="activeIndex === '500' ? 'selected' : ''"
            class="item"
            >￥500</view
          >
          <view
            @tap="($event) => onChangeIndex('800')"
            :class="activeIndex === '800' ? 'selected' : ''"
            class="item"
            >￥800</view
          >
          <view
            @tap="($event) => onChangeIndex('1000')"
            :class="activeIndex === '1000' ? 'selected' : ''"
            class="item"
            >￥1000</view
          >
          <view
            @tap="($event) => onChangeIndex('define')"
            :class="activeIndex === 'define' ? 'selected' : ''"
            class="item"
            >自定义</view
          >
        </view>
        <view class="define" v-if="activeIndex === 'define'">
          <text>自定义金额</text>
          <uni-easyinput v-model="amount" type="text" />
        </view>
      </view>
      <view class="btn" @tap="goToRecharge">立即充值</view>
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

    .image {
      height: 220rpx;
      width: 100%;
      background-image: url('@/static/images/money.png');
      background-size: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      padding: 20rpx 20rpx 20rpx 40rpx;

      .left {
        font-size: 28rpx;
        color: #fff;

        .money {
          margin-left: 20rpx;
        }
      }

      .detail {
        font-size: 24rpx;
      }
    }

    .recharge-container {
      margin-top: 30rpx;

      .recharge-title {
        position: relative;
        font-weight: bold;
        border-bottom: none;
        height: 20rpx;
        background: linear-gradient(
          96.62deg,
          rgba(255, 116, 88, 1) 0%,
          rgba(255, 137, 114, 0) 100%
        );

        .total {
          position: absolute;
          left: 0;
          bottom: 0;
        }

        .text {
          position: absolute;
          bottom: 0;
          left: 0;
        }
      }

      .choose {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;

        .item {
          position: relative;
          width: 200rpx;
          height: 100rpx;
          line-height: 100rpx;
          text-align: center;
          margin-top: 20rpx;
          border-radius: 20rpx;
          border: 1px solid rgba(39, 178, 86, 1);
        }

        .selected {
          color: #4abe84;
          box-shadow: 0 2rpx 7rpx 0 rgba(85, 110, 97, 0.35);
          border-radius: 20rpx;
          // border: 1rpx solid rgba(74, 190, 132, 1);
        }

        .selected:before {
          content: '';
          position: absolute;
          right: 0;
          bottom: 0;
          border: 17rpx solid #4abe84;
          border-top-color: transparent;
          border-left-color: transparent;
        }

        .selected:after {
          content: '';
          width: 5rpx;
          height: 12rpx;
          position: absolute;
          right: 6rpx;
          bottom: 6rpx;
          border: 2rpx solid #fff;
          border-top-color: transparent;
          border-left-color: transparent;
          transform: rotate(45deg);
        }
      }

      .define {
        display: flex;
        height: 100rpx;
        align-items: center;

        .uni-easyinput {
          .uni-easyinput__content {
            border: none;
            border-radius: 0%;
            border-bottom: 1px solid #dcdfe6;
          }
        }
      }
    }

    .btn {
      border-radius: 8px;
      background: rgba(39, 178, 86, 1);
      height: 100rpx;
      width: 300rpx;
      line-height: 100rpx;
      text-align: center;
      color: #fff;
      margin: auto;
      margin-top: 40rpx;
    }
  }
}
</style>
