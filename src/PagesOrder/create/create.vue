<script setup lang="ts">
import { getMyCouponListAPI } from '@/services/coupon'
import {
  createOrderAPI,
  getMemberOrderPreAPI,
  getMemberOrderPreNowAPI,
  getMemberOrderRepurchaseByIdAPI,
  postMemberOrderAPI,
  type CreateOrderCartItem,
} from '@/services/order'
import { useMemberStore } from '@/stores'
import { useAddressStore } from '@/stores/modules/address'
import type { CartItem } from '@/types/cart'
import type { CouponItem, MyCouponItem } from '@/types/coupon'
import type { OrderPreResult } from '@/types/order'
import { cal } from '@/utils/cal'
import { onLoad, onShow, onUnload } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

const couponpopup = ref()
const memberStore = useMemberStore()
const pay_way = memberStore.profile?.userinfo.pay_way
const remark = ref('')
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
// 获取当前日期
let today = new Date()

// 获取明天的日期
let tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)

// 获取明天是星期几
let dayOfWeek = tomorrow.getDay()

// 获取明天数据
const getYestDayOrNextDay = () => {
  // 将星期几转换为中文
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  // 获取当前日期
  const today = new Date()
  // 计算前一天的日期
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  // 获取明天是星期几
  const dayOfWeek = tomorrow.getDay()
  const tomorrowOfWeek = weekdays[dayOfWeek]

  return { tomorrow: tomorrow.toLocaleDateString().replaceAll('/', '-'), tomorrowOfWeek }
}
const deliverDate = ref('')
// 获取优惠券
const couponList = ref<MyCouponItem[]>([])
const getOwnCouponData = async () => {
  const res = await getMyCouponListAPI({ status: '1' })
  deliverDate.value = res.result.deliverDate
  couponList.value = res.result.list
  isAvalibleCouponList()
}

