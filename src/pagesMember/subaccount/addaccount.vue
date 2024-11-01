<script setup lang="ts">
import { getMyCouponListAPI, getCouponListAPI, receiveCouponAPI } from '@/services/coupon'
import {
  addSuggestAPI,
  getMySuggestAPI,
  modifySubUserAPI,
  registerSubUserAPI,
  type SubAccountItem,
} from '@/services/my'
import type { CouponItem, MyCouponItem, WholeCouponItem } from '@/types/coupon'
import type { PageParams } from '@/types/global'
import type { MySuggestItem } from '@/types/my'
import { onLoad, onUnload } from '@dcloudio/uni-app'
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
  sub_account_name: '',
  username: '',
  mobile: '',
  pwd: '',
  accountstatus: true,
  isShowPrice: true,
  isShowDebtAmount: true,
})

const query = defineProps<{
  type: string
}>()

// 注册定义校验规则
const rules: UniHelper.UniFormsRules = {
  sub_account_name: {
    rules: [{ required: true, errorMessage: '请输入子账号名称' }],
  },
  username: {
    rules: [{ required: true, errorMessage: '请输入联系人' }],
  },
  mobile: {
    rules: [
      { required: true, errorMessage: '请输入手机号码' },
      { pattern: /^1[3-9]\d{9}$/, errorMessage: '手机号格式不正确' },
    ],
  },
  pwd: {
    rules: [{ required: query.type === 'add' ? true : false, errorMessage: '请输入密码' }],
  },
}
const currentAccount = ref<SubAccountItem>({} as SubAccountItem)
onUnload(() => {
  uni.$off('editsubaccount')
})
onLoad(() => {
  uni.$on('editsubaccount', (data) => {
    currentAccount.value = data.currentAccount
    form.value.sub_account_name = currentAccount.value.sub_account_name
    form.value.username = currentAccount.value.username
    form.value.mobile = currentAccount.value.mobile
    form.value.accountstatus = Boolean(Number(currentAccount.value.sub_account_level.slice(0, 1)))
    form.value.isShowPrice = Boolean(Number(currentAccount.value.sub_account_level.slice(1, 2)))
    form.value.isShowDebtAmount = Boolean(
      Number(currentAccount.value.sub_account_level.slice(2, 3)),
    )
  })
})
const goback = () => {
  uni.navigateBack()
}
const password = ref()
const iconClick = () => {
  console.log(password.value)
  if (password.value.type === 'password') {
    password.value.type = 'text'
  } else {
    password.value.type = 'password'
  }
}

const switchAccountStatusChange = (e: any) => {
  form.value.accountstatus = e.detail.value
}
const switchGoodsPriceChange = (e: any) => {
  form.value.isShowPrice = e.detail.value
}
const switchDebtMoneyChange = (e: any) => {
  form.value.isShowDebtAmount = e.detail.value
}
const onSave = async () => {
  let res
  await formRef.value?.validate?.()
  const sub_account_level = `${Number(form.value.accountstatus)}${Number(
    form.value.isShowPrice,
  )}${Number(form.value.isShowDebtAmount)}`
  if (query.type === 'add') {
    res = await registerSubUserAPI({
      mobile: form.value.mobile,
      username: form.value.username,
      sub_account_name: form.value.sub_account_name,
      password: form.value.pwd,
      sub_account_level,
    })
  } else {
    res = await modifySubUserAPI({
      userId: currentAccount.value.userId,
      mobile: form.value.mobile,
      username: form.value.username,
      sub_account_name: form.value.sub_account_name,
      password: form.value.pwd,
      sub_account_level,
    })
  }

  if (res.code.toString() === '1') {
    uni.showToast({ icon: 'success', title: '子账号保存成功' })
    setTimeout(() => {
      uni.navigateTo({ url: '/pagesMember/subaccount/subaccount' })
    }, 500)
  } else {
    uni.showToast({ icon: 'error', title: res.msg })
  }
}
</script>

<template>
  <scroll-view class="viewport" scroll-y enable-back-to-top>
    <SolaShopHeader :title="type === 'add' ? '新增子账号' : '编辑子账号'" />
    <view class="container form-content">
      <uni-forms ref="formRef" :rules="rules" :modelValue="form">
        <uni-forms-item class="form-item" name="sub_account_name">
          <text class="label">子账号名称</text>
          <input
            type="tel"
            v-model="form.sub_account_name"
            class="input"
            placeholder="请输入子账号名称"
          />
        </uni-forms-item>
        <uni-forms-item class="form-item" name="username">
          <text class="label">联系人</text>
          <input type="text" v-model="form.username" class="input" placeholder="请输入联系人" />
        </uni-forms-item>
        <uni-forms-item class="form-item" name="mobile">
          <text class="label">手机</text>
          <input type="tel" v-model="form.mobile" class="input" placeholder="请输入手机号码" />
        </uni-forms-item>
        <uni-forms-item class="form-item" name="pwd">
          <text class="label">密码</text>
          <uni-easyinput
            ref="password"
            :inputBorder="false"
            type="password"
            v-model="form.pwd"
            :clearable="false"
            placeholder="请输入密码"
          ></uni-easyinput>
        </uni-forms-item>
        <uni-forms-item class="form-item">
          <text class="label">帐号状态</text>
          <switch :checked="form.accountstatus" @change="switchAccountStatusChange" />
        </uni-forms-item>
        <uni-forms-item class="form-item">
          <text class="label">显示商品价格</text>
          <switch :checked="form.isShowPrice" @change="switchGoodsPriceChange" />
        </uni-forms-item>
        <uni-forms-item class="form-item">
          <text class="label">显示欠款金额</text>
          <switch :checked="form.isShowDebtAmount" @change="switchDebtMoneyChange" />
        </uni-forms-item>
        <view class="bottom">
          <button hover-class="button-hover" @tap="onSave">保存</button>
        </view>
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

.viewport {
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 112, 64, 1) 0%, rgba(255, 80, 64, 1) 100%);

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

        .uni-easyinput__content {
          border: none;
          text-align: right;
        }

        .input {
          flex: 1;
          text-align: right;
        }

        .uni-easyinput__placeholder-class {
          font-size: 30rpx !important;
          color: #999;
        }
      }
    }

    .uni-forms-item:nth-child(2) {
      .uni-forms-item__content {
        border-bottom: 1px solid #f2f4f7;
        padding-bottom: 20rpx;

        .uni-easyinput {
          margin-top: 10rpx;
        }
      }
    }

    .bottom {
      width: 100%;
      margin-top: 40rpx;

      button {
        width: 80%;
        color: #fff;
        border-radius: 20rpx;
        background: linear-gradient(90deg, rgba(255, 112, 77, 1) 0%, rgba(255, 95, 77, 1) 100%);
      }
    }
  }
}
</style>
