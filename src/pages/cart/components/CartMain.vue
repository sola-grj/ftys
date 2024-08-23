<script setup lang="ts">
import type {
  InputNumberBox,
  InputNumberBoxEvent,
} from '@/components/vk-data-input-number-box/vk-data-input-number-box'
import {
  removeShoppingCart,
  useAddShoppingCart,
  useGuessList,
  useUpdateShoppingCart,
} from '@/composables'
import {
  deleteMemberCartAPI,
  getMemberCartAPI,
  getShoppingCartAPI,
  putMemberCartBySkuIdAPI,
  putMemberCartSelectedAPI,
} from '@/services/cart'
import { useMemberStore } from '@/stores'
import type { CartItem } from '@/types/cart'
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
// 获取会员store
const memberStore = useMemberStore()

// 获取购物车
const cartList = ref<CartItem[]>([])
const getMemberCartData = async () => {
  const res = await getShoppingCartAPI()

  cartList.value = res.result.map((item) => {
    //@ts-ignore
    item.check = false
    return item
  })
  console.log('====', cartList.value)
}

// 初始化调用
onShow(() => {
  if (memberStore.profile) {
    getMemberCartData()
  }
})

// 点击删除按钮
const onDeleteCart = (id: string) => {
  // 弹窗二次确认
  uni.showModal({
    content: '是否删除',
    success: async (res) => {
      if (res.confirm) {
        // 后端删除单品
        const res = await removeShoppingCart(id)
        // 重新获取列表
        getMemberCartData()
      }
    },
  })
}

const onDeleteCarts = (datas: CartItem[]) => {
  if (seletedCardlistCount.value === 0) {
    uni.showToast({ icon: 'none', title: '请选择要删除的商品' })
  } else {
    const ids: string[] = []
    datas.forEach((item) => {
      ids.push(item.id)
    })
    // 弹窗二次确认
    uni.showModal({
      content: '是否删除',
      success: async (res) => {
        if (res.confirm) {
          // 后端删除单品
          const res = await removeShoppingCart(ids.join(','))
          // 重新获取列表
          getMemberCartData()
          isShowManage.value = false
        }
      },
    })
  }
}

// 修改商品数量
const onChangeCount = async (ev: InputNumberBoxEvent) => {
  await putMemberCartBySkuIdAPI(ev.index, { count: ev.value })
}

// 修改选中状态
const onChangeSelected = (item: CartItem) => {
  cartList.value = cartList.value.map((i) => {
    if (i.id === item.id) {
      i.check = !i.check
    }
    return i
  })
}

// 计算全选
const isSelectedAll = computed(() => {
  return cartList.value.length && cartList.value.every((v) => v.check)
})

// 修改全选状态
const onChangeSelectedAll = async () => {
  // 前端数据更新
  const _isSelectedAll = !isSelectedAll.value
  // 前端数据更新
  cartList.value.forEach((item) => {
    item.check = _isSelectedAll
  })
}

// 计算选中单品列表
const selectedCardList = computed(() => {
  return cartList.value.filter((v) => v.check)
})

// 计算选中的总件数
const seletedCardlistCount = computed(() => {
  return selectedCardList.value.reduce((sum, item) => sum + item.num, 0)
})

// 计算选中的总价格
const selectedCardListMoney = computed(() => {
  return selectedCardList.value
    .reduce((sum, item) => sum + parseInt(item.unit_price) * item.num, 0)
    .toFixed(2)
})

// 去结算
const goToPayment = () => {
  if (seletedCardlistCount.value === 0) {
    uni.showToast({ icon: 'none', title: '请选择商品' })
  } else {
    uni.navigateTo({ url: '/PagesOrder/create/create' })
  }
}

// 更新购物车
// 添加购物车
const currentCartId = ref('')
const addShoppingCart = async (data: CartItem, num: number, type: string) => {
  if (type === 'first') {
    const res = await useAddShoppingCart(
      {
        source: data.source,
        goodsId: data.goodsId,
        fGoodsId: data.fGoodsId,
        num,
        units: data.units,
        unitPrice: data.unit_price,
      },
      num,
    )
    if (res.code === '1') {
      currentCartId.value = res.result.cartId
      data.num = res.result.goodsNum
    }
  } else {
    if (num === 0) {
      // 弹窗二次确认
      uni.showModal({
        content: '是否删除',
        success: async (res) => {
          if (res.confirm) {
            // 后端删除单品
            const res = await removeShoppingCart(currentCartId.value || data.id)
            if (res.code === '1') {
              data.num = 0
            }
            // 重新获取列表
            getMemberCartData()
          } else {
            // data.num = data.num
          }
        },
        fail: (fail) => {
          console.log(fail)
        },
      })
    } else {
      const res = await useUpdateShoppingCart(
        {
          cartId: currentCartId.value || data.id,
          num,
          unitPrice: data.unit_price,
          units: data.units,
        },
        num,
      )
      if (res.code === '1') {
        data.num = res.result.goodsNum
      }
    }
  }
}

const isShowManage = ref(false)
const onTapManage = () => {
  isShowManage.value = !isShowManage.value
}
</script>

