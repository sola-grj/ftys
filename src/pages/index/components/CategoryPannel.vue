<script setup lang="ts">
import type { BasicCategoryItem } from '@/types/home'
import { defineProps } from 'vue'

defineProps<{
  list: BasicCategoryItem[]
}>()

const onTap = (item: BasicCategoryItem) => {
  uni.switchTab({
    url:
      item.name === '更多'
        ? '/pages/category/category'
        : `/pages/category/category?type=${item.id}`,
    success: (success) => {
      setTimeout(() => {
        console.log('settimeout==========', 200)

        uni.$emit('categoryInfo', {
          categoryInfo: item,
        })
      }, 200)
    },
  })
  // if (item.name === '更多') {
  //   uni.switchTab({
  //     url: '/pages/category/category',
  //     success: (success) => {
  //       uni.$emit('categoryInfo', {
  //         categoryInfo: item,
  //       })
  //     },
  //   })
  // } else {
  //   uni.switchTab({
  //     url:
  //       item.name === '更多'
  //         ? '/pages/category/category'
  //         : `/pages/category/category?type=${item.id}`,
  //     success: (success) => {
  //       uni.$emit('categoryInfo', {
  //         categoryInfo: item,
  //       })
  //     },
  //   })
  // }
}
</script>

<template>
  <view class="category">
    <view
      class="category-item"
      hover-class="none"
      v-for="item in list"
      :key="item.id"
      @tap="($event) => onTap(item)"
    >
      <image class="icon" :src="item.image"></image>
      <text class="text">{{ item.name }}</text>
    </view>
  </view>
</template>

<style lang="scss">
/* 前台类目 */
.category {
  margin: 20rpx 0 0;
  padding: 10rpx 0;
  display: flex;
  flex-wrap: wrap;
  min-height: 328rpx;

  .category-item {
    width: 150rpx;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;

    .icon {
      width: 100rpx;
      height: 100rpx;
    }

    .text {
      font-size: 26rpx;
      color: #666;
    }
  }
}
</style>
