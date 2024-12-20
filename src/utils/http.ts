function debounce(func: any, wait = 500) {
  // 定义定时器变量
  let timeout = null
  // 清除定时器
  if (timeout !== null) clearTimeout(timeout)
  //设置定时器
  timeout = setTimeout(() => {
    typeof func === 'function' && func()
  }, wait)
}
/**
 * 添加拦截器
 *  拦截request请求
 *  拦截uploadFile文件上传
 *
 * TODO
 *  1.非http开头需要拼接地址
 *  2.请求超时
 *  3.添加小程序端请求标识
 *  4.添加token请求头标识
 */

import { useMemberStore } from '@/stores'

// const baseURL = 'https://pcapi-xiaotuxian-front-devtest.itheima.net'
// const baseURL = 'http://47.95.197.8/api/'
const baseURL = 'https://ksshop.snooowball.cn/api'

// 添加拦截器
const httpInterceptor = {
  // 拦截前触发
  invoke(options: UniApp.RequestOptions) {
    uni.showLoading({
      title: '加载中',
    })
    // 1.非http开头需要拼接地址
    if (!options.url.startsWith('http')) {
      options.url = baseURL + options.url
    }
    // 2.请求超时，默认60s
    options.timeout = 600000
    // 3.添加小程序端请求标识
    options.header = {
      ...options.header,
      'source-client': 'miniapp',
    }
    // 4.添加token请求头标识
    const memberStore = useMemberStore()
    const token = memberStore.profile?.userinfo ? memberStore.profile.userinfo.token : null
    if (token) {
      uni.setStorageSync('token_expired', false)
      options.header.token = token
    }
    uni.hideLoading()
    console.log(options)
  },
}
uni.addInterceptor('request', httpInterceptor)
uni.addInterceptor('uploadFile', httpInterceptor)
uni.addInterceptor('downloadFile', httpInterceptor)

/**
 * 请求函数
 * @param UniApp.RequestOptions
 * @returns Promise
 * 1.返回Promise对象
 * 2.请求成功
 *  2.1 提取核心数据 res.data
 *  2.2 添加类型，支持泛型
 * 3.请求失败
 *  3.1 网络错误 提示用户更换网络
 *  3.2 401错误 清理用户信息，跳转到登路页面
 *  3.3 其他错误 根据后端错误提示轻提示
 */

interface Data<T> {
  code: string
  msg: string
  time: string
  result: T
}
// 2.2 添加类型，支持泛型
export const http = <T>(options: UniApp.RequestOptions) => {
  return new Promise<Data<T>>((resolve, reject) => {
    uni.request({
      ...options,
      // 2.请求成功
      success(res) {
        uni.hideLoading()
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 2.1 提取核心数据 res.data
          resolve(res.data as Data<T>)
        } else if (res.statusCode === 401) {
          const exists = uni.getStorageSync('token_expired') || false
          if (!exists) {
            uni.setStorageSync('token_expired', true)
            uni.showModal({
              content: res.data.msg,
              success: (res) => {
                console.log('^^^^^^^^^^^^^^^^^^^^', res)

                // 3.2 401错误 清理用户信息，跳转到登路页面
                const memberStore = useMemberStore()
                memberStore.clearProfile()
                uni.reLaunch({ url: '/PagesOrder/login/login' })
                reject(res)
              },
            })
          }
        } else {
          // 3.3 其他错误 根据后端错误提示轻提示
          uni.showToast({
            icon: 'none',
            title: (res.data as Data<T>).msg || res.data || '请求错误',
          })
          reject(res)
        }
      },
      // 响应失败
      fail(err) {
        uni.hideLoading()
        // 3.1 网络错误 提示用户更换网络
        uni.showToast({
          icon: 'none',
          title: '网络错误，换个网络试试',
        })
        reject(err)
      },
    })
  })
}
