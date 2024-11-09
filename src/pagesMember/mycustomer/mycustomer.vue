<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import {
  addSuggestAPI,
  cutAccountAPI,
  getCustomerListAPI,
  getMyMerchantListAPI,
  getMySuggestAPI,
  type MyMerchantItem,
} from '@/services/my'
import { useMemberStore } from '@/stores'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import type { PageParams } from '@/types/global'
import type { MySuggestItem } from '@/types/my'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref, watch } from 'vue'
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const status = ref('')
const filter = ref('')
const memberStore = useMemberStore()
// 弹出层组件
const typepopup = ref<UniHelper.UniPopupInstance>()
// 推荐分页参数
const pageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
const isFinish = ref(false)
const myMerchant = ref<MyMerchantItem[]>([])
const totalOrderMoney = ref('')
const getMyMerchantData = async () => {
  // 退出判断
  if (isFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getMyMerchantListAPI({
    status: status.value,
    filter: filter.value,
    ...pageParams,
  })
  myMerchant.value.push(...res.result.list)
  totalOrderMoney.value = res.result.totalOrderMoney
  if (pageParams.page < Math.ceil(res.result.total / 10)) {
    // 页码累加
    pageParams.page++
  } else {
    isFinish.value = true
  }
}
onLoad(() => {
  getMyMerchantData()
})

const current = ref(0)
const radioChange = (evt) => {
  pageParams.page = 1
  isFinish.value = false
  myMerchant.value = []
  for (let i = 0; i < items.length; i++) {
    if (items[i].value === evt.detail.value) {
      current.value = i
      status.value = items[i].value
      getMyMerchantData()
      break
    }
  }
  //  @ts-ignore
  typepopup!.value?.close()
}
const items = [
  {
    value: '',
    name: '全部',
    checked: 'true',
  },
  {
    value: 'unreviewed',
    name: '未审核',
  },
  {
    value: 'normal',
    name: '正常',
  },
  {
    value: 'disable',
    name: '被禁用',
  },
]
const goback = () => {
  uni.switchTab({ url: '/pages/my/my' })
}
const goToDetail = (data: MyMerchantItem) => {
  uni.navigateTo({
    url: '/pagesMember/mycustomer/customerinfo',
    success: (success) => {
      setTimeout(() => {
        uni.$emit('customerinfo', { customerinfo: data })
      }, 200)
    },
  })
}
watch(
  () => filter,
  (newValue, oldValue) => {
    pageParams.page = 1
    isFinish.value = false
    myMerchant.value = []
    getMyMerchantData()
  },
  { immediate: false, deep: true },
)
</script>

<template>
  <scroll-view class="viewport">
    <SolaShopHeader title="我的商户" :define-back="goback" />
    <scroll-view
      @scrolltolower="getMyMerchantData"
      scroll-y
      enable-back-to-top
      class="container form-content"
    >
      <view class="search">
        <uni-easyinput
          placeholder="请输入客户名称/客户编码/客户账号"
          class="search"
          prefixIcon="search"
          v-model="filter"
        >
        </uni-easyinput>
        <text class="ftysIcon icon-gengduo1" @tap="typepopup?.open?.('top')" />
      </view>
      <view class="total">
        <text>用户下单总和</text>
        <text
          >￥{{
            totalOrderMoney && isNaN(Number(totalOrderMoney))
              ? '-'
              : Number(totalOrderMoney).toFixed(2)
          }}</text
        >
      </view>
      <view
        v-for="item in myMerchant"
        :key="item.userId"
        class="customer-item"
        @tap="($event) => goToDetail(item)"
      >
        <view class="top">
          <view class="customer-name">
            <view class="text">{{ item.username }}</view>
          </view>
          <view class="more">查看更多</view>
        </view>
        <view class="bottom">
          <view class="b-item">
            <view class="label">发货金额</view>
            <view class="value">{{ Number(item.orderMoney).toFixed(2) }}</view>
          </view>
          <view class="b-item">
            <view class="label">区域</view>
            <view class="value">{{ item.shippingArea }}</view>
          </view>
          <view class="b-item">
            <view class="label">地址</view>
            <view class="value">{{ item.shippingAddr }}</view>
          </view>
          <view class="b-item">
            <view class="label">电话</view>
            <view class="value">{{ item.mobile }}</view>
          </view>
          <view class="b-item">
            <view class="label">下单时间</view>
            <view class="value">{{ item.createTime }}</view>
          </view>
          <view class="b-item">
            <view class="label">上次下单时间</view>
            <view class="value">{{ item.lastOrderTime }}</view>
          </view>
        </view>
      </view>
      <view v-if="myMerchant.length === 0" class="bg">
        <image
          src="https://img.js.design/assets/img/66909fda4fc21e83fb682df4.png#52a35c0ee65bdb8ba63bcefcce2ce6e6"
          mode="aspectFit"
        />
        <text>暂无内容</text>
      </view>
    </scroll-view>
    <uni-popup ref="typepopup" background-color="#fff">
      <view class="customer-popup-content">
        <radio-group @change="radioChange">
          <label
            class="uni-list-cell uni-list-cell-pd"
            :class="index === current ? 'checked' : ''"
            v-for="(item, index) in items"
            :key="item.value"
          >
            <view>{{ item.name }}</view>
            <view>
              <radio :value="item.value" :checked="index === current" />
            </view>
          </label>
        </radio-group>
      </view>
    </uni-popup>
  </scroll-view>
</template>

<style lang="scss">
page {
  height: 100%;
  overflow: scroll;
  background-color: #f7f7f8;
}

::-webkit-scrollbar {
  display: none;
  /* 隐藏滚动条 */
}

.customer-popup-content {
  height: 400rpx;
  padding: 30rpx;

  radio-group {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;

    .uni-list-cell {
      display: flex;
      height: 100rpx;
      align-items: center;
      padding: 0 20rpx;

      view:first-child {
        margin-right: 40rpx;
      }
    }

    .checked {
      background-color: #f2f4f7;
    }
  }
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

    .total {
      display: flex;
      justify-content: space-between;
      height: 60rpx;
      align-items: center;
      margin-top: 30rpx;
    }

    .search {
      display: flex;
      align-items: center;

      .uni-easyinput {
        width: 80%;
        margin: auto;

        .uni-easyinput__content {
          border-color: rgba(255, 80, 64, 1) !important;
          border-radius: 40rpx !important;
          height: 56rpx;
        }
      }

      .icon-gengduo1 {
        font-size: 50rpx;
      }
    }

    .customer-item {
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
          color: rgba(175, 176, 178, 1);
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
  }
}
</style>
