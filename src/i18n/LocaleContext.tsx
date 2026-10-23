import React, { createContext, useContext, useMemo } from 'react';
import type { Lang } from './config';
import { DEFAULT_LANG } from './config';
import { zh } from './dict.zh';
import { en } from './dict.en';

// ===== 词典 =====
// zh 是 key 的唯一来源（Dict 类型由它推导）。en 声明成 Record<keyof typeof zh, string>：
// 任何漏翻的 key 会直接在 tsc 阶段报错，不会等到线上才显示中文或空白。
// Dict 定义在 dict.zh.ts 而非本文件：dict.en.ts 要用它做类型约束，
// 若定义在这里会与 dict.en.ts 形成运行时循环引用。
export type { Dict } from './dict.zh';
import type { Dict } from './dict.zh';
export type DictKey = keyof Dict;

const DICTS: Record<Lang, Dict> = {
  zh,
  en: en as Dict,
};

/** 插值变量：t('a.b', { n: 3 }) 会把模板里的 {n} 替换成 3 */
export type Vars = Record<string, string | number>;

function interpolate(tpl: string, vars?: Vars): string {
  if (!vars) return tpl;
  return tpl.replace(/\{(\w+)\}/g, (m, k: string) =>
    Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : m,
  );
}

export interface LocaleValue {
  lang: Lang;
  /** 取词条。key 不存在时回退到中文，再不存在时返回 key 本身（便于开发期定位）。 */
  t: (key: DictKey, vars?: Vars) => string;
}

const LocaleContext = createContext<LocaleValue>({
  lang: DEFAULT_LANG,
  t: (key) => (zh[key] as string) ?? key,
});

/**
 * 语言上下文。lang 必须由调用方从 URL 推导后传入（见 config.ts 顶部说明），
 * 组件内部不读 localStorage / navigator.language，保证 SSG 首帧与客户端一致。
 *
 * ⚠️ 本组件内部无条件调用 Hook（useMemo 恒定执行），不要在它外层写
 * `if (...) return null` 再渲染 —— 那会导致首帧与后续渲染的 Hook 数不一致（React #310）。
 */
export const LocaleProvider: React.FC<{ lang: Lang; children: React.ReactNode }> = ({
  lang,
  children,
}) => {
  const value = useMemo<LocaleValue>(
    () => ({
      lang,
      t: (key, vars) => {
        const raw = DICTS[lang]?.[key] ?? DICTS.zh[key] ?? key;
        return interpolate(raw as string, vars);
      },
    }),
    [lang],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

/** 取当前语言与翻译函数 */
export function useI18n(): LocaleValue {
  return useContext(LocaleContext);
}

/** 只要翻译函数的便捷写法 */
export function useT(): LocaleValue['t'] {
  return useContext(LocaleContext).t;
}
