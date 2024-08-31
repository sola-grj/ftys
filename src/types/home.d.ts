import type { GoodsItem } from './global'

/** 首页-前台类目数据类型 */
export type CategoryItem = {
  /** 图标路径 */
  icon: string
  /** id */
  id: string
  /** 分类名称 */
  name: string
}

/** 首页-热门推荐数据类型 */
export type HotItem = {
  /** 说明 */
  alt: string
  /** id */
  id: string
  /** 图片集合[ 图片路径 ] */
  pictures: string[]
  /** 跳转地址 */
  target: string
  /** 标题 */
  title: string
  /** 推荐类型 */
  type: string
}

/** 猜你喜欢-商品类型 */
export type GuessItem = GoodsItem

/********************************************************* */
/** 首页-置顶商品 */
export type TopItem = {
  name: string
  goodsId: string
  source: string
}

/** 首页-分类商品 */
export type BasicCategoryItem = {
  id: string
  name: string
  image: string
  source: string
  childlist: BasicCategoryItem[]
}

export type SearchBasicCategoryItem = {
  price: string
  fGoodsId: string
  goodsId: string
  isCollect: string
  name: string
  images: string[]
  source: string
  cartGoodsNum: number
  cartId: string
  unit: string
}

export type CategoryResult = {
  top1: BasicCategoryItem[]
  top2: BasicCategoryItem[]
  fruitCategory: []
  dryCargoCategory: []
}

/** 首页-轮播图 */
export type BannerItem = {
  image: string
  title: string
  sort: string
  path: string
}

/** 首页-今日必买 */
export type MustBuyItem = TopItem & {
  price: string
  images: string[]
  isCollect: string // 0 1
  cartGoodsNum: number
  cartId: string
  fGoodsId: string
  unit: string
}

/** 首页-推荐购买 */
export type RecommendItem = {
  goodsId: string
  name: string
  images: string[]
  source: string
  unit_price: string
  isCollect: string
  cartGoodsNum: number
  cartId: string
  fGoodsId: string
  units: string
}

export type RecommendResult = {
  list: RecommendItem[]
  total: number
  page: string
}
