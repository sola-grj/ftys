import type { ProfileDetail, ProfileParams } from '@/types/member'
import { http } from '@/utils/http'

/**
 * 获取个人信息
 */
export const getMemberProfileAPI = () => {
  return http<ProfileDetail>({
    method: 'GET',
    url: '/member/profile',
  })
}

/**
 * 修改个人信息
 * @param data 请求体参数
 */
export const putMemberProfileAPI = (data: ProfileParams) => {
  return http<ProfileDetail>({
    method: 'PUT',
    url: '/member/profile',
    data,
  })
}

export type CapitalItem = {
  id: string
  user_id: string
  money: string
  type: string
  sign: string
  orderId: string
  before: string
  after: string
  credit_before: string
  credit_after: string
  memo: string
  createTime: string
  typeName: string
  capitalId: string
}

export type CapitalDetail = {
  id: string
  capital_no: string
  user_id: string
  money: string
  type: string
  sign: string
  order_id: string
  before: string
  after: string
  credit_before: string
  credit_after: string
  memo: string
  create_time: string
  order_no: string
}

export type CapitalResult = {
  page: number
  total: number
  list: CapitalItem[]
}
/**
 * 账户明细列表
 * @param data 请求体参数
 */
export const getCapitalListAPI = (data: { page: number; pageSize: number; type?: string }) => {
  return http<CapitalResult>({
    method: 'PUT',
    url: '/capital/getCapitalList',
    data,
  })
}

/**
 * 账户明细详情
 * @param data 请求体参数
 */
export const getCapitalDetailAPI = (data: { capitalId: string; type: string; orderId: string }) => {
  return http<CapitalDetail>({
    method: 'PUT',
    url: '/capital/getCapitalDetail',
    data,
  })
}
