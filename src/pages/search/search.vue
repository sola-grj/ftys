<script setup lang="ts">
import { useGuessList } from '@/composables'
import { getHistorySearchListAPI, getSearchListAPI } from '@/services/search'
import type { PageParams } from '@/types/global'
import type { SearchGoodsItem } from '@/types/search'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

// 获取搜索历史接口数据
const myHistorySearchList = ref<string[]>([])
const searchDiscoverList = ref<string[]>([])
const getHistorySearchListData = async () => {
  const res = await getHistorySearchListAPI()
  myHistorySearchList.value = res.result.myHistorySearch
  searchDiscoverList.value = res.result.searchDiscover
}

// 排序参数 // default price
const orderType = ref('default')

// 分页参数
const pageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
// 已经结束的标记
const finish = ref(false)
// 获取屏幕边界到安全区域的距离
const { safeAreaInsets } = uni.getSystemInfoSync()
// 搜索关键词
const keyword = ref('')
const onChangeKeyword = (event: any) => {
  keyword.value = event.target.value
}
// 重置数据方法
const resetData = () => {
  pageParams.page = 1
  searchList.value = []
  finish.value = false
}

// 搜索列表
const searchList = ref<SearchGoodsItem[]>([])
const getSearchListData = async (action: string = '', other: string = '') => {
  if (other) {
    keyword.value = other
  }
  if (action === 'tap') {
    resetData()
  }
  // 退出判断
  if (finish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getSearchListAPI({ keyword: keyword.value, ...pageParams })
  // 分页数据增加
  searchList.value.push(...res.result.list)
  if (pageParams.page < res.result.list.length) {
    // 页码累加
    pageParams.page++
  } else {
    finish.value = true
  }
}

// 触底加载
const onScrollToLower = () => {
  console.log(123)
}

// 回到首页

const goToHome = () => {
  uni.navigateBack()
}

onLoad(() => {
  getHistorySearchListData()
})
</script>

<template>
  <scroll-view class="viewport" scroll-y @scrolltolower="getSearchListData">
    <view class="navbar" :style="{ paddingTop: safeAreaInsets?.top + 'px' }">
      <view @tap="goToHome" class="back ftysIcon icon-xiangzuojiantou"></view>
      <!-- 搜索条 -->
      <view class="search">
        <input v-model="keyword" class="uni-input" confirm-type="search" placeholder="搜索" />
        <button
          @tap="($event) => getSearchListData('tap')"
          class="search-btn"
          hover-class="button-hover"
        >
          搜索
        </button>
      </view>
    </view>
    <view v-if="searchList.length === 0" class="history">
      <view class="title">
        <view class="text">历史搜索</view>
        <view @tap="myHistorySearchList = []" class="ftysIcon icon-shanchu"></view>
      </view>
      <view class="content">
        <view
          @tap="($event) => getSearchListData('tap', item)"
          class="item"
          :key="index"
          v-for="(item, index) in myHistorySearchList"
          >{{ item }}
        </view>
      </view>
    </view>
    <view v-if="searchList.length === 0" class="history">
      <view class="title">
        <view class="text">搜索发现</view>
        <view @tap="getHistorySearchListData" class="ftysIcon icon-shuaxin"></view>
      </view>
      <view class="content">
        <view
          @tap="($event) => getSearchListData('tap', item)"
          class="item"
          :key="index"
          v-for="(item, index) in searchDiscoverList"
          >{{ item }}
        </view>
      </view>
    </view>
    <view class="search-list" v-else>
      <view class="order">
        <view>默认</view>
        <view>单价</view>
      </view>
      <view class="list-container">
        <view class="item" v-for="item in searchList" :key="item.goodsId">
          <image :src="item.images[0]" />
          <view class="info">
            <view class="title">{{ item.name }}</view>
            <view class="price">￥{{ item.price }}</view>
          </view>
          <view class="right">
            <view class="ftysIcon icon-shoucang"></view>
            <view class="ftysIcon icon-a-jiagou2x"></view>
          </view>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
  background-color: #f7f7f8;
}

.viewport {
  height: 100%;
}

/* 自定义导航条 */
.navbar {
  background-color: #ff6840;
  background-size: cover;
  position: relative;
  display: flex;
  align-items: center;
  padding-top: 20px;
  width: 100%;

  .back {
    color: #fff;
    width: 60rpx;
    text-align: center;
  }

  .logo {
    display: flex;
    align-items: center;
    height: 64rpx;
    padding-left: 30rpx;
    padding-top: 20rpx;

    .logo-image {
      width: 166rpx;
      height: 39rpx;
    }

    .logo-text {
      flex: 1;
      line-height: 28rpx;
      color: #fff;
      margin: 2rpx 0 0 20rpx;
      padding-left: 20rpx;
      border-left: 1rpx solid #fff;
      font-size: 26rpx;
    }
  }

  .search {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10rpx 0 26rpx;
    height: 64rpx;
    margin: 16rpx 20rpx;
    color: #fff;
    font-size: 28rpx;
    border-radius: 32rpx;
    background-color: rgba(255, 255, 255, 0.5);

    .search-btn {
      color: #fff;
      border-radius: 30rpx;
      height: 54rpx;
      line-height: 54rpx;
      background: linear-gradient(90deg, rgba(255, 112, 64, 1) 0%, rgba(255, 80, 64, 1) 100%);
      font-size: 26rpx;
      font-weight: 400;
      margin: 0;
    }
  }

  .icon-search {
    &::before {
      margin-right: 10rpx;
    }
  }

  .icon-scan {
    font-size: 30rpx;
    padding: 15rpx;
  }

  .recommand-list {
    display: flex;
    justify-content: space-around;
    margin-bottom: 12rpx;

    .recommand-item {
      width: 100rpx;
      height: 50rpx;
      line-height: 50rpx;
      text-align: center;
      border-radius: 26rpx;
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
    }
  }
}

.history {
  margin: 20rpx 20rpx 0;

  .title {
    display: flex;
    justify-content: space-between;
    font-size: 30rpx;
    font-weight: 400;
    color: #999999;
  }

  .content {
    .item {
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
    }
  }
}

.search-list {
  margin: 20rpx 20rpx 0;

  .order {
    display: flex;
  }

  .list-container {
    .item {
      display: flex;
      border-bottom: 1px solid #eee2e2;
      margin-top: 30rpx;

      image {
        height: 200rpx;
        width: 200rpx;
      }

      .info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 90%;

        .title {
        }

        .price {
          margin-top: 30rpx;
          color: #ff5040;
        }
      }

      .right {
        display: flex;
        flex-direction: column;
        flex: 1;
        justify-content: space-around;

        .shoucang {
          height: 50%;
        }

        .jiagou {
          flex: 1;
        }
      }
    }
  }
}
</style>
