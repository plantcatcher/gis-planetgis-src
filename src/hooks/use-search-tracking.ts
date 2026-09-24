import * as React from 'react';
import { trackSearch } from '@/lib/analytics';
import { useDebounce } from './use-debounce';

/**
 * 站内搜索框埋点。
 *
 * 本站搜索框是「边输边过滤」，逐字上报会把 search_term 塞满中间态关键词，
 * 所以：先防抖（默认 900ms，用户停下才认为是一次搜索），再交给 trackSearch
 * 做会话内去重。context 用来区分是哪个搜索框（learn / resources / home）。
 */
export function useSearchTracking(term: string, context: string, delay = 900) {
  const debounced = useDebounce(term, delay);

  React.useEffect(() => {
    const t = debounced.trim();
    if (t) trackSearch(t, context);
  }, [debounced, context]);
}
