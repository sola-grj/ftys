<script setup lang="ts">
import { useGuessList } from '@/composables'
import { useMemberStore } from '@/stores'
import type { SolaShopGuessInstance } from '@/types/component'
import { ref } from 'vue'

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
// 订单选项
const orderTypes = [
  { type: 1, text: '待付款', icon: 'icon-daifukuan' },
  { type: 2, text: '待发货', icon: 'icon-31daifahuo' },
  { type: 3, text: '待收货', icon: 'icon-daishouhuo' },
  { type: 4, text: '退换/售后', icon: 'icon-shouhou' },
]
// 优惠券、欠款、余额
const CouponTypes = [
  { name: '优惠券', data: '38', desc: '下单立省' },
  { name: '欠款', data: '2677.00', desc: '当前欠款' },
  { name: '账户余额', data: '0.00', desc: '在线充值' },
]
// 常用工具
const ToolTypes = [
  { type: 1, text: '子账号', icon: 'icon-touxiang' },
  { type: 2, text: '我的报表', icon: 'icon-baobiao' },
  { type: 3, text: '导出对账单', icon: 'icon-shujuguanli-daohang-daorushuju' },
  { type: 4, text: '新品需求', icon: 'icon-xinpin' },
  { type: 5, text: '意见反馈', icon: 'icon-yijianfankui' },
  { type: 6, text: '在线客服', icon: 'icon-kefu' },
]

// 帮助中心
const HelpCenterTypes = [
  { type: 1, text: '售后规则', icon: 'icon-shouhou' },
  { type: 2, text: '服务条款', icon: 'icon-fuwutiaokuan' },
  { type: 3, text: '关于我们', icon: 'icon-guanyuwomen' },
]
// 获取会员信息
const memberStore = useMemberStore()

const { guessRef, onScrollToLower } = useGuessList()
</script>

<template>
  <scroll-view @scrolltolower="onScrollToLower" class="viewport" scroll-y enable-back-to-top>
    <!-- 个人资料 -->
    <view class="profile" :style="{ paddingTop: safeAreaInsets!.top + 'px' }">
      <!-- 情况1：已登录 -->
      <view class="overview" v-if="memberStore.profile">
        <navigator url="/pagesMember/profile/profile" hover-class="none">
          <image
            class="avatar"
            mode="aspectFill"
            :src="memberStore.profile.userinfo.avatar"
          ></image>
        </navigator>
        <view class="meta">
          <view class="nickname">
            {{ memberStore.profile.userinfo.username }}
            <text class="ftysIcon icon-qiehuanzhanghao">切换账号</text>
          </view>
          <navigator class="extra" url="/pagesMember/profile/profile" hover-class="none">
            <text class="update">{{ memberStore.profile.userinfo.mobile }}</text>
          </navigator>
        </view>
      </view>
      <!-- 情况2：未登录 -->
      <view class="overview" v-else>
        <navigator url="/pages/login/login" hover-class="none">
          <image
            class="avatar gray"
            mode="aspectFill"
            src="http://yjy-xiaotuxian-dev.oss-cn-beijing.aliyuncs.com/picture/2021-04-06/db628d42-88a7-46e7-abb8-659448c33081.png"
          >
          </image>
        </navigator>
        <view class="meta">
          <navigator url="/pages/login/login" hover-class="none" class="nickname">
            未登录
          </navigator>
          <view class="extra">
            <text class="tips">点击登录账号</text>
          </view>
        </view>
      </view>
      <navigator class="settings" url="/pagesMember/settings/settings" hover-class="none">
        <text class="ftysIcon icon-shezhi"></text>
        <text class="ftysIcon icon-xiaoxi1"></text>
      </navigator>
    </view>
    <!-- 我的订单 -->
    <view class="orders">
      <view class="title">
        我的订单
        <navigator class="navigator" url="/PagesOrder/list/list?type=0" hover-class="none">
          查看全部订单<text class="icon-right"></text>
        </navigator>
      </view>
      <view class="section">
        <!-- 订单 -->
        <navigator
          v-for="item in orderTypes"
          :key="item.type"
          :class="`ftysIcon ${item.icon}`"
          :url="`/PagesOrder/list/list?type=${item.type}`"
          class="navigator"
          hover-class="none"
        >
          <text class="text">{{ item.text }}</text>
        </navigator>
      </view>
    </view>
    <!-- 优惠券、欠款、账户余额 -->
    <view class="coupons">
      <view class="coupons-item">
        <!-- 订单 -->
        <navigator
          v-for="item in CouponTypes"
          :key="item.name"
          class="navigator"
          hover-class="none"
        >
          <view class="data"
            >{{ item.data }}{{ item.name === '欠款' || item.name === '账户余额' ? '元' : '' }}</view
          >
          <view class="name">{{ item.name }}</view>
          <view class="desc">{{ item.desc }}</view>
        </navigator>
      </view>
    </view>
    <!-- 常用工具 -->
    <view class="tools">
      <view class="title"> 常用工具 </view>
      <view class="tool-item" v-for="item in ToolTypes" :key="item.type">
        <navigator
          :class="`ftysIcon ${item.icon}`"
          :url="`/PagesOrder/list/list?type=${item.type}`"
          class="navigator"
          hover-class="none"
        >
          <text class="text">{{ item.text }}</text>
        </navigator>
      </view>
    </view>
    <!-- 帮助中心 -->
    <view class="help-center">
      <view class="title"> 帮助中心 </view>
      <view class="help-center-item" v-for="item in HelpCenterTypes" :key="item.type">
        <navigator
          :class="`ftysIcon ${item.icon}`"
          :url="`/PagesOrder/list/list?type=${item.type}`"
          class="navigator"
          hover-class="none"
        >
          <text class="text">{{ item.text }}</text>
        </navigator>
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
}