// 判断当前用户是否有可以使用的优惠券
const avalibleCouponList = ref<MyCouponItem[]>([])
const isAvalibleCouponList = () => {
  avalibleCouponList.value = couponList.value.filter((item) => {
    // 优惠券面额判定
    const isAmountfit = Number(selectedCardListMoney.value) > Number(item.amount_limit)
    // 优惠券有效起止时间
    const today = new Date()
    const start = new Date(Date.parse(item.expire_start_time))
    const end = new Date(Date.parse(item.expire_end_time))
    const isTimefit = today >= start && today <= end

    if (isAmountfit && isTimefit) {
      return item
    }
  })
}

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
const currentChooseCoupon = ref<MyCouponItem>({} as MyCouponItem)
const chooseCoupon = (couponId: string) => {
  uni.navigateBack()
  currentChooseCoupon.value = avalibleCouponList.value.find(
    (item) => item.couponId === couponId,
  ) as MyCouponItem
  // @ts-ignore
  selectedCardListMoney.value = cal
    .jian(Number(selectedCardListMoney.value), Number(currentChooseCoupon.value.face_value))
    .toFixed(2)
  console.log(couponId, 'couponId', currentChooseCoupon.value)
}
const query = defineProps<{
  skuId?: string
  count?: string
  orderId?: string
  couponId?: string
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
const selectedCardList = ref<CartItem[]>([])
const cartList = ref<CartItem[]>([])
const selectedCardListMoney = ref('')
onUnload(() => {
  uni.$off('selectedCardList')
})
onShow(() => {
  uni.$on('selectedCardList', (data) => {
    selectedCardList.value = data.selectedCardList
    selectedCardListMoney.value = data.selectedCardListMoney
    cartList.value = data.cartList
    // 获取优惠券信息
    getOwnCouponData()
  })
})

const addressStore = useAddressStore()
// 收货地址
const selectedAddress = computed(() => {
  return addressStore.selectedAddress || orderPre.value?.userAddresses.find((v) => v.isDefault)
})

// 提交订单
const onOrderSubmit = async () => {
  let createCartList: CreateOrderCartItem[] = []
  let res: { result: any; code: string; msg: string } = { result: null, code: '', msg: '' }
  selectedCardList.value.forEach((item) => {
    createCartList.push({
      cartId: item.id.toString(),
      num: item.num.toString(),
      unitPrice: item.unit_price.toString(),
      costUnitPrice: item.cost_unit_price ? item.cost_total_price : '',
    })
  })
  // 不使用优惠券
  if (!currentChooseCoupon.value.couponId) {
    res = await createOrderAPI({
      userCoupon: '0',
      couponId: '0',
      remark: remark.value,
      cartList: createCartList,
    })
  } else {
    // 使用优惠券
    res = await createOrderAPI({
      userCoupon: '1',
      couponId: currentChooseCoupon.value.couponId,
      couponAmount: currentChooseCoupon.value.face_value,
      remark: remark.value,
      cartList: createCartList,
    })
  }
  if (res.code === '1' && res.result.orderId) {
    uni.showToast({
      icon: 'success',
      title: '订单创建成功',
    })
  } else {
    uni.showToast({
      icon: 'success',
      title: res.msg,
    })
  }
  setTimeout(() => {
    if (pay_way === 'credit') {
      // 关闭当前页面，跳转到订单详情页
      uni.redirectTo({ url: `/PagesOrder/list/list` })
    } else {
      uni.navigateTo({
        url: `/PagesOrder/orderpay/orderpay?orderId=${res.result.order_id}&orderNo=${res.result.orderNo}&money=${res.result.money}&orderPayPrice=${res.result.orderPayPrice}`,
      })
    }
  }, 500)
}
const goback = () => {
  uni.navigateBack()
}

// 有效期展示
const showExpireText = (data: MyCouponItem) => {
  // 展示有效期
  if (data.expire_type === '1') {
    return `${data.expire_days}天后过期`
  } else {
    return `有效期 ${data.expire_start_time.slice(2)}-${data.expire_end_time.slice(2)}`
  }
}
// 去选择优惠券
const goToChooseCoupon = () => {
  uni.navigateTo({
    url: '/PagesOrder/coupon/coupon?from=order',
    success: (res) => {
      uni.$emit('avalibleCouponList', {
        avalibleCouponList: avalibleCouponList.value,
        chooseCoupon,
        currentChooseCoupon: currentChooseCoupon.value,
      })
    },
  })
}
const showValue = () => {
  if (avalibleCouponList.value.length === 0) {
    return '暂无可用优惠券'
  }
  if (avalibleCouponList.value.length > 0 && !currentChooseCoupon.value.couponId) {
    return '请选择优惠券'
  }
  if (avalibleCouponList.value.length > 0 && currentChooseCoupon.value.couponId) {
    return `-￥${currentChooseCoupon.value.face_value}`
  }
}
</script>

<template>
  <scroll-view scroll-y class="viewport">
    <view class="top-title">
      <SolaShopHeader title="确认订单" />
    </view>
    <view class="container">
      <!-- 收货地址 -->
      <view class="address">
        <view class="add-title">收获方式</view>
        <view class="add-psz">配送至</view>
        <view class="add-detail">{{ memberStore.profile?.userinfo.shipping_addr }}</view>
        <view class="add-person">
          <text class="person-name">{{ memberStore.profile?.userinfo.username }}</text>
          <text class="person-phone">{{ memberStore.profile?.userinfo.mobile }}</text>
        </view>
      </view>
      <!-- 支付方式 -->
      <view class="pay-type">
        <view class="pay-title">支付方式</view>
        <view class="pay-value">{{
          memberStore.profile?.userinfo.pay_way === 'credit' ? '货到付款' : '在线支付'
        }}</view>
      </view>
      <!-- 配送时间 -->
      <view class="time">
        <view class="time-title">配送时间</view>
        <view class="time-value">{{ deliverDate }}</view>
      </view>

      <!-- 商品信息 -->
      <view class="list-container">
        <view class="item" v-for="item in selectedCardList" :key="item.goodsId">
          <image :src="item.images[0]" mode="scaleToFill" />
          <view class="info">
            <view class="title">{{ item.name }}</view>
            <view class="right">
              <view class="price">￥{{ item.unit_price }}/{{ item.units }}</view>
              <view class="num"> X{{ item.num }}</view>
            </view>
          </view>
        </view>
        <view class="remark">
          <view class="title">备注</view>
          <uni-easyinput
            placeholder="建议备注前先与商家沟通确认"
            class="question"
            type="textarea"
            v-model="remark"
          ></uni-easyinput>
        </view>
      </view>
      <!-- 支付金额 -->
      <view class="settlement">
        <view class="item">
          <text class="text">商品金额: </text>
          <text class="number symbol">{{ selectedCardListMoney }}</text>
        </view>
        <view class="item">
          <text class="text">运费: </text>
          <text class="number symbol">0.00</text>
        </view>
        <view class="item coupon">
          <text class="text">优惠券: </text>
          <text
            class="number"
            :class="currentChooseCoupon.face_value ? 'amount' : ''"
            @tap="goToChooseCoupon"
            >{{ showValue() }}</text
          >
        </view>
        <view class="total">
          <text class="text">合计: </text>
          <text class="total-num">{{ selectedCardListMoney }}</text>
        </view>
      </view>
      <uni-popup ref="couponpopup" background-color="#fff">
        <view class="popup-content">
          <view class="text">分类</view>
          <view class="coupon-list">
            <view v-for="item in avalibleCouponList" :key="item.name" class="coupon-item">
              <view class="left">
                <text class="face-value">￥{{ item.face_value }}</text>
                <text class="amount-limit">满{{ item.amount_limit }}元可用</text>
              </view>
              <view class="mid">
                <text class="name">{{ item.name }}</text>
                <text class="expire_type">{{ showExpireText(item) }}</text>
              </view>
              <view class="right" @tap="($event) => goToUse(item)">
                <view v-if="item.status === '1'" class="use-btn">使用</view>
                <image class="image" v-if="item.status === '2'" src="@/static/images/used.png" />
                <image class="image" v-if="item.status === '3'" src="@/static/images/expired.png" />
              </view>
            </view>
          </view>
        </view>
      </uni-popup>
    </view>
  </scroll-view>

  <!-- 吸底工具栏 -->
  <view class="toolbar" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }">
    <view class="total-pay symbol">
      <text class="number">￥{{ selectedCardListMoney }}</text>
      <text class="trans-fee">含运费：￥0.00</text>
    </view>
    <view class="button" @tap="onOrderSubmit"> 提交订单 </view>
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
}

