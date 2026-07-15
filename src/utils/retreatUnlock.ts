import { Retreat } from '@/types/retreat';

const UNLOCK_STORAGE_KEY = 'retreat_unlocked_ids';

export const getRetreatUnlockKey = (retreat?: Partial<Retreat> | null): string => {
  const parts = [
    retreat?.id,
    retreat?.sourceUrl,
    retreat?.name,
    retreat?.location,
    retreat?.country,
    retreat?.duration,
    retreat?.price,
  ];

  const normalized = parts
    .filter((value): value is string | number => value != null && String(value).trim() !== '')
    .map((value) => String(value).trim().toLowerCase())
    .join('::');

  return normalized || 'unknown-retreat';
};

export const isRetreatUnlocked = (
  retreat: Partial<Retreat> | null | undefined,
  unlockedRetreatKeys: string[] = [],
): boolean => {
  const normalizedKeys = (unlockedRetreatKeys || [])
    .filter((value): value is string => typeof value === 'string' && value.trim() !== '')
    .map((value) => value.trim().toLowerCase());

  if (normalizedKeys.length === 0) return false;

  const fallbackId = retreat?.id?.trim().toLowerCase();
  const key = getRetreatUnlockKey(retreat).toLowerCase();

  return normalizedKeys.some((storedKey) => storedKey === key || storedKey === fallbackId);
};

export const readUnlockedRetreatKeys = (): string[] => {
  if (typeof window === 'undefined' || !window.sessionStorage) return [];

  try {
    const raw = window.sessionStorage.getItem(UNLOCK_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

export const writeUnlockedRetreatKeys = (keys: string[]) => {
  if (typeof window === 'undefined' || !window.sessionStorage) return;

  const next = Array.from(new Set(keys.filter((item): item is string => typeof item === 'string' && item.trim() !== '')));
  window.sessionStorage.setItem(UNLOCK_STORAGE_KEY, JSON.stringify(next));
};

export const appendUnlockedRetreatKey = (
  retreat: Partial<Retreat> | null | undefined,
  currentKeys: string[] = [],
): string[] => {
  const next = Array.from(
    new Set([
      ...currentKeys,
      getRetreatUnlockKey(retreat),
      retreat?.id?.trim() || '',
    ].filter((item): item is string => typeof item === 'string' && item.trim() !== '')),
  );

  writeUnlockedRetreatKeys(next);
  return next;
};
