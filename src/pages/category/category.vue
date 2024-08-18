<script setup lang="ts">
import { getCategoryTopAPI } from '@/services/category'
import { getCategoryAPI, getHomeBannerAPI } from '@/services/home'
import type { CategoryTopItem } from '@/types/category'
import type { BannerItem, BasicCategoryItem } from '@/types/home'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import PageSkeleton from './components/PageSkeleton.vue'
import { useMemberStore } from '@/stores'

// 获取当前用户角色信息
const memberStore = useMemberStore()

// 查看当前账号是主账号还是子账号 1:主账号 2:子账号
let user_role = memberStore.profile?.userinfo.user_role
// 用户type_id
/**  1:业务员 2:司机 3:生鲜 4:干货 5:生鲜&干货
 *  type_id 1 最高权限
    type_id 2 只展示 我的 页面
    type_id 3 4 5 && user_role === 2  客户 客户才有主账号 子账号
 */
const type_id = memberStore.profile?.userinfo.type_id

const activeIndex = ref(0) // 0 是密码登录 1是短信
const onChangeIndex = (index: number) => {
  activeIndex.value = index
}

// 获取商品分类数据
const top1List = ref<BasicCategoryItem[]>([])
const top2List = ref<BasicCategoryItem[]>([])
const getTypeListData = async () => {
  const res = await getCategoryAPI()
  top1List.value = res.result.top1
  top2List.value = res.result.top2
  top2List.value.push({
    id: 'more',
    name: '更多',
    image: 'http://47.95.197.8/uploads/20240814/1036867403937a234c7d8565c07f114b.jpeg',
    source: 'H',
  })
}

// 获取首页参数
const query = defineProps<{
  type: string
}>()
// 获取轮播图数据
const bannerList = ref<BannerItem[]>([])
const getBannerListData = async () => {
  const res = await getHomeBannerAPI(2)
  bannerList.value = res.result
}

// 获取分类列表数据
const categoryList = ref<CategoryTopItem[]>([])
const getCategoryTopData = async () => {
  const res = await getCategoryTopAPI()
  categoryList.value = res.result
}
// 页面是否加载完成 标识
const isFinish = ref(true)
// 页面加载
onLoad(async () => {
  await Promise.all([getTypeListData()])
  isFinish.value = true
  if (query.type) {
    categoryList.value.forEach((item, index) => {
      if (item.id === query.type) {
        activeIndex.value = index
      }
    })
  }
})
const goToSearch = () => {
  uni.navigateTo({ url: '/pages/search/search' })
}
// 获取当前二级分类数据
const subCategoryList = computed(() => {
  return categoryList.value[activeIndex.value]?.children || []
})
// {
//   // 最上面大类目
//   '新鲜水果id': [
//     // 中类目
//     '富士苹果id',
//     '嘎啦苹果',
//     '黄元帅',
//   ],
//     '海鲜水产id': [
//       '大虾',
//       '螃蟹',
//       '鱼',
//     ],
//       '新鲜水果id': [
//         '富士苹果',
//         '嘎啦苹果',
//         '黄元帅',
//       ],
// }
</script>

