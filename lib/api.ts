import { IndexData, HistoricalPE, ComponentStock } from '@/types';

// 判断是否在服务端
const isServer = typeof window === 'undefined';

/**
 * 从腾讯财经获取指数数据（通过 API 代理）
 */
export async function fetchIndexDataFromEastMoney(
  code: string,
  market: 'CN' | 'HK'
): Promise<IndexData | null> {
  try {
    const response = await fetch(`/api/index/${encodeURIComponent(code)}?market=${market}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.error) return null;
    return { ...data, pePercentile: 50, pbPercentile: 50 };
  } catch (error) {
    console.error('Failed to fetch index data:', error);
    return null;
  }
}

/**
 * 从腾讯财经获取美股指数数据（通过 API 代理）
 */
export async function fetchIndexDataFromYahoo(code: string): Promise<IndexData | null> {
  try {
    const response = await fetch(`/api/index/${encodeURIComponent(code)}?market=US`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.error) return null;
    return { ...data, pePercentile: 50, pbPercentile: 50 };
  } catch (error) {
    console.error('Failed to fetch US data:', error);
    return null;
  }
}

/**
 * 获取历史 PE 数据（通过 API 路由，客户端/服务端通用）
 */
export async function fetchHistoricalPE(code: string): Promise<HistoricalPE[]> {
  try {
    // 服务端时使用绝对 URL
    const baseUrl = isServer
      ? process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `http://localhost:${process.env.PORT ?? 3000}`
      : '';
    const response = await fetch(`${baseUrl}/api/historical-pe/${encodeURIComponent(code)}`);
    if (!response.ok) return [];
    const json = await response.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}

/**
 * 获取成分股数据
 */
export async function fetchComponentStocks(code: string): Promise<ComponentStock[]> {
  return [];
}
