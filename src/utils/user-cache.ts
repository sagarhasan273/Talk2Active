export interface CachedUserInfo {
  userId: string;
  name: string;
  avatarUrl?: string;
}

const USER_CACHE_KEY = 'room_users_cache';

// In-memory cache to prevent repetitive JSON.parse calls in list renders
const memoryCache = new Map<string, CachedUserInfo>();

// Initialize memory cache from sessionStorage once on load
const initCache = () => {
  if (typeof window === 'undefined' || memoryCache.size > 0) return;
  try {
    const raw = sessionStorage.getItem(USER_CACHE_KEY);
    if (raw) {
      const parsed: Record<string, CachedUserInfo> = JSON.parse(raw);
      Object.entries(parsed).forEach(([id, data]) => memoryCache.set(id, data));
    }
  } catch (err) {
    console.error('Failed to parse user cache:', err);
  }
};

export const cacheUserInfo = (user: CachedUserInfo) => {
  if (!user?.userId) return;
  initCache();

  // 1. Instant update in memory
  memoryCache.set(user.userId, user);

  // 2. Persist to sessionStorage
  try {
    const serialized = JSON.stringify(Object.fromEntries(memoryCache));
    sessionStorage.setItem(USER_CACHE_KEY, serialized);
  } catch (err) {
    console.error('Failed to save user cache:', err);
  }
};

export const getCachedUserInfo = (userId: string): CachedUserInfo | null => {
  if (!userId) return null;
  initCache();
  return memoryCache.get(userId) || null;
};

// Call this in onLeaveRoom to clean up everything at once
export const clearUserCache = () => {
  memoryCache.clear();
  sessionStorage.removeItem(USER_CACHE_KEY);
};
