<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import { getMySuggestAPI } from '@/services/my'
import {
  getShippedOrderDetailAPI,
  shipOrderAPI,
  signInOrderAPI,
  type ShipedOrderDetailItem,
  type ShipedOrderDetailResult,
  type ShipOrderItem,
} from '@/services/order'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import type { PageParams } from '@/types/global'
import type { MySuggestItem } from '@/types/my'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

const reconciliation = ref([['签收', '发货']])
const deliveryStage = ref('')
const onReconciliationChange = (e: any) => {
  console.log(e.detail.value)
  // @ts-ignore
  deliveryStage.value = reconciliation.value[0][e.detail.value[0]]
}
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const props = defineProps<{
  orderId: string
}>()
const completeOrderDetail = ref<ShipedOrderDetailResult>({} as ShipedOrderDetailResult)
const confirmCompleteOrderDetail = ref<ShipedOrderDetailResult>({
  orderDetail: [] as ShipedOrderDetailItem[],
} as ShipedOrderDetailResult)
const getCompleteOrderDetail = async (orderId: string) => {
  const res = await getShippedOrderDetailAPI({
    orderId,
  })
  completeOrderDetail.value = res.result
  if (res.result.orderInfo.status === '2' || res.result.orderInfo.status === '12') {
    deliveryStage.value = '待发货订单'
  }
  if (res.result.orderInfo.status === '3') {
    deliveryStage.value = '待签收订单'
  }
}

onLoad(() => {
  getCompleteOrderDetail(props.orderId)
})
const imageList = ref([])
const onDelete = (event: any) => {
  console.log(event)
  // @ts-ignore
  imageList.value = [...imageList.value.filter((item) => item.uuid !== event.tempFile.uuid)]
}
const onSelect = (event: any) => {
  uni.uploadFile({
    url: '/common/upload', //仅为示例，非真实的接口地址
    filePath: event.tempFilePaths[0],
    name: 'file',
    success: (res) => {
      let { data } = res
      data = JSON.parse(data)
      // @ts-ignore
      imageList.value.push(data!.result.url)
    },
  })
}
const goback = () => {
  uni.navigateBack()
}
const onChangeGoodsStatus = (data: ShipedOrderDetailItem, status: string) => {
  if (status === 'confirm') {
    completeOrderDetail.value.orderDetail = completeOrderDetail.value.orderDetail.filter(
      (item) => item.goodsId !== data.goodsId,
    )
    confirmCompleteOrderDetail.value.orderDetail.push(data)
  } else {
    confirmCompleteOrderDetail.value.orderDetail =
      confirmCompleteOrderDetail.value.orderDetail.filter((item) => item.goodsId !== data.goodsId)
    completeOrderDetail.value.orderDetail.push(data)
  }
}
//
// 发货 ？签收
const onSave = async () => {
  if (imageList.value.length === 0) {
    uni.showToast({ icon: 'error', title: '请上传证迹图片' })
    return
  }
  const status = completeOrderDetail.value.orderInfo.status

  if (status === '2' || status === '12') {
    // 订单发货
    const orderDetail: ShipOrderItem[] = []
    if (confirmCompleteOrderDetail.value.orderDetail.length === 0) {
      uni.showToast({ icon: 'none', title: '请选择需要发货的商品' })
      return
    }
    confirmCompleteOrderDetail.value.orderDetail.forEach((item) => {
      orderDetail.push({
        detailId: item.detailId,
        actNum: item.num.toString(),
        unitPrice: item.unitPrice,
      })
    })
    if (orderDetail.length === 0) {
      uni.showToast({ icon: 'error', title: ' 请选择待发货的商品' })
    }
    const res = await shipOrderAPI({
      orderId: props.orderId,
      orderDetail,
      shipImages: imageList.value.join(','),
    })
    if (res.code === '1') {
      uni.showToast({ icon: 'success', title: '发货成功！' })
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/my/my' })
      }, 500)
    }
  }
  if (status === '3') {
    console.log('imageList.value', imageList.value)
    if (imageList.value.length === 0) {
      uni.showToast({ icon: 'none', title: '请上传签收照片' })
    }
    // 订单签收
    const res = await signInOrderAPI({
      orderId: props.orderId,
      signInImages: imageList.value.join(','),
    })
    if (res.code === '1') {
      uni.showToast({ icon: 'success', title: '签收成功！' })
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/my/my' })
      }, 500)
    }
  }
}
</script>