<template>
  <scroll-view scroll-y class="scroll-view" :style="{ paddingTop: safeAreaInsets!.top + 'px' }">
    <view class="top-title">
      <view class="title-container">
        <view class="text">购物车</view>
        <view class="position">
          <text class="ftysIcon icon-dingwei"
            >大数据大数据大数据大数据大数据大数据大数据大数据大数据大数据大数据</text
          >
        </view>
        <view v-if="!isShowManage" @tap="onTapManage" class="manage">管理</view>
        <view v-else class="manage manage-btns">
          <text @tap="($event) => onDeleteCarts(selectedCardList)" class="ftysIcon icon-shanchu"
            >删除</text
          >
          <text @tap="onTapManage">取消</text>
        </view>
      </view>
    </view>
    <!-- 已登录: 显示购物车 -->
    <template v-if="memberStore.profile">
      <!-- 购物车列表 -->
      <view class="cart-list" v-if="cartList.length">
        <view class="top-check-all">
          <view class="check-container">
            <text
              @tap="onChangeSelectedAll"
              :class="`ftysIcon ${isSelectedAll ? 'icon-xuanzhong1-copy' : 'icon-xuanzhong1'}`"
            ></text>
            <text class="checked-all-text">全选</text>
          </view>
          <view class="text">免运费</view>
        </view>
        <!-- 滑动操作分区 -->
        <uni-swipe-action>
          <!-- 滑动操作项 -->
          <uni-swipe-action-item v-for="item in cartList" :key="item.id" class="cart-swipe">
            <!-- 商品信息 -->
            <view class="goods">
              <!-- 选中状态 -->
              <view class="check-container">
                <text
                  @tap="($event) => onChangeSelected(item)"
                  :class="`ftysIcon ${item.check ? 'icon-xuanzhong1-copy' : 'icon-xuanzhong1'}`"
                ></text>
              </view>
              <navigator
                :url="`/pages/goods/goods?id=${item.id}`"
                hover-class="none"
                class="navigator"
              >
                <image mode="aspectFill" class="picture" :src="item.images[0]"></image>
                <view class="meta">
                  <view class="name ellipsis">{{ item.name }}</view>
                  <!-- <view class="attrsText ellipsis">{{ item.attrsText }}</view> -->
                  <view class="price">{{ item.unit_price }}/{{ item.units }}</view>
                </view>
              </navigator>
              <!-- 商品数量 -->
              <uni-number-box
                class="number-box"
                :min="1"
                :value="item.num"
                @change="($event) => addShoppingCart(item, $event, '')"
              />
            </view>
            <!-- 右侧删除按钮 -->
            <template #right>
              <view class="cart-swipe-right">
                <button @tap="($event) => onDeleteCart(item.id)" class="button delete-button">
                  删除
                </button>
              </view>
            </template>
          </uni-swipe-action-item>
        </uni-swipe-action>
      </view>
      <!-- 购物车空状态 -->
      <view class="cart-blank" v-else>
        <image src="/static/images/blank_cart.png" class="image" />
        <text class="text">购物车还是空的，快来挑选好货吧</text>
        <navigator open-type="switchTab" url="/pages/index/index" hover-class="none">
          <button class="button">去首页看看</button>
        </navigator>
      </view>
      <!-- 吸底工具栏 -->
      <view class="toolbar">
        <view class="all">
          <text
            @tap="onChangeSelectedAll"
            :class="`ftysIcon ${isSelectedAll ? 'icon-xuanzhong1-copy' : 'icon-xuanzhong1'}`"
          />
          <text>全选</text>
        </view>

        <text class="text">合计:</text>
        <text class="amount">{{ selectedCardListMoney }}</text>
        <view class="button-grounp">
          <view
            @tap="goToPayment"
            class="button payment-button"
            :class="{ disabled: seletedCardlistCount === 0 }"
          >
            去结算({{ seletedCardlistCount }})
          </view>
        </view>
      </view>
    </template>
    <!-- 未登录: 提示登录 -->
    <view class="login-blank" v-else>
      <text class="text">登录后可查看购物车中的商品</text>
      <navigator url="/pages/login/login" hover-class="none">
        <button class="button">去登录</button>
      </navigator>
    </view>
    <!-- 底部占位空盒子 -->
    <view class="toolbar-height"></view>
  </scroll-view>
</template>

<style lang="scss">
// 根元素
:host {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f7f7f8;
}

// 滚动容器
.scroll-view {
  width: 100%;
  position: relative;
  flex: 1;
}

