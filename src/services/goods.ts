import type { GoodsResult } from '@/types/goods'
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
export const addGoodsCollectAPI = (data: { source: string; goodsId: string }) => {
  return http({
    method: 'POST',
    url: '/goods/addGoodsCollect',
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
