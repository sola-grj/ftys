import type { SearchGoodsResult, SearchHistoryGoodsResult } from '@/types/search'
import type { PageParams, PageResult } from '@/types/global'
import { http } from '@/utils/http'

/**
 * 获取搜索列表
 * @param data keyword 关键词
 */
export const getSearchListAPI = (data: {
  keyword: string
  page: number
  pageSize: number
  priceSort?: string
}) => {
  return http<SearchGoodsResult>({
    method: 'POST',
    url: '/goods/searchGoods',
    data,
  })
}

/**
 * 历史搜索&amp;搜索发现
 * @param
 */
export const getHistorySearchListAPI = () => {
  return http<SearchHistoryGoodsResult>({
    method: 'GET',
    url: '/search_keyword/getHistoryKeyword',
  })
}