<template>
  <scroll-view class="viewport" scroll-y enable-back-to-top>
    <SolaShopHeader :title="deliveryStage" />
    <view class="container">
      <view class="orderno"
        >订单号：{{ completeOrderDetail.orderInfo && completeOrderDetail.orderInfo.orderNo }}
      </view>
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
            <view class="xiadan">订单数量：{{ item.num }}{{ item.units }}</view>
            <!-- <view class="fahuo">发货：￥{{ item.actNum }}{{ item.units }}</view> -->
            <view
              v-if="deliveryStage === '待发货订单'"
              class="btn"
              @tap="($event) => onChangeGoodsStatus(item, 'confirm')"
            >
              手动发货</view
            >
          </view>
        </view>
      </view>
      <view class="list-container" v-if="deliveryStage === '待发货订单'">
        <view>
          <text>订单发货</text>
        </view>
        <view
          class="item"
          v-for="item in confirmCompleteOrderDetail.orderDetail"
          :key="item.goodsId"
        >
          <image :src="item.goodsImages[0]" mode="scaleToFill" />
          <view class="info">
            <view class="infotitle">{{ item.goodsName }}</view>
            <!-- <view class="xiadan">下单：￥{{ item.num }}{{ item.units }}</view> -->
            <view class="fahuo">发货数量：{{ item.num }}{{ item.units }}</view>
            <view class="btn cancel" @tap="($event) => onChangeGoodsStatus(item, 'cancel')"
              >取消发货</view
            >
          </view>
        </view>
      </view>
      <view class="bottom">
        <view class="b-item">
          <text>*发货阶段</text>
          <text class="b-value">{{ deliveryStage }}</text>
          <!-- <picker class="b-value" mode="multiSelector" placeholder="请选择发货阶段" :range="reconciliation"
                        @change="onReconciliationChange">
                        {{ deliveryStage }}<text class="ftysIcon icon-xiangyoujiantou" />
                    </picker> -->
        </view>
        <uni-file-picker
          v-if="completeOrderDetail.orderInfo"
          @delete="onDelete"
          @select="onSelect"
          class="choose-img"
          limit="3"
          :title="`拍照上传图片`"
        ></uni-file-picker>
        <view class="b-container">
          <button hover-class="button-hover" @tap="onSave">提交保存</button>
        </view>
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

  .container {
    height: 100%;
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    overflow: scroll;
    padding: 30rpx;

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
      padding: 20rpx 20rpx 80rpx 20rpx;
      // border-radius: 10rpx;
      background-color: #fff;
      border-bottom: 10rpx solid rgba(236, 236, 236, 1);

      .item {
        display: flex;
        margin-top: 20rpx;

        image {
          height: 160rpx;
          width: 160rpx;
        }

        .info {
          position: relative;
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

          .btn {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 120rpx;
            height: 40rpx;
            color: #fff;
            line-height: 40rpx;
            text-align: center;
            border-radius: 5px;
            background: linear-gradient(90deg, rgba(255, 112, 77, 1) 0%, rgba(255, 95, 77, 1) 100%);
            font-size: 20rpx;
          }

          .cancel {
            background: rgba(175, 176, 178, 1);
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

    .bottom {
      .b-item {
        height: 60rpx;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 20rpx;
        border-bottom: 1px solid rgba(242, 244, 247, 1);

        .b-value {
          color: rgba(175, 176, 178, 1);
        }
      }

      .b-container {
        width: 100%;
        margin-top: 40rpx;

        button {
          width: 80%;
          color: #fff;
          border-radius: 20rpx;
          background: linear-gradient(90deg, rgba(255, 112, 77, 1) 0%, rgba(255, 95, 77, 1) 100%);
        }
      }
    }
  }
}
</style>
