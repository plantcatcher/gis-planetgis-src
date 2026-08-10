// =============================================================================
// useLearning —— 把 Learning Store 接入 React 的响应式 Hook
// -----------------------------------------------------------------------------
// 采用 React 18 官方的 useSyncExternalStore：把「外部可变数据源」（localStorage
// 背后的 store）安全地接入组件渲染。它的核心作用是：
//   - 服务端渲染（SSG 预渲染）时用 getServerSnapshot（稳定空数据），避免
//     hydration mismatch，保证预渲染 DOM 与客户端首帧一致；
//   - 客户端挂载后切到 getSnapshot（真实本地数据），数据变化即通过订阅触发重渲染。
//
// 组件拿到的是「当前学习数据快照」，写操作统一走 learningService。
// =============================================================================

import { useSyncExternalStore } from 'react';
import { getSnapshot, getServerSnapshot, subscribe, type LearningData } from '@/lib/learningStore';

/** 订阅整个学习数据快照（任意字段变化都会触发组件重渲染） */
export function useLearningData(): LearningData {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export { getSnapshot, getServerSnapshot, subscribe };
export type { LearningData };
