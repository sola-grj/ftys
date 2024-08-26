/** 订单状态枚举 1:待支付;2:已支付(待发货);3:已发货(待收货);4:待售后(已提交售后申请):5:售后处理完毕;6:已收货; */
export enum OrderState {
  /** 待付款 */
  DaiFuKuan = '1',
  /** 待发货 */
  DaiFaHuo = '2',
  /** 待收货 */
  DaiShouHuo = '3',
  /** 待售后 */
  DaiShouHou = '4',
  /** 售后完毕 */
  SHWanBi = '5',
  /** 已收货 */
  YiShouHuo = '6',
}

/** 订单状态列表 */
export const orderStateList = [
  { id: '0', text: '' },
  { id: '1', text: '待付款' },
  { id: '2', text: '待发货' },
  { id: '3', text: '待收货' },
  { id: '4', text: '待评价' },
  { id: '5', text: '已完成' },
  { id: '6', text: '已取消' },
]
