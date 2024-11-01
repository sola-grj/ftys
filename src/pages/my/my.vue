<script setup lang="ts">
import { useGuessList } from '@/composables'
import { type ShipedOrderItem, type UnShipCustomerItem } from '@/services/order'
import { useMemberStore } from '@/stores'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import unshipcustomer from './components/unshipcustomer.vue'
import unshipcustomerorders from './components/unshipcustomerorders.vue'
import completeorder from './components/completeorder.vue'
import completeorderdetail from './components/completeorderdetail.vue'
import { getMyCouponListAPI } from '@/services/coupon'
import { getFullPerformanceAPI, getUserMoneyAPI } from '@/services/my'

// 获取会员信息
const memberStore = useMemberStore()
const pay_way = memberStore.profile?.userinfo.pay_way
const money = ref('')
const creditMoney = ref('')

const currentUnshipCustomer = ref<UnShipCustomerItem>({} as UnShipCustomerItem)
const isUnShipDetail = ref(false)
const changeUnShipDetailStatus = (data: UnShipCustomerItem) => {
  isUnShipDetail.value = !isUnShipDetail.value
  currentUnshipCustomer.value = data
}
const currentCompleteOrder = ref<ShipedOrderItem>({} as ShipedOrderItem)
const changeCompleteDetailStatus = (data: ShipedOrderItem) => {
  isCompleteDetail.value = !isCompleteDetail.value
  currentCompleteOrder.value = data
}
const isCompleteDetail = ref(false)

const activeIndex = ref('1')
const onChangeIndex = (val: string) => {
  activeIndex.value = val
}
// 获取优惠券总数
const couponNum = ref('')
const getCouponNum = async () => {
  const res = await getMyCouponListAPI()
  couponNum.value = Math.ceil(res.result.total / 10)
}
// 查看当前账号是主账号还是子账号 1:主账号 2:子账号
let user_role = memberStore.profile?.userinfo.user_role
// 用户type_id
/**  1:业务员 2:司机 3:生鲜 4:干货 5:生鲜&干货
 *  type_id 1 最高权限
    type_id 2 只展示 我的 页面
    type_id 3 4 5 && user_role === 2  客户 客户才有主账号 子账号
 */
const type_id = memberStore.profile?.userinfo.type_id

// 子账号是否展示欠款信息 1 0
let credit_price = memberStore.profile?.userinfo.credit_price
console.log('memberStore====', memberStore)

// user_role = '2'
// credit_price = '0'

// 三种用户角色
// 我的页面判断用户权限
onShow(() => {
  getMoney()
  // 司机角色，不显示底部tabbar  	1:业务员 2:司机 3:生鲜 4:干货 5:生鲜&干货
  if (type_id === 2) {
    uni.hideTabBar({
      animation: true,
    })
  } else {
    uni.showTabBar({
      animation: true,
    })
  }
  // 子账号 查看 欠款权限
  if (user_role === '2' && credit_price === '0') {
    CouponTypes.value = CouponTypes.value.filter((item) => item.name !== '欠款')
  }
})

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
const { top, height } = uni.getMenuButtonBoundingClientRect()
// 订单选项
const orderTypes = ref([
  { type: 1, text: '待付款', icon: 'icon-daifukuan', count: '' },
  { type: 2, text: '待发货', icon: 'icon-31daifahuo', count: '' },
  { type: 3, text: '待收货', icon: 'icon-daishouhuo', count: '' },
  { type: 4, text: '退换/售后', icon: 'icon-shouhou', count: '' },
])
// 优惠券、欠款、余额
const CouponTypes = ref([
  { name: '优惠券', data: couponNum.value || '0', desc: '下单立省' },
  {
    name: '欠款',
    data: creditMoney.value || '暂无欠款',
    desc: '当前欠款',
  },
  { name: '账户余额', data: money.value || '0.00', desc: '在线充值' },
])
// 客户常用工具
let CustomerToolTypes: any = []
let CustomerMainToolTypes = [
  { type: 1, name: '子账号', icon: 'icon-touxiang' },
  { type: 2, name: '我的报表', icon: 'icon-baobiao' },
  { type: 3, name: '导出对账单', icon: 'icon-shujuguanli-daohang-daorushuju' },
  { type: 4, name: '新品需求', icon: 'icon-xinpin' },
  { type: 5, name: '意见反馈', icon: 'icon-yijianfankui' },
  { type: 6, name: '在线客服', icon: 'icon-kefu' },
]
let CustomerSubToolTypes = [
  { type: 3, name: '导出对账单', icon: 'icon-shujuguanli-daohang-daorushuju' },
  { type: 4, name: '新品需求', icon: 'icon-xinpin' },
  { type: 5, name: '意见反馈', icon: 'icon-yijianfankui' },
  { type: 6, name: '在线客服', icon: 'icon-kefu' },
]
if (user_role?.toString() === '1') {
  CustomerToolTypes = CustomerMainToolTypes
}
if (user_role?.toString() === '2') {
  CustomerToolTypes = CustomerSubToolTypes
}

