<script setup lang="ts">
import {
  getShippedOrderDetailAPI,
  type ShipedOrderDetailResult,
  type ShipedOrderItem,
} from '@/services/order'
import { onMounted, ref } from 'vue'

const step = ref()
const props = defineProps<{
  keyword: string
  currentCompleteOrder: ShipedOrderItem
}>()
const list2 = [
  {
    title: '仓库处理中',
    desc: '',
  },
  {
    title: '运输中',
    desc: '',
  },
  {
    title: '已签收',
    desc: '',
  },
]
const active = ref(0)
const completeOrderDetail = ref<ShipedOrderDetailResult>({} as ShipedOrderDetailResult)

const getCompleteOrderDetail = async (orderId: string) => {
  const res = await getShippedOrderDetailAPI({
    orderId,
  })
  completeOrderDetail.value = res.result
  list2[0].desc = res.result.orderInfo.createTime || '20199999999'
  list2[1].desc = res.result.orderInfo.payTime || '20199999999'
  list2[2].desc = res.result.orderInfo.signInTime || '20199999999'
  if (res.result.orderInfo.status === '3') {
    active.value = 1
  }
  if (res.result.orderInfo.status === '6' || res.result.orderInfo.status === '4') {
    active.value = 2
  }
  if (res.result.orderInfo.status === '2') {
    active.value = 0
  }
}

onMounted(() => {
  getCompleteOrderDetail(props.currentCompleteOrder.orderId)
})
</script>

<template>
  <scroll-view class="viewport" scroll-y enable-back-to-top>
    <view class="container">
      <view class="orderno"
        >订单号：{{ completeOrderDetail.orderInfo && completeOrderDetail.orderInfo.orderNo }}</view
      >
      <view class="address-info">
        <text class="ftysIcon icon-ditu_dingwei" />
        <view class="desc">
          <view class="address">{{
            completeOrderDetail.orderInfo && completeOrderDetail.orderInfo.shippingInfo.shippingAddr
          }}</view>
          <view class="user"
            >{{
              completeOrderDetail.orderInfo && completeOrderDetail.orderInfo.shippingInfo.username
            }}
            {{ completeOrderDetail.orderInfo && completeOrderDetail.orderInfo.shippingInfo.mobile }}
          </view>
        </view>
      </view>
      <view class="list-container">
        <view class="item" v-for="item in completeOrderDetail.orderDetail" :key="item.goodsId">
          <image :src="item.goodsImages[0]" mode="scaleToFill" />
          <view class="info">
            <view class="infotitle">{{ item.goodsName }}</view>
            <view class="xiadan">下单：￥{{ item.num }}{{ item.units }}</view>
            <view class="fahuo">发货：￥{{ item.actNum }}{{ item.units }}</view>
          </view>
        </view>
      </view>
      <view class="step-container">
        <uni-steps
          active-color="#ff5040"
          :active="active"
          ref="step"
          :options="list2"
          direction="column"
        />
        <view class="images">
          <image
            v-for="item in completeOrderDetail.orderInfo &&
            completeOrderDetail.orderInfo.signInImages"
            :key="item"
            :src="item"
            class="img"
          />
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
    height: 100%;
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    // overflow: scroll;
    padding: 20rpx;

    .orderno {
      color: rgba(50, 50, 51, 1);
      font-size: 28rpx;
    }

    .address-info {
      display: flex;

      .icon-ditu_dingwei {
        color: rgba(255, 80, 64, 1);
        font-size: 80rpx;
      }

      .desc {
        display: flex;
        flex-direction: column;
        font-size: 26rpx;

        .address {
          color: rgba(102, 102, 102, 1);
        }

        .user {
          color: rgba(50, 50, 51, 1);
        }
      }
    }

    .list-container {
      padding: 20rpx 20rpx;
      // border-radius: 10rpx;
      background-color: #fff;
      border-bottom: 1px solid rgba(236, 236, 236, 1);

      .item {
        display: flex;
        margin-top: 20rpx;

        image {
          height: 160rpx;
          width: 160rpx;
        }

        .info {
          flex: 1;
          display: flex;
          flex-direction: column;
          width: 90%;
          padding-left: 20rpx;
          justify-content: space-between;

          .infotitle {
            font-weight: bold;
            font-size: 28rpx;
            color: rgba(50, 50, 51, 1);
          }

          .xiadan {
            font-size: 26rpx;
            color: rgba(102, 102, 102, 1);
          }

          .fahuo {
            font-size: 26rpx;
            color: rgba(255, 80, 64, 1);
          }
        }

        .right {
          display: flex;
          // flex: 1;
          justify-content: space-between;
          align-items: flex-end;
          color: #ff5040;

          ::v-deep .uni-numbox {
            .uni-numbox-btns {
              padding: 0 4px;
            }

            .uni-numbox__value {
              width: 48rpx !important;
              height: 30rpx !important;
              font-size: 26rpx !important;
            }
          }

          .shoucang {
            height: 50%;
          }

          .jiagou {
            flex: 1;
          }

          .num {
            font-weight: bold;
          }
        }

        .note {
          margin-top: 10rpx;

          .uni-easyinput__content {
            height: 60rpx;
          }
        }
      }

      .remark {
        margin-top: 30rpx;
        display: flex;

        .rtitle {
          font-size: 30rpx;
          margin-right: 40rpx;
          color: rgba(50, 50, 51, 1);
        }
      }
    }

    .step-container {
      position: relative;

      .images {
        position: absolute;
        left: 60rpx;
        bottom: 40rpx;

        .img {
          width: 40rpx;
          height: 40rpx;
          margin-left: 5rpx;
        }
      }
    }
  }
}
</style>
