<script setup lang="ts">
import {
  getUnShipOrderListAPI,
  type UnShipCustomerItem,
  type UnShipOrderListItem,
} from '@/services/order'
import type { PageParams } from '@/types/global'
import { onMounted, ref } from 'vue'

const props = defineProps<{
  keyword: string
  currentUnshipCustomer: UnShipCustomerItem
}>()

const unShipOrderList = ref<UnShipOrderListItem[]>([])
const unShipOrdersPageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
const unShipOrdersFinish = ref(false)
const getUnShipOrderList = async (data: UnShipCustomerItem) => {
  // 退出判断
  if (unShipOrdersFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getUnShipOrderListAPI({
    userId: data.userId,
    ...unShipOrdersPageParams,
  })
  unShipOrderList.value.push(...res.result.list)
  if (unShipOrdersPageParams.page < Math.ceil(res.result.total / 10)) {
    // 页码累加
    unShipOrdersPageParams.page++
  } else {
    unShipOrdersFinish.value = true
  }
}
onMounted(async () => {
  await getUnShipOrderList(props.currentUnshipCustomer)
  console.log('unShipOrderList==', unShipOrderList.value, props.currentUnshipCustomer)
})

const goToDeliver = (orderId: string) => {
  uni.navigateTo({ url: `/PagesOrder/delivery/delivery?orderId=${orderId}` })
}
</script>

<template>
  <scroll-view
    class="viewport"
    scroll-y
    enable-back-to-top
    @scrolltolower="() => getUnShipOrderList(props.currentUnshipCustomer)"
  >
    <view class="container">
      <view v-for="item in unShipOrderList" :key="item.orderId" class="item">
        <view class="top">
          <view class="customer-name">
            <view class="text">{{ item.orderNo }}</view>
          </view>
          <view class="more" @tap="($event) => goToDeliver(item.orderId)"
            >{{ item.status === '3' || item.status === '13' ? '去签收' : '去发货' }}></view
          >
        </view>
        <view class="bottom">
          <view class="b-item">
            <view class="label">客户名称</view>
            <view class="value">{{ item.username }}</view>
          </view>
          <view class="b-item">
            <view class="label">联系电话</view>
            <view class="value phone">
              <text class="ftysIcon icon-dianhua">{{ item.mobile }}</text>
            </view>
          </view>
          <view class="b-item">
            <view class="label">下单日期</view>
            <view class="value">{{ item.createTime }}</view>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<style lang="scss">
.viewport {
  // height: 100%;
  // overflow: hidden;

  .container {
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    overflow-y: scroll;
    padding: 20rpx;

    .item {
      display: flex;
      flex-direction: column;
      width: 100%;
      padding: 0 30rpx;
      font-size: 28rpx;
      border-bottom: 1px solid rgba(175, 176, 178, 1);
      margin-top: 20rpx;

      .top {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30rpx;

        .customer-name {
          display: flex;

          .num {
            font-size: 20rpx;
            width: 44rpx;
            height: 44rpx;
            margin-left: 20rpx;
            line-height: 40rpx;
            text-align: center;
            background-image: url('@/static/images/number.png');
            background-size: 100%;
          }
        }

        .more {
          width: 100rpx;
          height: 40rpx;
          color: #fff;
          line-height: 40rpx;
          text-align: center;
          border-radius: 5px;
          background: linear-gradient(90deg, rgba(255, 112, 77, 1) 0%, rgba(255, 95, 77, 1) 100%);
          font-size: 20rpx;
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

          .phone {
            color: rgba(255, 80, 64, 1);
          }
        }
      }
    }
  }
}
</style>
