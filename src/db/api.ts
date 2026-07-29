import { supabase } from './supabase';
import { SectionConfig, BrandProfile, Item, SocialLink, SiteSettings } from '@/types';

export const api = {
  // Sections
  async getSections() {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .order('order_index', { ascending: true });
    if (error) throw error;
    return data as SectionConfig[];
  },

  async updateSection(id: string, updates: Partial<SectionConfig>) {
    const { error } = await supabase.from('sections').update(updates).eq('id', id);
    if (error) throw error;
  },

  // Brand Profile
  async getBrandProfile() {
    const { data, error } = await supabase.from('brand_profile').select('*').single();
    if (error) throw error;
    return data as BrandProfile;
  },

  async updateBrandProfile(id: string, updates: Partial<BrandProfile>) {
    const { error } = await supabase.from('brand_profile').update(updates).eq('id', id);
    if (error) throw error;
  },

  // Items (Works, Tools, Subdomains)
  async getItems(type?: string) {
    let query = supabase.from('items').select('*').order('order_index', { ascending: true });
    if (type) {
      query = query.eq('type', type);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as Item[];
  },

  async upsertItem(item: Partial<Item>) {
    const { error } = await supabase.from('items').upsert(item);
    if (error) throw error;
  },

  async delete