<script setup lang="ts">
import { OrderState } from '@/services/constants'
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import { addSuggestAPI, getMySuggestAPI } from '@/services/my'
import {
  getAfterServiceTypeAPI,
  type AfterServiceItem,
  type OrderDetailResult,
  createAfterSalesAPI,
  type AfterSaleReqItem,
} from '@/services/order'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import type { PageParams } from '@/types/global'
import type { MySuggestItem } from '@/types/my'
import type { DetailItem } from '@/types/order'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const formRef = ref<UniHelper.UniFormsInstance>()
const imageList = ref([])
const imageUrlList = ref([])
const title = ref('')
const content = ref('')

const onafterSalesTypeChange = (e: any) => {
  console.log(e.detail.value)
  // @ts-ignore
  currentType.value = afterSalesType.value[0][e.detail.value[0]]
}
const onafterSalesReasonChange = (e: any) => {
  // @ts-ignore
  currentReason.value = afterSalesReason.value[0][e.detail.value[0]]
  switch (e.detail.value[0]) {
    case 0:
      currentTypeId.value = '1'
      break
    case 1:
      currentTypeId.value = '2'
      break
    case 2:
      currentTypeId.value = '3'
      break
    case 3:
      currentTypeId.value = '4'
      break

    default:
      break
  }
}

const afterSalesType = ref([['退货退款']])
const afterSalesReason = ref([['货物变质/损坏', '多发/错发', '订单下错', '其他原因']])

const currentType = ref('')
const currentReason = ref('')
const currentTypeId = ref('1')

// 注册表单数据
const form = ref({
  title,
  content,
  images: '',
})

// 注册定义校验规则
const rules: UniHelper.UniFormsRules = {
  title: {
    rules: [{ required: true, errorMessage: '请描述您的内容标题' }],
  },
  content: {
    rules: [{ required: true, errorMessage: '请输入问题反馈' }],
  },
}
const onSave = async () => {
  let goodsList: AfterSaleReqItem[] = []
  order.value.orderDetail.forEach((item) => {
    goodsList.push({
      goodsId: item.goodsId,
      num: item.num,
      units: item.units,
      source: item.source,
      remark: item.remark,
    })
  })
  const res = await createAfterSalesAPI({
    orderId: order.value.orderId,
    afterSalesType: currentTypeId.value,
    afterSalesReason: currentReason.value,
    remark: order.value.remark,
    goodsList,
  })
  if (res.code === '1') {
    uni.navigateTo({ url: '/PagesOrder/list/list' })
  }
}
const onSelect = (event: any) => {
  uni.uploadFile({
    url: '/common/upload', //仅为示例，非真实的接口地址
    filePath: event.tempFilePaths[0],
    name: 'file',
    success: (res) => {
      uni.showToast({ icon: 'success', title: '上传成功' })
    },
  })
}
const onDelete = (event: any) => {
  console.log(event)
  // @ts-ignore
  imageList.value = [...imageList.value.filter((item) => item.uuid !== event.tempFile.uuid)]
}
const order = ref<OrderDetailResult>({} as OrderDetailResult)
onLoad(() => {
  uni.$on('applyaftersale', (data) => {
    order.value = data.order
  })
})
const addShoppingCart = async (data: DetailItem, num: number, type: string) => {
  if (num === 0) {
    // 弹窗二次确认
    uni.showModal({
      content: '是否删除',
      success: async (res) => {
        if (res.confirm) {
          // 前端页面更新
          order.value.orderDetail = order.value.orderDetail.filter(
            (item) => item.cartId !== data.cartId,
          )
        } else {
          data.num = '1'
          // data.num = data.num
        }
      },
      fail: (fail) => {
        console.log(fail)
      },
    })
  }
}
const goback = () => {
  uni.navigateBack()
}
</script>

