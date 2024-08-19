export type MySuggestItem = {
  id: string
  user_id: string
  title: string
  content: string
  images: string
  status: string
  create_time: string
  update_time: string
}

export type MySuggestResult = {
  list: MySuggestItem[]
  page: number
  total: number
}

export type DeliverItem = {
  data: string
  value: string
}
export type ProfitItem = {
  data: string
  value: string
}

export type PerformancePicdata = {
  deliver: DeliverItem[]
  profit: ProfitItem[]
}

export type MyPerformanceResult = {
  todayNewUserCount: string // 今日新增用户数
  weekNewUserCount: string // 本周新增用户数
  todayOrderAmount: string // 今日订单金额
  todayOrderCount: string // 今日已下单数量
  weekOrderAmount: string // 本周订单金额
  weekOrderCount: string // 本周已下单数量
  todayDeliveryAmount: string //今日结算金额
  weekDeliveryAmount: string //本周结算金额
  monthOrderPrice: string //月订单金额
  monthNewUserCount: string //月新增用户数量
  monthOrderCost: string //月发货金额
  monthDeliverAmount: string //月结算金额
  monthOrderCount: string //月订单数量
  picData: PerformancePicdata
}

export type OrderStatusItem = {
  userId: string
  orderTime: string
  username: string
  mobile: string
}

export type OrderStatusResult = {
  total: number
  page: string
  list: OrderStatusItem[]
}

export type CustomerBillItem = {
  orderId: string
  userId: string
  username: string
  mobile: string
  SDebt: string
  HDebt: string
  totalDebt: string
}

export type CustomerBillResult = {
  total: number
  page: string
  list: CustomerBillItem[]
}
