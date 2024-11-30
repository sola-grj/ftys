<script setup lang="ts">
import { getUnShipCustomerAPI, type UnShipCustomerItem } from '@/services/order'
import type { PageParams } from '@/types/global'
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
  keyword: string
  changeUnShipDetailStatus: (data: UnShipCustomerItem) => void
}>()
const debounce = (func: () => {}, wait = 500) => {
  // 定义定时器变量
  let timeout = null
  // 清除定时器
  if (timeout !== null) clearTimeout(timeout)
  //设置定时器
  timeout = setTimeout(() => {
    typeof func === 'function' && func()
  }, wait)
}
// watchEffect(() => {
//   const k = props.keyword
//   unShipCustomerPageParams.page = 1
//   isUnShipCustomerFinish.value = false
//   unShipCustomerList.value = []
//   getUnShipListData()
// })
const unShipCustomerPageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}

// 推荐分页参数
const pageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
const isUnShipCustomerFinish = ref(false)

const unShipCustomerList = ref<UnShipCustomerItem[]>([])
const getUnShipListData = async () => {
  // 退出判断
  if (isUnShipCustomerFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了~' })
  }
  const res = await getUnShipCustomerAPI({ account: props.keyword, ...unShipCustomerPageParams })
  unShipCustomerList.value.push(...res.result.list)
  // suggestList.value.push(...mockList)
  if (unShipCustomerPageParams.page < Math.ceil(res.result.total / 10)) {
    // 页码累加
    unShipCustomerPageParams.page++
  } else {
    isUnShipCustomerFinish.value = true
  }
}
onMounted(() => {
  getUnShipListData()
})
let timer: any = null
watch(
  () => props.keyword,
  (newValue, oldValue) => {
    timer && clearTimeout(timer)
    timer = setTimeout(() => {
      console.log('workOrder变化了', newValue, oldValue)
      unShipCustomerPageParams.page = 1
      isUnShipCustomerFinish.value = false
      unShipCustomerList.value = []
      getUnShipListData()
    }, 500)
  },
  { immediate: false, deep: true },
)
</script>

<template>
  <scroll-view @scrolltolower="getUnShipListData" class="viewport" scroll-y enable-back-to-top>
    <view class="container">
      <view
        v-for="item in unShipCustomerList"
        :key="item.userId"
        class="item"
        @tap="($event) => changeUnShipDetailStatus(item)"
      >
        <view class="top">
          <view class="customer-name">
            <view class="text">{{ item.username }}</view>
            <view class="num">{{ item.orderCount }}</view>
          </view>
          <view class="more">查看更多</view>
        </view>
        <view class="bottom">
          <view class="b-item">
            <view class="label">区域</view>
            <view class="value">{{ item.shippingArea }}</view>
          </view>
          <view class="b-item">
            <view class="label">地址</view>
            <view class="value">{{ item.shippingAddr }}</view>
          </view>
          <view class="b-item">
            <view class="label">电话</view>
            <view class="value">{{ item.mobile }}</view>
          </view>
        </view>
      </view>
      <view v-if="unShipCustomerList.length === 0" class="bg">
        <image
          src="https://img.js.design/assets/img/66909fda4fc21e83fb682df4.png#52a35c0ee65bdb8ba63bcefcce2ce6e6"
          mode="aspectFit"
        />
        <text>暂无内容</text>
      </view>
    </view>
  </scroll-view>
</template>

<style lang="scss">
.viewport {
  // height: 100%;
  // overflow: hidden;

  .container {
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    overflow-y: scroll;
    padding: 20rpx;

    .bg {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      color: rgba(175, 177, 178, 1);

      image {
        height: 500rpx;
        width: 500rpx;
      }
    }

    .item {
      display: flex;
      flex-direction: column;
      width: 100%;
      padding: 0 30rpx;
      font-size: 28rpx;
      border-bottom: 1px solid rgba(175, 176, 178, 1);
      margin-top: 20rpx;

      .top {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30rpx;

        .customer-name {
          display: flex;

          .num {
            font-size: 20rpx;
            width: 44rpx;
            height: 44rpx;
            margin-left: 20rpx;
            line-height: 40rpx;
            text-align: center;
            background-image: url('@/static/images/number.png');
            background-size: 100%;
          }
        }

        .more {
          color: rgba(175, 176, 178, 1);
        }
      }

      .bottom {
        .b-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20rpx;

          .label {
            color: rgba(175, 176, 178, 1);
          }
        }
      }
    }
  }
}
</style>