/* 用户信息 */
.profile {
  margin-top: 20rpx;
  position: relative;
  // background-color: #cfdcfa;

  .overview {
    display: flex;
    min-height: 120rpx;
    padding: 0 36rpx;

    .meta {
      height: 100%;
    }

    // color: #fff;
  }

  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background-color: #eee;
  }

  .gray {
    filter: grayscale(100%);
  }

  .meta {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    margin-left: 20rpx;
  }

  .nickname {
    margin-bottom: 16rpx;
    font-size: 50rpx;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    .icon-qiehuanzhanghao {
      font-size: 26rpx;
      color: #666666;
    }
  }

  .extra {
    display: flex;
    font-size: 20rpx;
  }

  .tips {
    font-size: 22rpx;
  }

  .update {
    padding: 3rpx 10rpx 1rpx;
    background-color: rgba(200, 217, 250, 1);
    border: 1rpx solid rgba(255, 255, 255, 0.8);
    margin-right: 10rpx;
    border-radius: 30rpx;
  }

  .settings {
    position: absolute;
    bottom: 0;
    right: 16rpx;
    font-size: 60rpx;
    // color: #fff;

    .icon-xiaoxi1 {
      margin-left: 30rpx;
    }
  }
}

/* 我的订单 */
.orders {
  position: relative;
  z-index: 99;
  padding: 30rpx;
  margin: 50rpx 20rpx 0;
  background-color: #fff;
  border-radius: 10rpx;
  box-shadow: 0 4rpx 6rpx rgba(240, 240, 240, 0.6);

  .title {
    height: 40rpx;
    line-height: 40rpx;
    font-size: 28rpx;
    color: #1e1e1e;

    .navigator {
      font-size: 24rpx;
      color: #939393;
      float: right;

      .ftysIcon {
        font-size: 35rpx;
      }
    }
  }

  .section {
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 40rpx 20rpx 10rpx;

    .navigator,
    .contact {
      text-align: center;
      font-size: 24rpx;
      color: #333;

      &::before {
        display: block;
        font-size: 60rpx;
        color: #ff9545;
      }

      .text {
        margin-top: 10rpx;
      }
    }

    .navigator {
      display: flex;
      flex-direction: column;
      align-items: center;

      .text {
        margin-top: 10rpx;
      }
    }

    .contact {
      padding: 0;
      margin: 0;
      border: 0;
      background-color: transparent;
      line-height: inherit;
    }
  }
}

.coupons {
  position: relative;
  z-index: 99;
  padding: 30rpx;
  margin: 50rpx 20rpx 0;
  background-color: #fff;
  border-radius: 10rpx;
  box-shadow: 0 4rpx 6rpx rgba(240, 240, 240, 0.6);

  .coupons-item {
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 20rpx 20rpx 10rpx;

    .navigator {
      font-size: 24rpx;
      float: right;
      display: flex;
      flex-direction: column;
      align-items: center;

      .data {
        font-size: 40rpx;
      }

      .name {
        font-size: 26rpx;
        margin-top: 10rpx;
      }

      .desc {
        margin-top: 6rpx;
        color: #939393;
      }
    }
  }
}

.tools {
  position: relative;
  z-index: 99;
  padding: 30rpx;
  margin: 50rpx 20rpx 0;
  background-color: #fff;
  border-radius: 10rpx;
  box-shadow: 0 4rpx 6rpx rgba(240, 240, 240, 0.6);

  .tool-item {
    display: inline-block;
    width: 25%;
    height: 100rpx;
    margin-top: 20rpx;

    .navigator {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 50rpx;

      .text {
        font-size: 24rpx;
        margin-top: 10rpx;
      }
    }
  }
}

.help-center {
  position: relative;
  z-index: 99;
  padding: 30rpx;
  margin: 50rpx 20rpx 0;
  background-color: #fff;
  border-radius: 10rpx;
  box-shadow: 0 4rpx 6rpx rgba(240, 240, 240, 0.6);

  .help-center-item {
    display: inline-block;
    width: 25%;
    height: 100rpx;
    margin-top: 20rpx;

    .navigator {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 50rpx;

      .text {
        font-size: 24rpx;
        margin-top: 10rpx;
      }
    }
  }
}

/* 猜你喜欢 */
.guess {
  background-color: #f7f7f8;
  margin-top: 20rpx;
}
</style>
