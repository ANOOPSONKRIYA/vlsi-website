// Site settings management using localStorage
// This will be replaced with database calls when connected

export interface SiteSettings {
  siteName: string;
  contactEmail: string;
  heroVideoUrl: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'VLSI & AI Robotics Lab',
  contactEmail: 'contact@lab.edu',
  heroVideoUrl: 'https://ik.imagekit.io/asdflkj/Drone_Flying_Video_Generation.mp4?updatedAt=1770105351047',
};

const STORAGE_KEY = 'vlsi_site_settings';

export function getSettings(): SiteSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_SETTINGS;
  
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<SiteSettings>): void {
  if (typeof window === 'undefined') return;
  
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function getHeroVideoUrl(): string {
  return getSettings().heroVideoUrl;
}
