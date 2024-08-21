/** 购物车类型 */
export type CartItem = {
  id: string
  user_id: string
  order_id: string
  source: string
  goods_id: string
  f_goods_id: string
  num: number
  units: string
  unit_price: string
  total_price: string
  cost_unit_price: string
  cost_total_price: string
  remark: string
  create_time: string
  update_time: string
  name: string
  goodsId: string
  fGoodsId: string
  images: string
  check: Boolean
}
