import { useEffect } from 'react';

/**
 * Tawk.to 在线客服（可选）
 *
 * 接入方式：
 *   1. 在 Tawk.to 后台复制 Widget Code，地址形如
 *      https://embed.tawk.to/<PROPERTY_ID>/<WIDGET_ID>
 *   2. 站点已内置当前账号的公开 ID；如需换号，可用构建环境变量覆盖：
 *      VITE_TAWK_PROPERTY_ID / VITE_TAWK_WIDGET_ID
 *   3. 重新构建部署（Vite 的环境变量是构建期注入的，不是运行时读取）。
 *
 * 设计取舍：
 * - 使用 Tawk 自带的气泡和聊天面板，不在主站里重复实现一套 IM UI；
 *   后续如果想换自定义按钮，再通过 Tawk_API.hideWidget / maximize 接管即可。
 * - 只注入脚本、不产出 DOM，因此不会影响 SSG 预渲染与 hydration 树。
 * - 全屏地图/游戏页通过 hidden 隐藏，避免聊天气泡压在地图画面上。
 * - 两个 ID 格式不对时静默禁用，避免线上出现一个永远打不开的客服入口。
 * - Tawk.to 在中国大陆的可达性不稳定；本站保留 Contact 页邮箱作为兜底渠道。
 */

const TAWK_SCRIPT_ID = 'tawk-to-widget';
// Tawk 的 Property / Widget ID 本身就是公开值，会出现在前端脚本里。
// 这里内置当前站点的 ID，保证不配置环境变量也能直接工作；换号时可用环境变量覆盖。
const DEFAULT_PROPERTY_ID = '6ae60ac9a785fa3c3637cde5';
const DEFAULT_WIDGET_ID = '1k699k9fn';
const PROPERTY_ID =
  import.meta.env.VITE_TAWK_PROPERTY_ID?.trim() || DEFAULT_PROPERTY_ID;
const WIDGET_ID =
  import.meta.env.VITE_TAWK_WIDGET_ID?.trim() || DEFAULT_WIDGET_ID;
const TAWK_ENABLED =
  /^[a-zA-Z0-9]+$/.test(PROPERTY_ID) && /^[a-zA-Z0-9]+$/.test(WIDGET_ID);

type TawkApi = {
  onLoad?: () => void;
  hideWidget?: () => void;
  showWidget?: () => void;
};

declare global {
  interface Window {
    Tawk_API?: TawkApi;
    Tawk_LoadStart?: Date;
  }
}

interface TawkChatProps {
  /** 全屏地图/游戏页传 true：已加载的客服会被隐藏，未加载时也不会发起请求。 */
  hidden?: boolean;
}

const TawkChat: React.FC<TawkChatProps> = ({ hidden = false }) => {
  useEffect(() => {
    if (!TAWK_ENABLED) return;

    const api = (window.Tawk_API = window.Tawk_API || {});
    api.onLoad = () => {
      if (hidden) api.hideWidget?.();
      else api.showWidget?.();
    };

    // StrictMode 下 effect 会执行两次；脚本只允许注入一次。
    if (document.getElementById(TAWK_SCRIPT_ID)) {
      if (hidden) api.hideWidget?.();
      else api.showWidget?.();
      return;
    }

    if (hidden) return;

    window.Tawk_LoadStart = new Date();
    const script = document.createElement('script');
    script.id = TAWK_SCRIPT_ID;
    script.async = true;
    script.src = `https://embed.tawk.to/${PROPERTY_ID}/${WIDGET_ID}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    script.onerror = () => script.remove();
    document.head.appendChild(script);
  }, [hidden]);

  return null;
};

export default TawkChat;