<template>
  <view class="viewport">
    <view class="login-container">
      <view class="login-type">
        <view
          @tap="($event) => onChangeIndex(0)"
          class="pwd-btn"
          :class="activeIndex === 0 ? 'checked' : ''"
          >生鲜蔬菜
        </view>
        <view
          @tap="($event) => onChangeIndex(1)"
          class="code-btn"
          :class="activeIndex === 1 ? 'checked' : ''"
          >干货调料
        </view>
      </view>
    </view>
    <!-- 搜索框 -->
    <view @tap="goToSearch" class="search">
      <text class="ftysIcon icon-sousuo"></text>
      <input disabled />
      <button class="search-btn">搜索</button>
    </view>
    <view class="head-types">
      <view class="head-types-item" v-for="item in top1List" :key="item.id">
        <image class="icon" :src="item.image" />
        <text class="text"> {{ item.name }}</text>
      </view>
    </view>
    <!-- 分类 -->
    <view class="categories">
      <!-- 左侧：一级分类 -->
      <scroll-view class="primary" scroll-y>
        <view
          @tap="activeIndex = index"
          v-for="(item, index) in categoryList"
          :key="item.id"
          class="item"
          :class="{ active: index === activeIndex }"
        >
          <text class="name"> {{ item.name }} </text>
        </view>
      </scroll-view>
      <!-- 右侧：二级分类 -->
      <scroll-view class="secondary" scroll-y>
        <!-- 焦点图 -->
        <SolaShopSwiper class="banner" :list="bannerList" />
        <!-- 内容区域 -->
        <view class="panel" v-for="item in subCategoryList" :key="item.id">
          <view class="title">
            <text class="name">{{ item.name }}</text>
            <navigator class="more" hover-class="none">全部</navigator>
          </view>
          <view class="section">
            <navigator
              v-for="goods in item.goods"
              :key="goods.id"
              class="goods"
              hover-class="none"
              :url="`/pages/goods/goods?id=${goods.id}`"
            >
              <image class="image" :src="goods.picture"></image>
              <view class="name ellipsis">{{ goods.name }}</view>
              <view class="price">
                <text class="symbol">¥</text>
                <text class="number">{{ goods.price }}</text>
              </view>
            </navigator>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
  <!-- <PageSkeleton v-else /> -->
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
}

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

.search {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4rpx 0 26rpx;
  height: 64rpx;
  margin: 16rpx 20rpx;
  font-size: 28rpx;
  border-radius: 32rpx;
  background-color: rgba(255, 255, 255, 0.5);
  border: 1px solid #ff5040;

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

.head-types {
  display: flex;

  .head-types-item {
    flex: 1;
    width: 150rpx;
    // height: 150rpx;
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

.icon-search {
  &::before {
    margin-right: 10rpx;
  }
}

/* 分类 */
.categories {
  flex: 1;
  min-height: 400rpx;
  display: flex;
}

/* 一级分类 */
.primary {
  overflow: hidden;
  width: 180rpx;
  flex: none;
  background-color: #f6f6f6;

  .item {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 96rpx;
    font-size: 26rpx;
    color: #595c63;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      left: 42rpx;
      bottom: 0;
      width: 96rpx;
      border-top: 1rpx solid #e3e4e7;
    }
  }

  .active {
    background-color: #fff;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 8rpx;
      height: 100%;
      background-color: #27ba9b;
    }
  }
}

.primary .item:last-child::after,
.primary .active::after {
  display: none;
}

/* 二级分类 */
.secondary {
  background-color: #fff;

  .carousel {
    height: 200rpx;
    margin: 0 30rpx 20rpx;
    border-radius: 4rpx;
    overflow: hidden;
  }

  .panel {
    margin: 0 30rpx 0rpx;
  }

  .title {
    height: 60rpx;
    line-height: 60rpx;
    color: #333;
    font-size: 28rpx;
    border-bottom: 1rpx solid #f7f7f8;

    .more {
      float: right;
      padding-left: 20rpx;
      font-size: 24rpx;
      color: #999;
    }
  }

  .more {
    &::after {
      font-family: 'erabbit' !important;
      content: '\e6c2';
    }
  }

  .section {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    padding: 20rpx 0;

    .goods {
      width: 150rpx;
      margin: 0rpx 30rpx 20rpx 0;

      &:nth-child(3n) {
        margin-right: 0;
      }

      image {
        width: 150rpx;
        height: 150rpx;
      }

      .name {
        padding: 5rpx;
        font-size: 22rpx;
        color: #333;
      }

      .price {
        padding: 5rpx;
        font-size: 18rpx;
        color: #cf4444;
      }

      .number {
        font-size: 24rpx;
        margin-left: 2rpx;
      }
    }
  }
}
</style>
