<script setup lang="ts">
import { ref } from 'vue'
import OrderList from './components/OrderList.vue'

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

// 获取页面参数
const query = defineProps<{
  type: string
}>()

// 高亮下标
const activeIndex = ref(
  orderTabs.value.findIndex((v) => Number(v.orderState) === Number(query.type)),
)
</script>

<template>
  <view class="viewport">
    <!-- tabs -->
    <view class="tabs">
      <text
        @tap="($event) => (activeIndex = index)"
        class="item"
        v-for="(item, index) in orderTabs"
        :key="item.title"
      >
        {{ item.title }}
      </text>
      <!-- 游标 -->
      <view class="cursor" :style="{ left: activeIndex * 16.6 + '%' }"></view>
    </view>
    <!-- 滑动容器 -->
    <swiper
      class="swiper"
      :current="activeIndex"
      @change="($event) => (activeIndex = $event.detail.current)"
    >
      <!-- 滑动项 -->
      <swiper-item v-for="item in orderTabs" :key="item.title">
        <!-- 订单列表 -->
        <OrderList :order-state="item.orderState" />
      </swiper-item>
    </swiper>
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
    background-color: #27ba9b;
    /* 过渡效果 */
    transition: all 0.4s;
  }
}

// swiper
.swiper {
  background-color: #f7f7f8;
}
</style>