// 业务员常用工具
const SalesmanToolTypes = [
  { type: 1, name: '我的商户', icon: 'icon-wodeshanghu', userRole: user_role },
  { type: 2, name: '客户账款', icon: 'icon-shouzhangben', userRole: user_role },
  { type: 3, name: '渠道订单', icon: 'icon-dingwei1', userRole: user_role },
  { type: 4, name: '下单情况', icon: 'icon-xiadanqingkuang', userRole: user_role },
  { type: 5, name: '意见反馈', icon: 'icon-yijianfankui', userRole: user_role },
  { type: 6, name: '在线客服', icon: 'icon-kefu', userRole: user_role },
]
// 最终展示的常用工具
let showToolTypes: any = []
if (type_id?.toString() === '3' || type_id?.toString() === '4' || type_id?.toString() === '5') {
  showToolTypes = CustomerToolTypes
} else if (type_id?.toString() === '1') {
  showToolTypes = SalesmanToolTypes
} else {
  showToolTypes = []
}
// 帮助中心
const HelpCenterTypes = [
  { type: 1, name: '售后规则', icon: 'icon-shouhou' },
  { type: 2, name: '服务条款', icon: 'icon-fuwutiaokuan' },
  { type: 3, name: '关于我们', icon: 'icon-guanyuwomen' },
]
const monthData = ref([
  { value: 1, text: '01月' },
  { value: 2, text: '02月' },
  { value: 3, text: '03月' },
  { value: 4, text: '04月' },
  { value: 5, text: '05月' },
  { value: 6, text: '06月' },
  { value: 7, text: '07月' },
  { value: 8, text: '08月' },
  { value: 9, text: '09月' },
  { value: 10, text: '10月' },
  { value: 11, text: '11月' },
  { value: 12, text: '12月' },
])
const currentMonth = ref('')
const now = new Date()
const month = (now.getMonth() + 1).toString().padStart(2, '0')
currentMonth.value = month + '月'
const { guessRef, onScrollToLower } = useGuessList()
const profitLineData = ref({
  categories: [] as string[],
  series: [
    {
      name: '业绩',
      data: [] as number[],
    },
  ],
})
// 图表相关
const opts = {
  color: [
    '#1890FF',
    '#91CB74',
    '#FAC858',
    '#EE6666',
    '#73C0DE',
    '#3CA272',
    '#FC8452',
    '#9A60B4',
    '#ea7ccc',
  ],
  padding: [15, 10, 0, 15],
  dataLabel: false, //数据点上的文本显示
  dataPointShape: false, //是否显示数据点的图形标识
  enableScroll: false,
  legend: {},
  xAxis: {
    disableGrid: true, //不绘制网格
    labelCount: 5, //数据点文字（刻度点）单屏幕限制显示的数量
    fontSize: 10,
    rotateLabel: true,
    marginTop: 5,
    // rotateAngle: 10,
    // rotateLabel: true,//【旋转】数据点（刻度点）文字
    // itemCount: 5,//单屏数据密度即图表可视区域内显示的X轴数据点数量，仅在启用enableScroll时有效
    // fontColor: "#999"
  },
  yAxis: {
    gridType: 'dash',
    dashLength: 2,
  },
  extra: {
    line: {
      type: 'curve',
      width: 2,
      activeType: 'hollow',
    },
  },
}

