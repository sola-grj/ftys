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

/**
 * 我的优惠券
 */
export const getMyCouponListAPI = () => {
  return http<MyCouponItem[]>({
    method: 'POST',
    url: '/coupon/getReceiveCoupon',
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
