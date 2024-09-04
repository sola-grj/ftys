// src/services/login.ts
import type { LoginResult } from '@/types/member'
import { http } from '@/utils/http'

// 小程序
type LoginParams = {
  code: string
  encryptedData: string
  iv: string
}

// 账号密码
type UserLoginParams = {
  account: string
  password: string
}

// 短信验证码登录
type verigyCodeLoginParams = {
  mobile: string
  captcha: string
}

// 短信验证码参数
type smsParams = {
  mobile: string
  event: string // register login
}

// 用户注册参数
type RegisterParams = {
  username: string
  password: string
  mobile: string
  code: string
  type_id: string //	3:生鲜;4:干货;5:生鲜&干货
  sub_account_level: string //	创建子账号时需要,111,分别对应账号状态,商品价格,签约金额是否显示,1显示,0不显示
  company_lon: string //	经度
  company_lat: string //	string	纬度
  company_province: string
  compnay_city: string
  company_area: string
  company_addr: string
  company: string
  shipping_lon: string
  shipping_lat: string
  shipping_province: string
  shipping_city: string
  shipping_area: string
  shipping_addr: string
  images: string
  sale_id: string
}

type ResetPwdParams = {
  mobile: string
  newpassword: string
  captcha: string
  picCode: string
}
/**
 * 小程序登录
 * @param data 请求参数
 */
export const postLoginWxMinAPI = (data: LoginParams) => {
  return http<LoginResult>({
    method: 'POST',
    url: '/login/wxMin',
    data,
  })
}

/**
 * 小程序登录_内测版
 * @param phoneNumber 模拟手机号码
 */
export const postLoginWxMinSimpleAPI = (phoneNumber: string) => {
  return http<LoginResult>({
    method: 'POST',
    url: '/login/wxMin/simple',
    data: {
      phoneNumber,
    },
  })
}

/**
 * 账号密码登录
 * @param data 请求参数
 */
export const userLoginAPI = (data: UserLoginParams) => {
  return http<LoginResult>({
    method: 'POST',
    url: '/user/login',
    data,
  })
}

/**
 * 验证码登录
 * @param data 请求参数
 */
export const verifyCodeLoginAPI = (data: verigyCodeLoginParams) => {
  return http<LoginResult>({
    method: 'POST',
    url: '/user/mobilelogin',
    data,
  })
}

/**
 * 获取短信验证码
 * @param data 请求参数
 */
export const getSmsAPI = (data: smsParams) => {
  return http({
    method: 'POST',
    url: '/sms/send',
    data,
  })
}

/**
 * 用户注册
 * @param data 请求参数
 */
export const userRegisterAPI = (data: RegisterParams) => {
  return http<LoginResult>({
    method: 'POST',
    url: '/user/register',
    data,
  })
}

/**
 * 找回密码
 * @param data 请求参数
 */
export const resetPwdAPI = (data: ResetPwdParams) => {
  return http({
    method: 'POST',
    url: '/user/resetpwd',
    data,
  })
}
