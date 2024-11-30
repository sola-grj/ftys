<script setup lang="ts">
import { removeShoppingCart, useAddShoppingCart, useUpdateShoppingCart } from '@/composables'
import {
  batchAddShoppingCartAPI,
  getShoppingCartAPI,
  type AddShoppingCartDataType,
} from '@/services/cart'
import { useMemberStore } from '@/stores'
import type { CartItem } from '@/types/cart'
import { onHide, onLoad, onShow, onUnload } from '@dcloudio/uni-app'
import { computed, ref, onBeforeUnmount, onMounted } from 'vue'
import { cal } from '@/utils/cal'
import type { OrderItem } from '@/types/order'
import type { RecommendItem } from '@/types/home'
import { getRecommendGoodsAPI } from '@/services/home'
import type { PageParams } from '@/types/global'

const priceHide = ref('0')
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const { top, height } = uni.getMenuButtonBoundingClientRect()
// 获取会员store
const memberStore = useMemberStore()

// 获取购物车
const cartList = ref<CartItem[]>([])
const getMemberCartData = async () => {
  const res = await getShoppingCartAPI()

  cartList.value = res.result.map((item) => {
    //@ts-ignore
    item.check = false
    if (item.priceHide === '1') {
      priceHide.value = '1'
    } else {
      priceHide.value = '0'
    }
    return item
  })
  if (res.result.length > 0) {
    uni.setTabBarBadge({
      //显示数字
      index: 3, //tabbar下标
      text: `${res.result.length}`, //数字
    })
  } else {
    uni.removeTabBarBadge({
      //显示数字
      index: 3, //tabbar下标
    })
  }
  console.log('====', cartList.value)
}

// 初始化调用
const againBuyGoodsOrder = ref<OrderItem>({} as OrderItem)
onUnload(() => {
  console.log('onBeforeUnmount======')
  uni.$off('againBuy')
})
onBeforeUnmount(() => {
  console.log('onBeforeUnmount======')

  uni.$off('againBuy')
})
onHide(() => {
  console.log('onHide======')
  uni.$off('againBuy')
})
// onMounted(())
onShow(() => {
  console.log('=============cartmain data show========')
  recommendPageParams.page = 1
  recommendFinish.value = false
  getRecommendData()
  getMemberCartData()
  uni.$on('againBuy', async (data) => {
    console.log('cartmain data========', data)

    // 再次购买
    againBuyGoodsOrder.value = data.againBuyGoodsOrder
    let goodsList: AddShoppingCartDataType[] = []
    againBuyGoodsOrder.value.detail.forEach((item) => {
      goodsList.push({
        source: item.source,
        goodsId: item.goodsId,
        fGoodsId: item.fGoodsId,
        num: Number(item.num),
        units: item.units,
        unitPrice: item.unitPrice,
        remark: item.remark,
      })
    })
    const res = await batchAddShoppingCartAPI({
      goodsList,
    })
    // 重新获取购物车数据
    await getMemberCartData()
    recommendPageParams.page = 1
    recommendFinish.value = false
    recommendList.value = []
    getRecommendData()
  })
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
        if (res.result.shoppingCartNum !== 0) {
          uni.setTabBarBadge({
            //显示数字
            index: 3, //tabbar下标
            text: `${res.result.shoppingCartNum}`, //数字
          })
        } else {
          uni.removeTabBarBadge({
            //显示数字
            index: 3, //tabbar下标
          })
        }
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
          if (res.result.shoppingCartNum !== 0) {
            uni.setTabBarBadge({
              //显示数字
              index: 3, //tabbar下标
              text: `${res.result.shoppingCartNum}`, //数字
            })
          } else {
            uni.removeTabBarBadge({
              //显示数字
              index: 3, //tabbar下标
            })
          }
          // 重新获取列表
          getMemberCartData()
          isShowManage.value = false
          recommendPageParams.page = 1
          recommendFinish.value = false
          recommendList.value = []
          getRecommendData()
        }
      },
    })
  }
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
  return (
    selectedCardList.value
      // @ts-ignore
      .reduce((sum, item) => cal.jia(sum, cal.cheng(Number(item.unit_price), item.num)), 0)
      // @ts-ignore
      .toFixed(2)
  )
})

// 去结算
const goToPayment = () => {
  if (seletedCardlistCount.value === 0) {
    uni.showToast({ icon: 'none', title: '请选择商品' })
  } else {
    uni.navigateTo({
      url: '/PagesOrder/create/create',
      success: (res) => {
        uni.$emit('cartmaintest', {
          test: 123,
        })
        setTimeout(() => {
          uni.$emit('selectedCardList', {
            selectedCardList: selectedCardList.value,
            selectedCardListMoney: selectedCardListMoney.value,
            cartList: cartList.value,
            priceHide: priceHide.value,
          })
        }, 200)

        // res.eventChannel.emit('selectedCardList', {
        //   selectedCardList: selectedCardList.value,
        //   selectedCardListMoney: selectedCardListMoney.value,
        //   cartList: cartList.value,
        // })
      },
    })
  }
}

// 更新购物车
// 添加购物车
const currentCartId = ref('')
const addShoppingCart = async (data: CartItem & RecommendItem, num: number, type: string) => {
  if (type === 'first') {
    const res = await useAddShoppingCart(
      {
        source: data.source,
        goodsId: data.goodsId,
        fGoodsId: data.fGoodsId,
        num,
        units: data.units || data.units,
        unitPrice: data.unit_price || data.price,
      },
      num,
    )
    if (res.code === '1') {
      currentCartId.value = res.result.cartId
      data.num = res.result.goodsNum
      if (res.result.shoppingCartNum !== 0) {
        uni.setTabBarBadge({
          //显示数字
          index: 3, //tabbar下标
          text: `${res.result.shoppingCartNum}`, //数字
        })
      } else {
        uni.removeTabBarBadge({
          //显示数字
          index: 3, //tabbar下标
        })
      }
    }
  } else {
    if (num === 0) {
      uni.showModal({
        content: '是否删除',
        success: async (res) => {
          if (res.confirm) {
            // 后端删除单品
            const res = await removeShoppingCart(currentCartId.value || data.id || data.cartId)
            getMemberCartData()
            recommendPageParams.page = 1
            recommendFinish.value = false
            recommendList.value = []
            getRecommendData()
            if (res.result.shoppingCartNum !== 0) {
              uni.setTabBarBadge({
                //显示数字
                index: 3, //tabbar下标
                text: `${res.result.shoppingCartNum}`, //数字
              })
            } else {
              uni.removeTabBarBadge({
                //显示数字
                index: 3, //tabbar下标
              })
            }
          }
        },
      })
      return
    } else {
      const res = await useUpdateShoppingCart(
        {
          cartId: currentCartId.value || data.id || data.cartId,
          num,
          units: data.units || data.units,
          unitPrice: data.unit_price || data.price,
        },
        num,
      )
      if (res.code === '1') {
        data.num = res.result.goodsNum
        if (res.result.shoppingCartNum !== 0) {
          uni.setTabBarBadge({
            //显示数字
            index: 3, //tabbar下标
            text: `${res.result.shoppingCartNum}`, //数字
          })
        } else {
          uni.removeTabBarBadge({
            //显示数字
            index: 3, //tabbar下标
          })
        }
      }
    }
  }
  getMemberCartData()
  recommendPageParams.page = 1
  recommendFinish.value = false
  recommendList.value = []
  getRecommendData()
}

