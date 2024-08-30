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
 * 下单情况
 * @param data 请求参数
 */
export const getcustomerBillAPI = () => {
  return http<CustomerBillResult>({
    method: 'POST',
    url: '/sales/customerBill',
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
export const setpaypwdAPI = (data: { paypwd: string }) => {
  return http({
    method: 'POST',
    url: '/user/setpaypwd',
    data,
  })
}
