<script setup lang="ts">
import {
  cutAccountAPI,
  getChannelOrderListAPI,
  type CustomerItem,
  type ChannelOrderItem,
} from '@/services/my'
import { useMemberStore } from '@/stores'
import type { PageParams } from '@/types/global'
import type { OrderItem } from '@/types/order'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { ref, watch } from 'vue'
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const activeIndex = ref(0)
const status = ref('')
// 点击一级分类
const onChangeIndex = (index: number) => {
  activeIndex.value = index
}
const memberStore = useMemberStore()
// 弹出层组件
const typepopup = ref<UniHelper.UniPopupInstance>()
const items = [
  {
    value: '',
    name: '全部',
    checked: 'true',
  },
  {
    value: '2',
    name: '已支付',
  },
  {
    value: '1',
    name: '未支付',
  },
]
const current = ref(0)
const currentStatus = ref('全部')
const radioChange = (evt: any) => {
  isFinish.value = false
  pageParams.page = 1
  channelOrderList.value = []
  for (let i = 0; i < items.length; i++) {
    if (items[i].value === evt.detail.value) {
      current.value = i
      currentStatus.value = items[i].name
      status.value = items[i].value
      getChannelOrderListData()
      break
    }
  }
  //  @ts-ignore
  typepopup!.value?.close()
}
// 推荐分页参数
const pageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
const shippedTime = ref('')
const isFinish = ref(false)
const channelOrderList = ref<ChannelOrderItem[]>([])
const getChannelOrderListData = async () => {
  // 退出判断
  if (isFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getChannelOrderListAPI({
    status: status.value,
    shippedTime: shippedTime.value,
    ...pageParams,
  })
  channelOrderList.value.push(...res.result.list)
  if (pageParams.page < res.result.total) {
    // 页码累加
    pageParams.page++
  } else {
    isFinish.value = true
  }
}

onLoad(() => {
  getChannelOrderListData()
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
  () => shippedTime,
  (newValue, oldValue) => {
    pageParams.page = 1
    isFinish.value = false
    channelOrderList.value = []
    getChannelOrderListData()
  },
  { immediate: false, deep: true },
)
// 跳转订单详情
const goToOrderDetail = (orderId: string) => {
  uni.navigateTo({ url: `/PagesOrder/detail/detail?orderId=${orderId}` })
}
</script>

<template>
  <scroll-view class="viewport">
    <SolaShopHeader title="渠道订单" />
    <scroll-view
      class="container form-content"
      @scrolltolower="getChannelOrderListData"
      scroll-y
      enable-back-to-top
    >
      <view class="condition">
        <view class="date">
          <text class="label">发货日期：</text>
          <uni-datetime-picker clear-icon :border="false" type="date" v-model="shippedTime" />
        </view>
        <view class="status" @tap="typepopup?.open?.('top')"
          ><text class="label">订单状态：</text><text>{{ currentStatus }}</text>
        </view>
      </view>
      <view class="other-container">
        <view
          v-for="item in channelOrderList"
          :key="item.orderId"
          class="other-item"
          @tap="($event) => goToOrderDetail(item.orderId)"
        >
          <view class="top">
            <view class="customer-name">
              <view class="text">{{ item.orderNo }}</view>
            </view>
            <view class="more ftysIcon icon-xiangyoujiantou"></view>
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
              <view class="value">{{ item.orderPrice }}</view>
            </view>
          </view>
        </view>
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
  // overflow: hidden;
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

    .condition {
      display: flex;
      height: 100rpx;
      align-items: center;
      justify-content: space-around;
      font-size: 28rpx;

      .label {
        color: rgba(175, 176, 178, 1);
        margin-right: 20rpx;
      }

      .date {
        display: flex;
        align-items: center;
      }

      .status {
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
    }
  }
}
</style>
