<script setup lang="ts">
import { useAddShoppingCart, useCollect, useUpdateShoppingCart } from '@/composables'
import {
  creditRepayAPI,
  getGoodsCollectsAPI,
  getMyCreditListAPI,
  getRecentlyOrderAPI,
  type CreditItem,
} from '@/services/order'
import { getCapitalListAPI, type CapitalItem } from '@/services/profile'
import type { PageParams } from '@/types/global'
import type { QuickOrderCategoryItem, QuickOrderListItem } from '@/types/order'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { cal } from '@/utils/cal'

const typepopup = ref<UniHelper.UniPopupInstance>()
const activeIndex = ref('1')
const currentCommonlyType = ref<QuickOrderCategoryItem>({} as QuickOrderCategoryItem)
const currentRecentlyType = ref<QuickOrderCategoryItem>({} as QuickOrderCategoryItem)
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
// 状态栏高度
const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0
// 胶囊数据
const { top, height } = wx.getMenuButtonBoundingClientRect()
// 自定义导航栏高度 = 胶囊高度 + 胶囊的padding*2, 如果获取不到设置为38
const barHeight = height ? height + (top - statusBarHeight) * 2 : 38

const allFinish = ref(false)
const allPageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}

// 全部
const total = ref('')
const myDebtList = ref<CreditItem[]>([])
const getMyDebtData = async () => {
  // 退出判断
  if (allFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getMyCreditListAPI({ ...allPageParams })
  total.value = res.result.totalCreditMoney
  res.result.list.forEach((item) => {
    item.check = false
  })
  // 分页数据增加
  myDebtList.value.push(...res.result.list)
  if (allPageParams.page < res.result.total) {
    // 页码累加
    allPageParams.page++
  } else {
    allFinish.value = true
  }
}

const onChangeIndex = (index: string) => {
  activeIndex.value = index
}
onLoad(() => {
  getMyDebtData()
})
const goToDetail = (item: CreditItem) => {
  uni.navigateTo({
    url: `/pagesMember/mydebt/mydebtdetail`,
    success: (res) => {
      uni.$emit('debtDetail', {
        debtDetail: item,
      })
    },
  })
}

const onChangeSelected = (item: CreditItem) => {
  myDebtList.value.forEach((i) => {
    if (i.capitalId === item.capitalId) {
      i.check = !item.check
    }
  })
}
const goback = () => {
  uni.navigateBack()
}

// 计算全选
const isSelectedAll = computed(() => {
  return myDebtList.value.length && myDebtList.value.every((v) => v.check)
})

// 修改全选状态
const onChangeSelectedAll = async () => {
  // 前端数据更新
  const _isSelectedAll = !isSelectedAll.value
  // 前端数据更新
  myDebtList.value.forEach((item) => {
    item.check = _isSelectedAll
  })
}

// 计算选中单品列表
const selectedCardList = computed(() => {
  return myDebtList.value.filter((v) => v.check)
})

// 计算选中的总件数
const seletedCardlistCount = computed(() => {
  return selectedCardList.value.length
})

// 计算选中的总价格
const selectedCardListMoney = computed(() => {
  return (
    selectedCardList.value
      // .reduce((sum, item) => sum + parseInt(item.money), 0)
      // @ts-ignore
      .reduce((sum, item) => cal.jia(sum, Number(item.money)), 0)
      // @ts-ignore
      .toFixed(2)
  )
})

// 立即支付
const goToPayment = async () => {
  if (seletedCardlistCount.value === 0) {
    uni.showToast({ icon: 'error', title: '请选择需要支付的订单' })
    return
  } else {
    let capitalIds: string[] = []
    selectedCardList.value.forEach((item) => {
      capitalIds.push(item.capitalId)
    })
    const res = await creditRepayAPI({
      capitalIds: capitalIds.join(','),
      repayMoney: selectedCardListMoney.value,
    })
    if (res.code === '1') {
      uni.showToast({
        icon: 'success',
        title: '还款成功',
      })
      myDebtList.value = []
      allPageParams.page = 1
      await getMyDebtData()
    } else {
      uni.showToast({
        icon: 'fail',
        title: res.msg,
      })
    }
  }
}
</script>
<template>
  <view class="viewport" scroll-y enable-back-to-top>
    <SolaShopHeader title="我的欠款" />
    <scroll-view class="container">
      <view class="image">
        <view class="top">
          <text class="t-title">订单欠款</text>
          <text class="money">{{ total }}</text>
        </view>
        <view class="bottom"> 实际欠款：￥{{ total }} (实际欠款=订单欠款-不关联原单退款) </view>
      </view>
      <scroll-view
        @scrolltolower="getMyDebtData"
        scroll-y
        enable-back-to-top
        class="list-container"
        :style="{ height: `calc(100vh - 400rpx - ${statusBarHeight}rpx - ${barHeight}rpx)` }"
      >
        <view class="recharge-title">
          <text class="text">欠款记录</text>
        </view>
        <view v-for="item in myDebtList" :key="item.capitalId" class="item">
          <view class="check-container">
            <text
              @tap="($event) => onChangeSelected(item)"
              :class="`ftysIcon ${item.check ? 'icon-xuanzhong1-copy' : 'icon-xuanzhong1'}`"
            ></text>
          </view>
          <view class="info">
            <view class="infotitle"
              >订单号：{{ item.orderNo }}
              <text @tap="($event) => goToDetail(item)" class="detail">详情>></text>
            </view>
            <view class="price">{{ item.createTime }}</view>
          </view>
          <view class="right"> ￥{{ item.money }} </view>
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
              立即支付({{ seletedCardlistCount }})
            </view>
          </view>
        </view>
      </scroll-view>
    </scroll-view>
  </view>
</template>
<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
  background-color: #f7f7f8;
}

