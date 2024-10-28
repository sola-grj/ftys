<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import {
  getMySuggestAPI,
  getSubAccountAPI,
  removeSubAccountAPI,
  type SubAccountItem,
} from '@/services/my'
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
const subaccountList = ref<SubAccountItem[]>([])
const getSubAccountListData = async () => {
  // 退出判断
  if (isFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getSubAccountAPI({ ...pageParams })

  subaccountList.value.push(...res.result.list)
  if (pageParams.page < Math.ceil(res.result.total / 10)) {
    // 页码累加
    pageParams.page++
  } else {
    isFinish.value = true
  }
}

onLoad(() => {
  getSubAccountListData()
})
const addSubAccount = (type: string, data?: SubAccountItem) => {
  uni.navigateTo({
    url: `/pagesMember/subaccount/addaccount?type=${type}`,
    success: (success) => {
      if (type === 'edit') {
        uni.$emit('editsubaccount', {
          currentAccount: data,
        })
      }
    },
  })
}
const goback = () => {
  uni.switchTab({
    url: '/pages/my/my',
  })
}
const deleteSubAccount = async (userId: string) => {
  // 弹窗二次确认
  uni.showModal({
    content: '是否删除',
    success: async (res) => {
      if (res.confirm) {
        const res = await removeSubAccountAPI({ userId })
        if (res.code.toString() === '1') {
          uni.showToast({ icon: 'success', title: '删除成功' })
          subaccountList.value = subaccountList.value.filter((v) => v.userId !== userId)
        } else {
          uni.showToast({ icon: 'error', title: res.msg })
        }
      }
    },
  })
}
</script>

<template>
  <scroll-view @scrolltolower="getSubAccountListData" class="viewport" scroll-y enable-back-to-top>
    <SolaShopHeader :define-back="goback" title="子账号" />
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
          <text
            @tap="($event) => addSubAccount('edit', item)"
            class="ftysIcon icon-xiugaioryijian"
          />
          <text @tap="($event) => deleteSubAccount(item.userId)" class="ftysIcon icon-shanchu" />
        </view>
      </view>
      <view v-if="subaccountList.length === 0" class="bg">
        <image
          src="https://img.js.design/assets/img/66909fda4fc21e83fb682df4.png#52a35c0ee65bdb8ba63bcefcce2ce6e6"
          mode="aspectFit"
        />
        <text>暂无内容</text>
      </view>
      <view class="add">
        <button @tap="($event) => addSubAccount('add')" class="add-btn">新增</button>
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
  position: relative;
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 112, 64, 1) 0%, rgba(255, 80, 64, 1) 100%);

  .container {
    height: 100%;
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    overflow: scroll;

    .item {
      display: flex;
      height: 150rpx;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f2f4f7;
      padding: 30rpx;

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

    .add {
      width: 100%;
      position: fixed;
      bottom: 10rpx;

      .add-btn {
        width: 80%;
        color: #fff;
        background-color: #ff5040;
      }
    }
  }
}
</style>
