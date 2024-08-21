<script setup lang="ts">
import { getGoodsByIdAPI, goodsDetailPageRecommendGoodsAPI } from '@/services/goods'
import type { GoodsResult } from '@/types/goods'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import ServicePannel from './components/ServicePannel.vue'
import AddressPannel from './components/AddressPannel.vue'
import type {
  SkuPopupEvent,
  SkuPopupInstanceType,
  SkuPopupLocaldata,
} from '@/components/vk-data-goods-sku-popup/vk-data-goods-sku-popup'
import { computed } from 'vue'
import { addShoppingCartAPI, postMemberCartAPI } from '@/services/cart'
import { useAddressStore } from '@/stores/modules/address'
import type { AddressItem } from '@/types/address'
import { getMemberAddressAPI } from '@/services/address'
import type { RecommendItem } from '@/types/home'
import { useAddShoppingCart, useUpdateShoppingCart } from '@/composables'

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

// 接收页面参数
const query = defineProps<{
  source: string
  goodsId: string
}>()
console.log('query', query)

const splitArray = (array: any[], size: number) => {
  var result = []
  for (var i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

// 獲取商品详情推荐
const recommendGoods = ref<RecommendItem[]>([])
const swipperRecommendGoods = ref<any[]>([])
const goodsDetailPageRecommendGoodsData = async () => {
  const res = await goodsDetailPageRecommendGoodsAPI({
    goodsId: query.goodsId,
    source: query.source,
    page: 1,
    pageSize: 30,
  })
  recommendGoods.value = res.result.list
  swipperRecommendGoods.value = splitArray(res.result.list, 6)
}

// 获取商品详情信息
const goods = ref<GoodsResult>()
const getGoodsByIdData = async () => {
  const res = await getGoodsByIdAPI({
    source: query.source,
    goodsId: query.goodsId,
  })
  goods.value = res.result
}

const addressStore = useAddressStore()
//获取收货地址列表数据
const addressList = ref<AddressItem[]>([])
const getMemberAddressData = async () => {
  const res = await getMemberAddressAPI()
  addressList.value = res.result
}

onLoad(() => {
  getGoodsByIdData()
  goodsDetailPageRecommendGoodsData()
})
// 轮播图变化的回调
const currentIndex = ref(0)
const onChange: UniHelper.SwiperOnChange = (ev) => {
  currentIndex.value = ev.detail!.current
}
// 点击图片回调
const onTapImage = (url: string) => {
  // 大图预览
  uni.previewImage({
    current: url,
    urls: goods.value!.mainPictures,
  })
}
// uni-ui 弹出层组件
const popup = ref<{
  open: (type?: UniHelper.UniPopupType) => void
  close: () => void
}>()

// 关闭popup
const onClose = () => {
  popup.value?.close()
}

// 弹出层条件渲染
const popupName = ref<'address' | 'service'>()
const openPopup = () => {
  popup.value?.open()
}
// 是否显示SKU组件
const isShowSku = ref(false)
// 商品信息
const localdata = ref({} as SkuPopupLocaldata)
// 按钮模式
enum SkuMode {
  Both = 1,
  Cart = 2,
  Buy = 3,
}
const mode = ref<SkuMode>(SkuMode.Cart)
// 打开SKU弹窗修改按钮模式
const openSkuPopup = (val: SkuMode) => {
  isShowSku.value = true
  // 修改按钮模式
  mode.value = val
}
// sku组件实例
const skuPopupRef = ref<SkuPopupInstanceType>()
// 计算被选中的值
const selectArrText = computed(() => {
  return skuPopupRef.value?.selectArr?.join(' ').trim() || '请选择商品规格'
})

// 加入购物车事件
const onAddCart = async (ev: SkuPopupEvent) => {
  await postMemberCartAPI({ skuId: ev._id, count: ev.buy_num })
  uni.showToast({ title: '添加成功' })
  isShowSku.value = false
}
// 立即购买
const onBuyNow = (ev: SkuPopupEvent) => {
  uni.navigateTo({ url: `/PagesOrder/create/create?skuId=${ev._id}&count=${ev.buy_num}` })
}

const onShowModal = (tip: { tipTitle: string; tipDetail: string }) => {
  uni.showModal({
    title: '',
    content: '',
    confirmText: '确定',
  })
}
// 更新购物车
// 添加购物车
const cartNum = ref(0)
const addShoppingCart = async (data: any, num: number, type: string) => {
  let orderId = ''
  if (type === 'first') {
    useAddShoppingCart
    const res = await useAddShoppingCart(
      {
        source: data.source,
        goodsId: data.goodsId,
        fGoodsId: data.fGoodsId,
        num,
        units: data.unit,
        unitPrice: data.price,
      },
      num,
    )
    if (res.code === '1') {
      orderId = res.result.orderId
      cartNum.value = 1
    }
  } else {
    const res = await useUpdateShoppingCart(
      {
        cartId: orderId,
        num,
        unitPrice: data.price,
        units: data.unit,
      },
      num,
    )
    if (res.code === '1') {
      cartNum.value = num
    }
  }
}

// 更新购物车数量
const changeCartNum = async (value: number) => {
  // @ts-ignore
  await addShoppingCart(goods, value, '')
  console.log(value)
}
</script>

<template>
  <!-- sku弹窗组件 -->
  <vk-data-goods-sku-popup
    add-cart-background-color="#FFA868"
    buy-now-background-color="#27BA9B"
    :mode="mode"
    v-model="isShowSku"
    :localdata="localdata"
    ref="skuPopupRef"
    :actived-style="{
      color: '#27BA9B',
      borderColor: '#27BA9B',
      backgroundColor: '#E9F8F5',
    }"
    @add-cart="onAddCart"
    @buy-now="onBuyNow"
  />
  <scroll-view scroll-y class="viewport">
    <!-- 基本信息 -->
    <view class="goods">
      <!-- 商品主图 -->
      <view class="preview">
        <swiper @change="onChange" circular>
          <swiper-item v-for="item in goods?.images" :key="item">
            <image @tap="onTapImage(item)" mode="aspectFill" :src="item" />
          </swiper-item>
        </swiper>
        <view class="indicator">
          <text class="current">{{ currentIndex + 1 }}</text>
          <text class="split">/</text>
          <text class="total">{{ goods?.images.length }}</text>
        </view>
      </view>
    </view>
    <view class="meta">
      <view class="meta-item">
        <view class="label">选择</view>
        <view class="value">
          <view class="top">购买数量</view>
          <view class="bottom">￥{{ goods?.price }}/{{ goods?.unit }}</view>
        </view>
      </view>
      <view class="meta-item">
        <view class="label">注意</view>
        <view class="value"
          >{{ goods?.tip.tipTitle }} <text @tap="openPopup" class="ftysIcon icon-wenhao"></text
        ></view>
      </view>
    </view>
    <uni-popup ref="popup" type="dialog" background-color="#fff">
      <view class="popup-root">
        <!--eslint-disable-next-line-->
        <view v-html="goods?.tip.tipDetail"></view>
        <!-- <view class="footer">
          <view class="button primary" @tap="onClose">确认</view>
        </view> -->
      </view>
    </uni-popup>
    <view class="recommend">
      <swiper
        @change="onChange"
        indicator-active-color="#999999"
        circular
        :indicator-dots="true"
        :autoplay="true"
      >
        <swiper-item v-for="(item, index) in swipperRecommendGoods" :key="index">
          <view class="recommend-container">
            <view class="recommend-item" v-for="i in item" :key="i.goodsId">
              <image mode="aspectFill" class="img" :src="i.images[0]" />
              <view class="name">{{ i.name }}</view>
              <view class="bottom">
                <text>￥{{ i.price }}</text>
                <text class="ftysIcon icon-a-jiagou2x"></text>
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 商品详情 -->
    <view class="detail panel">
      <view class="title">
        <text>详情</text>
      </view>
      <view class="content">
        <view class="content-item">
          <text class="label">产地</text>
          <text class="value">{{ goods?.productPlace }}</text>
        </view>
        <view class="content-item">
          <text class="label">规格</text>
          <text class="value">{{ goods?.model }}</text>
        </view>
        <view class="content-item">
          <text class="label">重量</text>
          <text class="value">{{ goods?.weight }}</text>
        </view>
        <view class="content-item">
          <text class="label">包装</text>
          <text class="value">{{ goods?.package }}</text>
        </view>
        <view class="content-item">
          <text class="label">贮存条件</text>
          <text class="value">{{ goods?.storage }}</text>
        </view>
      </view>
      <view class="detailimage">
        <image
          mode="aspectFill"
          class="detail-image"
          :key="item"
          :src="item"
          v-for="item in goods?.detailImages"
        />
      </view>
    </view>
  </scroll-view>

  <!-- 用户操作 -->
  <view class="toolbar" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }">
    <view class="icons">
      <button class="icons-button" open-type="contact">
        <text class="ftysIcon icon-kefu"></text>客服
      </button>
      <navigator class="icons-button" url="/pages/cart/cart2" open-type="navigate">
        <uni-badge class="uni-badge-left-margin" :text="8" absolute="rightTop" size="small">
          <view class="box"><text class="ftysIcon icon-gouwuche"></text></view>
        </uni-badge>
        <view class="text">购物车</view>
      </navigator>
    </view>
    <view class="buttons">
      <uni-number-box class="number-box" v-if="cartNum" @change="changeCartNum" />
      <view v-else @tap="($event: any) => addShoppingCart(goods, 1, 'first')" class="addcart">
        加入购物车
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
page {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.viewport {
  background-color: #f4f4f4;
  margin-bottom: 200rpx;
}

::v-deep .uni-popup__wrapper {
  border-radius: 20rpx;
}

.popup-root {
  padding: 30rpx 30rpx 0;
  border-radius: 10rpx 10rpx 0 0;
  overflow: scroll;
  min-height: 500rpx;
  width: 500rpx;

  .title {
    font-size: 30rpx;
    text-align: center;
    margin-bottom: 30rpx;
  }

  .description {
    font-size: 28rpx;
    padding: 0 20rpx;

    .image {
      width: 100%;
      height: 100%;
    }

    .tips {
      color: #444;
      margin-bottom: 12rpx;
    }

    .cell {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15rpx 0;
      color: #666;
    }

    .icon::before {
      content: '\e6cd';
      font-family: 'erabbit' !important;
      font-size: 38rpx;
      color: #999;
    }

    .icon.checked::before {
      content: '\e6cc';
      font-size: 38rpx;
      color: #27ba9b;
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    padding: 30rpx 0 40rpx;
    font-size: 28rpx;
    color: #444;

    .button {
      flex: 1;
      height: 72rpx;
      text-align: center;
      line-height: 72rpx;
      margin: 0 20rpx;
      color: #444;
      border-radius: 72rpx;
      border: 1rpx solid #ccc;
    }

    .primary {
      color: #fff;
      background-color: #27ba9b;
      border: none;
    }
  }
}

.panel {
  margin-top: 20rpx;
  background-color: #fff;

  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 90rpx;
    line-height: 1;
    padding: 30rpx 60rpx 30rpx 6rpx;
    position: relative;

    text {
      padding-left: 10rpx;
      font-size: 28rpx;
      color: #333;
      font-weight: 600;
    }

    navigator {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.arrow {
  &::after {
    position: absolute;
    top: 50%;
    right: 30rpx;
    content: '\e6c2';
    color: #ccc;
    font-family: 'erabbit' !important;
    font-size: 32rpx;
    transform: translateY(-50%);
  }
}

/* 商品信息 */
.goods {
  background-color: #fff;

  .preview {
    height: 750rpx;
    position: relative;

    .image {
      width: 750rpx;
      height: 750rpx;
    }

    .indicator {
      height: 40rpx;
      padding: 0 24rpx;
      line-height: 40rpx;
      border-radius: 30rpx;
      color: #fff;
      font-family: Arial, Helvetica, sans-serif;
      background-color: rgba(0, 0, 0, 0.3);
      position: absolute;
      bottom: 30rpx;
      right: 30rpx;

      .current {
        font-size: 26rpx;
      }

      .split {
        font-size: 24rpx;
        margin: 0 1rpx 0 2rpx;
      }

      .total {
        font-size: 24rpx;
      }
    }
  }

  .action {
    padding-left: 20rpx;

    .item {
      height: 90rpx;
      padding-right: 60rpx;
      border-bottom: 1rpx solid #eaeaea;
      font-size: 26rpx;
      color: #333;
      position: relative;
      display: flex;
      align-items: center;

      &:last-child {
        border-bottom: 0 none;
      }
    }

    .label {
      width: 60rpx;
      color: #898b94;
      margin: 0 16rpx 0 10rpx;
    }

    .text {
      flex: 1;
      -webkit-line-clamp: 1;
    }
  }
}

/*价格信息 */
.meta {
  margin-top: 20rpx;
  min-height: 240rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;

  .meta-item {
    display: flex;

    .label {
      color: #999;
      margin-right: 20rpx;
    }

    .value {
      .bottom {
        width: 240rpx;
        height: 100rpx;
        line-height: 100rpx;
        text-align: center;
        color: #fff;
        margin: 30rpx 0;
        border-radius: 4px;
        background: linear-gradient(90deg, rgba(255, 112, 64, 1) 0%, rgba(255, 80, 64, 1) 100%);
      }
    }
  }
}

.recommend {
  margin-top: 20rpx;
  height: 900rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;

  .recommend-container {
    width: 100%;
    display: flex;
    flex-wrap: wrap;

    .recommend-item {
      // flex: 1; // width: 100rpx;
      // height: 100rpx;
      width: 33%;
      height: 70%;
      background-color: #fff;
      padding: 10rpx;

      .name {
        height: 60rpx;
        margin-top: 10rpx;
        font-size: 26rpx;
      }

      .bottom {
        color: #cf4444;
        display: flex;
        justify-content: space-between;
      }

      .img {
        width: 100%;
        height: 270rpx;
      }
    }
  }
}

/* 商品详情 */
.detail {
  .content {
    margin: 20rpx;
    border: 1px solid #ebebeb;
    font-size: 26rpx;

    .content-item {
      display: flex;
      color: #666;
      height: 70rpx;
      border-bottom: 1px solid #ebebeb;
      line-height: 70rpx;

      .label {
        width: 150rpx;
        margin-left: 20rpx;
        margin-right: 60rpx;
      }
    }
  }
}

.detailimage {
  width: 100%;

  .detail-image {
    width: 750rpx;
    height: 750rpx;
  }
}

/* 同类推荐 */
.similar {
  .content {
    padding: 0 20rpx 200rpx;
    background-color: #f4f4f4;
    display: flex;
    flex-wrap: wrap;

    .goods {
      width: 340rpx;
      padding: 24rpx 20rpx 20rpx;
      margin: 20rpx 7rpx;
      border-radius: 10rpx;
      background-color: #fff;
    }

    .image {
      width: 300rpx;
      height: 260rpx;
    }

    .name {
      height: 80rpx;
      margin: 10rpx 0;
      font-size: 26rpx;
      color: #262626;
    }

    .price {
      line-height: 1;
      font-size: 20rpx;
      color: #cf4444;
    }

    .number {
      font-size: 26rpx;
      margin-left: 2rpx;
    }
  }

  navigator {
    &:nth-child(even) {
      margin-right: 0;
    }
  }
}

/* 底部工具栏 */
.toolbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  background-color: #fff;
  height: 130rpx;
  padding: 0 20rpx var(--window-bottom);
  border-top: 1rpx solid #eaeaea;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: content-box;

  .buttons {
    display: flex;

    & > view {
      width: 220rpx;
      text-align: center;
      line-height: 72rpx;
      font-size: 26rpx;
      color: #fff;
      border-radius: 20rpx;
    }

    .addcart {
      background: linear-gradient(90deg, rgba(255, 112, 64, 1) 0%, rgba(255, 80, 64, 1) 100%);
    }

    .buynow,
    .payment {
      background-color: #27ba9b;
      margin-left: 20rpx;
    }
  }

  .icons {
    padding-right: 10rpx;
    display: flex;
    align-items: center;
    flex: 1;

    .icons-button {
      width: 30%;
      text-align: center;
      line-height: 1.4;
      padding: 0;
      margin: 0;
      border-radius: 0;
      font-size: 20rpx;
      color: #333;
      background-color: #fff;

      &::after {
        border: none;
      }
    }

    text {
      display: block;
      font-size: 34rpx;
    }
  }
}
</style>