.popup-content {
  width: 100%;
  min-height: 300rpx;
  padding: 20rpx;

  .type-item {
    font-size: 26rpx;
    color: rgba(50, 50, 51, 1);
    font-weight: 400;
    margin-top: 20rpx;
    margin-right: 20rpx;
    display: inline-block;
    height: 60rpx;
    line-height: 40rpx;
    padding: 10rpx;
    border-radius: 4px;
    background: rgba(242, 244, 247, 1);
    white-space: nowrap;
  }
}

::-webkit-scrollbar {
  width: 0;
  height: 0;
  background-color: transparent;
}

.viewport {
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 112, 64, 1) 0%, rgba(255, 80, 64, 1) 100%);

  .container {
    // height: 100%;
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    overflow: scroll;
    padding: 30rpx;

    .image {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-evenly;
      height: 200rpx;
      background-image: url('@/static/images/viewbg.png');
      background-size: 100%;
      font-size: 26rpx;
      color: #afb0b2;

      .top {
        .t-title {
          margin-right: 20rpx;
        }

        .money {
          color: rgba(50, 50, 51, 1);
          font-weight: bold;
        }
      }

      .bottom {
        width: 70%;
      }
    }

    .list-container {
      overflow-y: scroll;
      .recharge-title {
        position: relative;
        margin-top: 40rpx;
        font-weight: bold;
        border-bottom: none;
        height: 20rpx;
        background: linear-gradient(
          96.62deg,
          rgba(255, 116, 88, 1) 0%,
          rgba(255, 137, 114, 0) 100%
        );

        .total {
          position: absolute;
          left: 0;
          bottom: 0;
        }

        .text {
          position: absolute;
          bottom: 0;
          left: 0;
        }
      }

      .item {
        display: flex;
        border-bottom: 1px solid #eee2e2;
        margin-top: 30rpx;
        padding-bottom: 20rpx;

        .check-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40rpx;
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

        image {
          height: 100rpx;
          width: 100rpx;
        }

        .info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          width: 90%;
          padding-left: 20rpx;
          font-size: 24rpx;
          white-space: nowrap;

          .price {
            margin-top: 10rpx;
            color: #afb1b2;
          }

          .detail {
            color: rgba(255, 148, 26, 1);
            margin-left: 20rpx;
          }
        }

        .right {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          align-items: flex-end;
          color: rgba(255, 80, 64, 1);

          .shoucang {
            height: 50%;
          }

          .jiagou {
            flex: 1;
          }
        }

        .red {
          color: rgba(255, 80, 64, 1);
        }

        .green {
          color: rgba(39, 178, 86, 1);
        }
      }

      .item:nth-last-child(1) {
        border-bottom: none;
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
  }
}
</style>
