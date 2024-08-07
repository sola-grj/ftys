import type { SearchGoodsResult } from '@/types/search'
import type { PageParams, PageResult } from '@/types/global'
import { http } from '@/utils/http'

/**
 * 获取搜索列表
 * @param data keyword 关键词
 */
export const getSearchListAPI = (data: { keyword: string; page: number; pageSize: number }) => {
  return http<SearchGoodsResult>({
    method: 'GET',
    url: '/goods/searchGoods',
    data,
  })
}