.top-title {
  height: 400rpx;
  width: 100%;
  background: linear-gradient(to bottom, rgb(241 73 17) 0%, #f7f7f8 100%);
  padding: 20rpx;

  .title-container {
    display: flex;
    justify-content: space-between;
    color: #fff;
    align-items: center;
    height: 100rpx;

    .text {
      font-size: 36rpx;
      font-weight: bold;
    }

    .position {
      height: 40rpx;
      border-radius: 0px 8px, 8px, 8px;
      background: rgba(255, 255, 255, 0.1);
      font-size: 24rpx;
      width: 300rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-left: 10rpx;
    }

    .manage {
      font-size: 30rpx;
    }

    .manage-btns {
      .icon-shanchu {
        margin-right: 20rpx;
      }
    }
  }
}

// 购物车列表
.cart-list {
  margin: 0 20rpx;
  position: relative;
  padding-bottom: 100rpx;
  background-color: #fff;
  top: -270rpx;
  border-radius: 20rpx;
  overflow: scroll;

  .top-check-all {
    margin-top: 40rpx;
    display: flex;
    height: 60rpx;
    justify-content: space-between;
    align-items: center;

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

    .text {
      margin-right: 30rpx;
      font-size: 26rpx;
    }
  }

  // 优惠提示
  .tips {
    display: flex;
    align-items: center;
    line-height: 1;
    margin: 30rpx 10rpx;
    font-size: 26rpx;
    color: #666;

    .label {
      color: #fff;
      padding: 7rpx 15rpx 5rpx;
      border-radius: 4rpx;
      font-size: 24rpx;
      background-color: #27ba9b;
      margin-right: 10rpx;
    }
  }

  // 购物车商品
  .goods {
    position: relative;
    display: flex;
    padding: 20rpx 20rpx 20rpx 80rpx;
    border-radius: 10rpx;
    background-color: #fff;
    position: relative;

    .number-box {
      position: absolute;
      right: 20rpx;
      bottom: 20rpx;
    }

    .navigator {
      display: flex;
      width: 100%;
    }

    .check-container {
      position: absolute;
      top: 0;
      left: 0;

      display: flex;
      align-items: center;
      justify-content: center;
      width: 80rpx;
      height: 100%;

      .icon-xuanzhong {
        font-size: 40rpx;
      }
    }

    .checked {
      background-color: #cf4444;
      font-size: 40rpx;
    }

    .picture {
      width: 170rpx;
      height: 170rpx;
    }

    .meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin-left: 20rpx;
    }

    .name {
      height: 72rpx;
      font-size: 26rpx;
      color: #444;
    }

    .attrsText {
      line-height: 1.8;
      padding: 0 15rpx;
      font-size: 24rpx;
      align-self: flex-start;
      border-radius: 4rpx;
      color: #888;
      background-color: #f7f7f8;
    }

    .price {
      line-height: 1;
      font-size: 26rpx;
      color: #444;
      margin-bottom: 2rpx;
      color: #cf4444;

      &::before {
        content: '￥';
        font-size: 80%;
      }
    }

    // 商品数量
    .count {
      position: absolute;
      bottom: 20rpx;
      right: 5rpx;

      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 220rpx;
      height: 48rpx;

      .text {
        height: 100%;
        padding: 0 20rpx;
        font-size: 32rpx;
        color: #444;
      }

      .input {
        height: 100%;
        text-align: center;
        border-radius: 4rpx;
        font-size: 24rpx;
        color: #444;
        background-color: #f6f6f6;
      }
    }
  }

  .cart-swipe {
    display: block;
    margin: 20rpx 0;
  }

  .cart-swipe-right {
    display: flex;
    height: 100%;

    .button {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 50px;
      padding: 6px;
      line-height: 1.5;
      color: #fff;
      font-size: 26rpx;
      border-radius: 0;
    }

    .delete-button {
      background-color: #cf4444;
    }
  }
}

// 空状态
.cart-blank,
.login-blank {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 60vh;

  .image {
    width: 400rpx;
    height: 281rpx;
  }

  .text {
    color: #444;
    font-size: 26rpx;
    margin: 20rpx 0;
  }

  .button {
    width: 240rpx !important;
    height: 60rpx;
    line-height: 60rpx;
    margin-top: 20rpx;
    font-size: 26rpx;
    border-radius: 60rpx;
    color: #fff;
    background-color: #27ba9b;
  }
}

// 吸底工具栏
.toolbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: var(--window-bottom);
  z-index: 100;

  height: 100rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  border-top: 1rpx solid #ededed;
  border-bottom: 1rpx solid #ededed;
  background-color: #fff;
  box-sizing: content-box;

  .all {
    margin-left: 25rpx;
    font-size: 14px;
    color: #444;
    display: flex;
    align-items: center;
  }

  .checked::before {
    content: '\e6cc';
    color: #27ba9b;
  }

  .text {
    margin-right: 8rpx;
    margin-left: 32rpx;
    color: #444;
    font-size: 14px;
  }

  .amount {
    font-size: 20px;
    color: #cf4444;

    .decimal {
      font-size: 12px;
    }

    &::before {
      content: '￥';
      font-size: 12px;
    }
  }

  .button-grounp {
    margin-left: auto;
    display: flex;
    justify-content: space-between;
    text-align: center;
    line-height: 72rpx;
    font-size: 13px;
    color: #fff;

    .button {
      width: 240rpx;
      margin: 0 10rpx;
      border-radius: 20rpx;
    }

    .payment-button {
      background: linear-gradient(90deg, rgba(255, 112, 64, 1) 0%, rgba(255, 80, 64, 1) 100%);

      &.disabled {
        opacity: 0.6;
      }
    }
  }
}

// 底部占位空盒子
.toolbar-height {
  height: 100rpx;
}
</style>
