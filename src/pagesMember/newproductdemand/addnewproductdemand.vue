<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import { createGoodsApplyAPI } from '@/services/goods'
import { getCategoryAPI } from '@/services/home'
import { addSuggestAPI, getMySuggestAPI } from '@/services/my'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import type { PageParams } from '@/types/global'
import type { BasicCategoryItem, CategoryItem } from '@/types/home'
import type { MySuggestItem } from '@/types/my'
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const formRef = ref<UniHelper.UniFormsInstance>()
const imageList = ref([])
const imageUrlList = ref([])
const title = ref('')
const content = ref('')
// 注册表单数据
const form = ref({
  name: '',
  type: '',
  brand: '',
  specification: '',
  supplier: '',
  price: '',
  remark: '',
})
const typeDataTree = ref<any[]>([])
const fruitList = ref<BasicCategoryItem[]>([])
const dryList = ref<BasicCategoryItem[]>([])
const getCategoryData = async () => {
  const res = await getCategoryAPI()
  fruitList.value = res.result.fruitCategory
  dryList.value = res.result.dryCargoCategory
}

// 构造级联数据
const makeTypeData = () => {
  const dataTree: any = [
    {
      text: '生鲜',
      value: '1-0',
      children: [],
    },
    {
      text: '干货',
      value: '2-0',
      children: [],
    },
  ]
  fruitList.value.forEach((item, index) => {
    let data: any = {
      text: item.name,
      value: `1-${index + 1}`,
      children: [],
      id: item.id,
    }
    dataTree[0].children.push(data)
    item.childlist.forEach((j, jindex) => {
      data.children.push({
        text: j.name,
        value: `1-${index + 1}-${jindex + 1}`,
        id: j.id,
        // children: []
      })
    })
  })
  dryList.value.forEach((item, index) => {
    let data: any = {
      text: item.name,
      value: `2-${index + 1}`,
      children: [],
      id: item.id,
    }
    dataTree[1].children.push(data)
    item.childlist.forEach((j, jindex) => {
      data.children.push({
        text: j.name,
        value: `2-${index + 1}-${jindex + 1}`,
        id: j.id,
        // children: []
      })
    })
  })
  typeDataTree.value = dataTree
  console.log('dataTree', dataTree)
}

// 注册定义校验规则
const rules: UniHelper.UniFormsRules = {
  name: {
    rules: [{ required: true, errorMessage: '请描输入商品名称' }],
  },
  type: {
    rules: [{ required: true, errorMessage: '请选择商品分类' }],
  },
}
const onSave = async () => {
  await formRef?.value?.validate?.()
  await createGoodsApplyAPI({
    goods_name: form.value.name,
    goods_source: currentType.value.source,
    goods_category: currentType.value.id,
    goods_brand: form.value.brand,
    goods_specification: form.value.specification,
    goods_supplier: form.value.supplier,
    goods_price: form.value.price,
    goods_remark: form.value.remark,
  })
  uni.navigateTo({ url: '/pagesMember/newproductdemand/newproductdemand' })
}
const onSelect = (event: any) => {
  uni.uploadFile({
    url: '/common/upload', //仅为示例，非真实的接口地址
    filePath: event.tempFilePaths[0],
    name: 'file',
    success: (res) => {
      let { data } = res
      data = JSON.parse(data)
      // @ts-ignore
      imageList.value.push({
        // @ts-ignore
        url: data!.result.url,
        uuid: event.tempFiles[0].uuid,
      })
      // @ts-ignore
      imageUrlList.value.push(data!.result.url)
      // @ts-ignore
      form.value.images = data!.result.url
      console.log('event', event, data)
    },
  })
}
const onDelete = (event: any) => {
  console.log(event)
  // @ts-ignore
  imageList.value = [...imageList.value.filter((item) => item.uuid !== event.tempFile.uuid)]
}
onLoad(async () => {
  await getCategoryData()
  await makeTypeData()
})
const picker = ref()
const openPciker = () => {
  picker.value.show()
}

