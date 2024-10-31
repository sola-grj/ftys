import type { LoginResult } from '@/types/member'
import type {
  CustomerBillResult,
  MyPerformanceResult,
  MySuggestItem,
  MySuggestResult,
  OrderStatusResult,
} from '@/types/my'
import { http } from '@/utils/http'

export type AddSuggestType = {
  title: string
  content: string
  images?: string
}

/**
 * 意见反馈列表
 * @param data 请求参数
 */
export const getMySuggestAPI = (data: { page: number; pageSize: number }) => {
  return http<MySuggestResult>({
    method: 'POST',
    url: '/suggest/getMySuggest',
    data,
  })
}

/**
 * 添加意见反馈
 * @param data 请求参数
 */
export const addSuggestAPI = (data: AddSuggestType) => {
  return http({
    method: 'POST',
    url: '/suggest/addSuggest',
    data,
  })
}

/**
 * 业绩查看
 * @param data 请求参数
 */
export const getFullPerformanceAPI = (data: { month: string }) => {
  return http<MyPerformanceResult>({
    method: 'POST',
    url: '/sales/getFullPerformance',
    data,
  })
}

/**
 * 下单情况
 * @param data 请求参数
 */
export const getOrderPerformanceAPI = (data: { dateFilter: string }) => {
  return http<OrderStatusResult>({
    method: 'POST',
    url: '/sales/getOrderPerformance',
    data,
  })
}

/**
 * 客户账款
 * @param data 请求参数
 */
export const getcustomerBillAPI = (data: { filter: string }) => {
  return http<CustomerBillResult>({
    method: 'POST',
    url: '/sales/customerBill',
    data,
  })
}

export type SubAccountItem = {
  mobile: string
  userId: string
  username: string
  sub_account_name: string
  sub_account_level: string
}

export type SubAccountResult = {
  page: number
  total: number
  list: SubAccountItem[]
}
/**
 * 子账号
 * @param data 请求参数
 */
export const getSubAccountAPI = (data: { page: number; pageSize: number }) => {
  return http<SubAccountResult>({
    method: 'POST',
    url: '/user/getSubAccount',
  })
}

export type RegisterSubUserData = {
  mobile: string
  username: string
  sub_account_name: string
  password: string
  sub_account_level: string
}

/**
 * 注册子账号
 * @param data 请求参数
 */
export const registerSubUserAPI = (data: RegisterSubUserData) => {
  return http({
    method: 'POST',
    url: '/user/registerSubUser',
    data,
  })
}

export type ModifySubUserData = {
  userId: string
  mobile: string
  username: string
  sub_account_name: string
  password: string
  sub_account_level: string
}

/**
 * 编辑子账号
 * @param data 请求参数
 */
export const modifySubUserAPI = (data: ModifySubUserData) => {
  return http({
    method: 'POST',
    url: '/user/modifySubUser',
    data,
  })
}

/**
 * 删除子账号
 * @param data 请求参数
 */
export const removeSubAccountAPI = (data: { userId: string }) => {
  return http({
    method: 'POST',
    url: '/user/removeSubAccount',
    data,
  })
}

export type UpdateUserInfoData = {
  username?: string
  mobile?: string
  code?: string
  company_lon?: string //	经度
  company_lat?: string //	string	纬度
  company_province?: string
  compnay_city?: string
  company_area?: string
  company_addr?: string
  company?: string
  shipping_lon?: string
  shipping_lat?: string
  shipping_province?: string
  shipping_city?: string
  shipping_area?: string
  shipping_addr?: string
  images?: string
  sale_id?: string
}

export type UpdateUserResult = {
  type_id: number // 1:业务员 2:司机 3:生鲜 4:干货 5:生鲜&干货
  user_role: string // 1:主账号 2:子账号
  sub_account_name: string // 子账号名称
  sub_account_level: string
  username: string
  mobile: string
  receive_way: string // 	收货方式:deliver:送货上门,pick_up:用户自提
  pay_way: string // 支付方式:credit:赊账,online:在线支付
  avatar: string
  money: string // 账户余额
  credit_money: string // 欠款余额
  account_status: string // 权限判断（未知位置权限）
  goods_price: string // 权限判断（商品价格，不用处理）
  credit_price: string // 权限判断（是否显示欠款情况）
  shipping_addr: string
  shipping_area: string
  company: string
  driver_id: string
  id: string
  user_id: string
}

