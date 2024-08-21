import type { GoodsResult } from '@/types/goods'
import type { RecommendResult, SearchBasicCategoryItem } from '@/types/home'
import { http } from '@/utils/http'

/**
 * 商品详情
 * @param id 商品id
 */
export const getGoodsByIdAPI = (data: { source: string; goodsId: string }) => {
  return http<GoodsResult>({
    method: 'POST',
    url: '/goods/getGoodsDetail',
    data,
  })
}

/**
 * 添加商品收藏
 * @param id 商品id
 */
export const getGoodsCollectInfoAPI = (data: { source: string; goodsId: string }) => {
  return http({
    method: 'POST',
    url: '/goods/addGoodsCollect',
    data,
  })
}

/**
 * 產品詳情頁 商品推薦
 * @param id 商品id
 */
export const goodsDetailPageRecommendGoodsAPI = (data: {
  source: string
  goodsId: string
  page: number
  pageSize: number
}) => {
  return http<RecommendResult>({
    method: 'POST',
    url: '/goods/goodsDetailPageRecommendGoods',
    data,
  })
}

export type GetGoodsListByIdResult = {
  list: SearchBasicCategoryItem[]
  total: number
  page: number
}

/**
 * 根据分类查询商品
 * @param id 商品id
 */
export const getGoodsListByIdAPI = (data: {
  source: string
  category: string
  page: number
  pageSize: number
}) => {
  return http<GetGoodsListByIdResult>({
    method: 'POST',
    url: '/goods/getGoodsList',
    data,
  })
}
