/** 商品信息 */
export type SearchGoodsItem = {
  name: string
  goodsId: string
  source: string
  price: string
  image: string
}

export type SearchGoodsResult = {
  total: number
  page: number
  list: SearchGoodsItem[]
}
