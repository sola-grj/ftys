<script setup lang="ts">
import type { PageParams } from '@/types/global'
import type { RecommendItem } from '@/types/home'
import { ref } from 'vue'
// 分页参数
const pageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
defineProps<{
  recommendList: RecommendItem[]
}>()

// 选中Index
const activeIndex = ref(0)
const onActiveChange = (index: number) => {
  activeIndex.value = index
}
</script>

<template>
  <view class="btns">
    <view class="left">
      <view
        @tap="($event) => onActiveChange(0)"
        :class="`left-item ${activeIndex === 0 ? 'checked' : ''}`"
      >
        <view class="title">推荐</view>
        <view class="desc">为你定制</view>
      </view>
      <view
        @tap="($event) => onActiveChange(1)"
        :class="`left-item ${activeIndex === 1 ? 'checked' : ''}`"
      >
        <view class="title">浏览</view>
        <view class="desc">历史记录</view>
      </view>
    </view>

    <view class="right">
      <image
        src="https://img.js.design/assets/img/647f508ef4cf090efd244f0d.png#abcd9de40757a3e271102c0dfedec16e"
      />
      <view>领优惠券</view>
    </view>
  </view>
  <view class="list-container">
    <view class="item" v-for="item in recommendList" :key="item.goodsId">
      <image :src="item.image" />
      <view>{{ item.name }}</view>
      <view class="info">
        <view class="price">￥{{ item.price }}</view>
        <view class="jiagou icon icon-search"></view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
.btns {
  margin: 20rpx 20rpx 0;
  display: flex;

  .left {
    width: 50%;
    display: flex;

    .left-item {
      width: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 20rpx;

      .title {
        font-size: 40rpx;
        font-weight: 600;
        margin-bottom: 5rpx;
      }

      .desc {
        font-size: 20rpx;
        font-weight: 400;
        color: #323233;
      }
    }

    .checked {
      background: linear-gradient(90deg, rgba(255, 112, 64, 1) 0%, rgba(255, 80, 64, 1) 100%);
      color: #fff;

      .desc {
        color: #fff;
      }
    }
  }

  .right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 80, 64, 1);
    font-size: 30rpx;
    font-weight: 700;
    background-color: #fff;
    border-radius: 20rpx;

    image {
      width: 150rpx;
      height: 150rpx;
    }
  }
}

.list-container {
  margin: 20rpx 20rpx 0;

  .item {
    image {
      width: 300rpx;
      height: 300rpx;
    }

    width: 50%;
    display: inline-block;

    .info {
      display: flex;
      justify-content: space-around;
    }
  }
}
</style>
