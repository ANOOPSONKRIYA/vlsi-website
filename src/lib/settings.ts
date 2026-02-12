// Site settings management using Supabase
import { supabase } from '@/lib/supabase';
import type { SiteSettings } from '@/types';

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'thinkbuildlabs',
  contactEmail: 'contact@lab.edu',
  contactPhone: '+1 (555) 123-4567',
  contactAddress: 'Engineering Building, Room 405\nUniversity Campus, CA 94305',
  heroVideoUrl: 'https://ik.imagekit.io/asdflkj/Drone_Flying_Video_Generation.mp4?updatedAt=1770105351047',
  footerDescription: 'Pushing the boundaries of silicon and intelligence through innovative research and collaborative learning.',
  footerSocialLinks: [
    { platform: 'github', url: 'https://github.com' },
    { platform: 'linkedin', url: 'https://linkedin.com' },
    { platform: 'twitter', url: 'https://twitter.com' },
    { platform: 'instagram', url: 'https://instagram.com' },
  ],
};

// All settings are stored in a single "primary" row. Using upsert with the
// unique `isPrimary` constraint keeps the table singleton and avoids the
// footer reading a different row than the admin page updates.
const SETTINGS_CONFLICT_KEY = 'isPrimary';

export async function getSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('isPrimary', true)
    .order('updatedAt', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching site settings:', error);
    return DEFAULT_SETTINGS;
  }

  return data ? { ...DEFAULT_SETTINGS, ...data } : DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const payload = {
    ...DEFAULT_SETTINGS,
    ...settings,
    isPrimary: true,
    updatedAt: new Date().toISOString(),
  } satisfies Partial<SiteSettings>;

  const { data, error } = await supabase
    .from('site_settings')
    .upsert(payload, { onConflict: SETTINGS_CONFLICT_KEY })
    .select()
    .single();

  if (error) {
    console.error('Error saving site settings:', error);
    throw error;
  }

  return { ...DEFAULT_SETTINGS, ...data };
}

export async function getHeroVideoUrl(): Promise<string> {
  const settings = await getSettings();
  return settings.heroVideoUrl;
}
