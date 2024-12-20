import type { CartItem } from '@/types/cart'
import { http } from '@/utils/http'
/**
 * 加入购物车
 * @param data 请求体参数
 */
export const postMemberCartAPI = (data: { skuId: string; count: number }) => {
  return http({
    method: 'POST',
    url: '/member/cart',
    data,
  })
}

/**
 * 获取购物车列表
 */
export const getMemberCartAPI = () => {
  return http<CartItem[]>({
    method: 'GET',
    url: '/member/cart',
  })
}

/**
 * 删除/清空购物车单品
 * @param data 请求体参数 ids SKUID 集合
 */
export const deleteMemberCartAPI = (data: { ids: string[] }) => {
  return http({
    method: 'DELETE',
    url: '/member/cart',
    data,
  })
}

/**
 * 修改购物车单品
 * @param skuId SKUID
 * @param data selected 选中状态 count 商品数量
 */
export const putMemberCartBySkuIdAPI = (
  skuId: string,
  data: { selected?: boolean; count?: number },
) => {
  return http({
    method: 'PUT',
    url: `/member/cart/${skuId}`,
    data,
  })
}

/**
 * 购物车全选/取消全选
 * @param data selected 是否选中
 */
export const putMemberCartSelectedAPI = (data: { selected: boolean }) => {
  return http({
    method: 'PUT',
    url: '/member/cart/selected',
    data,
  })
}

// ************

export type AddShoppingCartDataType = {
  source: string
  goodsId: string
  fGoodsId: string
  num: number
  units: string
  unitPrice: string
  remark?: string
}

export type UpdateShoppingCartDataType = {
  cartId: string
  num: number
  unitPrice: string
  units: string
}
/**
 * 添加购物车
 * @param data selected 是否选中
 */
export const addShoppingCartAPI = (data: AddShoppingCartDataType) => {
  return http<{ cartId: string; goodsNum: number; shoppingCartNum: number }>({
    method: 'POST',
    url: '/shopping_cart/addShoppingCart',
    data,
  })
}

/**
 * 更新购物车
 * @param data selected 是否选中
 */
export const updateShoppingCartAPI = (data: UpdateShoppingCartDataType) => {
  return http<{ cartId: string; goodsNum: number; shoppingCartNum: number }>({
    method: 'POST',
    url: '/shopping_cart/updateShoppingCart',
    data,
  })
}

/**
 * 购物车列表
 * @param
 */
export const getShoppingCartAPI = () => {
  return http<CartItem[]>({
    method: 'POST',
    url: '/shopping_cart/getShoppingCart',
  })
}

/**
 * 删除购物车
 * @param
 */
export const removeShoppingCartAPI = (data: { cartId: string }) => {
  return http<{ shoppingCartNum: number }>({
    method: 'POST',
    url: '/shopping_cart/removeShoppingCart',
    data,
  })
}

/**
 * 批量添加购物车
 * @param data selected 是否选中
 */
export const batchAddShoppingCartAPI = (data: { goodsList: AddShoppingCartDataType[] }) => {
  return http<{ cartId: string; goodsNum: number }>({
    method: 'POST',
    url: '/shopping_cart/batchAddShoppingCart',
    data,
  })
}