const getFullPerformanceData = async (month: string) => {
  profitLineData.value.categories = []
  profitLineData.value.series[0].data = []
  const res = await getFullPerformanceAPI({
    month: monthData.value.filter((item) => item.text === month)[0].value.toString(),
  })
  res.result.picData.profit.forEach((item) => {
    profitLineData.value.categories.push(item.date)
    profitLineData.value.series[0].data.push(parseInt(item.value))
  })
}

// 跳转
const onJump = (data: any) => {
  switch (data.name) {
    case '优惠券':
      uni.navigateTo({ url: '/PagesOrder/coupon/coupon?from=my' })
      break
    case '欠款':
      uni.navigateTo({ url: '/pagesMember/mydebt/mydebt' })
      break
    case '账户余额':
      uni.navigateTo({ url: '/pagesMember/recharge/recharge' })
      break
    case '子账号':
      uni.navigateTo({ url: '/pagesMember/subaccount/subaccount' })
      break
    case '我的报表':
      uni.navigateTo({ url: '/pagesMember/reports/reports' })
      break
    case '导出对账单':
      uni.navigateTo({ url: '/pagesMember/statement/statement' })
      break
    case '新品需求':
      uni.navigateTo({ url: '/pagesMember/newproductdemand/newproductdemand' })
      break
    case '意见反馈':
      uni.navigateTo({ url: '/pagesMember/feedback/feedback' })
      break
    case '在线客服':
      uni.navigateTo({ url: '/pagesMember/customerservice/customerservice' })
      break
    case '我的商户':
      uni.navigateTo({ url: '/pagesMember/mycustomer/mycustomer' })
      break
    case '客户账款':
      uni.navigateTo({ url: '/pagesMember/debtSituation/debtSituation' })
      break
    case '渠道订单':
      uni.navigateTo({ url: '/PagesOrder/channelorders/channelorders' })
      break
    case '下单情况':
      uni.navigateTo({ url: '/pagesMember/orderstatus/orderstatus' })
      break
    case '售后规则':
      uni.navigateTo({ url: '/pagesMember/salerules/salerules' })
      break
    case '服务条款':
      uni.navigateTo({ url: '/pagesMember/servicerules/servicerules' })
      break
    case '关于我们':
      uni.navigateTo({ url: '/pagesMember/aboutus/aboutus' })
      break
    case '业绩查看':
      uni.navigateTo({ url: '/pagesMember/performance/performance' })
      break
    default:
      break
  }
}
// 司机相关
const keyword = ref('')
const onChangeAccount = () => {
  uni.navigateTo({ url: '/pagesMember/changeaccount/changeaccount' })
}
const getMoney = async () => {
  const res = await getUserMoneyAPI()
  orderTypes.value[0].count = res.result.unpaidCount
  orderTypes.value[1].count = res.result.unshippedCount
  orderTypes.value[2].count = res.result.unreceivedCount
  orderTypes.value[3].count = res.result.afterSaleCount
  money.value = res.result.money
  creditMoney.value = res.result.credit_money
  CouponTypes.value[0].data = res.result.couponsCount || '暂无优惠券'
  CouponTypes.value[1].data = res.result.credit_money || '暂无欠款'
  CouponTypes.value[2].data = res.result.money || '0.00'
}
onLoad(() => {
  getCouponNum()
  getFullPerformanceData(currentMonth.value)
})
</script>

