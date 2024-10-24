<script setup lang="ts">
import { ref } from 'vue'
import OrderList from './components/OrderList.vue'
import { useMemberStore } from '@/stores'
import { onLoad } from '@dcloudio/uni-app'
// import Test from './components/test.vue'
const memberStore = useMemberStore()
const pay_way = memberStore.profile?.userinfo.pay_way
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
// tabs 数据 1:待支付;2:已支付(待发货);3:已发货(待收货);4:待售后(已提交售后申请):5:售后处理完毕;6:已收货;
const orderTabs = ref([
  { orderState: '0', title: '全部' },
  { orderState: '1', title: '待支付' },
  { orderState: '2', title: '待发货' },
  { orderState: '3', title: '待收货' },
  { orderState: '4', title: '待售后' },
  { orderState: '6', title: '已完成' },
])

const tabItems = ref(['全部', '待支付', '待发货', '待收货', '待售后', '已完成'])
// 获取页面参数
const query = defineProps<{
  type: number
}>()

const current = ref(0)
onLoad(() => {
  console.log('type=========', query.type, typeof query.type)
  current.value = Number(query.type)
})
// 高亮下标
const activeIndex = ref(
  orderTabs.value.findIndex((v) => Number(v.orderState) === Number(query.type)),
)
const onClickItem = (e) => {
  if (current.value !== e.currentIndex) {
    current.value = e.currentIndex
  }
}
</script>

<template>
  <view class="viewport">
    <!-- tabs -->
    <!-- <view class="tabs">
      <text @tap="($event) => (activeIndex = index)" class="item" v-for="(item, index) in orderTabs" :key="item.title">
        {{ item.title }}
      </text>
      <view class="cursor" :style="{ left: activeIndex * 16.6 + '%' }"></view>
    </view> -->
    <!-- 滑动容器 -->
    <!-- <swiper
      class="swiper"
      :current="activeIndex"
      @change="($event) => (activeIndex = $event.detail.current)"
    >
      <swiper-item v-for="item in orderTabs" :key="item.title">
        <OrderList :order-state="item.orderState" />
      </swiper-item>
    </swiper> -->
    <view class="status-tabs">
      <uni-segmented-control
        :current="current"
        :values="tabItems"
        style-type="text"
        active-color="#ff5040"
        @clickItem="onClickItem"
      />
    </view>
    <view v-if="pay_way === 'online'" class="content">
      <view v-if="current === 0">
        <OrderList :order-state="'0'" />
      </view>
      <view v-if="current === 1">
        <OrderList :order-state="'1'" />
      </view>
      <view v-if="current === 2">
        <OrderList :order-state="'2'" />
      </view>
      <view v-if="current === 3">
        <OrderList :order-state="'3'" />
      </view>
      <view v-if="current === 4">
        <OrderList :order-state="'4'" />
      </view>
      <view v-if="current === 5">
        <OrderList :order-state="'5'" />
      </view>
    </view>
    <view v-else class="content">
      <view v-if="current === 0">
        <OrderList :order-state="'0'" />
      </view>
      <view v-if="current === 1">
        <OrderList :order-state="'12'" />
      </view>
      <view v-if="current === 2">
        <OrderList :order-state="'12'" />
      </view>
      <view v-if="current === 3">
        <OrderList :order-state="'3'" />
      </view>
      <view v-if="current === 4">
        <OrderList :order-state="'4'" />
      </view>
      <view v-if="current === 5">
        <OrderList :order-state="'5'" />
      </view>
    </view>
  </view>
</template>

<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
}

.viewport {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.status-tabs {
  height: 80rpx;
}

.content {
  height: 100%;
}

// tabs
.tabs {
  display: flex;
  // justify-content: space-around;
  width: 100%;
  line-height: 60rpx;
  background-color: #fff;
  box-shadow: 0 4rpx 6rpx rgba(240, 240, 240, 0.6);
  position: relative;
  z-index: 9;

  .item {
    flex: 1;
    text-align: center;
    padding: 20rpx;
    font-size: 28rpx;
    color: #262626;
  }

  .cursor {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 16.6%;
    height: 6rpx;
    padding: 0 50rpx;
    background-color: #ff5040;
    /* 过渡效果 */
    transition: all 0.4s;
  }
}

// swiper
.swiper {
  background-color: #f7f7f8;
}
</style>
