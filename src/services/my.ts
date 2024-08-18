import type {
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
