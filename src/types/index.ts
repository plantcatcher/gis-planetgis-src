export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export interface SectionConfig {
  id: string;
  key: string;
  title: string;
  is_active: boolean;
  order_index: number;
}

export interface BrandProfile {
  id: string;
  name: string;
  bio: string;
  avatar_url?: string;
  banner_url?: string;
}

export type ItemType = 'work' | 'tool' | 'subdomain';

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  description?: string;
  image_url?: string;
  link?: string;
  order_index: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  icon_name?: string;
  url: string;
  order_index: number;
}

export interface SiteSettings {
  copyright: string;
  privacy_policy: string;
  footer_text: string;
}

