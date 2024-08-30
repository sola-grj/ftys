<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import {
  addSuggestAPI,
  cutAccountAPI,
  getCustomerListAPI,
  getMySuggestAPI,
  type CustomerItem,
} from '@/services/my'
import { useMemberStore } from '@/stores'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import type { PageParams } from '@/types/global'
import type { MySuggestItem } from '@/types/my'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref, watch } from 'vue'
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

const memberStore = useMemberStore()
const keyword = ref('')
// 推荐分页参数
const pageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
const isFinish = ref(false)
const customerList = ref<CustomerItem[]>([])
const getCustomerData = async () => {
  // 退出判断
  if (isFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getCustomerListAPI({ filter: keyword.value, ...pageParams })
  customerList.value.push(...res.result.list)
  if (pageParams.page < res.result.total) {
    // 页码累加
    pageParams.page++
  } else {
    isFinish.value = true
  }
}
onLoad(() => {
  getCustomerData()
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
  uni.navigateBack()
}
watch(
  () => keyword,
  (newValue, oldValue) => {
    pageParams.page = 1
    isFinish.value = false
    customerList.value = []
    getCustomerData()
  },
  { immediate: true, deep: true },
)
</script>

<template>
  <scroll-view class="viewport" @scrolltolower="getCustomerData" scroll-y enable-back-to-top>
    <view class="title" :style="{ paddingTop: safeAreaInsets!.top + 'px' }">
      <text @tap="goback" class="ftysIcon icon-xiangzuojiantou"></text>
      <text class="text">切换账户</text>
    </view>
    <view class="container form-content">
      <view class="search">
        <uni-easyinput placeholder="搜索客户" class="search" prefixIcon="search" v-model="keyword">
        </uni-easyinput>
      </view>
      <view
        class="customer-item"
        v-for="item in customerList"
        :key="item.userId"
        @tap="($event) => onChangeCustomer(item)"
      >
        <view class="check-container">
          <text
            @tap="($event) => onChangeSelected(item)"
            :class="`ftysIcon ${
              item.userId.toString() === memberStore.profile?.userinfo.user_id
                ? 'icon-xuanzhong1-copy'
                : 'icon-xuanzhong1'
            }`"
          ></text>
        </view>
        <view>{{ item.username }}</view>
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
  }

  .container {
    height: 100%;
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    overflow: scroll;
    padding: 30rpx;

    .search {
      .uni-easyinput {
        width: 90%;
        margin: auto;

        .uni-easyinput__content {
          border-color: rgba(255, 80, 64, 1) !important;
          border-radius: 40rpx !important;
          height: 70rpx;
        }
      }
    }

    .customer-item {
      display: flex;
      align-items: center;
      height: 160rpx;
      border-bottom: 1px solid #f2f4f7;

      .check-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 80rpx;
        // height: 100%;

        .icon-xuanzhong {
          font-size: 40rpx;
        }

        .checked-all-text {
          position: absolute;
          left: 80rpx;
          font-size: 30rpx;
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
