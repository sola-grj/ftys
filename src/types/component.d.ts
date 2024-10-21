/**
 * declare module '@vue/runtime-core'
 *   现调整为
 * declare module 'vue'
 */
import SolaShopSwiper from '@/components/SolaShopSwiper.vue'
import SolaShopGuess from '@/components/SolaShopGuess.vue'
import SolaShopHeader from '@/components/SolaShopHeader.vue'
import 'vue'
declare module 'vue' {
  export interface GlobalComponents {
    //
    SolaShopSwiper: typeof SolaShopSwiper
    SolaShopGuess: typeof SolaShopGuess
    SolaShopHeader: typeof SolaShopHeader
  }
}

// 组件实例类型
export type SolaShopGuessInstance = InstanceType<typeof SolaShopGuess>
