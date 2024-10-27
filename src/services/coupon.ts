import type { CouponItem, MyCouponItem } from '@/types/coupon'
import { http } from '@/utils/http'

export type ReceiveCouponType = {
  coupon_id: string
  expire_time: string
  expire_type: string
  expire_days: string
}

/**
 * 优惠券列表
 */
export const getCouponListAPI = () => {
  return http<CouponItem[]>({
    method: 'POST',
    url: '/coupon/getCouponList',
  })
}

export type MyCouponListResult = {
  page: string
  total: string
  list: MyCouponItem[]
  deliverDate: string
}

/**
 * 我的优惠券
 */
export const getMyCouponListAPI = (data?: { status: string }) => {
  return http<MyCouponListResult>({
    method: 'POST',
    url: '/coupon/getReceiveCoupon',
    data,
  })
}

/**
 * 领取优惠券
 */
export const receiveCouponAPI = (data: ReceiveCouponType) => {
  return http({
    method: 'POST',
    url: '/coupon/receiveCoupon',
    data,
  })
}
