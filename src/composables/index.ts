import { addShoppingCartAPI, removeShoppingCartAPI, updateShoppingCartAPI } from '@/services/cart'
import { getGoodsCollectInfoAPI } from '@/services/goods'
import type { SolaShopGuessInstance } from '@/types/component'
import { ref } from 'vue'
/**
 *
 * @returns 猜你喜欢组合式函数
 */
export const useGuessList = () => {
  // 获取猜你喜欢组件实例
  const guessRef = ref<SolaShopGuessInstance>()
  // 滚动触底
  const onScrollToLower = () => {
    guessRef.value?.getMore()
  }

  // 返回ref 和 事件处理函数
  return {
    guessRef,
    onScrollToLower,
  }
}

export const useCollect = async (source: string, goodsId: string) => {
  const res = await getGoodsCollectInfoAPI({ source, goodsId })
  return res
}

// 添加购物车
export const useAddShoppingCart = async (data: any, num: number) => {
  const res = await addShoppingCartAPI({
    source: data.source,
    goodsId: data.goodsId,
    fGoodsId: data.fGoodsId,
    num,
    units: data.units,
    unitPrice: data.unitPrice,
  })
  return res
}

// 更新购物车
export const useUpdateShoppingCart = async (data: any, num: number) => {
  const res = await updateShoppingCartAPI({
    cartId: data.cartId,
    num,
    unitPrice: data.unitPrice,
    units: data.units,
  })
  return res
}

// 删除购物车
export const removeShoppingCart = async (cartId: string) => {
  const res = await removeShoppingCartAPI({
    cartId,
  })
  return res
}
