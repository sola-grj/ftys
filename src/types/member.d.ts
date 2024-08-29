// src/types/member.d.ts
type BaseProfile = {
  /** 用户ID */
  id: number
  /** 头像  */
  avatar: string
  /** 账户名  */
  account: string
  /** 昵称 */
  nickname?: string
}

/** 小程序登录 登录用户信息 */
export type LoginResult = {
  userinfo: {
    type_id: number // 1:业务员 2:司机 3:生鲜 4:干货 5:生鲜&干货
    user_role: string // 1:主账号 2:子账号
    sub_account_name: string // 子账号名称
    sub_account_level: string
    username: string
    mobile: string
    receive_way: string // 	收货方式:deliver:送货上门,pick_up:用户自提
    pay_way: string // 支付方式:credit:赊账,online:在线支付
    avatar: string
    money: string // 账户余额
    credit_money: string // 欠款余额
    token: string // 唯一标识
    account_status: string // 权限判断（未知位置权限）
    goods_price: string // 权限判断（商品价格，不用处理）
    credit_price: string // 权限判断（是否显示欠款情况）
    shipping_addr: string
    shipping_area: string
    company: string
    driver_id: string
    id: string
    user_id: string
  }
}
/** 个人信息 用户详情信息 */
export type ProfileDetail = BaseProfile & {
  /** 性别 */
  gender?: Gender
  /** 生日 */
  birthday?: string
  /** 省市区 */
  fullLocation?: string
  /** 职业 */
  profession?: string
}
/** 性别 */
export type Gender = '女' | '男'

/** 个人信息 修改请求体参数 */
export type ProfileParams = Pick<
  ProfileDetail,
  'nickname' | 'gender' | 'birthday' | 'profession'
> & {
  /** 省份编码 */
  provinceCode?: string
  /** 城市编码 */
  cityCode?: string
  /** 区/县编码 */
  countyCode?: string
}