const isShowManage = ref(false)
const onTapManage = () => {
  isShowManage.value = !isShowManage.value
}
// 底部推荐数据
// 获取底部推荐数据
const recommendPageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
const recommendFinish = ref(false)
const recommendList = ref<RecommendItem[]>([])
const getRecommendData = async () => {
  // 退出判断
  if (recommendFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getRecommendGoodsAPI({ ...recommendPageParams })
  // 分页数据增加
  recommendList.value.push(...res.result.list)
  if (recommendPageParams.page < Math.ceil(res.result.total / 10)) {
    // 页码累加
    recommendPageParams.page++
  } else {
    recommendFinish.value = true
  }
}
const goToDetail = (data: RecommendItem) => {
  uni.navigateTo({ url: `/PagesOrder/goods/goods?source=${data.source}&goodsId=${data.goodsId}` })
}
</script>

<template>
  <scroll-view scroll-y class="scroll-view">
    <view class="top-title" :style="{ paddingTop: height + top + 'px' }">
      <view class="title-container">
        <view class="text">购物车</view>
        <view class="position">
          <text class="ftysIcon icon-dingwei">{{
            memberStore.profile?.userinfo.shipping_addr
          }}</text>
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
        <view>
          <!-- 滑动操作项 -->
          <view v-for="item in cartList" :key="item.id" class="cart-swipe">
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
                :url="`/PagesOrder/goods/goods?source=${item.source}&goodsId=${item.goodsId}`"
                hover-class="none"
                class="navigator"
              >
                <image mode="aspectFill" class="picture" :src="item.images[0]"></image>
                <view class="meta">
                  <view class="top">
                    <view class="name ellipsis">{{ item.name }}</view>
                    <view class="delete" @tap.stop="($event) => onDeleteCart(item.id)">删除</view>
                  </view>

                  <!-- <view class="attrsText ellipsis">{{ item.attrsText }}</view> -->
                  <view class="price"
                    >{{ item.priceHide === '1' ? '-' : item.unit_price }}/{{ item.units }}</view
                  >
                </view>
              </navigator>
              <!-- 商品数量 -->
              <uni-number-box
                class="number-box"
                :min="0"
                :value="item.num"
                @change="($event) => addShoppingCart(item, $event, '')"
              />
            </view>
            <view class="remark-input">
              <uni-easyinput
                style="width: 80%"
                class="remark-input"
                placeholder="请输入商品备注"
                v-model="item.remark"
              ></uni-easyinput>
            </view>
            <!-- 右侧删除按钮 -->
            <!-- <template #right>
              <view class="cart-swipe-right">
                <button @tap="($event) => onDeleteCart(item.id)" class="button delete-button">
                  删除
                </button>
              </view>
            </template> -->
          </view>
        </view>
      </view>
      <!-- 购物车空状态 -->
      <view class="cart-blank" v-else>
        <image src="/static/images/blank_cart.png" class="image" />
        <text class="text">购物车还是空的，快来挑选好货吧</text>
        <navigator open-type="switchTab" url="/pages/index/index" hover-class="none">
          <button class="button">去首页看看</button>
        </navigator>
      </view>
      <view class="recommand-list-container-view">
        <scroll-view scroll-y @scrolltolower="getRecommendData" class="recommand-list-container">
          <view class="recommand-title"
            ><text class="ftysIcon icon-jingxuantuijian"></text> 精选推荐</view
          >
          <view
            @tap="($event) => goToDetail(item)"
            class="item"
            v-for="item in recommendList"
            :key="item.goodsId"
          >
            <view class="item-container">
              <image :src="item.images[0]" />
              <view class="name">{{ item.name }}</view>
              <view class="info" @tap.stop.prevent>
                <view class="price">￥{{ item.price }}</view>
                <uni-number-box
                  class="number-box"
                  v-if="item.cartGoodsNum"
                  @change.stop="($event) => addShoppingCart(item, $event, '')"
                  v-model="item.cartGoodsNum"
                />
                <view
                  v-else
                  @tap="($event) => addShoppingCart(item, 1, 'first')"
                  class="ftysIcon icon-a-jiagou2x"
                >
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
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
        <text class="amount">{{
          isNaN(selectedCardListMoney) || priceHide === '1' ? '0.00' : selectedCardListMoney
        }}</text>
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
      <navigator url="/PagesOrder/login/login" hover-class="none">
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

.remark-input {
  margin: 10rpx 20rpx;
}

// 滚动容器
.scroll-view {
  width: 100%;
  position: relative;
  flex: 1;
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXcAAAFeCAYAAAB+Y18AAAAACXBIWXMAAAsSAAALEgHS3X78AAAgAElEQVR4nOx925blqK4s1KifOp90/v+92Q82oEuEJDydWVndi7FW9UwQkriFwtjGffz///dPO0v9UH6n8UVmzvRu6aN6rS2fqvVSuV7TlcnQ8kT/22U/Lf9PlJ3IPJHlqauf7+j8IHX1n29L4080fKj/cIHvSpe5X49rPknlgT6cEXW92vcjM2/P0q+c9b39scX1RvrpPv9M/0aba/OPA/udfmY/fWfaY/Kt6er4J+De2rcA/KtpOGCfqeRPD/+sVoMFr/fHgcLPbX82cU/tM/lIz58CmD8HbD8F2v9Q+jER5Q+PQ2+/P6g9nX+pNz9U0xvpTgLqZaVvpy/QSdv+ekJWZB5u3Pf5d5Z+ql+fp5fX5l+U/siY3ka37R8xqz4B95lGO51EqxO+eu4VgR1OiB8E7OUJ+6LP2ma1H0ci+feAzXeCxNu2NMj8PX3+d6cfAegyvQHurdFJFMyrr1g8O2ica1b+FNZD1f/vC2RvKssh+tnYVWvxxjDb/14Wfphc1/0HAf5bJ8OPnXVP99xREo0UN/Si1M3/30j9g22Yn7w/G8okCurt+v4bQNi38ePh6OMx+9b0YwHoS9L39PsfullaT79bFz0RulraxvuMJcyaj7qs75qf66mLVh53/JIEbvLGvvAbyl+zJfCpHS6NdfVHtp+W/X3pmxn8v/aCgcwIt+/+x5PelpFj8XwP+vObOUcdJEAdFlV1iUcHPx6cY+AtyPRIJvf4CYj96Yl6Zv/7byK+2T/fFWT/K6n3t595/+t6k++52yVy3rQvYvFwT/GBrpfuB1T36h8B/NL3wY3hD9N3AP8TXdwveVP3c6D/q0DyhzDl/kP8eCd9eP/uz6X6DdWQ1b+duv75ir2Q+WIXqoy/eoVQBvjgvkGm41u2IJKrnHK+FQIVey9uF4aFfMuGmH0t/cmF7m1/3V7JvwvQW3s0aj8E1e/07GmZ+nZHcTIVbwg+7reHEy8cK6Dzs+2XUd4aeh3gH4J1xZdQHgXx03seJdaBosg76U9fwfzJ9NMB/fnWzN80CjR99igkG9syWzicHMcg/xCAqc1inKoB/NAGDvU8Lv+KQPeC/Cu6ZJACFbYevz//lcz+S64YUcU39SFdPxzM30nv9NYPCNRvPeeuk9+vFwD/wgQpkbU39tQfbQ+NmuxXL5SH7X93//ud/Ee2yXZOHzK/Eoaf+/Az09dtzfzEdMbeXxjFnzMZXgb3kKCP9v7TywJI37wKOGZBPjfz67MtHFLek3JXhkvfBF/oWCL5pTdwPfMIbNT27HHd5+lY138Hq/+q9Idx/neMci9PGqTuo8abi4EnulbdYlu7ubCnCtvnWyslHYShftW0esbGg+AXWjqtc+ITMSOJ7Wj2B/TrE1+O5UuXrZmu/7F3n15cL6LD/yDAC+b+LWPtJ9URMCc+PgL5MEBwTSFAMLkH5VCG2jsD0e/anjmVj64qtNQzu6HtzseV+3VVykDk0UKP5vw34/MY/9Z99y+AXwEon5DPD9LX7LnHCbMG2AEPJ9Ine97bj3wo5kR/fXsFOKRlBhJ5HcTf2iL5mi0L2wf9FV/r9mUSK7ivf1bRsYHQ1rP0c7aCf1r64l75cyz+9yP8/NxBfllYBcwsUcBLGzx8/cIVw2sA72wNL/PAxissvQA8vWH2+mw75yRFreMlbweEze7NJWFrKwa8c5/nf+kkvf/G6onx+7/R+L+fiszdeIS2Kc/TvQASBv1cv9BD96WRT9qB6mBUAb41u79fB2+l4wM/UuWf6vtixnAGyvbppc/3FWpBdoi/XjP9UfJXf+cO/bu2Zr4Z7e8BeAvbkmTA/eH+Hip6+1K4rDfdbkEpiFxp3aJc3yUZi67aojpIMPuu7ZlH+dXA8nBi+e2cnvv0zJRJHuT/5LbWfzlp9v6HetQs8C/cj/8dA/oHqeb0OXvY0qP8hAuq7/avC7qOWPzSh2u8vw+P6vvSnwPwneQnepK2s20hn9AVU82nrAyXP2PKb6f/BYrWfkQPgO26++db6etvqOZbOIeTvrDvm6dRP+qYmEeAo/QX9B5tsTzYynnCSr8P4KuB57pVit6RON6/HhWygawTfcx+qj9/bv5zW1+X/l1bMz8gCSB4ccsmB/e3J1V5C6c4efLgIYWesWhkDDMzLH60xSIrdfkn1/L3Anwlf3Jq2wN8gkSgX7KrBGagPkcz3o+zTTxw/C99VfrBPf7ulg15WqbzP4/uOD8A6Jr6GOjmjwx8Ub2YkWuJk22aVZOxSmi7buspIDdUFoBgpu8onzDpmp4B8jqRraVVB4xRH/go4Y+21w6vWn8Se/8b0/hjj8scpgB/VwJNMVnne+72UcV39or2JH98WYIWpNFSAmK4XZMHk1C32id+xsCPyklfPAO7s6udPF9f/pT1DJKv8jy3dzYDH8OybuyIjv4EdPcVyf/2Ob4y/TXAXk0U71bKtmU4s7C55e2Wg4S3XMbBOiAX8o7VM/sIMpjsNhBfikcyh+UUxM8Bmdl8n8Hj7Ss0UnC7SiZRqW4zB+QSWMsrq+TOfi0o11j8/9j7/1IxWXBH0+bs0lEmVguuhSHs0K2L6kaLKQmiXATEqSy5XqoswHTBJwHoCYg/LfuWLRqVH21HiZuR4PLV6R5V3TV2D/O7GHMC9HWA9778L32W/nWsvZZ+t3DK7RnbKtcB1QQZeaoLMz4tMXhh4Et14yZ+e7YYEKwMBPE6y39axvS+ye6/EvjLWy7d5IO4z67PTo806K2Jr2iFkyVJMaH6H3uvp/8osLfW2m8KWJ4dlTcnjtOu9eBYYOGfrFkf0uGBK3Fhy+dWKscp+CdBmL2XyizggWLEgFv/AsCmYJvnP9rmAZOEgyVn0rmfU3n3ZWSwfRD7agb/HTb+XPr3AnupXXtbBg3x6bCfnORXkVATPayas3ov5XXmwQGz81US+JhdIVQCU8jGu97Z8vX4Fg6yGQW8J0DObGywBSA4UwDCNZty86XX2qRsYpA/3WJaW0rw0jWqWw8ulfRfYP7/HmB/3I4XX2Lqrdkr0pmespEOaj/17fpPhWurKrddQC+JfBQU0q2ahFHjMgFcwVXC0y2et/JZGdsWUbL2jRkyHDV/5D2RJBrPn4Nt3fCXkXD+tGq2ewDJ0NiE181/AaT/e+m1EQWPQjIKV0lENjPhS/FyxXoGFwAWU4C1dXqNVc/Siv5+/8MW/5Ihep4C9dOy7wN4lq/7ZZDXI6mewWwCVk0UU7AOUDra7skCjLqhrvZy/r3bKG+lv5O1v+4zYO7fMHfOwJ4rqD09E29HKImee+OBNdAPAVzK5FclGVCyumlZx7vVnjXGfnwfwMs8fgXm5bsG52QL5Pi4gS77+i4V+y55PxS2XtRgahb/P/au098F7F/q6+97Ku8NkDqzLSaH5P4SEzPjkQQaBE22lLTCXQafbv0Ihp4EQ7fwUzlcpha58KNct1R26yNBidmJ8sNWz867Bc8Avtouyfq7u6F6um1Tsjv3J29jNV+HyQX2XITK9bP0bwwKfwTYjwDzW/2bzF1M5bneNJ31iWSn7pfAMAPbzMpQbTnRQwONLTTymX66teMCDQO45yz/Cfg/rXPEyPvQGVLeRE2m+8xHA6DWphDz2zbbYjmwiJtQ0aFl+GowAHgld+uXMv821C6kbwf2bobCEqKTwXhxt0TMpeD4gZWPGUWm3CbPEGst0lKA/8LJzvSEfN7pPGH0qf6ufyLGzMuxqj8N5KjOCQiHOrq36uQTZhwHGz2vEYB6QNbBmj22C8e331cOWB2op9l5nMx6KrLJHcDO0OU/fSKkBXVdJP6Isearu7CfPy3DlmfJmNFUmFRzdYF563WxBEAiZPRYF18vntVX2Dxl8kYHLO9X7p8Gclbnds9dt5yCcGqzD5/nZLu7h8CCa29mdDpm9VtP/aTKWVnZ8IsC1nHBJ9RNFst/kM2/mrr6D0nxTsDXJTi496mQgQfZhFJ056AlkumGNqlOvOWhSgH7i/yozP8udNbYfBZ8AIB0Xx5p+U4gR2UwXwGjGCvHhs+Bn+Vj2XHfQ9ARPb7y8Kx+yYKxGU39s+rE4wWYebf6hMMlgJ8BB6wIUrmiU8n/UNbee/+arZkSqLf2PdHzyMbcluGVetIs/sWh57OAgrX8lYA+1xG1ta3ZrhdyzOa3VC7HbsBWAsET4I3KnoB/VFYC3G7tVti3kBdkog7whmULRqPkxdRC2yNhu9Ugj1Uj70MP8kqfca5yBvwpwLvLY6b3hwL7l6UyX30T2F/TlZwt44z5pvLGV18YIpeRyQUvYmg8DTdQoW+9tfp++0aECCyF6lumEAiob6ZcbRVI/MN9WAdE7kdvbW93CAVa1zkrT22agLv90OCIdGDQFvnyqIBhpWJw1f0+q4wiwEtLps/AYH8NwP/HU5mh2/RWZ74+KKfnuZ+x84rq+jujTLfhf0GAwPWLjF7KJts9GFxqQCsLK4GAbRVQ3Q2v70fMv4t8E6MRK1c5LhjoRhwFhG76aOn2IBgDv4ySBmQVuKKW4auUJV8+LXKzaBwwps4PvuJkjFbw/m9g7U+3Zp617ceC+kzkS0xlF7LlV7jUSwoUOywCMOZnPKebH1GdnP0HgGYVQBnu3xN2vctscOmwXrTQ32DgK99dsA144xPrwKDtA7wB4uTlItxf5jwYF5QI47a650tjAOQxwAvb0MkKwO9AkRvlsn8DsD9N5237waCu2yKflok3E+p9MFrrZuKXsd4v5+RYEW/bauy+rHJJW5FVVw+dy+KrBMz/KvYwwIoeJwFE1918GbFpbufNfMPWSR96HMIvGqU+uG0q/ySN1yP7qesrlIFmVbY3LxZDyp4TcG6j9fHBB7yFAA9KkYK/O9Xb9gYQF3S829e/0y2GK0mZmgcd/JFbyiUioMKuVZkwpo0YmGPfaswfb7YoHSAwzewskJwseMSmI12v5A8TkJYs39NesmJsRlMIu/hz7YpkgIDSZ6wGOswn8ToKjiYYUD9GS57J3T4SXZdCUQ4DVfIZvzQC/F2pujWTA/unneIm5VE6r+L8fXIq5PNGh/w/DQAcpLFU5KeY7nR9xfYiP51cRL6I3cxWtbx23vmV+yYrR37hwCX03P/EVw4auOcY2j7UOmfNSjuGnhgg5tMDx2xwTD+qLVj8DBRkYtEbpLIcd4bwOQZ4a+Pfytrjdn0I6oQsn3XlK9FW7LnbFXU4sDV3zpj5me5ZX0fMDLC97VoNxcDzmDUlQ5lzNq6D1COg1bTzNbZ+Wsed+2LlhJ8epPljkbtf7vYNzqi1T8PUF6A3pKws9Uf5qiA7pCQiIh2cBinVZQB/2wFnP1cBfv35P2A/ULrrftZtr15CgW2ZI+86+IWjwyducyZcDRYZYA/S7oMjfJ1cwPwtEA9dPlQFz/3Og0AAtE+Dwqe2hwc4LyeAEAC/ZPvYDgDSviHYMnsnq2wZpJwBxTSqq5YYHXM8x66v/Z3tuGct6Lhsm0WBuAVsWcYrf4pQfzyxrZmPgJ3WPf52XM3e5+nTj3UwULzLRGJT8ZTxM3Mlvj0vP7uXyepjADd/9UhO56p1GzFWkOLy82MJ3mLfFV0bSw2YOhDSmQg02RXL1pnXRy/hIXZPgbj782L0sQSeAA05/wa66jAEyUyqSVgYyKtgZFh8BvDXG9h/ObqDdHwlkgSC8x46BPPHQ7Ds/Fav0yO2XWGuzxPvpDLog/nPdfBgZBk+3mrByykGYQtTSOYMWF2ACNt0DsyqTIHCezYs/K39YpnnfMB9WQJ+ArrQT8vu23IQAvHO29F9b93w9SUF8Rk40gcz0deVDwZjHSA1i08ZfObzX5aOb55CTHmCgMU6AdacJKPGMnfOtstDDARz3l1RYzlTlnzgYCAJ19yBzdJxvMIGgqgKyGfluH1PPwU3ryok4AKwCXUhFt4FMNk2YCh0wD8QwDPgv0scNmolKEAo/80hZc2AsWPT3dQXlyf4HQNzBk6k2/xn6JdBvO8S4O8/FbsP12VEAX5umlsznwP7S6Be6jZ2LfYozT33rx0w1lE8lPhSLrkBOhsGtKQyr6zNVVq4K870RmD9DMj9pLDh5oitqzJ2qjnLz2zoqy0LZihIOHs9CFgO+Pkz8XbO9BvwoayzJx+j7MZ/rXVfmcyqgq1b/yccm4AWMfXtx3QeXQGJevI/owrywhGXfibgfz+wY31R+uA94ySN32vhlKusX9klXd4yBtJttOAJlBroYx6HdXWBFN5uHIIiWxEbvwRuaBuAd/a4fqY7A9qyzrEXSf0N0tiGA9TWwBurYto74A8CVgc3Klc8QQEJP+GyP5knJXFbd8C6PVdVAVtfbR0iGHnWbQPa1u332/cVxm0Fvo0L1maX7rAHZ7P009h9Bc/eBHZ3meUSxLpXklgcOp2eLXPS+Ahe5TIB3LFjt7hFMiUBUHOgtd5Y7ktsdtgCpJrb7/lNUKY/YvK8/ACAJQ5okv3YBrthiRh3awT4wXqyM25dGZj6Omjgp3S8bQGnBpB3fbnQ7NM0u4Y9c10BOWDeWve2abdj9Lh5gN+e6PDqfRGy7qmTKth/N8A/APTWwLqv6hJyJUA/0UtS6YXTlSqnQkIrH0oO968SlnNW/K6cpJHlokF0bN3EndpxBJ5/nQL1LueB8QlYz/In+k5slfPvsUSgj0YZAn+3VxiMWfu+XAGiW9kJxhrmXb85dg/Adc6Hjq5A8JMuk5DoQ9Cs7j05e7f+2rPnTasFFvkZjVeqO/6jDPbfBfA1kqkSBPSKLiEHmhZhXSkZInFcTaffj09Ee+PCgpqWDLHsn38z1D/Dza8jlNSkZ6nsCH2ssmpmrcLmn4MyDnopk7f5cO1YQBwwH4E+ZtIY+BGQ7TzREyO5MpCe26uTMbBOaUvebHVnvYhn3yVJvkEZzQYM0PY7rMP7K5g8au+KHkItpy1FsG/DDqC2+WUAfwDqHf4s6hGJHKEd2k4r5PZrPej0ZMzdUOdjgx9ciHTbl0OSj0r15pej9SkA8LloML00dra+J2xdyuD650w+KnuzDt6qYdtM8/hbq7sDWQPIAvg38CLGPMXtxzlMcDFr3/awfcqmtdb6wGFR+2nvo2x/dgukT7c7gBG7YNzv3GH9tTdtxy2O+lXQd2FDYTSopb01OeoK4qsBPkIAD+jHAGyTe0rqQJerUCOXeSrZy/bcB/lNRMuXKlojBZsDfaVrCcPukC82Jz6V0teCN2ftnJsfzwV9VmfeH9YbIF9Qw5StFn2DLNwFhD0uwwhP+IaMHSy8XR+/AbrrWgt3/gCyAJAls5/WVNvJgV7scVLYJ2sszMbgDfJ+P1/I9a2DBU/tmD75yY6Dkwf+fx3An7H0jwB99pvNyvRQoxxz8nRix6XfdkqGWuYQwRoPvLdV1N8LAIHFAuhn7DwawGgKdIGKWG6XeyAxukQ+A2zUjszXDGitTyz/KkNslc8DD5JMHoGvYIJKFjH+7DwZ0V/gWNxt23jVBZgvcA1efhLUF98oHqY9d/2BCIm9Cpiq0dnto/UuQPv+R8DtjHFtg/xWGgL9HBs7PyHYfwXAF1m1YSIlEEZJXr5APUBXQorP4NCxmYdJzbKIuQNWemi/OkRR6uAOMQVVWY/JhMBs68bXA1Iu8g2DMfB3LY4GJyzUPUw5YrMBAVgAcK89vRfbsbzJQ76hM2u0jqHWJoM5dEqh477D96YGSbtN1JVt367bgkC4bcdbkmC86m5kNXaGkLVvpQ4jKycBCh5bfjimYM65kQAWsnmc2wUl1kD/CcA/RQjZh6QsSqpSxqzNRIGqqkHkDUSUKQwiaM/9o9DxoSa/T3pnq7xIb87Ypw7Lg5hcotkx3Usi00fLg+ADn9phDBzoRHq7+CHxiLWjzsxRWxnrBbJj3MGG8VvdBy5wNBmoLMj6kzwXEA6bJzNM0EAgukV17SE9334q9q1k53iz4AGuEKYfwojb658NU8Gx8iqNHMX7SaPHAH+SMDM5AnUnXGHWHNTLgC76uZIQ1hwl7St6Wubz6PKJBtjpgAUya6i+g0Q6YFMqCwyB7lDGlvNQVKuPyiz7q9aL2DnY1kiZuchfIOv7iDLuvoW83sk+E39XoJJs2thRdYeYax3YkH3bTXAa0y3jyV3fLPQ+8O67fapmf3XKBg8B2iogCa3qg98A5Hehtp8u4LGYvN731wB/uW+YWaBTNEK7V61HK5xsk4zAPumYIoYeteNzjp2dCokibyZva0RdUxmYMLukE9fN2bXVifbOuxBBJwxafU8YvQwEbwWBqB4CU//oXHClYPP79Q8F46FbF/sMnmKxsuozfKJmN3YAs9/65CK3jyHuWspjFYh0BX+1gT+c7SB/qh6ohy75feNe5i8vSnqUfZHNwf7Chs3SZesAyDfXgW4Mz1KMHeev9TNQrwB6HXNyXaeJttOeCokrf8bl7RI7qZFLxUyd5HT1HyPFrYfsvjN9SEeNsUflWPezK4EIpIcSwgBN/VLM188DqRtdISw5ozRm7GMhyq4vbYsREMx+mEzH2BVwS0ZsWyesdD/Sdt+cM3CpV4Czao+9OhD5I9dzHTcQr8p1NQOfCtgAf6tTbXU+lkHsEHHEOJ4l1UnmZ8akq7jmbZR8IlUiAmdS7Q3Vsl8EJXBc442us3RcWqufR1v/gQb8J2fjY1385FcJcqEFQFi0n18JoBDj95RZQCuBPGTXi8pBPyBwd1tqbAmHNZjdbdom27xMsMx+g7GeuOHhXsuJu/5oskT4CPbNLci34R7P3H4aMHds2AaksfyK9GhfpAafeh8BwE8ZETgDoEd1ywnixYEeQGa1Sr7ma4DurwDilPW8TgeqK8+5P7xmgNFQ6mV/cdlz0Ld8Sv84A3vO60Og7VYm2g7KmTe3j/07Y+xmonW/NAf4tTwH68Ivbf9WLwpp62ai0kna2P0S2WCr54/c01ZjsriG6M1bifKPgemd4bZfBtBx+2CvGLw+YUe1ZefrD38wPXf+MPkK5Ft6tIC8yo+AvgvfOdBTMzRRVp0mDLg1UC+Ab/kpmEQXDSaP6G70nPvUa8ojccRQC+22oHtQtXk+V6nPOxnCKwlUaM7uttSCwSXDA8sJWEf1eNkAZXsgu5HHgWR/b9TqR/720Z2c9mGsX+jpIVQf+tUF817tYQHC7HZLvJRg3rWH0x87b1ZbZMfceiW4qisGBs6XgzcAa+9RMPJ67n+7yB+uFf6pquBmaFfzmy98B/RWD6jzSkqPCjC2IIgEm1YFQKfYSpUynY/65feeENUEkXj44vkXZMksZQMSSQNfiAJfj/k/S9FHmTnDhTJUyym73r8EfzsKAnnZiB9TlPnD914WmObeMAuU8y1fB6xTzp0jc/81rv/YM1i6KJ6eKNtDyDV9w3b1h2mQfr5dMHN3g1TUb22D9Da8/Ik/v3e3Ery4tO2YF5cCPTpYyMbpQJaC/Ky7ZBNG/5UpPCoAkzUrE7PqGMVgCDsGclwVjwAfl5Yyd/Ahjz0XRmG0YtDk0rWSmHnzHM+cyV9qgaPONu0z3eXBzS0xJ/UZ0Gf1ikFgGEZoZJWOLvNxW5zN4b1eACQ62wFja7Vn15VPG9Wpn13oG/jOhw8QY405vkGqvbNbIutRwtumkPQBDF4ZmFMtUYCSetzVzgwW27K9KpDtVt5v5a0p6W1PBdy3UuEDOTtFYF54NFK0mRXv5V4LHCVzK4PjQlH3b9phrGJ3Pw7MJeksAMyu1R3LdDAwjexGzwlBUDTRvQrU2CsLjjXgrJZFPkkGiXR5xm7t6nHhLx2Bk8UXCNraGvzVJsoAck3IdeB/u3e8x/6rtebfSm3NPG0j2zjbctcdoK6KLH5rRYH81DykR63hKwPzbLoa2ADkZ74aPAD0u0EiabBHHzTRv0zfozfHtAJcnCZTH1SMSWygy4mJuRA6WCC2RbtxMoxyp3hbJgICL5GVYKg5fdBS682ZMPdny8IaXXRNj2VPgJqFjGogOAkSVZt2nV/QXAVoZNeOxmSPSNbr1b7tStaj9W/XLdxAaK0A5t3NkzVDWb1yu4cG9Ly4eisVBpwJovJ0ShtE98SDVyng0Un2bDzT0Zr8tmhwBEI39QzYdzFYanWYwdym4s9y11IO5Fc2mPFJMMHqBiuAPnkGHturJT1HvBGoP7uhuociAkcrXW9KcnnUvX4qSi3k3niQGrgQynrPMrDn5VcPIlYb2/flTwIEYsZb3kyw1syTLJnuLnQDvaKiDVD0CRchrHVKsAXAP5p4fd7cwFx2OnjEUthQT7KYANEaeCPVce3lkH5uHj2TfveUGCB0IFkXHQJ1DDiK4EaqZOBykO2RyT746+pDiEQ4IhNfeyhZNg0KW7Pjn9mmQr73cMZTMNeB9cN0vi0TpW7+m6WzLnjyVAxg+nYiM/mh/8iAVuvkYJ8DMp+IHjh58HPstfsyVWdwPzFwgw9bhLp9z+igMtHWHw2Az1G/ARgG3wECj33WfBaIZ1eGlLNP6uw/XPBVZ84MIUPOhWkNAugQulp2ZXDrQIFJAr2aTX37vk3oDuy7I7ZtFOTs1YzbuiKs/kFyazgWUDKQiR8Bpw7EqDxKq5c+B+vUlknZDVWs9/RAS+fUHPeM0uLaLs1notGVROQTB2fvi+4KrrkbN3gT45ubcd06a4+PFRZ7s6S9FIzhPrTXsfGj6zwpp4BIsyNZ39kZgFFPnW4rBT2vPv3UT5n01TwJU7d3EkCXnIJgdwywts4BVAUN2WZwZdBuHTYwLQ1dSCOgbyhYmPKZqfB996Lqe/89PmNt/mJUoJkyko6AfBZUQdFgwgEjl2PyLIl29KZ3wOTE7UE7tb6Dl5gU8ztrAJUuRsLeaZHIAvX0Ci75FL1IRFQ1B9QZS6ZlekSrxwn4mmf5IUiCfIHVAHTEtsKQ8xIvQkkeFds1hAfuqbuAJGCYtok8+WJA2O+f77oKlrv1Gd/oRIeX7X/No6dD9+SlxuStoi76Ypj69782OAZ755guLU8AACAASURBVN6G4uEqoNDtmwbAXjqN/hZQw1MByG8fYTbyYQ5oAYs0g69gYCIDgVrOKy9/kGpny/hfZ+nMJ2kLM/5MN/aTDFRQpxOJYQuHH/hMn2VLnvFzf1HfyABI2TbLdyDJ6tibbxH44mfll17xiTxtCz2XLuV2VGF9susbttwaf/JFgLC7EduBfvN4opYTYWqYPAigJjCtJ1vQ15buvwzjUVtK5jFKZa81+qy8afXdHu2nDBL2ZrTmUodoQcY7rpPbKG2LrLL3wLz+beqnqBqkq19qZ8usOoc2jt0W81WyQ6t0A1IUoTN/zsFey4rlngYdf0CTnXRWD2XZma9ddWOsDwJkVAfcfAv0a3Axsn3A+to3VHf3GwX/oWWVXBdyM8/sbyMAFnA9K2mfVbDy+/FNBQ3LuIX1IX2z/e3btvLv9eC2geAjkDoIOk6L9s9NgJsTdrvnz8iXGladYHFSfCmAq5spVBnXcwbmowDgBwjYHwTEOH3h2TKlmhfo+Uu6WGkM3oXBc3V8rpK9WXXMxvfsxHJyMYofPSjXah2geR80EctYe8SWQqav2KbjtFoWvk0K7FkGKxZY3D57kuTw7YIBxgbnuYdugU2z5OmWa695eWl/yNqyOWF5yH7ZbBk9HSPbpuSbCU5d94rWYW4Sm4/87nmBn4pR4UsCoAN6mSqA20S78qRGswiwbj0Hsqys+lx7ZudlEGd+mBuqcAUOOWMDXbocuo/a7y6t4tu1Ubdw9+qA7yX3JIrAz+skYC1tkgmt7HRUluiGoC1rGgAbvtfDwGBZnNCOpgN/cmVHN8uWHXYoINU94HwdIki0FgQYf5iWev5b/lI41n1v2uB0A/HuAwfj5oUpaUP2ibXhe1AGJ3fzVepQ9Xe/+DPb+aOa9rn81rp77JMmQWZYwjstm0QY40Y5Ke5eJkv2XHtmCxn1VCJLeq4ULYap00chrZVCxC1lg8ya08HAWQmDwIxNKLtuYCIPrr+yOKfV71mNYDkKMFlAiVmttwf1CbZYtY9YN7bbwKfkZP8Fz6urc9nx26wKyGZdATYeXKWNPUEWKIsIoX1RUn6LxQQ8GzTRQVsuQEDWLex20w/2UchbZuUSoJf9fUnvfpD+bQkxcuCpGNuzdE0nwM5lkEY/n33dGrrIQIeTKXNAfAC94Fyl0JaiZlEdhyKVG6qMwzEz2QhqPZXxzi0Tq5aQULuWh2byHuyRjJbDMshyBVB9LcRqnwUOSXRQvvU2f959uEDrZA1DVIAOA1Y3i8w+Fqh7XB1Xu+QcvIK27FMUlY3b6VV3MP80a14Wu/Fv+PCFv2Ikg5ghCNFTNna7SWw1+WBhwf6uNQAJ6H5UK2saphN6egjkS/zweN5Z+QjMy+fCAFYUyYRJTPpLV/aZvRPlV6ruJ+Vw2gSrSvQElBb5kwN+XicD2pl7wryxndlTHlpDsBw+X9bh+V1lQiYujIaPOMp8BWajqY2NhUUAgFddwA9B8PFvs1oWvLiqY1HbF3OjUAgtbn0Lb6CVpdY/w5rvCgqKu6ltvx61+m8PrOb5uj3D7qcL/2RAUl6rxxxBPxiaLN+IlekMMZRK+6PpmZBrzlm4Tbt/Ni5iGWys+taPYShKzeMeQ8pmqjD3WjrV4tv4bJKIOUvqei1sMJRkEH3RNw2UzoFbY+duBvYM+FBdB8IgMEKAdvmi5wixkDZYyHH5C4wmtAhgJWw5/VBHF0C9bCDa0M0HvfeN0f0fsvWxs1SAtTcm/TWA9E8C6S0pWffwLdR7/0OSaRXAfFvu/hef3GOPU+q3TKWNGUxELwwN9dIhOBejDw6nCxsJCHBUkf8ZkKOyEKRtfyc2dB37J/B5tgspLwGFS+ZRSNv5tZB0Khr4U9OJlu9ZXVy/WmezIOKJBXtoTYMdkrGBqwbO3K5m3G01geoKbeOXjSAwNr/Wd+91p8Pf3JRTcsvP3vc2zNus7nCu+y8VANEWUHR8gLDjHuvsIsDPZ+DZx0CmH+Aq7z4AZ86DHYQ0e+AvS931Td/vG6jsLVMdTFqLb5p22UlLV7A+T8HiqL4J6wTIM501Nu0mP/gzs+VJTuZbVn5b/K3upkfKTuJjJWX+RvZ8Xew/BFSCdif2LKT7crH4AIOGvlGQ9XaG+SMK4pAsyeDTdZlih6KmZGMatLx+Z9OyTiU3Ah/aauy8Ka1vgmoPuzCour8budYW4Du7hs2qvl1reQPysnP7ubR202Z7Try5ebqnTN//mpuw6mAwFciGqH/niXUt+3HZNH1yZWmiBw86MxPMXkWI6l6+N1c/SmgMnyWMD5ZcpTpCEI9tyfK4KWqxEEWcKopf0cFhJgJiT4N63sOTABFZivVw0J2ZvGuGzdi5uIjrAv0K48osCyYOA+yTej5fcOGB5LXVCxsQA77lnQ75JqO0hudD7bN2CGzRTUrkIwZHv/cfn1cjvdnrcDPbZde+mq+Y93J+608fr8yOKBD9jc6ikf04TJkLsADsZzWDtI7h2nlgqfMBSKckrlh5/yT1zY3pAW0HflDhs1NvfXlgM/MpPDgMejX8fjOtN1wvpZ2sLBVMBHXx3iuuH8OwZw4RSGMNGrLQdUIVzDP7GhTyOogJp3WM/vBIXmizOSI0FpPdlmF9wXDdTcopN/ayUv64udjXjUs5xihAXT6b4Ba83OSezrH78ia42LV1+YO2ctgRA/KtWDDX5JjZIHWXK1/UZBB9aZiOm8nd9ztMOYI+SEXwDx9HBIAc+lm4obo7jqgkwSICr7yplSN/je6TASGAmOWaqrhzh6k9Q25r6pKUVN0/Oh+7Qf7YjNQwIQseIn/b9JPBgzkKDcA+K+v1Ogi0F1BbFjaLu/aSvX0b2jSnNvr9bFK/XyCkuKnys9//8z7tMQmO9RV+uyeBluwNYAH79s/Bs315YUMYmcFEceQurDOgF/6p+mrMZLC4Cztor2qcZO7NywmbJUR5HdilbtAOmEbJj/zk3LjF8Aqk0v5IJq///GmZ01onYxnwAqUwi7CMkesJz63YAIP0zYULbTqmiPVEYO3LJVSJRwpJ8Ec6PTu+dQkn5ULGuixbNbLd5u/oO6Y9CxyzvgVc0c7WWhv2xEfG+k2QQDcvpxzc+rDthp/kE4xXAJt+cWuI9Yz35VvD576oPlhBzLfjMqEtuH60xKLvsVjiAvCHyfSAD0IoJEt+oVUDwOePCfKF0VF54AvSqdt6s0WkEwJgNQjVk7BMDg4rRbNXHCjqxjXO9UTgyUJBpm8QGc6+I+YOywYqN+efB4HtDOivX2tNd+2DAsU7Q+uXYLEXtWaFW5kC9W35yhOGPcM1YIaCDJJb/kw5zVo3gNkri2bYtz+64FLVd54kaGKLBQGyDq6iB4ewYIOtbHMHZzTd/6zA6oJmW1cfK391nL+JuuqJArcmRrM9uRWQwHmWYsI3/zMaswEXEyxP9ST1Ub4kP5FcnrACkfsbbLNkjReSGc2sqgXBLm6inT5CgVsguloI+PIcnSYWC9Lpi4hdOtVXSstIm6pBwuUTBuXqSDAx5GtxZQeqEiwwm/P+kC0eAAYaXEVQsixY2nDbJwaEWzNXEb25Ux/vH/bsGN8GMd6LGd9aAUiixyv3v0NcHSyF22vRjtb8/bDLhy5aKdtw21V9bCK5cgmd0dnM+HcxDlWQcupUv58FAQ3M+oeXzXUP+YEwmODZXAW9LEUqEK4Eqf60DHTEIk9Ur4elTk3WT7yhYIBFRhqPBCsJb3wG7eE9cs0SDub5mTVUtwlcFdCWP3HAsacDWl0jB26U70AOvX8L6g/Zexb4Gjycq7XmAPLSpYOuO8Rri2xg7SIYLKf2vrduQ7/91QHIgmT0eOWtdnngb37vG8KtNUPU8M1Y2QbbDtmnqrz1hh4d3d3CZpGIFWcw4X5TIZg8oaKpsi2t+pwwxAQvQ18s43qiw6fTPfdBfvHBtenEwUgb10MmYVCvJov1VvRZPezNzyuDMDDxBzyoyy3KneEBU7JFyRStvD0dEPsFAdkwum23G7DV/eoY9PrFgcm/lQl8GmZbZLWnC7sGWAXg87dE5eOPpq2CAEiQxDb82Ti7r3RACc97X+Jof132R2BjK7zKXVARSltzX3ZyEmiRWJYUrsJnVwEZaE7NcKWEQAX6StkqRrKC/kpN8pDL2cc6lELgDE+Mn0YoFvTvyC3G3av/Ogd8DCI12w3srVbKMUOb08DZhN+w1JquheeDFgZ6A9xi5nn5Pv+3cmHAaJYdN3XqINrikWvowp69feYZr7AGPq6hgosDL3aDc3HmpWz1p/iclg8us322v3a09n0Ajhbopl8Es8c3UkW53F8XQUWOq2qxCV7W3pIsMjY/1+/+QsxeG0RRB6bcFQ3gsTxfQ3Hg4PlYD7fPTsnPbX3j0zIy6R1RrCnUnw4KZ5lM6gkjx3J+MycC+8xOqRy9bRkEEATeLo8Cd9uAukBEQuKVM0wlGjCMDgSasv4QlZYtZCN4AxQFtc2+GSu+5Yb++5qLrtVgD1+2sgmWrxn+8kXW70JWtUUHFFNtvehkA9jyGNyL2KWGDk1/Eza8546fuWitkIKoErEKCGO5LhG1UY+JPMLQ6bMhms6RU91L/vw59+XEo1p1V+lEKOqogXMQmYH8M8A/A/tVPpJyWeZYZxwgEKt0efc/WI99ZnsrcMGic//lNoJj347hXpkIlOxz99InHZCA75IVt8a3du6Onmem6OuL0QRGX3UVkFqmjVn+3l+3j2R23WYRUFZ7FE7OCYFf8JJ6bFumk27M7Ed+5V8KT7s2VEifEEWu5YQlxx7EH+7I9fArm5zkPk4dneeOA8qV3X2eq5fZRJnAVqwDSES+3RlKBEzAMXTDQxDuQCexnYM5WDRqcfP6KaDPxSyahoID3qPX2wICY7xPBigkBO4DCkeDT8Z0ZWKXjl1HAbOzdTmG2zUl0Z528wx/1h3GF8O8LzzvO0+xb30UwM5vfo99CB/79nL3O9rzvuvLsRDBBN8w5e1ounddYL3Gwq+5rn6YYHOQypj7iFFyvx1kpUQX6Ep9OuiNTrDtWQJ77t38F//p8x50vGRpp6oMz3OJRW1c415QXQ83f4Z9ZyB9JWYelnutDNBbw4Br+9YDkKkjWC4CySXfTZmpswFLMFOpsAMQdn7coNl3HeibfKmoI3/Avrnyh2x13A11QW7ZvcpxQDCMHLBje+QBepGInhYpojR6u9bJS0EUnLrSYOyI9oPJr8kdJ0Wnaa3C4voKEyBxsR49NjwVQHgFySeALRY1qw4IlXD5nT13CCqFFPVdzt5jyaQ/gjpokg7wi+sryQxeDnh82Md233rLO468yzam3ZkJ6ALbODBswEh1DDkx90wt3SBtrXW0b77Y7i3tghE+PXIvRPyykbIjnx1fa1Azb9vuaC/fXTx3W3drDM+sccFblLnxBi89ETvKnvjxCbmL1rfiAo/RxepETkfJLFAxyTqTO9Hr9ATyLtIEwWpPs/f33J9E7efRmfP3rD6tMwoyiQclwCcMuFKfgWU3l86UeQolbMq4fLI2JjOUgRCzbK+bPxnTFPBL2ZqcP15AAZ1ghJpRtxb31dY61JrbWyGqfxamAlC+nL2ro3Nn/Cf9fEDRBnWQY1cQug0y2e8UKF9b2/cECBs+InZUOKITASNKkzeoMPvqcnOFcmpviH4+94dRcCyfnThpT4WsoBJW5OocDXRQFusBC2rlgL0/0XnMJjtbhPnT9ZLCdhNdp+x/GIENlkkdYm8Hh0B+gRiyYd+AtDr62vLSegGjFPbk6NKDxfqc5pd+e/MyBkAdBsJvwQ6zl71k72CC+o4c4ztb5Lab5DG+4kriaovojeWUnuf6+XjZ+9oxHTRkIgHEKIJrEq6pgOPSRV9Bjhiol3pogxMx1x/px6yL/hEFcm5U5Lkc7LPfNAprBVE0xXVOO4RprOrBb5MSrQesOWfVw8l1U4b0LDkAbpkfIWBFde5MZss9oeH06DNnpC6uQ/YPAEHDdPjZMkKua9k9zkP7pAKSWKizz9G++bK7WzHuTB8sxREIjhQwpq3DofZH1m8qoMCvKc0y0TnqJq/ULRi3myf2e6vKCdtmwrrFmOBDrZ+AZCWBIJalHmBDYqNqLAhrSQUcuGpJ1f3dev+nXDVRdliqU9aATBfvzLOvLNna3RZI9iL+5lsiU4/3AoFbxY8qq4d1OgNuI09ukEmfZRDXIL9z3VZHt7LXr31TWHgEZNHjk9Y3LcsCinn5STLP6teY7kpiGiyn8TdiASC3Rp7J7y6gLF9NfdinLGDI4rsz2H03N8/GbjOW6a23f9YvyCSKCc1xOu8dMCLpipVdPcajnNwuMQLaOWCDRXyQekOPQnr1zU5fW8oNPEshyw2UDvujcFnlbI2gpZadScGudZ0x/CkBGNTM0ZiH/Vt+dZy/5DeIUPAgCzgGG81KmR7FVicAJ/bUkzGiIAqAmtFKGc2qNQADXbLvwYcu0Pkv2pfuglH4xI6rv38s/+HNZNEuBep3vp1DATvXc2MxGC0jVYzeWv9HRM89TkPnlBJas2cM9l5DpUrAM8xaYB1qAhbUQRtTsIqN1lp2/ACvVx8mKJk0TC5+WxBZ9pF8e8HqOVFgA7lLA1BQjnTpxTSanE2KPZpZ6heYlL6WkwZR4EMBIFUe1RWcT2L1LAAzYI3sCflKsFFPe7TW0J62hKcJcNJruBUkkBC/sCQYOfRluL6Wb49K8mCPDFZtvP1gH9WgLH3qScDc2/L2VtEwOXMHoBN54NfXpwC0g3R20iNgSKFuU5cXejupPpXskb8RdA7HLCvp6YDam4NVfTGo+tIMpJlsJsMuiGjgcEHF7vHiBaN1SlC/AYoteKJLljmQdZ9Q2zAY6hd/jAVggAVKOeHc+pCG9WuY+guELajfHrLHPc0bXr79/tl02Wp+LEBTvlw4cM9EeMPTPHWjAlp3v1Sw7TgothY/1tjhYIP5IeVEILky/lGFlLBaGwh7kR+grqvnXawxX6jMy8fmT4JBUJdVtwNeS2ePQqobV4fJLoRMQ9RHJfZerMNurAwwocAFgdPNwdrroEBvywE54ODMQb0C6K1FIHt1SqjHMsDW4BNIVTnJHNHeeTc12I1K1w+rT7ti+MrH5RQ5Z0baUP6YACMqoAB1/ccHH+kDvGejxniirvRFQh4ZY9AupRMM1DDt3FBqfDRB3abKlokNcqks+A0uNbwMTKegXTkjHjmQ42kaqLzh5y8xYTNc1/UkHGArttpkRXbyHfZzBpxezkRQUMG1LmHFyGaJ/dv1tJgirxu1F4FRpI8+NXOjYhigoK87czF9Bpai1riNooCJPttng6D+DB56XZ88n3631bPnu/5Ez+bPlF9yowG/DUgvBhx9RWka7Dt/q9W67sxKwLXtX1lgIsG5ZY7q2GOBHTwmtF+Szhl2+MQdvKLwTLxORtFAsRRg7fXP8yN/uQ+2xdNhMHkDRf6ZU2/l1LeMSVvJYYYm6vMS8AIGjvyq3syU5WmZYLGZn5u1Sf7px4SMdNtvTe4SBDzOv4XRN1sWTmpZC0p7UaCgsrZUVL8KG8LAsrOMIwZeDwoqGIFP2rFAufF8grqxt4TZo5rbXkRUHKCLQNRQG9c8gsiW4tJY/9SYu3WPpROyE2qVZDIDbodRWOd5YBP9nlamvfMZc+fqM52Hly9A49ewd50ztyHkjEzZ+wjsAlaL/HrK0K1tzGJ3qYEawchuMEEsEOg/vdJwYNn2Bzwum9YzH6DCwHQjJ3pGHD25MnVCPx0DN0FhyhrAguDZTf79S+3nA1uqTAVp74tm/M0lGGxgUByu0gxIImx6AyRlfrUgn0IUZc8VfPBKbf9jgUNsO0f2pSdLvi9VneqeewxHNf/9tPZLmKcSI4jq+Lmq5eR8Vod2D//xhMg+AB5r87Q8/HJTYhsxewdaMh88PkpBWgGaHNdAh7DL+tUx2OVbv/UC8HeBIgc9HnxEAEBgfWeo+iICrEcPFhBjkEaPgUp/rzd4daHdasLt22VuroNGK3y0xxYIub7+/UdVVnIRIYYfJC3gT7T4n4CnjZRHVZPFmOjtgYQmR5+Q7tFanblbGRIuiTRDVhr9gwFze/HoT2SuE1mjRE3rNal1e8Nvq2I3MJAG8wQDx4FuWyYWYQXgZJnt25VvAE3pubsMsXoyhDDo7D3p7ZHsuyhQ6KDYb9vGT9UmETwQqJvnyL3/N1iLSvONTdlIXl/6e9sjN3tdcFGFPIBPQbrXHoyP9nJc7x7YdoRgO8cPXf88A7PIXEaocAdVkva1ux9YDtap2FDBtVqv53vu9DGqoJrhGqQwDAHXQT6pbp+GEWLyzH0WcOaz47EM0qUFEMBW6kblazzkJJCM987U3nt2rXQhG0qPzkcnG7bWyI3TDcTsxZqxJHdDeHBiXynamsODvTphwk32JfpQh5CVT7QogBxtb3U1Mw4cuG+V0OdZhgnFFVHt/JJt4rY85NqKGelg9mSa2/XdNhRNPGg4tlsXA4G+rL8ajPCV2bMU9E+zRckbqqwB1zzQbLZaPzoMwGqD2gnoh3WAJ7Hnir8LebtQNX1KbQdsLZzPk2CINRCxttaauXyX+m6AYgtW6IrW0wb1vhxk8joAaFBjH4DRAWrQvsNfKZIyArBAAHJfNEL2AcjGQUmCZ/3rTdIva08GIhXMdrGfJ7JsZXfn/OpH10F1sjTtSC3sGXqXnCBY4SVwIA7Rwnra/Sqj64kOTHLdnCJBu+zvrvwM3OvmvMSTIHYGzEkdMODuZYq5GEED51MCC+IDduRsA5mcOXc1qRCAIbuOHVpXFbvEuhy7U/A0f1SO+N0zme7HDy27gieSlfbGvicCwd9UgAG79f2Ui6xvF6AIqt10Jv+AN+6XExBmY870wbmQ9kNzpIEDDbAjAovDahs3AsDVI24r+fkQJtEfXeWdAbtOs8MBtpUdw/ZpfRvlUbZPv9v12nDIG2mKlX8aGGp2mB4IzEQZ/ShtJwtFcJRq4GGsEJZ1WaYteFZq/br+cl8gAgufgubYErLPIFu0embXidXEPmAxdciLwDDgEAB2eTJQkA9hc38ByLZ2PdECg2pf/3qmr1HtOi/cM2QaTAG7u8ZW9Kfy2/iiaPQu9zpn++wjrDg5Zm4VIiWgf1Gy81hLPwPlEyb8+CyaYyfOnxh0PiAs2z8nc7d0tur8aPJu/mY1vj6M8sQrVJGCOHONAnNoxv3Fw17MIob5gVkhZ5zbvl76muXaFopbVWQxhSxdAcGVYT3MGF/4LPnMV6x+K6I3H42cdrUvQeyD8dX4AGVFRMOPUwr/pbsKjGt+LXmlx/fbWD75PdwIbNPvE6x+8EHHyd7/aBacyINUB7XPgb2uX6TZFYGjeEU8sJ+NT1CmbHsB+bGOfXYMetSMJjEzo0FPB3SvBVgxq4/8PKnTXQkYPgfUl1xoG5ykh3xjoLnrX4GUgdyu68eOThobZLut05c0BJCpxzDaORvWxzjM2PJ99k0WuF7r34B7lZBRy/pisuKtotFm6FD2VZ/1hrelBLsmbWA3oFe/zXwQhLCuDuea8nWA8mCRQELWdWbEP2lJAir6ilTSDF8Rf0FJ6ArKQmeiOmqB6qwkJmDbpSDCdRAZ/Zw7gqmK8tPEDgWzC+HEWsqgozqaLO6AZftegeoOiuhiNgJdraV7kF1+yLHp6m/KSMWP3nWmW/SU4d4Ai85070CP1DHMCy599ynzdQMwfiIFtrXC1Ge7CUFAQLt9Fcz7/qn7jO2zB+yaPFGz1eooOFTb7kAm65iOYf206lKiJLbOGBmkAdlkRvRz/pkscoxDfCVH4K3KbHzwHXUAzLuOrFR6zmSJnGOnUaD8MGY/f0P1Se1KB56C+KpnKiJgjiZbZUJfRd5DOm+EhAN9QS18fS1NQVVMKLjgE3CD+lrEsE2+nOML6fwHCJ1NCarARw++AuDQB56X+RjMtl6J2hibVp4KIH39O4XS43Zbb/P+FgZG2TZbTp6u6dILdlrkRjTm27QQsStPVkBBQNqk6BmAvpwAKCrQN10Q+2wiYQTsMP/TffepG6Ll8w9kL70P64VW00spo0f2caFe9K1RpdekTkrdBLBM0OnQkwJPoCH+NWAyJRAIB8za+mNZxta3C7IAoO3Lm6fBG6IzT9ST1hyoqzbNKyWZI/wrAS3Su/OHeEtTHydw82t6RowAaDc2u20IX/RTWMTnbqvp5/tXGWXoWq8/7tujk+1bl4CRp8TszyUbNe/UPVmy9SIyGKYXjn3ZZoGunjH3iv05+QHQwOqSIBRmQeaCnfSVehUwZ+Ok4WfKCkRpwZWAszWXKALTvXzbzdqs5VNm7cosuIF+F0RcugFunLbW2j8KnvJnwTfrlPIIfC/Z+WQX/iB3a+1+ekaDFL4SEccECKdG0+ef637Yk9f3dW9tiFfdorGBQBwELKZnDQjzadboauxaQ8C+f8NHXgkrLeJ9mrKrxcgHlCJSI3NTdZSJPwNntcpfi3aEuYfg3kHnMlHgKPS949+fRvsqOMfyftV5OTJNyoDOGPoVIPTVgQAyxkaJXsweM18wCOlDvYisiD4oAGj5zQiyYLUY8f0ootuecAFj/jtSwiGBi72opO5bMADVGJva4kAcBzinp7UWnVAp9VnfjPsqORsik6+HM6SS87M1jB9Oa8WEk5EkyedH1eOWEbafpm03xcdHaekvHD/wouFTNn2iK67vp79iUOp0qr1QsV7Pri45TytCEDVRU7O90SazhHWtXml6iD8zUBNsUYP6nd8xWdLdNhn1XQZAxAeMu32BrPRT3VMg7dpdx06DvKT2SZ+i3csPHhRgXySgDskx0IO2gZweM+EzMnHpnfow5eV+3vJRP1e06WWlkh3H95OMHPff7gz62Ieorcr/iGHBSfD1qT+5oUoZR81gWf9TXejTXa3Pw5xMb9tHxyigWwjEcgavY+CCDfinwRtkpr5b7F23AdXTc0x+DwuEPfbW6f2Poz5ToAAAIABJREFUZs3kfBTprxAIj6qV9QtXAMKFnc+Aduic6EiBdLtr2ov6ev4woG71DGBP6XF/MKjO2yHbsvwgLCkkT8IB+a1YVzNYT09TTuoCBEl2KU69WC02dVH+G0erH6bzG6qsD54MoLMcXekQPxdmTzFHCeZMn3/ZVcds6m/Ghotp6RnNokbE3m39pQPku77psW4KuPeZGB1IsjcYFaiH7bqZ7/wLApvuexcwZl6fstsakm1tB4zu2iOBNrjZu8BQwyYMcEIkD3wNg7rQEwbw5TvZB78VzfsE4557GNQvg24ZZYFM+SH+CwVgTZrSIAXy8isHLp8HhqQijIZVTATE8M2o59M7H+uwA4tAeyX57HbhsRUJnHSwSSdxth0ECiXL+4YyoAR0sR1TPkB+MViwJaYBbEtIju4eLZR+GPuhbSOEFvGJ7gWEgMFaUIc3j3vig0JkfNXCWPYF6nffOd94e0pvmQa+ryubvuepDU5Sd/TUB/Z1bONtX6W4JUtB3muzYtmTbbQ4AdtjfaH8uLvhDpwhA2Wp5iP6RKXMYH098MT73Xr/x9bQ1d1oRo6O5j+x1gwNQfmz1E8MuXCzPrWcLQJyVEIXEBBgi/DqarzAWF0Dqfer4KSu00zKhy7zYKKhcTZW6QJzhtpPX9C5ZcFEzQPSFvB6r7HOt1TGQqjT7ZfWmtuCUWAMHh2N5hI/8sBX1Jo92EbJq/R+Ql+FgN2+quKaJVYVIldOsu6XbXdYUija8sj3D4IQmkwMi3Z+5Tx3o/TYM1yfs2or26Fd5El0GYRyI1fj4zd3ZcZTVjgiLFzXk4xrtAVYxM9hjLIjAWzdJTbux/3G9HULO1vWh4kxliEbwIJ6hmaXEUNurburSqeXAKbTPZ98mm+/hrIiXy4g2w5TEAY/MJcqoO6yhwdbZ0v0Un4iJlRg5k/UMu8vnO/Kma4FHyR0TAo2Cisnsi8Hi/WwRlcT7HlsA/5hZSfbMjW56Lz23J+6vtI4ApQhVzaexRMDKdu/7cpLOsyWWPAZ61c3K5IBWQYwG1jvP26ADT8+YXWpRd/plcASMUFAB4Dhr2+EfhiQmlobQlYHfweajQOiBuq+/oj6EW8NmeBnyxgbV7qCgL76Bl8VOj9CABNG50/TV5rpQwuu1LfHplnwz113g7webzb6VpOZb0ktGYzpOgpsPk9zARC9gECEeuoWc3C3izYzcRqRSvqIUFoXOOPqpEwIiodyfnpes95DPKprF1TMnUK7CFj79qnE0ud/3KLv1LZimAWWHIF66iPTu9ppDuKSPmdALfN1nDb2epsvWEWPKOLP8GmvbD9O9enYk4ax4CiNVR6rlFZ3v2J92E999BdbC9F9LquRpawNlTYi4XO2jfVAUAkDI+qnWF2rPC1DSOKjFEZUJCABCVSus/96nSdgvtnfrhTzHLTo7tG9t0tWuWFrmX8IiKA9VecOPkZ5tAUw2nD7qNvnjH1rlsxBXaDb/Re+oWl0OL/NaMR/rkx0YBhmyDKEY/+UfkOcvdEd8JxfrYU33JVdUPcqk5T97Az33ddzvuZ1pAifyT8lEUC2ImGnJW++okKYV+sj9CH1dvq0DFuI1USvggoM++ismYrdiuyAP71c9zJHTOuuMAQKeNhEr0ndpXY+FtioKnNM0tdx7o71T51Nz3zAhpwvKzc4KTICXuNFFPS6FtVXEkiW9pceIdFFbYMpDyatZQH1+jfbmkG+hEYTXW2w9Sc5uU/pkj0EEBTcnyXZGYdOdFLNXcaI7Ecp8AstNP+kFGDuAULZeUGZA9JBfFUBByx6lljTo3qSRTkARd0Q+FMNItVzXWh98au8B9/IWp7+SEYqhKLgoYBuaP9LoL7kyWmOjk2PVWrBDM1l57tg3kttFISTz/Wp9gRtv1U5myE0C+IVkkVilPoSBtRhhMw2G8MBYPsxgB0schUjQfmJnX2q0D9MJHfILQhu71nyhMalOb/7nl2ixu/26I5zImcnqgXKJ+aWnsN6Q/xwk0PKRIEM6EuDyLRJFmJVhwasDUCoPmXdck52L4BshW1Q47snFNsuCIMAZN8yABjGm7H1wZm39pbIW/+mvAlSdH7QMb8Dx4yU7ipBA4UMwqv2Ohpar1kTP+6fXSF0Np/bMF/dKiww1JehQQDGIT5nZO8JiK4X+OqMfZuxdYgOMW51HxnV41cDEreAGbwtcw0a5qaVLtmXhIXoIyTEEoblUM9Q/3GUI2M7Ff8w09t/DCNkGbEsTheZlHOL1Y9A1I6j19ANSNs2hHbuf9LX6JvuKwu+wgPcDuAPBXXkY9P9msmzRwmh/Opr34q+BIQxFyTuVWfHzKDn/hQhHpgS+RDLU4+zRCVpFafd97JtHCH0tnCwprmGyIuC7BZfrvbmJynRd0T4qg2j2+I50mITq1H4hiqH8JPD5WPn+DChErvYfUjH0XWoHqCvcBtL5jBYzIysC0RhCAhCwOkYwIbQqHiW6bJl8zCgnbxgpOSNgLMzgbfV3+TMvhn6CNSnfEBOV6ASAjVQj32Uf/gv0852+BfYfDuGqNADH03okOQDBg6pRVuia14IrFb1JsZbJ62nSq8ykKszcJd+NQzsdmCSFHnvsdRRnZqiLAB59pK/ofok1di9qXGfeRLqC5goshx1K5Nbr3I7xOx1ZpTYZK/Tq/oOrIb49/aPnGMDmXXkyyyPAArUqZwnXz5D5c48Ckwa37h+MYFGJ4e/BoEKrXXmp6qjwG9nwPPmVzs8n1ft6KKgu5/OkxkkSx+xMX9Bbl25UiBjEluORrGmwbhQS1BwJOXVFBPVbnJCU3Kse3NzARBBz9wrAJil0EnWEvCBBKdvNqph2Q7+RsZti/fWzbCi+6d6YsMvPuivtWxB0YByWl+WmQG19Z6wdFrPMLHSR0KGmIhFWRTQ3BWKmdBp0LjrwMBz/2MBnfnJDg2z9fCBaVAyhTUVJAzT1EdCAyowZv9ntI8HMScXzLlPEruPUMWdzI9oxbrPJtqKefe1YIal6aQPu/vRWDCtPwpZnCNhEJ4LuGQrKIyAK2XUAywD01FLluqUoMOhOWKE0kaFs3RTgL445HTOYhCzMOiaZzko6BaCgKmz/dJoy/Rv94V8x/qdL7K9BIzdE0BNH03n9LR2b5n809wYW/sJcK964+7vbvKbeTLKzE8WCNdshAHLRMam4YyKhiHkPIEpufWC9r4TPDjGdVDu/OtyvVTw8oQKf1ki4G47OUAhV5uNBlnAUWJdVNFDGTUBOyebtJUt7yH2OezC5Tp8uZvsAtRRXVpP1EnriYwM1LsUmgAQyQ+dG30QW/matXs0cU7OFmJTVjNaaVcENsq8NzS5dnVfjwJ7cLWw22ycbLxNSiI4UcyzYzMb7bxRf2bMFFEgn7r5r+uoT9AcdnoOtMikJ40jFhD2ogcZ3k90VlwHhzkG5FtG06djMXVEE6Gig9ZFseuAGfDpu1FQyQAKVAL0AcrlIqOgfi1oWy+yOcQPvVR7a+CFIVlHn9myRw4ueQNimU/qHkQClBv/dMdRUJdiBthVoL4oegCk4lwcAEwQAi0ukDlidXowxrNVzZ/o2F9Y2/ux7VFrNF8+7FDCho+Affj6R6fYHtpqhPSx8T1sD3tCEfmxywYpW8xdLtBPww3uTLSj1V1pbhuyO27WAV1mJWKPa9GZ/rXT2XB5bW8QG45Jxv5iRhmzO8e6HSB6CEAMNZOH+ALRUIC0dToBSi2/vyxFQR2wZKVixmoSRKUYOq++6ax2MbgObXs/yIta2Pr+6/6TyTm/GMKvtvO3XyvJhKkHtRuom10xGGn5bP+TYBGCKU4fM/QQxCL7+qM7RhI9LRMPTtxUXlrYgVT1FR8UaqlnAMSzOmGcnO4Or5tv2VgWu/0fIivzp+Kvn+qXo1mct4zY29MwiQJBeiUgmIv3+YaAgElr+Tv/FKQbkjffpRXGNqhrNuQCrYheYSAdFVAH67rXVqCDYdcv/v4JVVoEJ7kkYjUZIFoiYvubgxyy34UEaoojDqGfbzH9aiLgloEBSEbU77nzzj22BZIZRNEAO2hdCgiGZr3c9Q4PQGqgLQjQEyYnq9lMf1YM5lg6KBioTQLbaM3c7BELRwJMCuq2/0WrGIu+Heymk8I+bhN4dCn1qQTqY6Fzek+CBG3tibkxKVPfYxZtk2j4ai7Hgzp5/h204fKLRw9ln3QIJzauZ4XNpslJyI4C/x0JktVzcP0sRllMwXVlL8TBtmDrSaoYjCdK/VHIN1LE8FwerIt99QsJ2Lwlnayg1EMrpGBqEwQkyNBtK/w5K60NvW8JnAgZ/BAMXo5tsI8MgeymtixwCgLb5PSPFoIDWAjzQh7gVxaYQlBfgDhukMbwPMBTLDjpCKF8YH6b4d5DDeYCCkCggxmTlUpiGZ+uezmCcCzjUgnXcoj735iAZwDB5dZb5jd7a/zL2xtFufHgVEj9o2hMFrPVL/JG8zKnrHxmRNPvsrOpbQXMQwZPWKbV4/mqlkvBkdjeoIImG9jXnUEoAAwL2SoQqDETQQXoUWMhGL57lb6jfgQtkAy8NdcIDojkG6mybWSiItY9BIOmbQd+eB8K9swfdD6Ygr1Fw2iBr95Nn3FJlP4UjKPVWsQ36/J8p2CVod7Gup+2Hnkb6wra1m/mjj8+7dVGH9kttFnJFUTKCY6BUcSZP15m1Jc186/S7A1PqgfJGdDMBnoIoZptzeIs2Mp68Gqkaf+0Vp1xZuO+WrkzSp/Bm4y2izIbLhzIebtyDH3b9JPvaorPwCj0WJ/1fNyDSwP4GLtdo9GjCLSV22kz4EP8xj4O8GtVOU6WTmwdFcqE0lMUOLUTuSDYD2Qpb6fKgyVyRoaiv1tv/4gJYJTAUc94pRdBXZw3ItfhzKUMNLYAZcUWyQaTsXL2+iOsEVrSf3hGO+4/sQbGnjPbi/+SYwtQPc1mcRt2/9/bLHA+Ed/uaZYeWwxwDNoI7gFg+YLtldPdT1QHj+n8A1whzqUm3V6N1hREpt0vVyNyMmEgeD7Ng0QLS7NKXiIfIjnwkLZLFbt1P4MAwSp+DPSYcH4YllpTN1QzNr58wYajYeDtn5NXLiXMsS0gwCP7urdf5T5O9i5Qj1YlmjQgaKpK7SSMdv2yzw+DesxHFQxaa/Kam7HI4UWJj7osfWt25onMa3T3m5/K9pQXlauBoxJk0Qc2aB0SvJy/tL98Z05Qj9dI1AoRtItIszR2MzEPoa9src6wlJ2OPr927kC5Va8S8g+fr3/Blwvcj9wIJ+KTi6mh/sJ6LDruS6UVChbr4ZxFhhHq7wJ1Uk50I5+HUBLpYXNfb/lw6I/ADupd/+KtBs48Mx+3BfnFTPnm53CySL7tAVM/JThuaLZ12P6/bWc3NlD7lN8dB4M+lZYeeB6tjV4AdeuXmZht/wmvLizrF0Wb8TfjgGH26q8PnoAnRCQVf8QY7cxHK+EFXgySGodXI8WjNPfcvy5l3ZjahnP6zvwVB0g9rAI4pPVhZAugXmEw67V4CK21t1Zx/l6VzC7U2dF6FgAgsQkyT42EGKSl1qEzmgUiK+8FadAUv+0ZLDAQjKa/ymTa6frauu78Npxf/JjnrZuwtv1oTay5Q74+rrrxjrYmS6P14KUyXlOLIFrks46A+yQ536vgbOU+AXW2YrFO9wgyqlq2hyqmbTl7WiYzjxJjQk7AY4Eqp31iCtzhT2HKdreBP4FePPwS6sbKQ4t7CJEuitNAANlzXncISofOcFd1blm2p+7qyPEkY7gA7AYtmYE2Gaa76Nn93RJdQYFzGIhEoBdyLBgtv519SSK23ihIAH4OQD3MwD6OW+NqPAuXKBdI2IXZyVw51I5lioz7yxkyQrkDzOzkt1GR4zC4uo3TfM49nywoKbZlR5q6SEwlCyrUh9VsgQPAK+vM5BRYsqujO7jIG1vAV2R/iJL96N6lgLZvmLZTsMP5W3sH+Q/ryKIe13EMVLBl5IN/BDDwO/iGqm1Tv+X3Z++sduNF75Rs2m1J5YFV3O2Vibe6Qb3px/mMHWCtlIb5xesSth+CBCuzSEiK4kloMk/o3BspaAP6G6Rfc9wEwbHNE1bk8QOsQQlor1kreUsg7nJyXhyaR5li7AZotQfhYeYI5+bqkT0qFfso19sF6Np6Cs7dLnDlofd/1iPbWJVggPfIAUsXinYVc5yuMRitTwVWJEjTM260R95vIcyOULYadEDCVxiq7mLPWC+dv7exeC7d/WrnNmOLTn2FVT9N1vMYGQL0CWXCD/f0W4EEgS7KpdJXu+BBcDiwL9scxAizLQMX/qCGu5x8N7X6vI88zwXcBHmzSwVp6LoYWAtsDKAvuLGZmNpANfWt6KunsAM4YTILKKsXhu4P1A+Q6w/xF7DnWbcO6lhePH4phLJ1NWY94LOu15t9ikuCnOSY3YBha43clOQBTOqlvt+FVm9INFeH5EcRXDbmo7jxqivRJ9mYNWk2U7wqfnKs2AOSdiyjLazmoLfw+/5jMuFhJiS2l7XiK1g/MJGbMscPgApZh2bgiVJwKXHn1ztoyF8yDrlvUTFbQCcC08UCtqZwAXoMcZNq+gOXPGXNyoSt5cpg+1DZjGfkZEBXR75wEwSdVZl9OJrY2Ww9Dh5XPw0IPCzgWUbs2eEMB7oO1tvUNIs+cD1IHcTUo4P2nH17KdTiuQEV/tq/h4lm+EMVr1LdIEVkroYToad9Q4VdZ+f3I58Ce9avBJR/tWafnhLptwfSF8Ysa6I1kZm0ERXWdWthLlMczR3oyxgXOZQswBOW7b1o+2MfXX7l3gMjqrvKx5yYmje6ekP8Z2HYXjQVW938cvUk8N1yUb/goxBIwFHsuBI81nUEb49lRVlQGpIZZt8qvXXZNnbmsx6BNbYNCt81hihC4Q5EG8NaaxCA+mU4CZkCKhTU+lSuqMcCJfmuQeSJjNUs9ORXA4ft4gGIfSCbM7ctMYIyrOMkjfWPYUGkLSyAcS+q++wZ2x8mMHDoSk/9U+xhuP9CaJwMf7IPZQDYhICO/ATemrqc8arLEs+gQaByvkf17LwQnsORnH6v9nrNrQkcr+ptsoeVJpezctcg70CjayAbt+RoCfPANbf10SY1l+PfTtUK/fz6ogJk35FQ2CQ+2F2MYrLrZ46oneV7VTHC+WryLzFdpn3jEzILUjTss9z+2hppTY81gQ/AKhs/g37Z6RjSflfjZdu14znaXIBBzGmStQRPUszVO3oVa4SNXs6CDGw52GFdXGc7hmbBPnFQdFw3fYJ8vN8QTZ/yMR3H2yyeA7cCKriYBTnM2BO9SqWwUX1cVwWdJSxb6nufuNNW9LyvNLzcGcSE9r41IRRA4P1BUCk3cq949mroL5H/1CO2bW1GFb/E9N6AgSaCWdFd+VAF+8UQ7dnRBd7EGzL+/PuSNtKSs74FWdVZfiAW33FMW+uIGH5r/mYaDAa37LhlY1D3mXvLofC1IAdgYB9ctVl7zPxYUl0EK1N7k66LGacve616fhAo/y68WQrhVnSUD3Z8xvCD+uxsDajIaK39aoVtlxgkT9ceTZixHFR4S/bTZGz18E+YnvYh20rv+qGC8yN/o4UCHWGDyYJsbwpPN/tkEcsuwe0luM+k/q4wf/3qwJXDLo9Z/zgZFR0AUAV1fbni50kdDC0Y1GNbreGxZfZWkwnrdsFjgjoEI/4d060LJwyc5lFNI6yDS6LXZrSWvhS1xIeRIcLxPMPB4mTbBV+52xZWUHo0/SjSNefH6BB3Nu9Fds+T7acQpyi2FO2/Eu0O7BEfhBt7zx2rRNHaT62wXYm/9GYvBBdRT/0SYC6+CSs1xGGB6W5rH1YtWsDSkT5nE4DbcFNaBKtpK1j0GsxM3YYW9RD/Cl4bgroSKRyQpWuhV+BpMAtB3TJjjZoY9ERAGqwP5ctOoj9+iSsNoQv740zioIXas+I8D98yVXBkCMV2bnyW2GIeuKgPb9p9seTORvo/cNv2IhqHKHjwhzGQIaanGl4q5UdpPwpJL9XAHeTUCcjosIXq2MEJPkzpr+YSB51AtsT4eYui8120Dg6GKhC4gMDcmzd3+b60q3dHkOyIgFWmbggm3xG9/5Ev8VD5MqjLzEtv7gP+spKup+f2CpfA0b1iRFAFTN1DNOk3R4Akdak/W64OfiNBfScOa0/xtApN3ba3C6PR2vvI6qmsecGXpMqxAe+msr77UcioE9WZHwXTmD4ZpsVGUE/8hqQKgz9EOdM2vHRbh1BVgRHK3Hvh4JIk04HAENV3ACwUd7dyTL1h8rsEqcCWyNiMpvhM/J3LP2vXwFjlwWD6EvoAxjObzuzQN92PYt2Yowi4N3OG3P0d7NdsW2TWyIuMSSYIGUB6VWBign5pxslPvVg2yw8Z8Vcmgwm0zP4g2vBydvp0iihOKf1u/ddYDtB0EMrz53xtjs2Tk85evm329cRdP7GRBHpaN342e9k1f9iPDZx9fGP6wica3nohy9cg2l6rmL/m++nWz/2nKlf1xs7ozH/dCrS+xyqQXu+tl9Yb2OEIDokbSKdvmxoa8xm2yjP8yzfxm8nCorHog+qY/ItNUZLR3gSb2Ymjt/Zr4HFoukoMAKerNpD/pMk0IXsHgArnj85prcL2D+3i9LvtCfKprjyFjLwgHTNfDj2wDrqQgExwQC0KkKlTPnDNoLWA34F6FIRusAlAUTdH+x313wIn0I0R011wM9ExrSceEwxBfTT7RukM91FgXgkwYcetBaizcVRabYNcwAvYvi361TRYY/NYF51Xcb1I93ayrX7pJt9ejJbGgXlil9gbDL1ELE8uLyrJ6AI+2I+iVLH2DC9dYi8xRcnHpfOaeVLbOwvMmEU5YOCMEUT35QKWmBBcCg7xr9Kr3UQmfH1/+EgIoq018QgkD22qviJlfPd2dbXYaqg+54+ewabtmKBR+fDIUq439CJ+1831Lw/s8ecAvdOaklVIxrpKiAa12x7jWvPEyRCaq0G11S/PvTpEBhCIz+xl+qU/bwB7QYd1PmYmoLp+lVDmay+6y7/T6ZeY9JCfd75Cm/giTSpP56XWxAj0yVusadQcXl/OuNAfhRuCrtxzexdIIJHV/HX+kMfwpL5Y8uWCgZiOU6dQSlm8aZrfjtYNUv2y9JNHGkUlyNS9mNbRh5qvlbr7cVceULkuyaBFkC0sOH6FgxcBP5rkPXA9wDRnFwe/OkSf70i8zPARyB8hrpfV40t1nX6J6ayxdgKr2t2cFAhrFxlq6sfiUUTT1pYuYOVW7uPSJRSnDN8CKPhjqxM+iKs/vmVzyTtG2W1rhqmHv+jD/GhNEF7gyx6RoepgP+Z0FsEgvFTxHeVBXVoJTmRZbSk80jj9cgrkx1pCHq3G8PK3xp/BcFIDtK2hxpOkXzgUZ5KV68/k3g4+8QoShGlBBE3o2SfATuqCp/mepkL7n3+Jyc7h4X5oZteamfijNXjXTinxVxWVB8OsL/hUOysfTHkDEFNEThhVG0U1yorFhJsf7UivVCx+5NsM2jaO+9GVA9vysH60xh+rlHX7kr8luylT8mKxg+0s74/ocBcsiF5rHQYbH/BUfWlIxRd0/owWqh3c1Y3XSFOQrguQjPH5SoEvcT29np9dCXwAsmuvuzusOX05yrY2bkugWyqyvz9KzqZ/zt2DqX/NZv2FGGY3QqxHzBoiDhJeLJdiAVyBhtxG2ywq+EKPMqXudArQvqMcrb+qYRjCQGoZHk60bgDAasiUS8HhZ0snf8RO91UTc4AzWnU6AOge3je7Imsj7DMxhtE0knNvA0jBNygRS21JBpJwMfn6YeA4TdIj7QkLht+b5jjevz9sON4D//yKQpEBOB0e96G/oeohfOCBYl873gK3Cl37LAIyzaM1uehb23ucTun57SrPorzH8cK9nNMvM2k4me5mL8ns+nsB44U6F5tlS92KiK8O6RY48JXFi8EaWEz8gZ4IRr1NRH/ZP+KTY0BPx3pnBRH0rp6kowv6yENaZW7vWHIQ2KkUz/nkMxsRvCCt7wSQaNU+ADzORgKHEXg/A9schYIA9KxDwbbMMH8kDcexazi5PbnOTqRDXQmlCWuKmOSSM0bitzuvRYgCq7vBCoG7u8BkiRdmPRu8I7YNH5ObX2UCc1kdYiafa/YxQddzAdDLty2S+qHqymkH/NDZAlQ1n+D1gIM6QOkAaedI3TfnovKztdY6eQ3yJEDU6mXXIb7sqQ/vJDz/Hye4/YwG9f2Ebwjj9lA35JSs+eo/1hE9ATJAAZ9E1fxdhs86Jis1WMDYL2urtTa6BlkqnbPSRM2SffLG5JJZAMx4adODv1g1YPFOscjrepfYgfeIH8eE4NbaOmESnS45f9jxEKQaky8hxUDdBhcbTL3PYj4Cn0IbwMDoohENBH13RdLNCJMoYv0AgZZ7PImC/NuuPf+rnlDvfgjQx3ZNYv2eLsCMYtba1c3vSi1Hvntr4FEy5If5zJ6VDZx7kuRCxfpJdAXz5Pz436EcuBas9chzZqZXs0TOKb2P8oonDgoK9MwgwkcILWi5xX4JRe3TVwAA8oZsM4Q0r7BjcFb1hvzRRPtu4LZ1h21f4M/KsMCG0453MbJzEjXuWCLHKIkSsAVa32xwBjVR0mNfXfsFGAoXDXowIsIBrjx6tq+0ZYImoUVdYruWn6VdL6OE7GGX4sPr2dMypdgiZPHUtJIRCMzfSkf3f1wDGS4vaNv/MdTUkRZkttNHmdyGFhRUNXm0MGSAzRYL8HaPQAoZ5Jpae2Yh4nW5l5+6d6C6RfJMz1qH+NOGCfWRDNO2ttonve9qHPhHMkTPC5d8GPczRAUvhT5yXOTiNE5MN1fgIWSFEICIOMrvmrLHA217vjXhrggy8mCCyvWbDBVdAJkchQb9+Vr3ZeNEyon9A7f0DdUQEKlLdhFagEA1PXDOvUdBUFLL82/fPR1vsVlmG3jZ2liPJsb+kAVqjMT7zIZBgc1jDAK3j4F/jh0LBhlxTU/fAAAgAElEQVQx7nWl0xrdgoHeFR/LZEcA0zqOqXudq74BdamX17/fuwAsjgcEo/0G9vzFmeCcG6saOl0hXYjtnpwxidWFlgVHuaaYCIQLRIG8NZKk0xZcsZqDt/8MUGQoQ4+njL5iP501MultmZNOq8nKGXFzzfu89Xk0rWI44Av2iWbviwIwK+84eaiffQIjDQ6jqY8mI5nQ/wUq+4842HEfuxS5CYoGK8upm8T/XSnxeZV1vY9r/WltAvvuYafP1h3t8GmSaPSslGV2PmTl82WIbbpYWuuUQdEDX4nVl5InYOcaKvPwTp0ImjNWfPkj19pJmzr4o8+rLSv7LQd8yRmBnPB/jqwfr/T8JSaW4OmSN8LIx7/xGS4IFPCIK4Ys+6UjLRNwOBTYjA1uEtjmBDd6hqpqGKYPBQtCrO9GpQYAoVGuI+Xjhip2zbR9GzK38ZuHhGXeDlb2vpdKN0bJW59qrph2SL223m4RlIrZfP4hc+Snf1HO9wHUucT9N79OvChjZhbxkO4VXBMjaWOJHK3zLjbpNCfX/I929h1cPNFhgqPN7rg4SBG440mKvmUqE/tG6alnEbuEsmHjfRBRYB1MynipZjCCPADSICB5pj9WQ/kHojVgVx491HUjEJxorvs73fsOA5f8SwcZpBuGmWFlkE/mKiGdm2DOja3bEpjS/j9y6bap5zr2HeWkzF5Wlb9F5Qr8lM9nieQqOl4mmjsVApOVAYw50psfZ/AwWcPlsRi/W0tPhZQwOPWLFc6ek+/N/iCaiW9Wkpj5bCsnZ/KR7nH/k20ZOD2KrV2lYVCAjJroX4t2j40PFDrJHaTI5/nWp+E4UPe1Xjaljft0iHbixqoeFqeiZdu4Q/yIpiSeGzqYLWwMJoXW01tr9/oKDuzK5+8Q//blH6QUcgC6+fv+r23P16Rgdf9qogMIY/0uX5htdyWWVbNXXE8SWyUg8PTmJ/8qH60p5h7pRSvGRjtKUOTs0k72qKLVY6rvLR7OOG1aLgNmh5sfADbAIMq+h5FRC1s3bBj5yIbTr5ixD1yKuYKFD79qJC4CGHtRMCN191mOw1f+WTjTChWEQl68NTi67oPNzvUavJV4vkUzsUoasCfM89bU40xmnYxufZftCd9mMH9n5VbOTGLAKFxWqVOQXWDzKJmF8OAKArleac62bG0+uNrQRgW428WOSe1lNvKaMik2WQaVkJmIuUpQClxwJc5OAFxanp/PDV/7EcDIfRNbRCWG7mm2Gg/TFnVTFrA4qV+ZFYwV+21ZuteN4dQ8chj400CwySA6A1AN18Ekb/LCwy4MFj6dMSGQStPqqQ3bj831ti6HN8YyQMsBT19fmAQawGDGg/7nvtXkJNicpKdBBQ7deWX89/4Sk0MWstXw2BGXDCQPqTdEwyLrAvXuU6iOTpZscm3qPqKLb35hZ73EwvtSM7IIyHTBEOgY1e/CH31DhIDT8QmTbaFgieuRj1VDvTN3tAOfTMQzgIeDgg88rXkmqW95kpvBQ/wHBl3cS4jipPv1xsYQeeEMf7iA7Qx7ug5xG2UeVpYSDODTVfYcfGMn3tOLV36c3D6/BXf/JaZBfmM3giWpIjNK3f6xhHUtPIlqUylarEy/YpVToBcms5GDL+I0ujZXSXTy4tTPQQpsZSxGrP3hh27xMYV+aTO+TBIi6xTTa0AyGu3Rmj44rs2MCj+XPt49nzzX7z3fjqZnURmdiumO3tSWAPna/MlHZ95IrP9iewWA6o1cRZQMND+Hr/GzuHPWL7LPwVXPl6W4vwActflCF7lKOnsUUk5GqYflX/9FbkHFAoSQr6zSJYEAetUFKAn50e41yMDgop45YlOaHzw2bnuiwdCOX05yncdByocGDm6eseJjDiYAeZq4wRcAdhBUw2f4R2vtV5Nf/XOtkDwge1uY7vfP5IKHt0XXtrpQqL0k5MZjZYgGL6M2BFSezaqlc36IEg3pNSeyJog+OLFT7Rk5bzexOWDklMl/2C9Fk8xKR2fLVJVW8q8kUKCbv+d/zOqsDsxe4MM/golRHcHmzhQn9EVnsDv7jcMAtCf8ntsZLIBFH/AIg6D4cEY6zcBWCb36CBkqOfUS2KUsXdTz2yJ9+dCN7IyTkrVFgYGwHVNjBmPv6/oJAz9gfreUXQbItswjIY3qtwmPo/TyeLUV899IQPdxPEOjjfuxG8kS+08fJf/KhGjbsvv+S0zWtl2w9jeetLZCg1Kd/rFrDCPAWOKcA3gxAS+HtT/jvvbSAcPGp7XKGdNurYkvp3sfKGgLBEGtlkRxF2/eAnUXGOrFtD2VpuNW+HLTAPIYiBXOA9/kFYgXgj6SM0doHwltGOIFC+5Tv/bBWjzDMsnydX3IfZz0n0gP7DOsJhhwamOuNHudZA1GBOY8fTIOsO4E9xq4hiqJCh7xMp0+4uYvn7j1wiDTb2cStihr4u92SjkApuoKZdeNuAR+qSp/KWb5CZDZPa4I3eSgHTFUBhjZm56RFFqvkndXATD7GMbWiIxvWzJsl76lGvlnhCrBKUsyMET1XyG+pUrT2hcFD7gYLeM6Td7X6GYsf3Qzv6L6hqCKbqhO0wPYN2Arn5E//8z4qsotGGRU17O42zMvLqCSDIov+CUCGGNse9z/23VCAGp3a8gTHlq/oNA9P9xscowux9OAys7qTd79ZK//u7oUrCwX3QJ+ygRXDq56/QMs3ob9q9tpZcr3XEGBzWqFMcROlvXFaBuw82sClKTJLjObzQwUML2/vNCI9vqaHEV+OG16leZygCbYWKI8jFLPrh7qT+F8FZCHvcv33HPIs8IUhkD9biRJkuJ9mBvrk2XyWYyuLPSz1bt+HmurX41vYvfAttezXa2rxkrHaK39uhAyBN5hrHV9mWlxbz9eebc0+iDHQtC90DE0SVDY8hj/7jGVDQj1j9moFf9Xm4MB0nruoCptFAKyCzERLpu8IfLxSomZbzhX0R5X4VyYAR7B+QXqXUEZET/kTDVMqTAr/t6/afd2ANuv7oOD1Rj0Z0bisFzk15Orn9Fa+pm9QzI+zC9enRgRjA49BYbfYtR/KwAO2mKnDA32d10My8q7YH3LnrETeRdnH5ieoquEMXxCUnbo6DaTtM/n4qBXC3j+hSBhxUekXP8KSLJP8mXztA1Wb8f7VVSe2yf6CbCH9fto/lnJAjhEAaCDnxNzELFOG3gOvjxmaobz2T3EiLze5ekAaH0qxrqcDCcDn/L0u/VmtmUcYNQR/jAWXPr1V6SXjuzoVKdH+kD2E0qRc/SdgyY1tT3u9dFBHyI9m26yJ0/0r05YKTika7JQyqIuAFAslQSDtrVrtwTTtWENH59qde9VEn16sC39pnc0qTc1a0cJ6xo1ue3T/c/wnqJRz/RPHzK/QxKyhAbUk/HDcuriv8hQqOwN8NVsVgbBh7vDrexXOjCxHhSwWSj+EPR/r8t77EhVae5GGuApK4/5cmTdnhhTWWA4pHUjA0pWI6eWmAnqJ1rinl5bIALZYUAzh3SFTJrYxeOzA5GMId4G0+r1b09x3zLP6jdpCfIM9Z+rdI2bhUKyRQYytXfYK5+8dGnPPlfziViSjDMITdWLWJ86gBpfBazoWZekalpLzC8Jbo/buCv+csTOp4KZ+wPZH0bak7kn8I8UWp0SbBEP2atr1UmY8Mox1Naz4l13epHEIPGnBxZ/DjtWNf9YIkv3nlB40hqWHehnjI61LzvFEMSfWP/YP/S3RnHagc5TdhqQ5O/wKkn4skpHU+CgLnO8b6dr2jL8a13AS5GScko6HqUDFhu9YTplUmfsCD5h9wZogyReZ1FWQ71Zfqmdtp6MCthON/+d0jVwT/aoKt28z/NgrrWm9gJ7zHNMTe2NBdPgJh1LGoBrw6qCkmhLfORsb0Mc+Zo+dTL9MW5Rf2W3r/ZbabGfDBqkmDa4xPLffDXB6l6LG9R9WGaMtzIOarjN1VE+gk1ddLQWX1esN2LpSamybV0XFZMKgjYVjo5mqdB7B9oOEpynOk8H/Mz+B8Bu/QomR0b8vEwxOfYapWdjUZwh+RuqrzKAbjdKzq7Z+E1WHofpJRgBUKxFS11gkbDkexVv9r0NeswwLDPcXtGPPyI/beiM2C4KKAFJlYTbn+rodM+/8FJiucqGFHH+1w7v4gvZzEBLGsMrkHzuDvujU/xWtfhsfnZ9gPKiVS+7ocKjIxyVM7myH36ICLFT7neOdXhuIptBwPwMNAupFBQqb6gaChdJFRpVvfyRX+RZdcuTY081B+SW+Xt+CZViwPMwNrOi81S6ztSgKn7Rt0DJp6PkhYUvhocSL6X73O94L76rG+A+WHnd4j8kYGw3etMBEci4oqHmZsXO1iPaSlZ1DWxubXJbRQYmCDTP7WTJAi3+hHycCi4rn8Rqa6mfgcJq20v4+eucGTMigFZEOO9LBS9fRen0uzX7tIxIEqDG2opglzCvcvy27gWMnVOpqxf9nSMRvgfyrbX1FIl2Blrf03rsxZwCkgEjIY8hNT6G9ioSQQNQKMfSTeGFSebqwQQsBFQZy8luGg/zR/StVGVezYlR+qqRZdEbjFRGfcEC3SrUFT+UfWLnqa53iGQFiA7BSg/mrWJe3iTVqF2AUaUO+DQQBDKI7Xx9qp8tczl54hhemkyD6yiHHJbX7kLYyQtDLWhxRnwV1p543rjlF3O22KqXnuPWj84/1zp6s4+UYhs7EEl8pP4BwJXlKljMn0J3fo+hmXGOri6EfjMn2M47tAWUyplVJSlD+I1HHtIV7c+DJAM91cWZSJz8gBQrVhPQ5SLR8C4EevzcDe7kASx5nvCcQ/qfP54Z2W6B/dbamweHsQOzhpHa/Rsz8d75EDjWdVcaRijn+tUXj6QtDP21k0ekbiylAEAwXwoOi1rr053h+hYBINx6sX91VK4rreGkVznz6uL2ESjbrfSXB5l+10cDyIGrjg3ow5TsRkOagpwIrzySwBFghXrKCtgJ05FsFJxO0xMWH+UfkNC0bNiMQkL2E58K+uNP3GRtDsvxDdWIabKUjg1JmN9X6l41r4nfEzBnNu9gAx5B00AKJr24qanXpfxLAI5coAiwR9tt8PjSHDhY0FuBE0C0u7jYYEaZ9F3Bn6u57V9db0Bbi+y6owlWpi8JHM4LWnz28YvRelCBM2e8cOce+gkGxOzcBDaZ+8uPx9LTW0iGuAfWGXSNMZoqkVNMDBP5bggwI0fzQYCwd5yPyad1FOBb2o4XCO+Dq46rNMfjYkLMvar8mUm5/aG11Pgu9gLz75j5y2r+Yi4aGwlqSFYNUPhZOXGWiizvDCRGs49g8gvDSxYxPcfwgTEYUKYLt5yHCh2wUKDa+kn/7SZi+1pUJRrcjAtZqp4kiRKUHvoP//jsBkJY3w0SkwyAfeh5WemLLh4Iz69U7Iv1+3pXUx2UjN/yu85hYqMQgDOYt3sj9imoF+olbZHLI9NWPDKRnwqZJ+6CmqZ23AoRzefcnY9IgSKzeilT4AfMOH3mXdRhnHORUlnRIJwHG92o2XfOExVUoARmypG3JkLQgNI6aT+ybw7/At2ufJCWBtKv4QEeXSyTCR7hdOvNv4OTtk+ZoXqdT4MXPwMHfuIiq39Ox/QVlisTuoE5VyTnlAR8KzcaM/spo8ZBo+tPfumyTNfT5BimLIr7nAVIo2kz9+yqy7mAiMTqO/VHmKIu2u2Xq95TiRpv35QzPvNdbKNMcAzmuOy9fBlEWyt44DJQHeKH+f61se0J4Fjgn/i/vnSVBJSVMRcLDa9KQ/61KRnmfVBC/kDLQ2iaKgqMdGuxEAQrQH8ad/k4xf35huYs7xMHtD4UB7EZDsAn9gqGQl2v9vlLp1cS1v97/QknuQ3Osnb4Dm/OwvFfxIeOeApecrJYMoDs60RLZpavN1o8skeAGbPg6Zg5tAs4vz5XR4OKAGQbmRVxHjaDAOBWovZXlQ+bmy9TRla3Pwsatw709RDQLIDVLgGCu/rqlL06r8wTSVtIhKCHn4xktlH6HlA/SHTdW35eVWcnlSgrNb5orxDYK1W27AE9/ngQcRs3to3frf/6p9HVkjXelJ9PSEUjsZ6U8XgYRVDBjgtWQKVC31Cy8BE9ZSg5792wxpDlj3uCG7ZMg4q/GHBztPYsOABjqFsEDBpUZC3xlyQMAfN2VyJCabrlYvRVrh+U7UxS+OX71XYKDvMZ/Dxf+xVgs9uDT8E9ASwUDEM9cgEWfCJrut539xrrrbl3eAIlvL8O+pHqr1wRxkHnRqL74LAJXh9Gk1r1sf+jWHXCxHON61eXlD2ps8/F8VHELwABaIYQ66qGBd+FyCMbSzSek6dVlk5/2woGlV67MblPnwwCSmt7IXQ/zWgbF0uPfCBPuxjuoUEUhJMwgFz1BNdusO9Mw+aUssSjNsv23/C6EZK+D9l06NXZ9oKBvaVllkHB3nzFtI1P2jyc3rMxmZUyZp37hq41OEGotPXZHLht7kchH360LpWXC1u1nt6Jx5c34VWBc6O3+eYtm8a+TuWJGcHO6RXF2JL0sDABxgH7vrzvNpOwRcOQ285yhMr8zT6Tp9yC9vODuJaOiKXPYjD0KTbMe0ZiLykOINNvpwgas8NTu1rgs1XdM5C2oq8bGU9lxX5/oSzbrlBNK6GPrlkOBmJdDFaxn1wtIPDgdmW9D7mq0HsGsvPIXnbgMFsP76Tla/YS01mjBpi4sCHpShluSoWBVCzE3vTiomzMsc75rLZHGM08PY9R7HuT2iY3pD2QYeR11s2FhWuTgqzd/77fzemQgPTuPwfKNOU+ZXv1ti/w1Nc9BafIxEExd9lXnqQHHf0hB281OZh3SRLxRid1JWKBXE4a41agZurpjCUPUM/KBmvws2QDv4z0OBlq8syf5LOhuNl21aGOYwlOprsq8aU8qdgglfoCg/vTYV2AVn7hgttTMKAowKb77LrBDZy5gWnlvRfi5MUpZ5ABMiHgQHxYmLxaMHIL1EF9o2YGHxtQbMv26ZA6sMApNJrrMzyq5GmXAKgcyIoAFi26yuOYyycjQeVNH1xZ4BLCWbA/hLrK9FfkIn40MNMDf2dKWNnHb6wP8rviw6dse6QdZ2/W7l+AEDJmUcpL/Pj4KJc0Fd5QpSszkhkmm0TFySQTL69a1oh8bZxrOFks2QJ3i5E8kgcuKnCcWnakEGK3BuTuf+ZFRMTSvXtjSdD+HwhofVJ+oDJp39ywUv0Au7Gvp5dWDnEIzbPuHmDfsuhoCx8KxBwGU6yTfJYyMh/lfZ48uwxf3Dl24tOAMO0mWARXc4Vle0adwRo+SvxJIj4TX6OuP5huraUvMVVW+O1RPHlZJwnKFklSN4b5r5mqis3mHqnxdMzaA/VkwHn8K35EurU29zboN0ctmJPAgrZWsic79Pee8VRyVyygn1ozfXkLV7Y7sqdppNdmqJpqD2Dk0m48DvuyZfc1AsF4ViK7X5FiCNprRMI73TJIMofp9I+Zdmpcy815C8c1ZKVFU3fdzw77KrL7Axt73u7gnNy3uLdljMz6013icxh72heVC4N6ffG0hVGmryXA8+EgwO5F0J2MZvEOarTdMS/D6mBpA9GV7Wky7b+bKUuG7K33fZhYE6pXc/2H/dDNONcy2E88YJgqIgcHYwfQQ/9xume+gsUQdVyk5wu2vAX0QYqWcT3ERPI1y909n9rU/MrGMWzJh+CcfzLUJrR6cLvyuh+k4lVCV7/T4Hy/xNSpQGKUcxRXgtb1wqp80bNCVyu6ibnqzVW8B3OAUC0n6DBXMbyP9gtIS84FmabLgVJ4/kvfJbOC83qTzrYDjxFJ2LEmZ+YYB8CI7dysPFOvQFiOY9QHyMm7MA8iPs8y/+rRGB4S+PxFFdSfyE2bOtJuldpF/Ab4FBioxUMzGSKmDUfkETgbChLqOMUzkwoHLeaJ2HmXFbxz5C+a+t1Otl9AWFAw+5SE/4UZNPeB3MQcTT3Kt+0EASZY+CiIdYIUj04tvDMxYIpAJvoEhVcZVEp75KYkY6e8vpGZ53gM0ecdyDXRDnSDnk8FoUWzzGE6kwVW68cs5rasdNMfXw/Jk6kL0ekZ6CRGQfJ9VkprHZ9dLVAmegzOgd0iK64lENj8z3p9lkzAZDaTlH9DteqLz5SLElPFDFDWT4l0I2PZWPsQghGbVLKS4EsgFeX8u5vsiQ1jg7Vh3Do6Ya63zHoaJwKnKjMmTm2PcTQdrRD8pg/z/QYVvXS/Ol+ED4Kf2eZsm3YArSw57sDWsqXpuhqibukqgAHp+ZrM5hMbo93WYXIeePAB85Q3OZ2a8LKtmuZijlRbglcJqjW/jruGVVgfb+8Zdr/A3BnhHe1+jA9VaM0xayAyWruOHW2ImcYu6X7mB19Zr1rArheQ2llIriD4Tc1kn15Uo0/tYNKrfGAYloGoTTYc4y0qA9J2LWmapvxwIsP6MkxX40k37Z49R5zcEE/WuwRNvd4q62oqj2U5CcquJli9IfLXZZSStXr534NXIjZrPpqyRzgFmDbx8XFwO/QrCh0pOkWBxFf+Daa2tSgWbUo3dX484QwMghms8CBQ5jqJBZyojswM9+218nSAbqT28WJ4sakDMBW+j+8f7PJvnGqfNYjWb0CCLwo6L9kZ8tKkt2XQvNteZprM92UDu8j+XO0dF15ZYh4PoN/FrEJgGeAvBtqZyjojZOtcTjyu166GbvuOVnoBlJsIoIlfaQIkg41BnPCVQLneqsqu3nRy/Zxzgt+tdXFwGHXmbvyLHwPUxHoc6bYXcP4ogcDWGkgwWwxbVHIyu8tHGwkMDQkGwQeiA8DcJPB+7AleIZjz00E7XFBSVxEFQJ/kzlLrZsyO9Y+SC4FKMF253cZ80sSYfwgF1rF6ybxh8iezPyL8FT1ftNI+Swqsq3oFcJYadQJyT0DZ2CGV5SOHzfziDhVtpnk1M+xd0Tt7bsucDBTWeDqFNFPOreK6GBk51osS8fp/vPDG6kXJ3Daoz/4zVzcOcwzQDTnhA7AUNqGfhu3ydmxZfBXR4ZWZfTwS+uHGkd0eV+Zk195y5qoITLdkuxzOQ9XFpoMRPDwBi2H+WPdibF9TBz9Pus9fBPXWAIOqpASoHzP7FvqjqUXgT7dC4Ioh8A+D/cv9vhLyzXqhZPTHOnBlawKvLryA755DC8tU0nr1NGXgMGxG4PeSXGa2HaRfXTxRhiD6LmXg/bpCMU5uzfcvysA5SFK8G+o/azzguA7sO1C3w9DBl5xUXBUBI2LoFaZEt5yIQ9En7qJEXnjV4G0HAjXgEMidWQtEawzkvaLhxJ9CzrpiRJMsDLRFi2BtcQppdIdCI/7khMx4CMgS+EfL1w9OFYYb+UfLfsPOjdKeW0k4WB12ocYwxbym1asnsWbPVq7DP0tvPRogiEDHZnQRAJzMELoA+z1i4Mb4xlbAeEVl1k+e6XVa3pps4l1uFoUnQOJo3Q7kpLh5sqoDQWRtHVOMUgdtwJJLfxf/VutVhJ6Da6JFjsGMMMCPc9yRL7A1OH4uUB4xcev3Tvip6UCvo+o+uIVVj47fxeGyk99eiNl6nfGDp2WKgQTv9xxewiRJA+5c9FzTkKj2a9Lv5NjdgHErOe2G8CtgjzLA+GrS8Xi/eeDz9u3Cjz5XJ11a9eFVwliOu7m42sKvAKydMEhKAkb735hPUPcIzJcTd7+t2uCwiIJ/UXpE6o4sGFlG2VFkDRhEsNrMDDD1OpoDBYAWcvULH8Pky53tr6Sh3jSvlt54p8gnep3ze50HvT0o6AuY7aEDqxT9EX0k193eGM3c8MMm14SbC7uyX6+fTfS6SOX0TU1xUYLKq49/7qbwfnbtFkq3mQEqZIEJTPel2lwFWOwJxsfZMp2tA6oEaJ7sxab/jgDzBl/JZPbeT9U3PY0A0XWVz3n9gHHDv41pEZHzvsJXHVh34q9nSLn40ZVHluxkgz/P9VAZdZ3V2nX8wD/gGfAKfa+nxQjRNZ796wnrJPXoYlSMmrBuqUABHAESw769S9flzgACEgirB2fJP/Tw4e/s6BuR8ReerquE4NJ2iPpp4LnaXQdzcrnT3Z9Gix7H8OZw6oXNneBUWA/FpXNMqG7ldTaL6/u6oxAhcN0S8CRBg7L6tFFJUFk/Hl75CEUJXSr7xdqk9+4thjwNumpbBqF/zFWOLknLk6fKkrxCjPeSje7R8tY0oAxjkB3Ny3PufLOIw9MWySOhOzheoBsfjgZs3H9SPBm6vfDFKdcOnob4cYE6H6sdWATICDs5BupRz57Fj1LKF5IJb+dMZGX7JxuNCFYxHbe3CKYi8n/EOIuBFYo9ZtSV0x2fgLGs98Cv8EmfgFQlyawVe/xA9RJgKnAoydU49isKAHCmc6HLi1TEpEE1ATJIVgNcnPAl/s2+hU586S/k7j/1ZWH0MZCxnINgJM5NH6pAtHz4chRS1AdLKlcR0F8s69Zr3/9Nz5qn1vP3JaIZHs2f1prYZsMNfBBP2vwcZI1YHaRjFl6QLTawxDZdX3KR0drjj1v0e7rnW3DF9PjZemDz2YQxKvwiuvM+PX7Asn3PjLUjTAfPdqWOtHYlbAEttq2BovIRaQzasuhm1gGwLZ8ARlgcl+UGkjEYdfawagMMHacZnLIDxkSc0SkKPqJAPkmZM/TGvkxIUzoH/QWFy9d++WDyfIUiXR9Dephe/fqPQl5fp9wrBZ8mU94ECCWLRaK+rdPRWGaJBznGazvM9b6UbBaSadPvpWB23IpyiPlCjbikNLhyETnUIMwNKBkCJVLGbVaunjCeNc/kgRgw7JVNymRVkenlRpt3WTG43G0AVxzOVmvpjVl5pbHqg4DTWnNP2Dg9rNjclLawGAL6lEkGd8Nj976ixPwP+jK3r32IJf1Ce4HMBfZqhtYcrKTeSgCN/InBWssqk+6yj8v6ykBfYyNG9AVXAag5x2O6vrEhI+ixIs/c0RuJjxwEyX5AWS2iogEbA666fJ/4WG4AACAASURBVDE5wFlIppFOMfjgiFmr082zrpcuq0S3HgCr/b/2vnVdchxHjmy37fV11+vb+7+gd3d6pufSPU3/SEnEJQIAKeWpqq6D76s6mSIIQBQZCDIlykmBgUeg6GYhxEg+i9CCZgrXH8MYspgvvRKggziNE87roHoqw9yXr+uPhnsBZuthIHcmBysAHTYkUbGtWmZ0xj3r5JkNkIRLSBAP70s3PJ3tB58iGVOhNzwg6sb2lmUgeLUTsI6SbKCSwAb8NpU5cwR3iQzhEzBvt2HWpYP5snMbbmEwmrwX0j8ZacQBtp5hqBgKDJwuqYj+EwH6VUwuaTYe9blgWHVJRgWGe4IjBfDivJRQvFWcTMdVuA/CMJ/R+eNz7FbFWDzXkJv4jrwvLzu4PYF8DBgAg2VAd7Aa0wTvkE2nIF1shyIG6uTNY/CC7adVq50V6+3t5y7GD/Zx3vlAPJNuZLQl7RM1QuYY0F5QL34JNoppKg1TAHWi8tZKd6CEA6eZ8zGnA2ctQfnlZ2EmYpMO+OjjtcQLNB59J6sfvTakNIYsrtYYm6Q1m4QR8VzuAeFsjHl27AR15TC24K6WBKhT8BXEiJjl1Xbvo1fjIrAhc2XpR0/vpyL1F4rvMfsdIa8XTJh7FF/UGApI/ZCDBB4N3OPYAAoITGchvteb1RuikKYiqjfjUgDRcfJorYnb9Ui5+NBN0EN96m4mQ5m3OABf1i0IZjbLIM908fMQ2dCejw3xtNrddKWRdtC1lIY8pyDOy/RKNnAxyB/kNbh4s73Nu2SekiKYhAPHq6oeun3zxayHtrNOxXTkOHlBoDNqSZKAssq+8zieETB6Xn5/bL0FW/72cpdh1YNgPBI5XwUAQSz69RUD51VNgTA1bcA61sEAod8V2prv4JBhC1sOn01cK+WvQxrBVfsF7dHaMSnLfuOwzLy1ZtfcXQJTNaYB1v/8LAJw5OI5OVPAR2lGh7ToAEKN1DDJKcnGSHXZn6gc9jsuSIQz3eUHdChMER+uLeNENr/so55i0VvXMpt/lmM7l2VYl34++Qw3qgM27mu3YUc8HbgvduT0z9LLN5hfXH2puwGgAP9iogC0WrsAtIPOaSYaSoaJzW//o+NygN662tQL9u+uPlLhj+yLayFwmzHgrMu+WglxeBSUsRnt8EnEhO3xwyD7yjhQkdATsA0bGNR5UeizK1hlmTFoMnsynNWnfqcRb1PWMtRDOyaA7UKRBxaWhWAfCPSpdD4e6na2Ew1aluFAL0shq7GFFFS5kht0RoW/fNoaEcCYgY0dvIAxKz0C0pc/YwfqyYMF9g2+qoPDFFidoQpeLZzNRFrDg3fGIRo3aWNGEsPfJeQJg/PstjAQllyy/eFtGeyfShG8HKUUURIHa5yzYdH7iiN7xo7r/wnrhWbJ+z3D0WoKFR4HrD+bdcxrQIxDATFH7GJXQDs9TaJb/oOqKENvjD+ENgSJWHNlPXK6P1pngmigEqBGIGwHLvqBNvRLdGxI0yxhnCcY047/Gswe6LQsLT0doVSY91YCOw5gkO1qiqATkf6cngcROngAcEemYP+8vlXX0W+CA7IRgd0Ou5ZJd2lL3KY7iLpuBX8qqcyxETJ6E68tv3IVTFq4DgyxH8/U9N2tGAwt6IMkUt4PY79KWzD37PpVXkxaMNNOK4hphMlAH3GvljP1aRFhy1In0oVkhjFvE4gFLXu6Goxxe6cPJAWse679G4YiTlx320n51dFudKQt06jD3IuKxmA46whkiK0WWFIK65vvIJcAZcRDR5uLSiKmrrdwcMZMP6hDPtLkcwl+sOpRXOOOsCiYzxBf+FJJdjGCPpExbB+H1etklhHLaP2HoczjrY1ZHMXkK8+bsipe/RDxguwSsHpuW3QER1K1SfF187sw5nVabRkg0pW5kNmq6JyqARjbcqQzzIde+eEyYOZst02avEyhxrLe3NRadKGzfcpgbr5EP+w6fSAJHujD7oEJaeeE9bPtJRiiGDHrdPHAU3uC9U9b2W2VKPWYSyzKSQKX9kih35gP+QBlVm31lstTP+2HnISicfXIaw5t31m7Hz+/zz3PRnmRBbnzaHULVWW2yvBkvQTQGSmDzJqw7sOUGg8svspDKOcGYNn+LtH+NJXyJosFi+EzH5A8IoZFtjlGg8m2XzjGQdKxonCnm88yIfnALwtdawFBASPGtsjP06ERk7JS3cB3v/QCVu7qeXau4SmLmSSHpZlGtAdNUJ+O/U2Q7sO1mu0BJWwFS1xhaFPH/KCasZejZm/n7X3R6EsPt+vSWwA3lcvMzrQkBVf5Xy+8UehixbzscGnSuLn/I7IjvtjO6YBWAixi1qYdKFCbinRWQ2Yiod6V4eL1ySuVoD3fSUV9esNOF7wYm3FCkkdxrxRdZ8Z//uk2Qlj7hpwjb8an2u0YS9t3sUhR24G36SuIzSq6ZM/spO02bSyDt8KClfYf5DykrW6+T5+sHrMVtm3FkD61HxsKiNuQF8eeGBfJyLr8LhysEhA9qI6kQ1mwPoY6B7zkAGilbgdvlYZArRzLISkG50A6px+lzgH7BP3umnca7RoMNaDPZKtiuDpqAHhXdziTZQCM4sNJF9gMkpITGRyZbTBx3eREe3lLa0by0OBlWfP6XidEsYxGp/1sLIWxsVAQk+QxuWLc0IFvO2DOOpbztrkNwwpwHx1nAbVsgDrWik9T96pSaJuQnBI/os79LX/Rfi5XZHIA28bRiOOqQ5tCuvyUvZy6wgApipz8u3vdC2XEo+cQVQHYGn9urVqt3SRs88pxM85uys7gwrcsDe1HN5sGpvJvAebApaY+cHCmmISSIKjvxCaua0QMfbR4A0HqKD0mxGMY17k1A8gylwWwLBavq0e0BYM4Jr/3OklG3X7P2sQnj3mehIFrRVduL1neYywoZe2ShMJlb28Z5QhSyDyKkCk7J3U7GQv2ui79xzaPA1SH+HRjsoONy0R5ZaOx6w8CYwPU1E4TQN39D6BDxiztAENS1xW7djGdm117WQdkashgB/yo3NqtAqiBQGtdilaWc4pu9Hp1zv5t+QnP1DbFEQ/O1V0g+da+pD4jP8S+Ps8icy7esZLPJlZmRVvyIx4cVNC0ku/jklm6JHgLQxZdzoLjGdCwqOxiK9gEOm5iAsAWg/FLmfX/a62VDWThJwRLOTGwrFtPGq6YoB3xBc2ScBJE/Qjrz6JTASQfXMF+NEf4bEFZRzOOHaS/SaJiMRfMkOV4eJJZXGsuZm5m80fM0y4F8dn4McLgvqRiCwMoxGj9FNsU20lmnJTJpQ0h66wy91rWWjGF2GXJtgPooM4wkQcAKwcFZcXWJtQ5H3iYOpZztjGUDevDrfuSa5v9kHwVn3fg+GBn0hicWalhYpn2YdRuIeC7V2/nlhfwRd4u6HNY4SlBpe+9khlm6vnArx2TOOovGx9j6tIlwYTMGQFPdnIBM94Fs+4+1Jl3uqmYGrcFuyWWfeMcoWF5lXKQ58fBuYvnJnB9NUZW1twLlMWCaGauBQ1l2ohNr6ENAObcj9ig1QwK2YzDLTK3Zqf2mhF32LbjyhjDxTUOwL8swJQu4HNIvRmLK79OaNrWOmI5xjHo3tqxuZz9HUDricMm2XhbxqeIRWP67HNVAnH9sCuvQ2u3mHOlZiefMwsrxAjqEoCu243ALWn7FMCP+qVgdP9zycX5zZI0qEtICxlm1BcOSeCH2vJ8RSqznFhHQMEL3E9QkhdBA1XkXLTEyqwBWWZzlYJdVT/QL7NhE0/lThzEiK1edDtlWN/qiQ8ztXTNqAkAt9bMj8IMpCUYX+a93qU75kenM5PE5VHOvg4VzUtwR77aDKixN4mpuouy26ef8b5heylgA+Ddl2XCAScHWAriAlQLLBWWh82QJUWFP1k74BlG/Z0AOJab8roVEoGKPnYOXDS086DglNW1xyi1hqpWePw8B+kZncot41QeXluyXQTWEsiGj837wRHp/tsbu+Wvm9kA9GFkmGsLx3QHj9TDQLNdKGd7qGWbjj4es5OgW7lrrdpWFpx9djbKc0CtvSxpF4JA6U0ei01kwAd0gZ/abGeQLQmwbeyMATE/j56UI/+OkBf31WLYwvwwOW/flDurVjF0Q/JlGf2wBH+njKmkeiIch5vMqvyC5hSAldXWBtqvmqwzE6C+8pNcG+immwyTRiIwZgnBHuxgrfsq7wKkZfkZ2CwZqrLk0Jpiez0/OOUdOJL9szEy1H997526jY3XGATIJKAs6wmj6KU3399TDkSSbOgnZt6VB6LQ2Nn1P+uZcXJdqOAc5XMc4Lw0FrF+getdfC/RjUT9eLzaTmsS/KDq9iI3zA3d8XAKYVXKPImIzJaUQli34EuDI2O8x/mj+81ZvB3rvXQQ2HM7ccwidAuuEoftrpOSaYOkZ9mzAnJRhNoZ3/cugd33FzlDmfkk0HNObSwWDQs2mrbxpoFGpMpsg+9QfxFw4GyCj22X8KHEMxQH4FCXsOfgHF/nAsqS89OkjdkGNsh4qEklTiwq12FrbFdIPUheRoYrvzOZUOdgDK08TQ7rX0oHCyT6yI8CYqBz8Vm5Ra2nD82+Ji7ehMwzDd0+gpl3+WfGMUBF28byJSCoTWYamL4wkPsuxdjdBPCARYkPrldFGNGlWkA2GrEBWLGrgBLciqSDtW7dmqIkIZmpZDF020FpQIxxk/qg08XXNgLZYQ9gnw0AYSUBlrb1JednUdd/zf1nAsamuWxi+4E0y8ZTnGWRgyZtCF9XRZTVJ/rucfozpgAgX3+GQjMKlNaOdnXRBbhzoonXAfUZuwJ7KV3f4QM6g7+FErBmm/Rbw3cBqQ+zl3sAN/qy0C6NpfVETGiwBOPHXh/k6zzWXeHNgVmS6rgM6rari9V8QSdi5sfqEfvp7Yr0VkUG3MB3s+eYs27yQmlvn46t2Bet0H2bjFn0nLyMsTV3kHpUGHggLXX5henMkO5bu4CVDWjdHclFGoAldt9HPLbhvVPmLY4NZv1hmtSDtfUj5xxiljAabbvZTgc7B0p8R8pXHQ3SrdnbLJv9pMb3GRjQM9JlexmQiPrRvD5BTE45sFOUMac+xOA64MdzDalnN8AAhpzU4ol/c4tBNtrfpkYGGcgC4HYNQOwvvFik+tuFdnCWHWOs4G3WXyfIqI8UfZqNw5TYnDJPiEWxPmCOihYpvGmTnuftmzgOHOcEtg4B+KUTMWIMgK01vI+68GcHUXS/+6tqt7T58MPO6WyiehzzPGYdxLTh+ZoPbFmEjrVu2lIWnb48fk9fGwMFyYh+OxJWc+AognsPv1LbK+dWB7mXbRtIR+XUEWP22cwje1epJ17qI0kg28B92Kw9sT9c+8r849l4kCgKyF3tI0az8hDTOiNxNQiluhhwEP0gX/RUTKqYwUqZKgEtqsMBUPmUfVrQDpuMbDK4ig/QD+/ykbEwneMLjEOWEaCUvvgDTvNgZ/cuytytTsi0JejkMhcrX0GfjG6hhOGFmyP5wGgyMjpX3y7WoUJBrCIZ0AXMO2DKdQZurlXCvJVa6bzXnmqFMamC6BwDH0eFPj/qGCNTy1kbhHIdlzcvXHfLRB5CCgWduuvSbWn9lspZ1YOQTyJg/VoBkjgPaVt8UJEFAOhBkvgbwrNy+FvDt1mS9hmt2SdNXVccfjBN7+icyc2tRs/B35AnEwG/KCIM2QO4rAdg03RHF5uzw6EXxxL0zAHsA3N6SI3ZhzL7qfi93JXfCgNWFXRjon4M7aHxHjJ101NpRsf1SsmpmzgioT+WskQETITtCuwRlSzxE4jFyleN0VrrPxYbJMjwgVPE8K4LJqNm7pUNP4qiJOIByTiC8Q3wogsykK742R0evdmBoM7FJiLjyxNKtm/LK1G01vHdPysv9lCxnBUGaGf+xAMmZ/ohJ6qv6hIfXX/G9btpa2d8LZZIoXoM+sxZJqoz36WQj8t8fI/5N/A/ixiIB6wXsnBEerhNacvFoso1jdO2/JhUIZYSg/d9J1Fkl3yF2J9+j3O5v+VvJCyBKeJnPzsbJo9pYm2oKGjw4xC97fEqHEDP39Koqkg7CsjUgSsOyeAc2Bmwt3G4xNPacR/7b7PcxAH9XPEeMwTS9q+HnASXVaOQ71qpQyD6Vk9du0MzuBVt6KCgRo2FcvtP8Ox1Mck7BL3FKMO7XoD/UJHd1cSSJksc7HyT5HXpBwkTJriILGAqyiVLhnZLb5LIU2q+KpefGy/rcAM0ELO+nJ6HBMqA3XT1SQekMc6wZKhjPkodlhhcUhAgqxycQDwP+oQAOpe5I4S+fBqCsBnM1/lM8HSndhi4rJ2q5//y3v4GxOqbNrftjX/4Fj6cE5EeAzCxArWCQUV5B5nlrNiuS3Bu17mPNreBjdZ2q6CtdakqafsLRCNWnzboqfhbHipcI68BOGXbxWtWuV2zBw/wXSO78y4Ut79QdDGM1uK7ZRJRA9lZN+J9hD98McYHbUj2SuIaJkUocBHxAUBn/RS+0YgmDbIDYpAQ0B0hU0ckFRcrAWGU5M44Lh0Ti9WBidVKP9z7pCygWUU3TgdmDOjbMKV+QbKxVxzEvt+gkVWznXNRoVslXX3O3GLfib0q6J6qhTuHKkB+blyYge15hhTEVd+MkgYvmwyfBqRj867NgeF0qWrxeEWxn+B+7zV7L8lvJwMBhGkpYm/WhkeFiS3HcZcdOQCJP0rmXimv/7qLcYKx7tN87Vj2gToIg6RidRwI9ytQRIZRktOgBuI5azj0w/fXX9YZseryy6nfYQcodfxe4qA2OuILAfreuKmTeZ+dPMBJXdCXnfIKyGQgJ/o61DHEJNi/RnAgY0q3gQX2VfbNZxbeZ86a8+u/liweF8bcbSSQ+0/thQQRdi8w+jFQnD8pnetaw48Fer93DEBTV9fvsge2ETwM1NIHmqYeSj7e/nk4fYK0k6QjOpiPxTzJqvQm6FNg7lqv2U/quvjZCFC7rlP0JGGlx3Xygo51Ge7bGp2J2r/u9zBRA1Oq1xLWjW1ie5yNU3uwDVjGf5VhCIiSsbEJEpw6tADYL/UsQXh/V13BV9a2BF6Wk7kzMI+nQktDJkxgE+RItaYXnOcFx/dgM8AHdtUXAWn2YR8DFBLsX+UyEZDEog6jB5umgr9/3Z/T1MMgjO6lV/GQRIfaBg9usT5vKs7mkb3Hz0a0vqCoeL4j4kHAbQIkWyTfFTDJKEoAYrJ/BOBd81kBn4VbH4HE7zfFfTgCXM6UfdI6iZ0rYHEE9nT1Wru5uot13gzqRwIdP14DicUD7+udNpxRq8OUdbMHfP4EIbeRGXET3vo306bv2PiWRlFsD1/sHpazxIJ8gbbWzNc/SDR1BBVQvrCP05oCUHXa8v6kAdrw9Pk6igDCXVuW2Lu1ANinie1yDa9+xuY+Xs6IOjwqJMsYIZgiU9FADeJopr8GerKsCuSVB4ice2NL9k+aDwkbz0GcnQ+JJ5HyD8iPymjtdZ87a2xSL2LXWV2hcDUycW/INDQPr1/3JrOXWVwM1lWU4DPZ6cUyETMcejnBwO5x0IOifcpVM1/k52xF3VEl4GPgBX4idm3jET4xswZ77zDdZl7d590apFlhr7PKRw0pJJyRnh/i6PJzZZnT246ZetZK04935WNwfUD5hqOi2T7jqrly3h8QQdGSgThm6PplG1gvlkryeEIeus99Lcm9wCECb31YM1No2gCAJTkDLE+gpyzxQ0A+MJw8jsJuH/EHsxNnw7+fdHZbAPgXgwXsPwJf+OAUO5epNEhn7uAiwoeVZCKyTB0mW3kujV5/HJUzouYieyL59ztTxSLRMvVcCxcTyKW+shVJl3+iuBkA46QEySY4jxy8tS8/G9H2lLtglqRv4jB6MPHVfHpHNbVTFVj1d8sEW4TsdWvX0xL2dWGZ0F9MAAq3m7/H/VUOAN/FgZ6s7AeoCX9XzxHndlx/1mY2ufh94+c5QQZrwH7Wt+AbAS87F+0L9fXZhsan07UPdTEO7wKYyavQ0bnKqx2fgeTIConV5rMbPqEZ02kjV/vgTXSUbgDidPwipg4Yc2ov+/0AjPM08Y0ErEebF9fYcGOZx/KUgDj93TL6rhAdkALTZRFAFdOs41PcCGqHR3PBLegbrGnurpNxqQq9l87st/7hHudvCKtHD5oPGml38MEuUVm+Kcm+Es8mr9bA06uLPq6jbCtdlHzUCUvTuu/A3oLqtd7olJ10hyA9T40So3qTXDcsJIO6HCC3owGukIhai9fKqfH6HSyU2Rtwrcd+jMQCgI8mzy8A8YbaAdSBGPNbW5K0vXlfWezDP5KaR1a63kVo/e1nHzw9EgwWVUJ9A7DG1jDoOzKF2rOdF1izYwlsCGzsDEMzULz8ZIHRg+JMKvalHJepYdrMUJduTpT6uAqPNBRuVzAFsWq0jBLlcVPLaw8ctzSwwopkzVIPJv0EhLFoCJdZ8x18nsqVM4hAnMRVIlfo2gN7JDtXziV+AtQkBM1aSLXo9md9PktMW/i+TyCQrygxhmp9/OH//d/bITFRRLiZy3tjdmJ3U/QCLg9CWWuXvoyhk+Uqoz/CLpz68CTfnyedeKvljDxO6gfq5N2Wn1cQy6h2g+CayQ8IfG8JJhDWxe1Bvf27V8Q6vZ72aWxEdSFjzYG8zu59skA+JvfiLLy6g6R2l81W5uwrbmo0o4jFEU9wTJeWLfbxh3/5P2vRlP0xHrJprjXHHn09DGI2JjwJIfka+hR2iA9lJ0gsGBRPBhwDsHpYCsnIFrdE9y4mL/GHxnUq3eUz4yYJwDZbE5P2TLFd6pEOYaj74vcixTPeos8SGz/sQCAXPm6A+NQt2DLJx9mJHpQS9VMWLvyUEcq00exJhWt/iwlEdMKV9fHTv/zvTRf3JyHGoBEAZrQuYcnWFvGDwV7bfYF0lFyYD2vDH7/K6bkUZw6XDWanHaCbXbuesGo2K0l8+1BKMypYD8X0cCJYEZ8qnh7onF2mDFTp+9Qcxm5ixA8PoXQfLavMcp20CKsP6rdmZy4xC0+Xm9z5xr55bDM9P4KUNtsXaoyf/rUC7iBjWFqx4DjK6fWKwWUiIAkZJzDiwA8AUMzsxWXNZg/RzCECe1XX229tDWzjZZUO4o3E6NP+UVxuKehHso359QnnDQdTLqATfvfuq44YeGLH+HJ1sx9NK8yegHkn9peAvNcBfA+4px4tlv0dJL9KNXtcWrHfiY0+fvrX/1Vy/LyQREEkWp6Q9UNWGoG0PG7icV0UAI4GI5ZYkP0c7GOgP3VWZw5YR8eywMDLzJkMvTuzt7K9NR/pHVvI2nIy2Ek9GUAB+6kiuwNG2GimtxLWen9p5bDj7K+CedROEYgXlmhAu0guwHmB8Qt485Lw+n388d/+56bVRoGkkmH2ZAII4w+XDPuRL1OAiaTzF9oSgOxsbDD74RWVTw2+uBtxsCe2iK9VPVynBvzpJDa1UXu98fvkpvfSCzWIP1KJ9WyuDOnO8cXaMfGGyyuovrGTgXlPzid8CxMqqCU0dRjFtj2708+/r5jxacXV7+OP//bPQik2Y+ouhFITtH1s7ucFHLz7YqZPh1EI9s2Bdcbql224ZBLPGNxhwPC3mfVKYgji4+aqMdn65LohNsHmuu+ShK2uiQc3/DXxlSxl4JGGAHGBlbdGl1jKj/yHYM5YuQfdeIuVqFcN2NWsjlNZZuQrfSUzOJnX+NMf/jnSLAlmdSCW8ByKSwAAvKCtEPCFjVEAjaMsAydoJwJrpYO6MbLPZyjVmQMdjqAgToLeBm3z6qyA1q/OEr5mAVGuLq+g+g6ZA/Yd2Y2WWQiYT7BfYeX8XHAPGgLosX2f+FhiRD2ag3ht90kRRyLPU2LuavzpD//j49wBqa2RWzGcpbhM0FqLbz08bIVD4wDiDCDDSZ3Swfa9jSL4RmCv2olyNeMgA+Mo2YAYoA9urwzarg9w6oRLhumL9XRxbxOoop9gyaIE3kUGqZdhiC+ybKFsRGCeLa+0BpZY+Hnw/WgYumAw5w9OFZNl2C4fLn38/NM/tdbuhrQ2vV6VGMBMmS0OGWMUt+hW2XIDnU2g2QGwUwD7CtuOZw4rIJtN+H27pd2f6i8gozrXD+RAy7IwGApMsDinTRXjTbmw70tlaYlFg2QK5JSZa0Cndp5g5QTMq8tQzP7ZT+ttvyDWpLbXx88//eMDXvYlbKrqQ0uhEdAlCBiP0OdhJ0ssFOiFfgHssyUYDG5FsO+zkC67GH/xEM3AHugXFMM2WhHYJljkm3JKgidBgfoOC8qB24aUM3Z6JcUXq5Pvrpju5RL+aFwAc8OO4SguL9Fov37Wwq8Vf6o2k6dZsJ2pzoLx8x//8WFniwLPNRkCAEApEGT2Q2Z/frBlottVZhEh4CcPKI24K0+Q5mAfdVFrx3wMfFZmAllyjgQkNpeUqlIdgdJqpc6TAzUG8GxxLGPg+0sJyS2JGTNfvIPF2RLxVRh5ZU8aV0TaoA7gaKaT1VmRBfYw6/Tx5z/+90dM3uvmFeZ4HmK6IReYfgAYu0PR8kS0/4x3iO0EYM+XiorLRIz1t/aKvUsdJjoxpmCf+c2kmiycgBnJ+fVpgnRHwrcMRbLCDomP5eWEfM08ZOf0ncEFVn7ZEHHI+qVEoP05EL/6CaODLMlm7ct1v5D08ec//benbfpDhXMtsUtQIV17NUDqcneWQAzQK/XKdgSuEgJ6fVzZWAJ6YKcKuuE+NMwmKT90/Mf9ZZUvtca+yuXXrVaML7RgAuYxswU+Ox49s34O5nF9fVzpRmAOWPnKsspLhQN5DN657dbOJPjFgP4d4H5HKssERN8oc/Y6j8PcPaw6B3pngzByFcsm0LfWalsEZGDfWmlbgtouj9GyzwI/jWYiWV1To9oGz4mF/1XgxrZcFcdKiS+lHi/1WJ9X3V1mvr3Egm1wMEesPOqFWTsc9oLZCpPnATywFV9yrdoVuIOO1U3Rwhjh0+K7jjaI7AAAFjBJREFUA20CcAn0M7Bv7WLg2RLO+gNFK0D/Oj60orOvij4I7Gv+Zv21JZFo9pMdiOvflac5V7rwlCwbsCoviZZwzNheWUqAYI6WWIgdBuhLe9S8jmfMPGL9NjbfDiQ5LIM3SlAfKRdY9/GXn//rh7tncofBvQwEtwxeOvKPX26osPp4VjD1M1afAb06HC7fnB92wF7brMwgvG6R5Vv36ZjJ7aYmbiO0ZTgPmVuaj0bAjUT0LACSqTBAd2DOlllmeQToa8wc+LuKkuWVwqynBuKmbn+kh2p5KhuMxsD9ac5SkQKDWwH/6hrygF1J+LN2EKPntiFfWwZ6Y+cmq1/ed6a4zFFn+KxuFNeOsET9kcIYKpHFNywpe1Ug74VZBASwCMxryzVPADpfaqkvr8RgfgO8uynqqHi4I9DWtrxS2vjLz/8lKP9ACc8rAf4C0wzfgCSMDXT88kG2IFAxABsivjrQCxsAXDEDDuwEDPsaVvQa0OFdSriVc87rBfpfFr3XpPzWpWgJIdbX/jIg9+BEe5GYddBwFrcE9mDuY+JgLmwEgJ7tPhmDOG9X//HNHdFPOELt8dc/I3D/MqOF3+YY1VpfUqg8mZrfbhiBjb3cflnoisMH13h3QbOGfHkI2/K+tF6VRUe3kuI44niwbiTP99asTdsCSGfCAC4LAEuVkXJXK2DuARf2tkVAnzMRdB6id5Jk0BprB8TsiQ0229gRE8vTvJmln/HXP//nh11lIexO2aUUly+UDgGXwo+E6W8BEdi75aEFoL90UPfCCSoG+12gN35xwUIcwF6kchZ0pHR/qIDZcxzLptQeiuFeJ6AtLN1QVhqBGYULVkX5Q35Sdn0e22Xn1384IYRLNS7ZBe17smfRFvs90CTAIf5S52VJwP0xdrIoS9N2DJZNlD0H9uhHySKrh3fkmPpD/olZPbQDwR77sP7hlU6XcrSNLcBP4jqLIK7vyg7PcMz9qSC8ZKw0tAXBfAPIWwvAPEpSZAvcsOdbUC8mhGSWQp+s7WGvFw6qAM46RyWZwxp7Yppn/PUv/6nsOLbFdCvhLkx8AODUgWaR1bcWgH0O9OGGYoOdrwZi2r1CoJ8+XJUio86XyArXgAcX17FKxZ7/ZTcTqw9LvyyxMqQzRg7sVcG8tQDQODPPllm8vSpDBzYCdh4mtm78O8NZ74mBWh4e5Dj1vSR2MNCz6uNvIbhvBHJ3fK0AzaWfAM1XDfQzxm1Wb2KvgH0KrC4x1ME+7jU58CecdrXS+8WGJafX8u9ykMfVDscUB/L5tcbOI2C0xyuA7kYlPQ++bDLB3p4DA3OhWwB0HyeOtdq7qQTnvgSaNnMEg2X87S//kDjfld3RloFIwECvQnYpGKtnQO/9vEA8aiy0EZiIJ7A9lZL79RXQEztHO8CEARNoEpdq/wrI7g4HloxpOLou1Fzt3B+VKTQI5ZEigLJf68zcV+fsNHv5hT4cAfmsw1h6B3FeZckLtHNAfx3PAB0mxS2MDEep0mK9NxdouY+//fUfkor3O3q1TcqMzyhXfozE9hnQLTDj5fvJEaP3x89j4Y6Rh+0c5LMlC98O4SzCKNT29/E29ntWnADq5OYDJZ32I+HgkjLySylL2xjQ421ySY9LgFeDOSgnDL22KyWqO2PKGL7W0favOKCNTTnbauOZkIqMF7j/R+4/qm2XflyFO0OKLVOwIJoAMReI0LkJ9BkrzZZtXAVjJwD69fv0sZ2XTtahdFukLJnqFjpu1B7vknBAZazzkQDi4t0lAQGOEeXAChtr58Gr9aZOEMOpsgrqEaCXwHhe4xjQiZ2bN5q8jXDoft3HLwG4o8z/5YSx2Fl+ycKyhdYz9hg73QZ5MfQ2Qb61ItC3VlwCyuHgqu/aNbHvQP8B1CzH+1EiJ9RBB3Wsu2I3spXOraYOcVhZaqkBWwTmJE6aPMj6ewrGta2GYxsiBhj0MnXxcRALbFkmspIkiT5++dt/qMVWkicSwUqTRYC/APYCTDNGr4ClwjrpPvPIBrCzDfSRLWJvBTjprZ2Bj9JsoNrNWVzG9coMJNBiNjWLrAS2ISVGLnxUwVzpriy1CHsVMC/M6P1aOmLpoH6yD86MFduWx+qAzpLCptDVj4K+EzGvqoG7P5l38KZBv9Q8Vpcu5h/O6JdAXtiV/pwNMVvQh2Og90s6hKNVgT5r28rMxwVQAfuCrXB2sGHvw2QBvGEOqzDxwCcEswjMdXl5qaWyzKL0kvRPQL3yur4I1OOEMI9ngO7s0IuCSAlGmQ+aefbxyy//npeW7aywEsaUsqUMduAmo2WAuQvyKj7C5oV9X604K3gA6D2bx/aU7ULb6wo337BEfT8pyQT3runW2r0hHYGKdMVAbPqHRRk7dxWIPcB0XR0400Es/Q6ox+3wDEMH17N6cQf+utI3CrPQPn4NwL1i7v3CljXQl0AXgt3TIM/q6zIP9IxndNLsiNFn7ZTYope3CvYLVGD7DoF7bGegUYTOuzo1DljsNjEqgTip6+oHc69HGXpgKzwfC+rsfPK9bVybZIDemmsDZYOcP04MxndJAE5sJgfmYPz6y48LATEz901cspxDFpYuCss2WyCv/NaBPgN5aAswbX/uwLcsrtzVA33F9rWPWC+u+7UstTwtjAVPCZcTYuUW9LxH2PmlsgXoOIlxhrx5t0tWfxnQja3KDOb6cCA2Yep7Uh4bffz66wPg3loLp31LNUnttEUWQL61EOBaS5YfBus60YV8GOgjkCc+XFH1zUrQHteHIawu51gb3xTg5yDui9kyRMEPUq2AObTP2Dkuv/SWHi4CdjqmTk5/FdTpkguqS2wY+7SotbDdZ3XcEtZnngR6pMXAXbqruXhaoq4ZKz21K+QdkBf6i4x+bRtgzubdYdIO62x5hd17f7DKDeCHZrL72K10XhSGE0yl47NYAfIS9TkKdti596EBPbAZLO2chlCv1UZqDF3FZnzMMpu0hlWBNs/jVUCv2XtI6JJtKn38/dd/93A0TILOtTCFh818F+QrPz4mIP/6UwP6cI4j4oSntbw+D+ICbVGZOazZZpIs59AD3yBzZxJM/0tqV2FGgXaWWxK72YsvDju0Zx1xh71AATYodzoZqBcZejBD8cstXNDI3V/XsEZwywKL7wb32vQ0q15ifwGLLTPYJ/Z2b620SZgP9Sk2L46DPpg9jIXtnQeryXcV8BfjSBXuJIIFbsSk5J7O44CtWkwr7Ly1lt9uKOpW1tGzPdMxXYnYObYzPxZA/UMAPXsil1bD46VcH0H6YfhZcOcX4VERoBbylmyp4tYyRYHNH8Yqb2wKJ94ZyAs7oEpjjD5m3E+DPba5hqMbwI/krGTNseNbUgRuJiV2aHQS8MXgc2PJ5bCVXpUiqFcB/fXVltvzRAmDtVVAsbbuKLopw37cdsLA3RJ+cJK3TixewEhPCjBjfBkKwPY4yHtbUycG5/sgr+tU2Pzaqw2DpBrOVpjpRH8LvXfuq89ktBkr7WlrssTIhW7oKAPzyOfqbYuBvWzppaPQIkDP73zhbB2x6ncA+kqvK/aWe0Dfx9///sNKhZuS3Sd6qZFDFuyqbA4BG1quCextPRTk2XF8kWYyot2vesG3gD6z5+OhXXoL7LGPhUpfXorMuGamvsyyDuaH+hZDj8jeChALW9nySWprDdTvAzqgYh0XhysMVVkH+o8AdxBK2Fh8+g5PijBvVSQdA5adLdWooieY/BMgLwrzmU4Exnh2o/VZm2O/IZwsgH5qi/inFWPyXTatnZCZ7bLZeCkC6a0utSjzS3e6ELshQz/qQJau/UxzJCYwy0lBPUhys3wV1E0MtJz3yXB2viIQH3RzPgzuIRShxuo/xO7Hb78dFStAli2xyECi5YkAvDTbD8D51M2AMAM7uGSzC/K6POxoVVZPsaTA7ltLkmVdniHyq+iPa2OpgndcrwI6SNbvciF2U0A/6kFQZ22wswtjhalrG7Mc9Xw+g1B62nYdvw5Td+dyKxUScLeZaHPD+nVQV8q4gTIQ885dVwEtXQV5Vbz0+j1iK2W0Pc/8K1M34S+dNq4s34BYrL2lDr7I9JdNF2TNu17O2JP77DwGc2MnA/UIhC+dZNkFFq6COgZgD8xklEC2jlj6LUC3Mn77TZzBIyyk1LH6+O3vDw6cfBq72jBXxSUGr2pqvWUWDysCe9mr9xI7V3GwNHTZCoDTBsaGHNKNwRe1U+Cf+tB1lvv61uB4oo8/AdrAFpBddt5aBdRFj8h8XOw7sMnWv4EdfQjpBLYiGxmomzh5fW9DXIv+ww9bnU+B+z32jiRIt2Vwv9Wht0FdGYmnOBVwWQV5YLey9LP8RiZgrwDy5TW8ZaBPQJ4UlmLhyqrOswPgaxHTo/pxCDZTFcwzXQ+iH7L0Qs4pY+pqhJIAMlDv7gsB9mwJRvu4T0wPFx/Tt3vXWeW2eMR6ANSVA9tQ2DM5JwCYFZB/6X0hkL/+WwV5UqcK9OL80mUbbTA6xP3xCkkMX5sUztoxxRPlc8nB3MThwNyUm5hKLZ2x9Wzp5dKpg3rG9J3bCNSdMrF1H9gvA5a9Q6VbLpxsg/vuFOUJ0QDf2m2Qry5DvHSfBHlhrwzyvkzWKW/d60A+sHsklyL8IMPWbe6TVzBFu+Tkmf5bW/3c911bOwe2Kwz90Hv9KSaMIluPl3JmHWenW1WeNODh5TdHaVuXvan3BNbVcXbR1akO6MEWuH9JYD/lAPjW7oPWLK+CvOuWAegug7yrBGzeAnlQr7q8c8W2CPRXPWJuyfdXJMtDJ5kDkWWGVbuPrKXLugq0iV0Re4Wpa1t4iaQ7xYipJ6DuKgQ2nwX21hAhfcSq+X4g/Hm2BXA/p42vCl8BsFvBDVddfriUkqUaUFB9hN/Ze4rJXx+ia7jA5g97a0B/+AgiyPwFX2P/mUhjD4+rmtNc6sssgZ/Hl17Y0giwHbF1ujSS+UFgTIA9bL9sz5cQ2NsDyzHK2LNL4Jk3Be5zpD68Tv5RQpdrSiz+UrzJ4l1lAvLJ/d0c5L2/uWSzC/KkrgP6yhLKjdfq0eW1ov9HRE50M509WQd0oEsBHejfAHU6F42WT65yRq0SUFcVIrbuy5092kgfwthXhK9G7MkHZpKPk3sgnwL8Ub4J8lssngYDEkcC8gPEHtmVDtaSJJ2g13yXGP2CvS+0plNjmFJWgTywWwL1BUCHCvHLMTK27+KrsHXgx8o3BuxVKS7vpEzvmxc/DaoCVBXggUIM8oHNbZDfW66pgTy2UdkoTQa0+eibtl2I9SOHpDsjwjTrMoGv1lqBnwqow/u+Ex8RqF/lCNgZ0NZeX+f9xG18A9jbw0sx7xAC8K8BL2L/vYN7awhovwaAp3YJyCub1aWa60NhCWiDzZcepsIOxZ+VPli3bT7m1vpRAYIMHEg3RbPY/MxyMNdfkX6FpZu62fLJpbOyBPOel2So2Egycba/LWA/RSzh0GX03zW4t4bYe2sPA/yhswnw0HYAyDHIB9yrBPKHziLQb4O8cb4O9pFU7Xwk39egGc2rUunyY0U/YMLIZ8a0lV6drePEgGPYAvYCqLfW7m4p8C3I7x7cW7sD8JXlFFvfMUcG8LrsQ5Zqri9Fnlh8gbaq9wTQX3a+1f6J183Fn1odU1d/LSalENQrgE6Sx6NsPbBV3CPHs3Bv91L5/QN7a9/u4FkS/iPEOxi8UYJdNgDjD1mqUV/etGRDY6r5VbaKsX6c7IB3wQawNz8uzjCqoL4C6KrO18HWP4GdytcyWN4uDwH8q7wyQVxbpvG+qyCfA7z3uwryd358vVxsJIiKVN5pu2ANH3ZA+14f8+sCoKc/kOYsPe3Zd9m6q/QJ7G+U7wbcW3sY4NVXKEWAh4YCkM8APgyMDPcSwB/lZbxJVnbfBPatVQDfM9fnR8Lauvn8+iSgG3vbLN3H9Ra23traMoyrHNif5/F7B/VTvitwb+3DAf7Qy9bhne3EB12myWYG2q5TewvIV+y1t4L9x0h1DRx9XVxyaS1ZdjE2CQDSFi0B8Q6oB/ZKbD0DdWD/+2LrUr72AfMWuQ/wh25tieawk63DO9taxwM8rl9b/vH+VwBem1wFem67DvSxnY+RFYbNvu6voxPTLQP1HZbuTd0H9jW2XgF1bf9S/f4Y+ynfJbi39lUBPI8DlddZPLALAyW2iyCvfG0Q0ALvfCx5YNkKeiuEPZbOgJToEoV7Sy/yIAL+d7H1KqgDH98vYz/luwX31h5eotkBeGUC+bkJ8FO3DvK7AK983cLLgIu+CYcfkxCE38HSge0qW6+ugZ/l1aWdh4A9fhgp8fEJ7K195+De2hLAc72zbBfglZk3APzU7/YAjs8WkxhSX7fBmPw2UAvgvRI0w5OAnrhqEbDTHgmYOp0JEOfbbL21ZBnmBlt3db5bYG/tE9wveeBJ1lmeD+lu6tmvGdMO/KQs3tivsninXwV5of8wo/c+HhJrtATkrHJBllg68LGytl4Cdg7qjq0TRg9V3snWXb3vGthb+wR3JQ8B/EunzOJN3UcAvrUHQD7hnwtsHkLXNiqv9dlx1HgiCTwC5Mpg+dcd7usDgf0eW/fl1PbCj6aX+iewW/kEdyP3AP7QlTo7LL4O8ImfAWxEPgL7sQ9gK5BnGf26/z15cI5QZup1QD/18Y+g2J5fLy+CL6z8bmAPlqxmna95u96Plk9wN/LMXTSH/qlXAngI7jwWVx8dvvQr0LG5Hg/r7ID8Ue/3PjbLbD1fetHFdbbuzUXLMBmw74O6sv3J1p+WT3AHQl+HtbSPeWsPAXxlGajg4ysFeGzrdwbyu3e+xIpCBTRWla3fAnZt/xPYvyr5BHcg4dtOlgG+tat/5i+t+NIAXwH3qfckwGN73yDIl0ANydoSzDP3rT8H7Kq40AZqNCyA+yewl+UT3Incv0US1MsZ/ML6u1doIehe+h8N8MZmQejq6tcG9CUQM+pQHvixVOkXemjlbUahga8B2D/X2AP5BPdAngX4Ffau9At+DMCn3f0bAHju/guB/GNALqUC1PbQnbX1o3x1/R7qg97yscDePll7KJ/gnghdf98H+OL6+6X/BoAf2AaEhTTY7MdcYHNDVmc8tyRgwKH6kqwtw7yKorV1b/NDgf368qZ1dq//ydpj+Ux7ifAO1Bk85swll8IgTSQcO3Qdd9XQjIWqBeCzIj0M5Wj3PjLFWR79K13HaW5d1oF91eaOqVVg97rFvn8f2Au+vnv5ZO4FCX9gxQw+1q+x98MGXH8nPr7Y+nvB30MMvhSKEunrWUBYP4t9UF+5IwabXGTtBUBdW46psHZyHp+sfUc+mXtB4nU9yOBj/TrI6AH5xM+SOpYnZhla990M/jRVb4sh/j0nHwnsq/LobIKUrwK7r5j7J8C+5u/7lU9wr8tqh1q8GyGyQwE+n0anA716D3YJMT4O4EM/b5ZH/C5kqFXW7qXC2tkX7+ORJZ9Pebd8gntRDvb+EPvaGx0bspBAqLtsqo5t/V4B/hFWvGBkFRTf3R6rP6DyygVVrP95h0xNPltpQTY61YPsXdULfADWlbN3YIf5eAvAf+QyzUf7uPMj8hNkImft5Wu/GUPez9eX/z4llf8PR6CHyswafXoAAAAASUVORK5CYII=');
  background-size: cover;
}

.top-title {
  // height: 200rpx;
  // width: 200rpx;
  // background: linear-gradient(to bottom, rgb(241 73 17) 0%, #f7f7f8 100%);
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
  // position: relative;
  background-color: #fff;
  // top: -200rpx;
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

      .top {
        width: 100%;
        display: flex;
        justify-content: space-between;

        .name {
          width: 300rpx;
        }

        .delete {
          font-size: 26rpx;
          color: #ff5040;
        }
      }
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

.recommand-list-container-view {
  margin: 20rpx 10rpx 0 10rpx;
}

.recommand-list-container {
  position: relative;
  height: 100%;
  display: flex;
  flex-wrap: wrap;

  .recommand-title {
    text-align: center;
  }

  .item {
    width: 50%;
    display: inline-block;

    .item-container {
      background-color: #fff;
      margin: 10rpx;
      padding: 10rpx;
      border-radius: 10rpx;
      min-height: 480rpx;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: space-around;

      .name {
        overflow: hidden;
        text-overflow: ellipsis;
        -webkit-line-clamp: 2;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        text-align: left;
      }
    }

    image {
      width: 300rpx;
      height: 300rpx;
    }

    .name {
      display: flex;
    }

    .info {
      display: flex;
      justify-content: space-between;

      .price {
        color: #ff5040;
      }
    }
  }
}

// 空状态
.cart-blank {
  position: relative;
  // top: -200rpx;
}

.cart-blank,
.login-blank {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  // height: 60vh;

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
    background-color: #ff704d;
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
