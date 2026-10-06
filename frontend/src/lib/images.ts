export const FALLBACK_STAY_IMAGE = 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85';

export function getListingImageUrl(source?: string, width = 1200): string {
  if (!source) return FALLBACK_STAY_IMAGE;
  try {
    const url = new URL(source);
    if (url.hostname.endsWith('images.unsplash.com')) {
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('w', String(width));
      url.searchParams.set('q', '85');
      return url.toString();
    }
  } catch {
    return source;
  }
  return source;
}

import type { SyntheticEvent } from 'react';

export function useImageFallback(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = FALLBACK_STAY_IMAGE;
}
