import { IndexData, HistoricalPE, ComponentStock } from '@/types';

/**
 * 从腾讯财经获取指数数据（通过 API 代理）
 */
export async function fetchIndexDataFromEastMoney(
  code: string,
  market: 'CN' | 'HK'
): Promise<IndexData | null> {
  try {
    const url = `/api/index/${code}?market=${market}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error('API Error:', data.error);
      return null;
    }
    
    return {
      ...data,
      pePercentile: 50,
      pbPercentile: 50,
    };
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
    const url = `/api/index/${code}?market=US`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error('API Error:', data.error);
      return null;
    }
    
    return {
      ...data,
      pePercentile: 50,
      pbPercentile: 50,
    };
  } catch (error) {
    console.error('Failed to fetch Yahoo data:', error);
    return null;
  }
}

/**
 * 获取历史 PE 数据（通过 API 路由加载，避免动态 import 在生产环境报错）
 */
export async function fetchHistoricalPE(code: string): Promise<HistoricalPE[]> {
  try {
    const response = await fetch(`/api/historical-pe/${code}`);
    if (!response.ok) return [];
    const json = await response.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.warn(`No historical PE data for ${code}`);
    return [];
  }
}

/**
 * 获取成分股数据
 */
export async function fetchComponentStocks(code: string): Promise<ComponentStock[]> {
  // TODO: 从东方财富 API 获取成分股
  // 这里先返回示例数据
  return [
    { code: '300059', name: '东方财富', weight: 14.28 },
    { code: '600030', name: '中信证券', weight: 13.40 },
    { code: '601688', name: '华泰证券', weight: 6.27 },
  ];
}
