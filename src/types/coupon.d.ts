/** 优惠券对象 */
export type CouponItem = {
  id: string
  name: string
  type: string
  face_value: string
  amount_limit: string
  expire_type: string
  expire_start_time: string
  expire_end_time: string
  expire_days: string
  status: string
  create_time: string
  update_time: string
}

/** 我的优惠券对象 */
export type MyCouponItem = {
  name: string
  face_value: string
  amount_limit: string
  expire_type: string
  expire_start_time: string
  expire_time: string
  expire_days: string
  status: string
  receive_time: string
}

export type WholeCouponItem = CouponItem & MyCouponItem