<template>
  <view class="viewport" scroll-y enable-back-to-top>
    <!-- 个人资料 -->
    <view class="profile" :style="{ paddingTop: height + top + 'px' }">
      <!-- 情况1：已登录 -->
      <view class="overview" v-if="memberStore.profile">
        <navigator url="/pagesMember/profile/profile" hover-class="none">
          <image
            class="avatar"
            mode="aspectFill"
            :src="memberStore.profile.userinfo.avatar"
          ></image>
        </navigator>
        <view class="meta" @tap="onChangeAccount">
          <view class="nickname">
            {{ memberStore.profile.userinfo.username }}
            <text class="ftysIcon icon-qiehuanzhanghao">切换账号</text>
          </view>
          <navigator class="extra" hover-class="none">
            <text class="update">{{ memberStore.profile.userinfo.mobile }}</text>
          </navigator>
        </view>
      </view>
      <!-- 情况2：未登录 -->
      <view class="overview" v-else>
        <navigator url="/PagesOrder/login/login" hover-class="none">
          <image
            class="avatar gray"
            mode="aspectFill"
            src="http://yjy-xiaotuxian-dev.oss-cn-beijing.aliyuncs.com/picture/2021-04-06/db628d42-88a7-46e7-abb8-659448c33081.png"
          >
          </image>
        </navigator>
        <view class="meta">
          <navigator url="/PagesOrder/login/login" hover-class="none" class="nickname">
            未登录
          </navigator>
          <view class="extra">
            <text class="tips">点击登录账号</text>
          </view>
        </view>
      </view>
      <navigator class="settings" url="/pagesMember/settings/settings" hover-class="none">
        <text class="ftysIcon icon-shezhi"></text>
        <!-- <text class="ftysIcon icon-xiaoxi1"></text> -->
      </navigator>
    </view>
    <view class="container" v-if="type_id !== 2">
      <!-- 我的订单 -->
      <view class="orders">
        <view class="title">
          我的订单
          <navigator class="navigator" url="/PagesOrder/list/list?type=0" hover-class="none">
            查看全部订单<text class="icon-right"></text>
          </navigator>
        </view>
        <view class="section">
          <!-- 订单 -->
          <navigator
            v-for="item in orderTypes"
            :key="item.type"
            :url="`/PagesOrder/list/list?type=${item.type}`"
            class="navigator"
            hover-class="none"
          >
            <uni-badge
              class="uni-badge-left-margin"
              :text="item.count"
              absolute="rightTop"
              size="small"
            >
              <text :class="`ftysIcon ${item.icon}`"></text>
            </uni-badge>
            <text class="text">{{ item.text }}</text>
          </navigator>
        </view>
      </view>
      <!-- 优惠券、欠款、账户余额 -->
      <view
        v-if="
          type_id?.toString() === '3' || type_id?.toString() === '4' || type_id?.toString() === '5'
        "
        class="coupons"
      >
        <view class="coupons-item">
          <!-- 订单 -->
          <navigator
            @tap="($event) => onJump(item)"
            v-for="item in CouponTypes"
            :key="item.name"
            class="navigator"
            hover-class="none"
          >
            <view
              class="data"
              :class="item.name === '欠款' || item.name === '账户余额' ? 'red' : ''"
              >{{ item.data
              }}{{ item.name === '欠款' || item.name === '账户余额' ? '元' : '' }}</view
            >
            <view class="name">{{ item.name }}</view>
            <view class="desc">{{ item.desc }}</view>
          </navigator>
        </view>
      </view>
      <!-- 常用工具 -->
      <view class="tools" v-if="showToolTypes.length > 0">
        <view class="title"> 常用工具 </view>
        <view
          class="tool-item"
          @tap="($event) => onJump(item)"
          v-for="item in showToolTypes"
          :key="item.type"
        >
          <navigator :class="`ftysIcon ${item.icon}`" class="navigator" hover-class="none">
            <text class="text">{{ item.name }}</text>
          </navigator>
        </view>
      </view>
      <!-- 帮助中心 -->
      <view
        class="help-center"
        v-if="
          type_id?.toString() === '3' || type_id?.toString() === '4' || type_id?.toString() === '5'
        "
      >
        <view class="title"> 帮助中心 </view>
        <view
          class="help-center-item"
          @tap="($event) => onJump(item)"
          v-for="item in HelpCenterTypes"
          :key="item.type"
        >
          <view :class="`ftysIcon ${item.icon}`" class="navigator" hover-class="none">
            <text class="text">{{ item.name }}</text>
          </view>
        </view>
      </view>
      <!-- 业务员图表 -->
      <view v-if="type_id?.toString() === '1'" class="charts-box">
        <view class="title" @tap="($event) => onJump({ name: '业绩查看' })">
          <text class="left">30天业绩变化（发货）</text>
          <text class="right">更多</text>
        </view>
        <qiun-data-charts type="line" :dataLabel="false" :opts="opts" :chartData="profitLineData" />
      </view>
    </view>
    <view v-else class="driver-container">
      <view class="login-container">
        <view class="login-type">
          <text
            v-if="isUnShipDetail || isCompleteDetail"
            @tap="activeIndex === '1' ? (isUnShipDetail = false) : (isCompleteDetail = false)"
            class="ftysIcon icon-xiangzuojiantou"
          />
          <view
            @tap="($event) => onChangeIndex('1')"
            class="pwd-btn"
            :class="activeIndex === '1' ? 'checked' : ''"
          >
            待发货客户
          </view>
          <view
            @tap="($event) => onChangeIndex('2')"
            class="code-btn"
            :class="activeIndex === '2' ? 'checked' : ''"
          >
            已完成订单
          </view>
        </view>
      </view>
      <view class="search">
        <uni-easyinput
          placeholder="请输入客户名称/手机号"
          class="search"
          prefixIcon="search"
          v-model="keyword"
        >
        </uni-easyinput>
      </view>
      <view v-if="activeIndex === '1' && isUnShipDetail === false" class="comp-container">
        <unshipcustomer :keyword="keyword" :changeUnShipDetailStatus="changeUnShipDetailStatus" />
      </view>
      <view v-else-if="activeIndex === '1' && isUnShipDetail === true" class="comp-container">
        <unshipcustomerorders :keyword="keyword" :currentUnshipCustomer="currentUnshipCustomer" />
      </view>
      <view v-else-if="activeIndex === '2' && isCompleteDetail === false" class="comp-container">
        <completeorder
          :keyword="keyword"
          :changeCompleteDetailStatus="changeCompleteDetailStatus"
        />
      </view>
      <view v-else class="comp-container">
        <completeorderdetail :keyword="keyword" :currentCompleteOrder="currentCompleteOrder" />
      </view>
    </view>
  </view>
