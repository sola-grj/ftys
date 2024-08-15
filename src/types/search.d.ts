/** 商品信息 */
export type SearchGoodsItem = {
  name: string
  goodsId: string
  source: string
  price: string
  images: string[]
}

export type SearchGoodsResult = {
  total: number
  page: number
  list: SearchGoodsItem[]
}

export type SearchHistoryGoodsResult = {
  myHistorySearch: string[]
  searchDiscover: string[]
}
