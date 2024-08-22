/** 商品信息 */
export type SearchGoodsItem = {
  name: string
  goodsId: string
  source: string
  price: string
  images: string[]
  isCollect: string // 0 1
  cartGoodsNum: number
  cartId: string
  fGoodsId: string
  unit: string
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
