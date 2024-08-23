<script setup lang="ts">
import {
  getMemberOrderPreAPI,
  getMemberOrderPreNowAPI,
  getMemberOrderRepurchaseByIdAPI,
  postMemberOrderAPI,
} from '@/services/order'
import { useAddressStore } from '@/stores/modules/address'
import type { OrderPreResult } from '@/types/order'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
// 订单备注
const buyerMessage = ref('')
// 配送时间
const deliveryList = ref([
  { type: 1, text: '时间不限 (周一至周日)' },
  { type: 2, text: '工作日送 (周一至周五)' },
  { type: 3, text: '周末配送 (周六至周日)' },
])
// 当前配送时间下标
const activeIndex = ref(0)
// 当前配送时间
const activeDelivery = computed(() => deliveryList.value[activeIndex.value])
// 修改配送时间
const onChangeDelivery: UniHelper.SelectorPickerOnChange = (ev) => {
  activeIndex.value = ev.detail.value
}

const query = defineProps<{
  skuId?: string
  count?: string
  orderId?: string
}>()

// 获取订单信息
const orderPre = ref<OrderPreResult>()
const getMemberOrderPreData = async () => {
  if (query.skuId && query.count) {
    const res = await getMemberOrderPreNowAPI({
      count: query.count,
      skuId: query.skuId,
    })
    orderPre.value = res.result
  } else if (query.orderId) {
    // 再次购买
    const res = await getMemberOrderRepurchaseByIdAPI(query.orderId)
    orderPre.value = res.result
  } else {
    const res = await getMemberOrderPreAPI()
    orderPre.value = res.result
  }
}

onLoad(() => {
  getMemberOrderPreData()
})

const addressStore = useAddressStore()
// 收货地址
const selectedAddress = computed(() => {
  return addressStore.selectedAddress || orderPre.value?.userAddresses.find((v) => v.isDefault)
})

// 提交订单
const onOrderSubmit = async () => {
  if (!selectedAddress.value?.id) {
    return uni.showToast({ icon: 'none', title: '请选择收货地址' })
  }
  const res = await postMemberOrderAPI({
    addressId: selectedAddress.value?.id,
    buyerMessage: buyerMessage.value,
    deliveryTimeType: activeDelivery.value.type,
    goods: orderPre.value!.goods.map((v) => ({ count: v.count, skuId: v.skuId })),
    payChannel: 2,
    payType: 1,
  })
  // 关闭当前页面，跳转到订单详情页
  uni.redirectTo({ url: `/PagesOrder/detail/detail?id=${res.result.id}` })
}
</script>

<template>
  <scroll-view scroll-y class="viewport">
    <view class="top-title">
      <view class="title" :style="{ paddingTop: safeAreaInsets!.top + 'px' }">
        <text @tap="goback" class="ftysIcon icon-xiangzuojiantou"></text>
        <text class="text">确认订单</text>
      </view>
    </view>
    <view class="container">
      <!-- 收货地址 -->
      <view class="address">
        <view class="add-title">收获方式</view>
        <view class="add-psz">配送至</view>
        <view class="add-detail">浙江省杭州市余杭区良渚街道博园路8号杭州果品批发市场</view>
        <view class="add-person">
          <text class="person-name">李亦男</text>
          <text class="person-phone">189****7054</text>
        </view>
      </view>
      <!-- 支付方式 -->
      <view class="pay-type">
        <view class="pay-title">支付方式</view>
        <view class="pay-value">货单付款</view>
      </view>
      <!-- 配送时间 -->
      <view class="time">
        <view class="time-title">配送时间</view>
        <view class="time-value">2024-07-09 （周二）</view>
      </view>

      <!-- 商品信息 -->
      <view class="goods">
        <navigator
          v-for="item in orderPre?.goods"
          :key="item.skuId"
          :url="`/pages/goods/goods?id=${item.id}`"
          class="item"
          hover-class="none"
        >
          <image class="picture" :src="item.picture" />
          <view class="meta">
            <view class="name ellipsis"> {{ item.name }} </view>
            <view class="attrs">{{ item.attrsText }}</view>
            <view class="prices">
              <view class="pay-price symbol">{{ item.payPrice }}</view>
              <view class="price symbol">{{ item.price }}</view>
            </view>
            <view class="count">x{{ item.count }}</view>
          </view>
        </navigator>
      </view>

      <!-- 配送及支付方式 -->
      <view class="related">
        <view class="item">
          <text class="text">配送时间</text>
          <picker :range="deliveryList" range-key="text" @change="onChangeDelivery">
            <view class="icon-fonts picker">{{ activeDelivery.text }}</view>
          </picker>
        </view>
        <view class="item">
          <text class="text">订单备注</text>
          <input
            class="input"
            :cursor-spacing="30"
            placeholder="选题，建议留言前先与商家沟通确认"
            v-model="buyerMessage"
          />
        </view>
      </view>

      <!-- 支付金额 -->
      <view class="settlement">
        <view class="item">
          <text class="text">商品总价: </text>
          <text class="number symbol">{{ orderPre?.summary.totalPayPrice.toFixed(2) }}</text>
        </view>
        <view class="item">
          <text class="text">运费: </text>
          <text class="number symbol">{{ orderPre?.summary.postFee.toFixed(2) }}</text>
        </view>
      </view>
    </view>
  </scroll-view>

  <!-- 吸底工具栏 -->
  <view class="toolbar" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }">
    <view class="total-pay symbol">
      <text class="number">{{ orderPre?.summary.totalPayPrice.toFixed(2) }}</text>
    </view>
    <view class="button" @tap="onOrderSubmit" :class="{ disabled: !selectedAddress?.id }">
      提交订单
    </view>
  </view>
