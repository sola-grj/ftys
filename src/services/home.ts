import type { PageParams, PageResult } from '@/types/global'
import type {
  BannerItem,
  CategoryItem,
  CategoryResult,
  GuessItem,
  HotItem,
  MustBuyItem,
  TopItem,
} from '@/types/home'
import { http } from '@/utils/http'

/**
 * 首页广告区域接口
 * @param distributionSite 活动 banner 位置，1 代表首页，2 代表商品分类页，默认为 1
 */
export const getHomeBannerAPI = (distributionSite = 1) => {
  return http<BannerItem[]>({
    method: 'GET',
    url: '/home/banner',
    data: {
      distributionSite,
    },
  })
}

// services/home.ts
/**
 * 首页-前台分类-小程序
 */
export const getHomeCategoryAPI = () => {
  return http<CategoryItem[]>({
    method: 'GET',
    url: '/home/category/mutli',
  })
}

// services/home.ts
/**
 * 首页-热门推荐-小程序
 */
export const getHomeHotAPI = () => {
  return http<HotItem[]>({
    method: 'GET',
    url: '/home/hot/mutli',
  })
}

// src/services/home.ts
/**
 * 猜你喜欢-小程序
 */
export const getHomeGoodsGuessLikeAPI = (data?: PageParams) => {
  return http<PageResult<GuessItem>>({
    method: 'GET',
    url: '/home/goods/guessLike',
    data,
  })
}
//******************************************************* */
/**
 * 首页置顶产品
 */
export const getHomeTopListAPI = () => {
  return http<TopItem[]>({
    method: 'POST',
    url: '/goods/getTopGoods',
  })
}

/**
 * 首页分类
 */
export const getCategoryAPI = () => {
  return http<CategoryResult>({
    method: 'POST',
    url: '/goods_category/getCategory',
  })
}

/**
 * 首页轮播图
 */
export const getBannerListAPI = () => {
  return http<BannerItem[]>({
    method: 'POST',
    url: '/banner/getBannerList',
  })
}

/**
 * 首页 今日必买
 */
export const getMustBuyGoodsAPI = () => {
  return http<MustBuyItem[]>({
    method: 'POST',
    url: '/goods/getMustBuyGoods',
  })
}
