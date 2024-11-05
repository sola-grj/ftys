import type { CartItem } from '@/types/cart'
import type {
  DetailItem,
  OrderCreateParams,
  OrderListParams,
  OrderListReqData,
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
export const getOrderListAPI = (data: OrderListReqData) => {
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
  remark: string
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
  return http<{ orderId: string; orderNo: string; money: string; orderPayPrice: string }>({
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

/**
 * 订单支付
 * @param data 请求参数
 */
export const orderPayAPI = (data: {
  orderId: string
  payType: string
  password?: string
  code?: string
}) => {
  return http<{ signData: string; paySig: string; signature: string }>({
    method: 'POST',
    url: '/order/orderPay',
    data,
  })
}

export type OrderDetailResult = {
  couponInfo: {
    userCouponId: string
    couponName: string
    couponType: string
    faceValue: string
  }
  createTime: string
  deliveryInfo: {
    receiveWay: string
    shippingAddr: string
    mobile: string
    username: string
  }
  orderDetail: DetailItem[]
  orderNo: string
  orderPayPrice: string
  orderPrice: string
  status: string
  useCoupon: string
  userCouponId: string
  orderId: string
  remark: string
}

/**
 * 订单详情
 * @param data 请求参数
 */
export const orderDetailAPI = (data: { orderId: string }) => {
  return http<OrderDetailResult>({
    method: 'POST',
    url: '/order/orderDetail',
    data,
  })
}

export type EditOrderCartItem = {
  cartId: string
  num: string
  unitPrice: string
  remark?: string
}

export type EditOrderData = {
  userCoupon: string
  couponId: string
  couponAmount: string
  orderId: string
  remark: string
  cartList: EditOrderCartItem[]
}

/**
 * 订单详情
 * @param data 请求参数
 */
export const editOrderAPI = (data: EditOrderData) => {
  return http<{ order_id: string }>({
    method: 'POST',
    url: '/order/editOrder',
    data,
  })
}

/**
 * 取消订单
 * @param data 请求参数
 */
export const cancelOrderAPI = (data: { orderId: string }) => {
  return http({
    method: 'POST',
    url: '/order/cancelOrder',
    data,
  })
}
export type AfterServiceItem = {
  key: string
  value: string
}
export type AfterServiceTypeResult = {
  afterSalesType: AfterServiceItem[]
  afterSalesReason: AfterServiceItem[]
}

/**
 * 获取售后类型和原因
 * @param data 请求参数
 */
export const getAfterServiceTypeAPI = () => {
  return http<AfterServiceTypeResult>({
    method: 'POST',
    url: '/after_sales_service/getAfterServiceType',
  })
}
export type AfterSaleReqItem = {
  goodsId: string
  num: string
  units: string
  source: string
  remark: string
}
export type AfterSaleReqData = {
  orderId: string
  afterSalesType: string
  afterSalesReason: string
  remark: string
  goodsList: AfterSaleReqItem[]
  images: string
}
/**
 * 获取售后类型和原因
 * @param data 请求参数
 */
export const createAfterSalesAPI = (data: AfterSaleReqData) => {
  return http({
    method: 'POST',
    url: '/after_sales_service/createAfterSales',
    data,
  })
}

export type UnShipCustomerItem = {
  orderCount: string
  userId: string
  username: string
  mobile: string
  shippingArea: string
  shippingAddr: string
}
export type ShipedOrderItem = {
  orderId: string
  orderNo: string
  userId: string
  createTime: string
  username: string
  mobile: string
}

export type UnShipCustomerResult = {
  total: number
  page: number
  list: UnShipCustomerItem[]
}
export type ShipedOrderResult = {
  total: number
  page: number
  list: ShipedOrderItem[]
}

/**
 * 待发货客户列表
 * @param data 请求参数
 */
export const getUnShipCustomerAPI = (data: {
  page: number
  pageSize: number
  account?: string
}) => {
  return http<UnShipCustomerResult>({
    method: 'POST',
    url: '/driver/getUnShipCustomer',
    data,
  })
}

/**
 * 司机已完成订单
 * @param data 请求参数
 */
export const getShippedOrderListAPI = (data: {
  page: number
  pageSize: number
  account?: string
}) => {
  return http<ShipedOrderResult>({
    method: 'POST',
    url: '/driver/getShippedOrderList',
    data,
  })
}

export type UnShipOrderListItem = {
  orderId: string
  orderNo: string
  createTime: string
  username: string
  mobile: string
  status: string
}

export type UnShipOrder = {
  total: number
  list: UnShipOrderListItem[]
  page: number
}
/**
 *  待发货客户订单列表
 * @param data 请求参数
 */
export const getUnShipOrderListAPI = (data: {
  userId: string
  username?: string
  mobile?: string
}) => {
  return http<UnShipOrder>({
    method: 'POST',
    url: '/driver/getUnShipOrderList',
    data,
  })
}

export type ShipedOrderDetailResult = {
  orderInfo: {
    orderId: string
    orderNo: string
    status: string
    createTime: string
    payTime: string
    shippedTime: string
    signInTime: string
    signInImages: string[]
    shippingInfo: {
      mobile: string
      shippingAddr: string
      username: string
    }
  }
  orderDetail: ShipedOrderDetailItem[]
}

export type ShipedOrderDetailItem = {
  goodsId: string
  source: string
  fGodsId: string
  num: number
  actNum: string
  units: string
  goodsName: string
  goodsImages: string[]
  detailId: string
  unitPrice: string
  orderId: string
}
/**
 *  已完成订单详情
 * @param data 请求参数
 */
export const getShippedOrderDetailAPI = (data: { orderId: string }) => {
  return http<ShipedOrderDetailResult>({
    method: 'POST',
    url: '/driver/getShippedOrderDetail',
    data,
  })
}

export type ShipOrderItem = {
  detailId: string
  actNum: string
  unitPrice: string
}

/**
 *  订单发货
 * @param data 请求参数
 */
export const shipOrderAPI = (data: { orderId: string; orderDetail: ShipOrderItem[] }) => {
  return http<ShipedOrderDetailResult>({
    method: 'POST',
    url: '/driver/shipOrder',
    data,
  })
}

/**
 *  订单签收
 * @param data 请求参数
 */
export const signInOrderAPI = (data: { orderId: string; signInImages: string }) => {
  return http<ShipedOrderDetailResult>({
    method: 'POST',
    url: '/driver/signInOrder',
    data,
  })
}

export type CommondityTraceResult = {
  orderInfo: {
    username: string
    num: string
    actNum: string
    units: string
    orderNo: string
    salesReturnNum: string
  }
  providerInfo: {
    providerCode: string
    providerName: string
  }
  goodsInfo: {
    desc: string
    detailImages: string
    fid: string
    id: string
    images: string[]
    model: string
    package: string
    price: string
    productPlace: string
    providerCode: string
    providerName: string
    source: string
    storage: string
    unit: string
    weight: string
    category1Name: string
    category2Name: string
    category3Name: string
    goodsName: string
  }
  traceInfo: string[]
  traceNo: string
  traceTimes: string
  firstTraceTime: string
}

/**
 *  商品溯源
 * @param data 请求参数
 */
export const commodityTraceAPI = (data: {
  orderId: string
  goodsId: string
  fGoodsId: string
  source: string
}) => {
  return http<CommondityTraceResult>({
    method: 'POST',
    url: '/order/commodityTrace',
    data,
  })
}
