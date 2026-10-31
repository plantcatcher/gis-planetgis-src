/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Tawk.to Property ID（可选；与 WIDGET_ID 同时配置才会加载客服） */
  readonly VITE_TAWK_PROPERTY_ID?: string;
  /** Tawk.to Widget ID */
  readonly VITE_TAWK_WIDGET_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