const closePciker = () => {
  picker.value.hide()
}
const currentType = ref<BasicCategoryItem>({} as BasicCategoryItem)
const onPickerChange = (e: any) => {
  let [one, two, three] = e.detail.value[2].value.split('-')
  one = Number(one)
  two = Number(two)
  three = Number(three)
  if (one === 1) {
    currentType.value = fruitList.value[two - 1].childlist[three - 1]
  } else {
    currentType.value = dryList.value[two - 1].childlist[three - 1]
  }
  form.value.type = currentType.value.id
  picker.value.hide()
}
const goback = () => {
  uni.navigateBack()
}
</script>

<template>
  <scroll-view class="viewport" scroll-y enable-back-to-top>
    <view class="title" :style="{ paddingTop: safeAreaInsets!.top + 'px' }">
      <text @tap="goback" class="ftysIcon icon-xiangzuojiantou"></text>
      <text @tap="open" class="text">新增供货需求</text>
    </view>
    <view class="container form-content">
      <uni-forms class="form" ref="formRef" :rules="rules" :modelValue="form">
        <uni-forms-item class="form-item" name="name">
          <text class="label">*商品名称</text>
          <input type="tel" v-model="form.name" class="input" placeholder="请描述您的内容标题" />
        </uni-forms-item>
        <uni-forms-item class="form-item" name="type">
          <text class="label">*选择分类</text>
          <view class="mypicker">
            <!-- <text>请选择分类</text> -->
            <uni-data-picker
              :clear-icon="false"
              @change="onPickerChange"
              ref="picker"
              :localdata="typeDataTree"
              placeholder="请选择分类"
              popup-title="请选择分类"
            >
            </uni-data-picker>
          </view>

          <!-- <input type="tel" v-model="title" class="input" placeholder="请描述您的内容标题" /> -->
        </uni-forms-item>
        <uni-forms-item class="form-item" name="brand">
          <text class="label">*商品品牌</text>
          <input
            type="tel"
            v-model="form.brand"
            class="input"
            placeholder="请输入您想要的商品品牌"
          />
        </uni-forms-item>
        <uni-forms-item class="form-item" name="specification">
          <text class="label">*商品规格</text>
          <input
            type="tel"
            v-model="form.specification"
            class="input"
            placeholder="请输入商品规格"
          />
        </uni-forms-item>
        <uni-forms-item class="form-item" name="supplier">
          <text class="label">*供应商</text>
          <input
            type="tel"
            v-model="form.supplier"
            class="input"
            placeholder="请输入供应商名称或者联系方式"
          />
        </uni-forms-item>
        <uni-forms-item class="form-item" name="price">
          <text class="label">*参考价格</text>
          <input type="tel" v-model="form.price" class="input" placeholder="请输入参考价格" />
        </uni-forms-item>
        <uni-forms-item class="form-item" name="remark">
          <text class="label">*商品描述</text>
          <input
            type="tel"
            v-model="form.remark"
            class="input"
            placeholder="请准确描述产品的信息"
          />
        </uni-forms-item>

        <button @tap="onSave" open-type="" class="save">保存</button>
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

// ::v-deep swiper,
// scroll-view {
//   flex: 1;
//   height: 100rpx !important;
//   overflow: hidden;
// }

::v-deep .uni-data-tree-input {
  .placeholder {
    font-size: 28rpx;
  }
}

::v-deep .uni-data-tree-dialog {
  .selected-area {
    flex: none !important;
    height: 100rpx !important;
  }
}

::v-deep .input-value-border {
  border: none !important;

  .arrow-area {
    display: none !important;
  }

  .tab-c {
    height: 100% !important;
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

    .uni-forms-item {
      .uni-forms-item__content {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #f2f4f7;
        justify-content: space-between;

        .mypciker {
          ::v-deep .input-value-border {
            border: none !important;
          }
        }

        ::v-deep .mypicker {
          display: flex !important;
          justify-content: flex-end;
          flex: 1 !important;
        }

        .input {
          flex: 1;
          text-align: right;
        }
      }
    }

    // .uni-forms-item:nth-child(2) {
    //   .uni-forms-item__content {
    //     border-bottom: 1px solid #f2f4f7;
    //     padding-bottom: 20rpx;

    //     .uni-easyinput {
    //       margin-top: 10rpx;
    //     }
    //   }
    // }

    .save {
      width: 70%;
      border-radius: 8px;
      background: linear-gradient(90deg, rgba(255, 112, 77, 1) 0%, rgba(255, 95, 77, 1) 100%);
      color: #fff;
    }
  }
}
</style>
