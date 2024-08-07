<script setup lang="ts">
import type { BannerItem, HotItem, MustBuyItem } from '@/types/home'
import { defineProps } from 'vue'

// 接收数据
const query = defineProps<{
  mustlist: MustBuyItem[]
  bannerList: BannerItem[]
}>()
</script>

<template>
  <!-- 推荐专区 -->
  <view class="today-has-to-buy panel hot">
    <view class="my-swiper">
      <SolaShopSwiper class="top-swiper" :list="bannerList" />
    </view>
    <view class="type-list">
      <view class="title">今日必买</view>
      <view class="container">
        <view class="two">
          <view class="item">
            <image src="https://img.js.design/assets/img/62b5663edd87d2d6d6bd3297.png" />
            <view class="price">￥{{ mustlist[0].price }}</view>
          </view>
          <view class="item">
            <image src="https://img.js.design/assets/img/62b5663edd87d2d6d6bd3297.png" />
            <view class="price">￥{{ mustlist[1].price }}</view>
          </view>
        </view>
        <view class="two">
          <view class="item">
            <image src="https://img.js.design/assets/img/62b5663edd87d2d6d6bd3297.png" />
            <view class="price">￥{{ mustlist[2].price }}</view>
          </view>
          <view class="item">
            <image src="https://img.js.design/assets/img/62b5663edd87d2d6d6bd3297.png" />
            <view class="price">￥{{ mustlist[3].price }}</view>
          </view>
        </view>
      </view>
      <!-- <view class="item" v-for="item in list" :key="item.id">
                <view class="title">
                    <text class="title-text">{{ item.title }}</text>
                    <text class="title-desc">{{ item.alt }}</text>
                </view>
                <navigator hover-class="none" :url="`/pages/hot/hot?type=${item.type}`" class="cards">
                    <image v-for="src in item.pictures" :key="src" class="image" mode="aspectFit" :src="src"></image>
                </navigator>
            </view> -->
    </view>
  </view>
</template>

<style lang="scss">
/* 热门推荐 */
.today-has-to-buy {
  display: flex;
  flex-wrap: wrap;
  min-height: 508rpx;
  margin: 20rpx 20rpx 0;
  border-radius: 10rpx;

  .my-swiper {
    width: 50%;
    margin-right: 10rpx;

    .top-swiper {
      height: 100%;
    }
  }

  .type-list {
    flex: 1;
    background-color: #fff;
    border-radius: 20rpx;

    .container {
      .two {
        display: flex;

        .item {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;

          image {
            width: 150rpx;
            height: 150rpx;
          }

          .price {
            width: 100%;
            height: 40rpx;
            opacity: 0.8;
            text-align: center;
            line-height: 40rpx;
            border-radius: 15rpx;
            background: linear-gradient(90deg, rgba(255, 112, 64, 1) 0%, rgba(255, 80, 64, 1) 100%);
            position: absolute;
            bottom: 20rpx;
            color: #fff;
            font-size: 20rpx;
            font-weight: 400;
          }
        }
      }
    }

    .title {
      display: flex;
      align-items: center;
      padding: 24rpx 24rpx 0;
      font-size: 32rpx;
      color: #262626;
      position: relative;

      .title-desc {
        font-size: 24rpx;
        color: #7f7f7f;
        margin-left: 18rpx;
      }
    }

    .item {
      display: flex;
      flex-direction: column;
      width: 50%;
      height: 254rpx;
      border-right: 1rpx solid #eee;
      border-top: 1rpx solid #eee;

      .title {
        justify-content: start;
      }

      &:nth-child(2n) {
        border-right: 0 none;
      }

      &:nth-child(-n + 2) {
        border-top: 0 none;
      }

      .image {
        width: 150rpx;
        height: 150rpx;
      }
    }

    .cards {
      flex: 1;
      padding: 15rpx 20rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
