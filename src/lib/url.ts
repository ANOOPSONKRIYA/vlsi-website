import type { SocialLink } from '@/types';

const SCHEME_REGEX = /^[a-z][a-z0-9+.-]*:/i;

export function normalizeExternalUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();

  if (!trimmed) return '';
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (SCHEME_REGEX.test(trimmed)) return trimmed;

  return `https://${trimmed}`;
}

export function normalizeSocialUrl(
  platform: SocialLink['platform'],
  rawUrl: string
): string {
  const trimmed = rawUrl.trim();

  if (!trimmed) return '';

  if (platform === 'email') {
    return trimmed.toLowerCase().startsWith('mailto:') ? trimmed : `mailto:${trimmed}`;
  }

  return normalizeExternalUrl(trimmed);
}