/**
 * 用户信息修改
 * @param data 请求参数
 */
export const updateUserInfoAPI = (data: UpdateUserInfoData) => {
  return http<UpdateUserResult>({
    method: 'POST',
    url: '/user/modify',
    data,
  })
}

/**
 * 设置支付密码
 * @param data 请求参数
 */
export const setpaypwdAPI = (data: { paypwd: string; code: string; mobile: string }) => {
  return http({
    method: 'POST',
    url: '/user/setpaypwd',
    data,
  })
}
export type CustomerItem = {
  userId: string
  username: string
}
export type CustomerResult = {
  page: number
  total: number
  list: CustomerItem[]
}
/**
 * 获取客户列表
 * @param data 请求参数
 */
export const getCustomerListAPI = (data: { page: number; pageSize: number; filter?: string }) => {
  return http<CustomerResult>({
    method: 'POST',
    url: '/sales/getCustomerList',
    data,
  })
}

/**
 * 获取切换客户列表
 * @param data 请求参数
 */
export const getCutAccountListAPI = (data: { page: number; pageSize: number; filter?: string }) => {
  return http<CustomerResult>({
    method: 'POST',
    url: '/user/getCutAccountList',
    data,
  })
}

export type CutAccountResult = {
  type_id: number // 1:业务员 2:司机 3:生鲜 4:干货 5:生鲜&干货
  user_role: string // 1:主账号 2:子账号
  sub_account_name: string // 子账号名称
  sub_account_level: string
  username: string
  mobile: string
  receive_way: string // 	收货方式:deliver:送货上门,pick_up:用户自提
  pay_way: string // 支付方式:credit:赊账,online:在线支付
  avatar: string
  money: string // 账户余额
  credit_money: string // 欠款余额
  token: string // 唯一标识
  account_status: string // 权限判断（未知位置权限）
  goods_price: string // 权限判断（商品价格，不用处理）
  credit_price: string // 权限判断（是否显示欠款情况）
  shipping_addr: string
  shipping_area: string
  company: string
  driver_id: string
  id: string
  user_id: string
}

/**
 * 切换账号
 * @param data 请求参数
 */
export const cutAccountAPI = (data: { userId: string }) => {
  return http<LoginResult>({
    method: 'POST',
    url: '/user/cutAccount',
    data,
  })
}

export type MyMerchantItem = {
  company: string
  createTime: string
  lastOrderTime: string
  mobile: string
  orderMoney: string
  shippingAddr: string
  shippingArea: string
  status: string
  userId: number
  username: string
}

export type MyMerchantResult = {
  list: MyMerchantItem[]
  page: number
  total: number
  totalOrderMoney: string
}
/**
 * 我的商户列表
 * @param data 请求参数
 */
export const getMyMerchantListAPI = (data: {
  page: number
  pageSize: number
  filter?: string
  status: string
}) => {
  return http<MyMerchantResult>({
    method: 'POST',
    url: '/sales/getMyMerchantList',
    data,
  })
}

export type MyMerchantOrderItem = {
  createTime: string
  orderId: number
  orderNo: string
  orderPrice: string
  shippedOrderPrice: string
  shippedTime: string
  status: string
}

export type MyMerchantOrderResult = {
  page: number
  total: number
  list: MyMerchantOrderItem[]
}

/**
 * 我的商户订单列表
 * @param data 请求参数
 */
export const getMyMerchantOrderListAPI = (data: {
  page: number
  pageSize: number
  userId: string
}) => {
  return http<MyMerchantOrderResult>({
    method: 'POST',
    url: '/sales/getMyMerchantOrderList',
    data,
  })
}

/**
 * 我的商户订单列表
 * @param data 请求参数
 */
export const phoneCaptchaAPI = () => {
  return http({
    method: 'POST',
    url: '/common/phoneCaptcha',
  })
}

export type ChannelOrderItem = {
  createTime: string
  orderId: string
  orderNo: string
  orderPrice: string
  shippedTime: string
  status: string
  userId: string
  userInfo: {
    id: string
    mobile: string
    username: string
  }
}

export type ChannelOrderResult = {
  list: ChannelOrderItem[]
  page: number
  total: number
}
/**
 * 渠道订单
 * @param data 请求参数
 */
