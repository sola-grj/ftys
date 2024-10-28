<script setup lang="ts">
import { useAddShoppingCart, useCollect, useUpdateShoppingCart } from '@/composables'
import { getGoodsCollectsAPI, getRecentlyOrderAPI } from '@/services/order'
import { getCapitalListAPI, type CapitalItem } from '@/services/profile'
import type { PageParams } from '@/types/global'
import type { QuickOrderCategoryItem, QuickOrderListItem } from '@/types/order'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

const typepopup = ref<UniHelper.UniPopupInstance>()
const activeIndex = ref('1')
const currentCommonlyType = ref<QuickOrderCategoryItem>({} as QuickOrderCategoryItem)
const currentRecentlyType = ref<QuickOrderCategoryItem>({} as QuickOrderCategoryItem)
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const allFinish = ref(false)
const inIsFinish = ref(false)
const outIsFinish = ref(false)
const allPageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
const inPageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
const outPageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}

// 全部
const allCapitalList = ref<CapitalItem[]>([])
const getAllCapitalData = async () => {
  // 退出判断
  if (allFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getCapitalListAPI({ ...allPageParams })
  // 分页数据增加
  allCapitalList.value.push(...res.result.list)
  if (allPageParams.page < Math.ceil(res.result.total / 10)) {
    // 页码累加
    allPageParams.page++
  } else {
    allFinish.value = true
  }
}
// 收入
const inCapitalList = ref<CapitalItem[]>([])
const getInCapitalData = async () => {
  // 退出判断
  if (inIsFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getCapitalListAPI({ ...inPageParams, type: 'in' })
  // 分页数据增加
  inCapitalList.value.push(...res.result.list)
  if (inPageParams.page < Math.ceil(res.result.total / 10)) {
    // 页码累加
    inPageParams.page++
  } else {
    inIsFinish.value = true
  }
}

// 支出
const outCapitalList = ref<CapitalItem[]>([])
const getOutCapitalData = async () => {
  // 退出判断
  if (outIsFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getCapitalListAPI({ ...outPageParams, type: 'out' })
  // 分页数据增加
  outCapitalList.value.push(...res.result.list)
  if (outPageParams.page < Math.ceil(res.result.total / 10)) {
    // 页码累加
    outPageParams.page++
  } else {
    outIsFinish.value = true
  }
}

const onChangeIndex = (index: string) => {
  activeIndex.value = index
}
onLoad(() => {
  getAllCapitalData()
  getInCapitalData()
  getOutCapitalData()
})
const goToDetail = (item: CapitalItem) => {
  uni.navigateTo({
    url: `/pagesMember/capital/capitaldetail?type=${item.type}&capitalId=${item.capitalId}&orderId=${item.orderId}&title=${item.typeName}`,
  })
}

const onScrollToLower = () => {
  if (activeIndex.value === '1') {
    return getAllCapitalData()
  }
  if (activeIndex.value === '2') {
    return getInCapitalData()
  }
  if (activeIndex.value === '3') {
    return getOutCapitalData()
  }
}
const goback = () => {
  uni.navigateBack()
}
</script>
<template>
  <scroll-view class="viewport" scroll-y enable-back-to-top>
    <SolaShopHeader title="账户明细" />
    <scroll-view @scrolltolower="onScrollToLower" scroll-y enable-back-to-top class="container">
      <view class="login-container">
        <view class="login-type">
          <view
            @tap="($event) => onChangeIndex('1')"
            class="pwd-btn"
            :class="activeIndex === '1' ? 'checked' : ''"
            >全部
          </view>
          <view
            @tap="($event) => onChangeIndex('2')"
            class="code-btn"
            :class="activeIndex === '2' ? 'checked' : ''"
            >收入
          </view>
          <view
            @tap="($event) => onChangeIndex('3')"
            class="code-btn"
            :class="activeIndex === '3' ? 'checked' : ''"
            >支出
          </view>
        </view>
      </view>
      <view v-if="activeIndex === '1'" class="list-container">
        <view
          v-for="item in allCapitalList"
          :key="item.id"
          class="item"
          @tap="($event) => goToDetail(item)"
        >
          <image
            :src="
              Number(item.money) > 0
                ? 'https://img.js.design/assets/img/6691ec1357bbf24e7d84d155.png#d1470ccbdcf1e16c04752d2922557bae'
                : 'https://img.js.design/assets/img/6691ed755633d29b2e6b5f63.png#301e1bf17fb46516ad6eccd70153f3b0'
            "
          />
          <view class="info">
            <view class="infotitle" :class="Number(item.money) > 0 ? 'green' : 'red'">{{
              item.typeName
            }}</view>
            <view class="price">{{ item.createTime }}</view>
          </view>
          <view class="right" :class="Number(item.money) > 0 ? 'green' : 'red'">
            {{ item.money }}
          </view>
        </view>
      </view>
      <view v-if="activeIndex === '2'" class="list-container">
        <view
          v-for="item in inCapitalList"
          :key="item.id"
          class="item"
          @tap="($event) => goToDetail(item)"
        >
          <image
            :src="
              Number(item.money) > 0
                ? 'https://img.js.design/assets/img/6691ec1357bbf24e7d84d155.png#d1470ccbdcf1e16c04752d2922557bae'
                : 'https://img.js.design/assets/img/6691ed755633d29b2e6b5f63.png#301e1bf17fb46516ad6eccd70153f3b0'
            "
          />
          <view class="info">
            <view class="infotitle" :class="Number(item.money) > 0 ? 'green' : 'red'">{{
              item.typeName
            }}</view>
            <view class="price">{{ item.createTime }}</view>
          </view>
          <view class="right" :class="Number(item.money) > 0 ? 'green' : 'red'">
            {{ item.money }}
          </view>
        </view>
      </view>
      <view v-if="activeIndex === '3'" class="list-container">
        <view
          v-for="item in outCapitalList"
          :key="item.id"
          class="item"
          @tap="($event) => goToDetail(item)"
        >
          <image
            :src="
              Number(item.money) > 0
                ? 'https://img.js.design/assets/img/6691ec1357bbf24e7d84d155.png#d1470ccbdcf1e16c04752d2922557bae'
                : 'https://img.js.design/assets/img/6691ed755633d29b2e6b5f63.png#301e1bf17fb46516ad6eccd70153f3b0'
            "
          />
          <view class="info">
            <view class="infotitle" :class="Number(item.money) > 0 ? 'green' : 'red'">{{
              item.typeName
            }}</view>
            <view class="price">{{ item.createTime }}</view>
          </view>
          <view class="right" :class="Number(item.money) > 0 ? 'green' : 'red'">
            {{ item.money }}
          </view>
        </view>
      </view>
    </scroll-view>
  </scroll-view>
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
    height: 100%;
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    overflow: scroll;
    padding: 30rpx;

    .login-container {
      position: relative;
      height: 80rpx;
      margin-top: 20rpx;

      .login-type {
        display: flex;
        height: 80rpx;
        width: 500rpx;
        background: #f2f4f7;
        border-radius: 50rpx;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);

        .pwd-btn,
        .code-btn {
          width: 50%;
          line-height: 80rpx;
          text-align: center;
          border-radius: 50rpx;
        }

        .checked {
          color: #fff;
          background-color: #ff5040;
        }
      }
    }

    .list-container {
      .item {
        display: flex;
        border-bottom: 1px solid #eee2e2;
        margin-top: 30rpx;
        padding-bottom: 20rpx;

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

          .title {
          }

          .price {
            margin-top: 10rpx;
            color: #afb1b2;
          }
        }

        .right {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          align-items: flex-end;

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
  }
}
</style>
