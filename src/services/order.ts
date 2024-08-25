import type { CartItem } from '@/types/cart'
import type {
  OrderCreateParams,
  OrderListParams,
  OrderListResult,
  OrderLogisticResult,
  OrderPreResult,
  OrderResult,
  QuickOrderResult,
} from '@/types/order'
import { http } from '@/utils/http'
/**
 * 填写订单-获取预付订单
 */
export const getMemberOrderPreAPI = () => {
  return http<OrderPreResult>({
    method: 'GET',
    url: '/member/order/pre',
  })
}

/**
 * 填写订单-获取立即购买订单
 */
export const getMemberOrderPreNowAPI = (data: {
  skuId: string
  count: string
  addressId?: string
}) => {
  return http<OrderPreResult>({
    method: 'GET',
    url: '/member/order/pre/now',
    data,
  })
}

/**
 * 提交订单
 * @param data 请求参数
 */
export const postMemberOrderAPI = (data: OrderCreateParams) => {
  return http<{ id: string }>({
    method: 'POST',
    url: '/member/order',
    data,
  })
}

/**
 * 获取订单详情
 * @param id 订单id
 */
export const getMemberOrderByIdAPI = (id: string) => {
  return http<OrderResult>({
    method: 'GET',
    url: `/member/order/${id}`,
  })
}

/**
 * 填写订单-再次购买
 * @param id 订单id
 */
export const getMemberOrderRepurchaseByIdAPI = (id: string) => {
  return http<OrderPreResult>({
    method: 'GET',
    url: `/member/order/repurchase/${id}`,
  })
}

/**
 * 模拟发货-内测版
 * @description 在DEV环境下使用，仅在订单状态为待发货时，可模拟发货，调用后订单状态修改为待收货，包含模拟物流。
 * @param id 订单id
 */
export const getMemberOrderConsignmentByIdAPI = (id: string) => {
  return http({
    method: 'GET',
    url: `/member/order/consignment/${id}`,
  })
}

/**
 * 确认收货
 * @description 仅在订单状态为待收货时，可确认收货。
 * @param id 订单id
 */
export const putMemberOrderReceiptByIdAPI = (id: string) => {
  return http<OrderResult>({
    method: 'PUT',
    url: `/member/order/${id}/receipt`,
  })
}

/**
 * 获取订单物流
 * @description 仅在订单状态为待收货，待评价，已完成时，可获取物流信息。
 * @param id 订单id
 */
export const getMemberOrderLogisticsByIdAPI = (id: string) => {
  return http<OrderLogisticResult>({
    method: 'GET',
    url: `/member/order/${id}/logistics`,
  })
}

/**
 * 删除订单
 * @description 仅在订单状态为待评价，已完成，已取消时，可删除订单。
 * @param data ids 订单集合
 */
export const deleteMemberOrderAPI = (data: { ids: string[] }) => {
  return http({
    method: 'DELETE',
    url: `/member/order`,
    data,
  })
}

/**
 * 取消订单
 * @description 仅在订单状态为待付款时，可取消订单。
 * @param id 订单id
 * @param data cancelReason 取消理由
 */
export const getMemberOrderCancelByIdAPI = (id: string, data: { cancelReason: string }) => {
  return http<OrderResult>({
    method: 'PUT',
    url: `/member/order/${id}/cancel`,
    data,
  })
}

/**
 * 获取订单列表
 * @param data orderState 订单状态
 */
export const getMemberOrderAPI = (data: OrderListParams) => {
  return http<OrderListResult>({
    method: 'GET',
    url: `/member/order`,
    data,
  })
}

// *******
/**
 * 获取订单信息
 * @param data 请求参数
 */
export const getOrderListAPI = (data?: { status: string }) => {
  return http<OrderListResult>({
    method: 'POST',
    url: '/order/getOrderList',
    data,
  })
}

/**
 * 常用清单
 * @param data 请求参数
 */
export const getGoodsCollectsAPI = (data: {
  categoryId?: string
  page: number
  pageSize: number
}) => {
  return http<QuickOrderResult>({
    method: 'POST',
    url: '/goods/getGoodsCollects',
    data,
  })
}

/**
 * 最近购买
 * @param data 请求参数
 */
export const getRecentlyOrderAPI = (data: {
  categoryId?: string
  page: number
  pageSize: number
}) => {
  return http<QuickOrderResult>({
    method: 'POST',
    url: '/goods/getRecentlyOrder',
    data,
  })
}

export type CreateOrderCartItem = {
  cartId: string
  num: number | string
  unitPrice: string
  costUnitPrice: string
}

export type CreateOrderData = {
  userCoupon: string
  couponId: string
  couponAmount?: string
  remark: string
  cartList: CreateOrderCartItem[]
}
/**
 * 创建订单
 * @param data 请求参数
 */
export const createOrderAPI = (data: CreateOrderData) => {
  return http<{ orderId: string }>({
    method: 'POST',
    url: '/order/createOrder',
    data,
  })
}

export type CreditItem = {
  capitalId: string
  capitalNo: string
  money: string
  userId: string
  type: string
  sign: string
  orderId: string
  orderNo: string
  memo: string
  createTime: string
  check: boolean
}

export type CreditResult = {
  totalCreditMoney: string
  total: number
  page: number
  list: CreditItem[]
}
/**
 * 获取欠款信息
 * @param data 请求参数
 */
export const getMyCreditListAPI = (data: { page: number; pageSize: number }) => {
  return http<CreditResult>({
    method: 'POST',
    url: '/capital/getMyCreditList',
    data,
  })
}

/**
 * 获取欠款信息
 * @param data 请求参数
 */
export const creditRepayAPI = (data: { capitalIds: string; repayMoney: string }) => {
  return http({
    method: 'POST',
    url: '/capital/creditRepay',
    data,
  })
}