.container {
  // overflow: scroll;
  position: relative;
  top: -220rpx;
  height: 100%;
  display: inline-block;
  width: 100%;

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

  .list-container {
    margin: 20rpx;
    padding: 20rpx 20rpx;
    border-radius: 10rpx;
    background-color: #fff;

    .item {
      display: flex;
      margin-top: 30rpx;

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

        .title {
        }

        .price {
          margin-top: 10rpx;
          color: #ff5040;
        }
      }

      .right {
        display: flex;
        // flex: 1;
        justify-content: space-between;
        align-items: flex-end;
        color: #ff5040;

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
    }

    .remark {
      margin-top: 30rpx;
      display: flex;

      .title {
        font-size: 30rpx;
        margin-right: 40rpx;
        color: rgba(50, 50, 51, 1);
      }
    }
  }

  /* 结算清单 */
  .settlement {
    margin: 20rpx;
    padding: 20rpx;
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

    .coupon {
      color: rgba(255, 80, 64, 1);
      border-bottom: 1px solid #d0cbcb;
    }

    .total {
      margin: 30rpx 0;
      text-align: right;

      .total-num {
        color: #cf4444;
      }
    }

    .danger {
      color: #cf4444;
    }
  }
}

// .symbol::before {
//   content: '¥';
//   font-size: 80%;
//   margin-right: 5rpx;
// }

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
    display: flex;
    flex-direction: column;
    font-size: 40rpx;
    color: #cf4444;

    .decimal {
      font-size: 75%;
    }

    .trans-fee {
      color: #d0cbcb;
      font-size: 22rpx;
    }
  }

  .button {
    width: 220rpx;
    text-align: center;
    line-height: 72rpx;
    font-size: 26rpx;
    color: #fff;
    border-radius: 20rpx;
    background: linear-gradient(90deg, rgba(255, 112, 64, 1) 0%, rgba(255, 80, 64, 1) 100%);
  }

  .disabled {
    opacity: 0.6;
  }
}
</style>
