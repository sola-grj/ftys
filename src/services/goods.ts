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
  priceSort?: string
}) => {
  return http<GetGoodsListByIdResult>({
    method: 'POST',
    url: '/goods/getGoodsList',
    data,
  })
}

export type GetMyGoodsApplyItem = {
  id: string
  user_id: string
  goods_name: string
  goods_category: string
  goods_source: string
  goods_brand: string
  goods_specification: string
  goods_supplier: string
  goods_price: string
  goods_remark: string
  status: string
  create_time: string
  update_time: string
  goods_category_name: string
}

export type getMyGoodsApplyResult = {
  page: number
  total: number
  list: GetMyGoodsApplyItem[]
}

/**
 * 根据分类查询商品
 * @param id 商品id
 */
export const getMyGoodsApplyAPI = (data: { page: number; pageSize: number }) => {
  return http<getMyGoodsApplyResult>({
    method: 'POST',
    url: '/goods_apply/getMyGoodsApply',
    data,
  })
}

/**
 * 新增商品需求
 * @param id 商品id
 */
export const createGoodsApplyAPI = (data: {
  goods_name: string
  goods_source: string
  goods_category: string
  goods_brand: string
  goods_specification: string
  goods_supplier: string
  goods_price: string
  goods_remark: string
}) => {
  return http<{ applyId: string }>({
    method: 'POST',
    url: '/goods_apply/createGoodsApply',
    data,
  })
}