export const getChannelOrderListAPI = (data: {
  page: number
  pageSize: number
  status: string
  shippedTime: string
}) => {
  return http<ChannelOrderResult>({
    method: 'POST',
    url: '/sales/getChannelOrderList',
    data,
  })
}

/**
 * 微信登录
 * @param data 请求参数
 */
export const wxLoginAPI = (data: { code: string }) => {
  return http<LoginResult>({
    method: 'POST',
    url: '/user/wxLogin',
    data,
  })
}

/**
 * 绑定微信
 * @param data 请求参数
 */
export const bindWXAPI = (data: { code: string }) => {
  return http({
    method: 'POST',
    url: '/user/bindWX',
    data,
  })
}

/**
 *解绑微信
 * @param data 请求参数
 */
export const UnbindWXAPI = () => {
  return http({
    method: 'POST',
    url: '/user/unbindWX',
  })
}

/**
 * 检查是否绑定微信
 * @param data 请求参数
 */
export const checkBindWXAPI = () => {
  return http<{ openId: string; idBindWX: string; payPwdSwitch: string }>({
    method: 'POST',
    url: '/user/checkBindWX',
  })
}

export type RechargeResult = {
  data: {
    appId: string
    timeStamp: string
    nonceStr: string
    package: string
    paySign: string
    signType: string
  }
  type: string
}

export type RechargeB2BResult = {
  signData: string
  paySig: string
  signature: string
}

/**
 * 获取支付参数
 * @param data 请求参数
 */
export const getRechargePayAPI = (data: { rechargeMoney: number }) => {
  return http<RechargeResult>({
    method: 'POST',
    url: '/Pay_V3/recharge',
    data,
  })
}

/**
 * 获取支付参数
 * @param data 请求参数
 */
export const getRechargeB2BPayAPI = (data: { rechargeMoney: string; code: string }) => {
  return http<RechargeB2BResult>({
    method: 'POST',
    url: '/Pay_V3/rechargeB2B',
    data,
  })
}

/**
 * 获取支付参数
 * @param data 请求参数
 */
0
1
;('-581.80')
;('840.70')
12
0
21
export const getUserMoneyAPI = () => {
  return http<{
    money: string
    credit_money: string
    couponsCount: string
    afterSaleCount: string
    unpaidCount: string
    unreceivedCount: string
    unshippedCount: string
  }>({
    method: 'POST',
    url: '/user/getUserMoney',
  })
}

/**
 * 获取短信验证码
 * @param data 请求参数
 */
export const getSmsCodeAPI = (data: { mobile: string }) => {
  return http({
    method: 'POST',
    url: '/Ks_Sms/get_code',
    data,
  })
}

/**
 * 获取短信验证码
 * @param data 请求参数
 */
export const reviewAccountAPI = (data: { customerUserId: string | number }) => {
  return http({
    method: 'POST',
    url: '/user/reviewAccount',
    data,
  })
}

export type ServiceType = {
  id: number
  number: string
  type: string
}

/**
 * 联系客服
 * @param data 请求参数
 */
export const getServiceInfoAPI = () => {
  return http<ServiceType[]>({
    method: 'POST',
    url: '/common/getServiceInfo',
  })
}
export type UserInfo = {
  avatar: string
  bio: string
  birthday: string
  company: string
  company_addr: string
  company_area: string
  company_city: string
  company_lat: string
  company_lon: string
  company_province: string
  createtime: number
  credit_money: string
  driver_id: string
  email: string
  gender: string
  group_id: string
  h_user_id: string
  id: string
  images: string[]
  joinip: string
  jointime: string
  level: string
  loginfailure: string
  loginip: string
  logintime: string
  maxsuccessions: string
  mobile: string
  money: string
  nickname: string
  openid: string
  password: string
  pay_pwd: string
  pay_way: string
  pid: string
  prevtime: string
  receive_way: string
  s_user_id: string
  sale_id: string
  salt: string
  score: string
  shipping_addr: string
  shipping_area: string
  shipping_city: string
  shipping_lat: string
  shipping_lon: string
  shipping_province: string
  status: string
  sub_account_level: string
  sub_account_name: string
  successions: string
  third_create_time: string
  third_update_time: string
  token: string
  type_id: string
  updatetime: string
  user_role: string
  username: string
  verification: string
}
/**
 * 联系客服
 * @param data 请求参数
 */
export const getUserInfoAPI = () => {
  return http<UserInfo>({
    method: 'POST',
    url: '/user/getUserInfo',
  })
}
