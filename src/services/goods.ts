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