</template>

<style lang="scss">
page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: #f4f4f4;
}

// 滚动容器
.scroll-view {
  width: 100%;
  position: relative;
}

.top-title {
  height: 400rpx;
  width: 100%;
  background: linear-gradient(to bottom, rgb(241 73 17) 0%, #f7f7f8 100%);
  padding: 20rpx;

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
}

.container {
  // overflow: scroll;
  height: 100%;

  .address {
    overflow: hidden;
    margin: 20rpx;
    padding: 0 20rpx;
    border-radius: 10rpx;
    background-color: #fff;

    .add-title {
      margin-top: 40rpx;
      font-weight: bold;
    }

    .add-psz {
      color: #999;
      margin-top: 40rpx;
      font-size: 28rpx;
    }

    .add-detail {
      font-weight: bold;
      margin-top: 20rpx;
    }

    .add-person {
      margin: 30rpx 0;
      color: #999;
      font-size: 28rpx;

      .person-name {
        margin-right: 30rpx;
      }
    }
  }

  .pay-type {
    // overflow: hidden;
    margin: 20rpx;
    padding: 20rpx 20rpx;
    border-radius: 10rpx;
    background-color: #fff;
    display: flex;
    justify-content: space-between;

    .pay-value {
      margin-right: 100rpx;
      color: #ff5340;
      font-weight: 600;
    }
  }

  .time {
    // overflow: hidden;
    margin: 20rpx;
    padding: 20rpx 20rpx;
    border-radius: 10rpx;
    background-color: #fff;
    display: flex;
    justify-content: space-between;

    .time-value {
      margin-right: 100rpx;
      color: #ff5340;
      font-weight: 600;
    }
  }
}

.symbol::before {
  content: '¥';
  font-size: 80%;
  margin-right: 5rpx;
}

.shipment {
  margin: 20rpx;
  padding: 30rpx 30rpx 30rpx 84rpx;
  font-size: 26rpx;
  border-radius: 10rpx;
  background: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/locate.png)
    20rpx center / 50rpx no-repeat #fff;
  position: relative;

  .icon {
    font-size: 36rpx;
    color: #333;
    transform: translateY(-50%);
    position: absolute;
    top: 50%;
    right: 20rpx;
  }

  .user {
    color: #333;
    margin-bottom: 5rpx;
  }

  .address {
    color: #666;
  }
}

.goods {
  margin: 20rpx;
  padding: 0 20rpx;
  border-radius: 10rpx;
  background-color: #fff;

  .item {
    display: flex;
    padding: 30rpx 0;
    border-top: 1rpx solid #eee;

    &:first-child {
      border-top: none;
    }

    .picture {
      width: 170rpx;
      height: 170rpx;
      border-radius: 10rpx;
      margin-right: 20rpx;
    }

    .meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
    }

    .name {
      height: 80rpx;
      font-size: 26rpx;
      color: #444;
    }

    .attrs {
      line-height: 1.8;
      padding: 0 15rpx;
      margin-top: 6rpx;
      font-size: 24rpx;
      align-self: flex-start;
      border-radius: 4rpx;
      color: #888;
      background-color: #f7f7f8;
    }

    .prices {
      display: flex;
      align-items: baseline;
      margin-top: 6rpx;
      font-size: 28rpx;

      .pay-price {
        margin-right: 10rpx;
        color: #cf4444;
      }

      .price {
        font-size: 24rpx;
        color: #999;
        text-decoration: line-through;
      }
    }

    .count {
      position: absolute;
      bottom: 0;
      right: 0;
      font-size: 26rpx;
      color: #444;
    }
  }
}

/* 结算清单 */
.settlement {
  margin: 20rpx;
  padding: 0 20rpx;
  border-radius: 10rpx;
  background-color: #fff;

  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 80rpx;
    font-size: 26rpx;
    color: #333;
  }

  .danger {
    color: #cf4444;
  }
}

/* 吸底工具栏 */
.toolbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(var(--window-bottom));
  z-index: 1;

  background-color: #fff;
  height: 100rpx;
  padding: 0 20rpx;
  border-top: 1rpx solid #eaeaea;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: content-box;

  .total-pay {
    font-size: 40rpx;
    color: #cf4444;

    .decimal {
      font-size: 75%;
    }
  }

  .button {
    width: 220rpx;
    text-align: center;
    line-height: 72rpx;
    font-size: 26rpx;
    color: #fff;
    border-radius: 72rpx;
    background-color: #27ba9b;
  }

  .disabled {
    opacity: 0.6;
  }
}
</style>
