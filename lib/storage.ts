import { WatchlistItem } from '@/types';

const WATCHLIST_KEY = 'etf_tracker_watchlist';

/**
 * 获取自选列表
 */
export function getWatchlist(): WatchlistItem[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(WATCHLIST_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * 添加到自选列表
 */
export function addToWatchlist(item: WatchlistItem): boolean {
  const list = getWatchlist();
  if (!list.find(i => i.code === item.code)) {
    list.push(item);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
    return true;
  }
  return false; // 已存在
}

/**
 * 从自选列表删除
 */
export function removeFromWatchlist(code: string): void {
  const list = getWatchlist().filter(i => i.code !== code);
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
}

/**
 * 检查是否在自选列表中
 */
export function isInWatchlist(code: string): boolean {
  return getWatchlist().some(i => i.code === code);
}

/**
 * 清空自选列表
 */
export function clearWatchlist(): void {
  localStorage.removeItem(WATCHLIST_KEY);
}
