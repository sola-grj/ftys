<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import {
  addSuggestAPI,
  cutAccountAPI,
  getCustomerListAPI,
  getMyMerchantOrderListAPI,
  getMySuggestAPI,
  reviewAccountAPI,
  type CustomerItem,
  type MyMerchantItem,
  type MyMerchantOrderItem,
} from '@/services/my'
import { useMemberStore } from '@/stores'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import type { PageParams } from '@/types/global'
import type { MySuggestItem } from '@/types/my'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const activeIndex = ref(0)
// 点击一级分类
const onChangeIndex = (index: number) => {
  activeIndex.value = index
}
const memberStore = useMemberStore()

// 推荐分页参数
const pageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
const isFinish = ref(false)
const myMerchantOrderList = ref<MyMerchantOrderItem[]>([])
const getMyMerchantOrderListData = async (userId: string) => {
  // 退出判断
  if (isFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getMyMerchantOrderListAPI({ userId, ...pageParams })
  myMerchantOrderList.value.push(...res.result.list)
  if (pageParams.page < Math.ceil(res.result.total / 10)) {
    // 页码累加
    pageParams.page++
  } else {
    isFinish.value = true
  }
}
const customerinfo = ref<MyMerchantItem>()
onUnload(() => {
  uni.$off('customerinfo')
})
onLoad(() => {
  uni.$on('customerinfo', async (data) => {
    customerinfo.value = data.customerinfo
    await getMyMerchantOrderListData(customerinfo.value?.userId.toString() as string)
  })
})
const onChangeCustomer = async (data: CustomerItem) => {
  const res = await cutAccountAPI({ userId: data.userId })
  memberStore.setProfile(res!.result)
  uni.showToast({ icon: 'success', title: '账号切换成功' })
  setTimeout(() => {
    uni.reLaunch({ url: '/pages/my/my' })
  }, 500)
}
const goback = () => {
  uni.navigateTo({ url: '/pagesMember/mycustomer/mycustomer' })
}
const process = () => {
  uni.showModal({
    content: '是否对当前商户通过审核？',
    success: async (res) => {
      if (res.confirm) {
        // 后端删除单品
        const res = await reviewAccountAPI({
          customerUserId: customerinfo.value!.userId,
        })
        if (res.code === '1') {
          uni.showToast({ icon: 'success', title: '审核成功' })
          setTimeout(() => {
            uni.navigateTo({ url: '/pagesMember/mycustomer/mycustomer' })
          })
        } else {
          uni.showToast({ icon: 'none', title: '审核失败' })
        }
      }
    },
  })
}
</script>

<template>
  <scroll-view class="viewport">
    <SolaShopHeader :define-back="goback" title="商户信息" />
    <view class="container form-content">
      <view class="login-container">
        <view class="login-type">
          <view
            @tap="($event) => onChangeIndex(0)"
            class="pwd-btn"
            :class="activeIndex === 0 ? 'checked' : ''"
            >商户资料
          </view>
          <view
            @tap="($event) => onChangeIndex(1)"
            class="code-btn"
            :class="activeIndex === 1 ? 'checked' : ''"
            >商户订单
          </view>
        </view>
      </view>
      <view v-if="activeIndex === 0" class="info-container">
        <view class="info-item">
          <view class="label">联系人</view>
          <view class="value">{{ customerinfo?.username }}</view>
        </view>
        <view class="info-item">
          <view class="label">客户名称</view>
          <view class="value">{{ customerinfo?.username }}</view>
        </view>
        <view class="info-item">
          <view class="label">详细地址</view>
          <view class="value">{{ customerinfo?.shippingAddr }}</view>
        </view>
        <view class="info-item">
          <view class="label">客户账号</view>
          <view class="value">{{ customerinfo?.mobile }}</view>
        </view>
        <view class="info-item">
          <view class="label">收货手机</view>
          <view class="value">{{ customerinfo?.mobile }}</view>
        </view>
        <view class="info-item">
          <view class="label">状态</view>
          <view class="value">{{ customerinfo?.status }}</view>
        </view>
        <view class="info-item">
          <view class="label">所属集团</view>
          <view class="value">{{ customerinfo?.company }}</view>
        </view>
        <view class="info-item">
          <view class="label">客户类型</view>
          <view class="value">{{ '客户类型' }}</view>
        </view>
        <view class="info-item">
          <view class="label">创建时间</view>
          <view class="value">{{ customerinfo?.createTime }}</view>
        </view>
        <view v-if="customerinfo?.status === 'unreviewed'">
          <button style="background-color: #ff5040; color: #fff" @tap="process">审核</button>
        </view>
      </view>
      <view v-if="activeIndex === 1" class="other-container">
        <view v-for="item in myMerchantOrderList" :key="item.orderId" class="other-item">
          <view class="top">
            <view class="customer-name">
              <view class="text">{{ item.orderNo }}</view>
            </view>
            <view class="more">￥{{ item.orderPrice }}</view>
          </view>
          <view class="bottom">
            <view class="b-item">
              <view class="label">下单时间</view>
              <view class="value">{{ item.createTime }}</view>
            </view>
            <view class="b-item">
              <view class="label">发货日期</view>
              <view class="value">{{ item.shippedTime }}</view>
            </view>
            <view class="b-item">
              <view class="label">发货金额</view>
              <view class="value">{{ item.shippedOrderPrice }}</view>
            </view>
          </view>
        </view>
        <view v-if="myMerchantOrderList.length === 0" class="bg">
          <image
            src="https://img.js.design/assets/img/66909fda4fc21e83fb682df4.png#52a35c0ee65bdb8ba63bcefcce2ce6e6"
            mode="aspectFit"
          />
          <text>暂无内容</text>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<style lang="scss">
page {
  height: 100%;
  // overflow: hidden;
  background-color: #f7f7f8;
}

.viewport {
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 112, 64, 1) 0%, rgba(255, 80, 64, 1) 100%);

  .container {
    height: calc(100vh - 130rpx);
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    overflow: scroll;
    padding: 30rpx;

    .login-container {
      position: relative;
      height: 80rpx;
      margin-top: 20rpx;

      .login-type {
        display: flex;
        height: 80rpx;
        width: 500rpx;
        background: #f2f4f7;
        border-radius: 50rpx;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);

        .pwd-btn,
        .code-btn {
          width: 50%;
          line-height: 80rpx;
          text-align: center;
          border-radius: 50rpx;
        }

        .checked {
          color: #fff;
          background-color: #ff5040;
        }
      }
    }

    .info-container {
      .info-item {
        display: flex;
        height: 100rpx;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(242, 244, 247, 1);
        font-size: 28rpx;

        .label {
          color: rgba(175, 176, 178, 1);
        }
      }
    }

    .other-container {
      .other-item {
        display: flex;
        flex-direction: column;
        width: 100%;
        padding: 0 30rpx;
        font-size: 28rpx;
        border-bottom: 1px solid rgba(242, 244, 247, 1);
        margin-top: 20rpx;

        .top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30rpx;

          .customer-name {
            display: flex;
          }

          .more {
            color: rgba(255, 80, 64, 1);
          }
        }

        .bottom {
          .b-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20rpx;

            .label {
              color: rgba(175, 176, 178, 1);
            }
          }
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
}
</style>