</template>

<style lang="scss">
page {
  height: 100%;
  // overflow: hidden;
  background-color: #f7f7f8;
}

::v-deep .uni-steps {
  .uni-steps__column {
    .uni-steps__column-text-container {
      .uni-steps__column-text:last-child {
        padding-bottom: 80rpx;
      }
    }
  }
}

.viewport {
  height: 100%;
}

.container {
  height: calc(100vh - 200rpx);
  overflow: scroll;
}

.driver-container {
  height: 100%;
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;

  .login-container {
    position: relative;
    height: 140rpx;
    display: flex;
    justify-content: center;
    align-items: center;

    .login-type {
      display: flex;
      height: 80rpx;
      width: 500rpx;
      background: #f2f4f7;
      border-radius: 50rpx;

      .icon-xiangzuojiantou {
        position: absolute;
        left: 50rpx;
        top: 50%;
        transform: translateY(-50%);
      }

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

  .comp-container {
    height: 100%;
  }

  .search {
    .uni-easyinput {
      width: 90%;
      margin: auto;

      .uni-easyinput__content {
        border-color: rgba(255, 80, 64, 1) !important;
        border-radius: 40rpx !important;
        height: 70rpx;
      }
    }
  }
}

/* 用户信息 */
.profile {
  height: 200rpx;
  margin-top: 20rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;

  // background-color: #cfdcfa;

  .overview {
    display: flex;
    min-height: 120rpx;
    padding: 0 36rpx;

    .meta {
      height: 100%;
    }

    // color: #fff;
  }

  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background-color: #eee;
  }

  .gray {
    filter: grayscale(100%);
  }

  .meta {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    margin-left: 20rpx;
  }

  .nickname {
    margin-bottom: 16rpx;
    font-size: 36rpx;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    .icon-qiehuanzhanghao {
      font-size: 26rpx;
      color: #666666;
    }
  }

  .extra {
    display: flex;
    font-size: 20rpx;
  }

  .tips {
    font-size: 22rpx;
  }

  .update {
    padding: 3rpx 10rpx 1rpx;
    background-color: rgba(200, 217, 250, 1);
    border: 1rpx solid rgba(255, 255, 255, 0.8);
    margin-right: 10rpx;
    border-radius: 30rpx;
  }

  .settings {
    margin-right: 40rpx;
    font-size: 60rpx;
    // color: #fff;

    .icon-xiaoxi1 {
      margin-left: 30rpx;
    }
  }
}

/* 我的订单 */
.orders {
  position: relative;
  z-index: 99;
  padding: 30rpx;
  margin: 50rpx 20rpx 0;
  background-color: #fff;
  border-radius: 10rpx;
  box-shadow: 0 4rpx 6rpx rgba(240, 240, 240, 0.6);

  .title {
    height: 40rpx;
    line-height: 40rpx;
    // font-size: 28rpx;
    color: #1e1e1e;
    font-weight: bold;

    .navigator {
      font-size: 24rpx;
      color: #939393;
      float: right;

      .ftysIcon {
        font-size: 35rpx;
      }
    }
  }

  .section {
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 40rpx 20rpx 10rpx;

    .ftysIcon {
      font-size: 60rpx;
    }

    // .uni-badge-left-margin {
    //   width: 100%;
    // }

    // :deep(.uni-badge--x) {
    //   display: flex;
    //   justify-content: space-around;
    // }

    .navigator,
    .contact {
      text-align: center;
      font-size: 24rpx;
      color: #333;

      &::before {
        display: block;
        font-size: 60rpx;
        color: #ff9545;
      }

      .text {
        margin-top: 10rpx;
      }
    }

    .navigator {
      display: flex;
      flex-direction: column;
      align-items: center;

      .text {
        margin-top: 10rpx;
      }
    }

    .contact {
      padding: 0;
      margin: 0;
      border: 0;
      background-color: transparent;
      line-height: inherit;
    }
  }
}

.coupons {
  position: relative;
  z-index: 99;
  padding: 30rpx 0;
  margin: 50rpx 20rpx 0;
  background-color: #fff;
  border-radius: 10rpx;
  box-shadow: 0 4rpx 6rpx rgba(240, 240, 240, 0.6);

  .title {
    font-weight: bold;
    height: 60rpx;
  }

  .coupons-item {
    width: 100%;
    display: flex;
    justify-content: space-around;
    padding: 20rpx 20rpx 10rpx;

    .navigator {
      font-size: 24rpx;
      float: right;
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;

      .data {
        font-size: 34rpx;
        white-space: nowrap;
      }

      .red {
        color: rgba(255, 80, 64, 1);
      }

      .name {
        font-size: 26rpx;
        margin-top: 10rpx;
      }

      .desc {
        margin-top: 6rpx;
        color: #939393;
      }
    }
  }
}

.tools {
  position: relative;
  z-index: 99;
  padding: 30rpx;
  margin: 50rpx 20rpx 0;
  background-color: #fff;
  border-radius: 10rpx;
  box-shadow: 0 4rpx 6rpx rgba(240, 240, 240, 0.6);

  .title {
    font-weight: bold;
    height: 60rpx;
  }

  .tool-item {
    display: inline-block;
    width: 25%;
    height: 100rpx;
    margin-top: 20rpx;

    .navigator {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 50rpx;

      .text {
        font-size: 24rpx;
        margin-top: 10rpx;
      }
    }
  }
}

.help-center {
  position: relative;
  z-index: 99;
  padding: 30rpx;
  margin: 50rpx 20rpx 0;
  background-color: #fff;
  border-radius: 10rpx;
  box-shadow: 0 4rpx 6rpx rgba(240, 240, 240, 0.6);

  .title {
    font-weight: bold;
    height: 60rpx;
  }

  .help-center-item {
    display: inline-block;
    width: 25%;
    height: 100rpx;
    margin-top: 20rpx;

    .navigator {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 50rpx;

      .text {
        font-size: 24rpx;
        margin-top: 10rpx;
      }
    }
  }
}

/* 猜你喜欢 */
.guess {
  background-color: #f7f7f8;
  margin-top: 20rpx;
}

.charts-box {
  height: 300px;
  position: relative;
  z-index: 99;
  padding: 30rpx;
  margin: 50rpx 20rpx 0;
  background-color: #fff;
  border-radius: 10rpx;
  box-shadow: 0 4rpx 6rpx rgba(240, 240, 240, 0.6);

  .title {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    height: 60rpx;

    .left {
    }

    .right {
      font-size: 28rpx;
      font-weight: 500;
      color: #666666;
    }
  }
}
</style>