<template>
  <scroll-view class="viewport" scroll-y enable-back-to-top>
    <view class="title" :style="{ paddingTop: safeAreaInsets!.top + 'px' }">
      <text @tap="goback" class="ftysIcon icon-xiangzuojiantou"></text>
      <text class="text">申请售后</text>
    </view>
    <view class="container form-content">
      <uni-forms class="form" ref="formRef" :rules="rules" :modelValue="form">
        <uni-forms-item class="form-item" name="title">
          <text class="label">*售后类型</text>
          <view class="value">
            <picker
              mode="multiSelector"
              :class="currentType ? '' : 'choose'"
              :range="afterSalesType"
              @change="onafterSalesTypeChange"
              >{{ currentType ? currentType : '请选择售后类型' }}
            </picker>
          </view>
        </uni-forms-item>
        <uni-forms-item class="form-item" name="content">
          <text class="label">*售后原因</text>
          <view class="value">
            <picker
              mode="multiSelector"
              :class="currentReason ? '' : 'choose'"
              :range="afterSalesReason"
              @change="onafterSalesReasonChange"
              >{{ currentReason ? currentReason : '请选择售后原因' }}</picker
            >
          </view>
        </uni-forms-item>
        <uni-forms-item class="form-item" name="images">
          <uni-file-picker
            @delete="onDelete"
            @select="onSelect"
            class="choose-img"
            limit="3"
            :title="`上传图片`"
          ></uni-file-picker>
        </uni-forms-item>
        <view class="list-container">
          <view class="item" v-for="item in order.orderDetail" :key="item.orderId">
            <image :src="item.goodsImage[0]" mode="scaleToFill" />
            <view class="info">
              <view class="infotitle">{{ item.goodsName }}</view>
              <view class="right">
                <view class="price">￥{{ item.unitPrice }}/{{ item.units }}</view>
                <uni-number-box
                  class="number-box"
                  v-model="item.num"
                  @change="($event) => addShoppingCart(item, $event, '')"
                />
              </view>
              <view class="note">
                <uni-easyinput
                  v-model="item.remark"
                  placeholder="请输入商品备注"
                  class="question"
                  type="text"
                ></uni-easyinput>
              </view>
            </view>
          </view>
          <view class="remark">
            <view class="rtitle">备注</view>
            <uni-easyinput
              v-model="order.remark"
              placeholder="建议备注前先与商家沟通确认"
              class="question"
              type="textarea"
            ></uni-easyinput>
          </view>
        </view>
        <button @tap="onSave" open-type="" class="save">提交退货申请</button>
      </uni-forms>
    </view>
  </scroll-view>
</template>

<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
  background-color: #f7f7f8;
}

::v-deep .uni-date-editor {
  display: flex;
  justify-content: flex-end;

  .uni-date-x--border {
    width: 450rpx;
    border: none !important;
  }
}

.viewport {
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 112, 64, 1) 0%, rgba(255, 80, 64, 1) 100%);

  .title {
    position: relative;
    text-align: center;
    color: #fff;
    width: 100%;
    height: 130rpx;

    .text {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: 20rpx;
    }

    .icon-xiangzuojiantou {
      position: absolute;
      left: 20rpx;
      bottom: 20rpx;
    }
  }

  .container {
    height: 100%;
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    overflow: scroll;
    padding: 30rpx;

    .list-container {
      padding: 20rpx 20rpx;
      // border-radius: 10rpx;
      background-color: #fff;

      .item {
        display: flex;
        margin-top: 10rpx;

        image {
          height: 160rpx;
          width: 160rpx;
        }

        .info {
          flex: 1;
          display: flex;
          flex-direction: column;
          width: 90%;
          padding-left: 20rpx;

          .infotitle {
            flex: 1;
          }

          .price {
            margin-top: 10rpx;
            color: #ff5040;
          }
        }

        .right {
          display: flex;
          // flex: 1;
          justify-content: space-between;
          align-items: flex-end;
          color: #ff5040;

          ::v-deep .uni-numbox {
            .uni-numbox-btns {
              padding: 0 4px;
            }

            .uni-numbox__value {
              width: 48rpx !important;
              height: 30rpx !important;
              font-size: 26rpx !important;
            }
          }

          .shoucang {
            height: 50%;
          }

          .jiagou {
            flex: 1;
          }

          .num {
            font-weight: bold;
          }
        }

        .note {
          margin-top: 10rpx;

          .uni-easyinput__content {
            height: 60rpx;
          }
        }
      }

      .remark {
        margin-top: 30rpx;
        display: flex;

        .rtitle {
          font-size: 30rpx;
          margin-right: 40rpx;
          color: rgba(50, 50, 51, 1);
        }
      }
    }

    .uni-forms-item {
      .uni-forms-item__content {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #f2f4f7;

        .label {
          width: 200rpx;
        }

        .value {
          flex: 1;
          display: flex;
          justify-content: flex-end;

          .choose {
            color: rgba(175, 176, 178, 1);
          }
        }

        .input {
          flex: 1;
          text-align: right;
        }
      }
    }

    .save {
      width: 70%;
      border-radius: 8px;
      background: linear-gradient(90deg, rgba(255, 112, 77, 1) 0%, rgba(255, 95, 77, 1) 100%);
      color: #fff;
    }
  }
}
</style>
