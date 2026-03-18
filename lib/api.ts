import { IndexData, HistoricalPE, ComponentStock } from '@/types';

/**
 * 从 Next.js API 代理获取指数数据（避免 CORS 问题）
 */
export async function fetchIndexDataFromProxy(
  code: string,
  market: 'CN' | 'HK' | 'US'
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
      pePercentile: 50, // 需要计算
      pbPercentile: 50,
    };
  } catch (error) {
    console.error('Failed to fetch index data:', error);
    return null;
  }
}

/**
 * 从东方财富获取指数数据（备用）
 */
export async function fetchIndexDataFromEastMoney(
  code: string,
  market: 'CN' | 'HK'
): Promise<IndexData | null> {
  // 在生产环境使用 API 代理
  if (process.env.NODE_ENV === 'production') {
    return fetchIndexDataFromProxy(code, market);
  }
  
  // 本地开发直接调用（可能有 CORS 问题）
  try {
    const secid = market === 'CN' ? `1.${code}` : `100.${code}`;
    const fields = 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f53,f54,f55,f56,f57,f128,f129,f130,f131,f132,f133,f134,f135,f136,f137,f138,f139,f140,f141,f142,f143,f144,f145,f146,f147,f148,f149,f150';
    const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=${fields}`;
    
    const response = await fetch(url);
    const json = await response.json();
    
    if (!json.data) return null;
    
    const data = json.data;
    return {
      code,
      name: data.f58 || 'Unknown',
      price: data.f43 || 0,
      change: data.f44 || 0,
      changePercent: data.f45 || 0,
      pe: data.f128 || 0,
      pb: data.f129 || 0,
      pePercentile: 50,
      pbPercentile: 50,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to fetch index data:', error);
    return null;
  }
}

/**
 * 从雅虎财经获取美股指数数据
 */
export async function fetchIndexDataFromYahoo(code: string): Promise<IndexData | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${code}?interval=1d&range=1d`;
    
    const response = await fetch(url);
    const json = await response.json();
    
    if (!json.chart?.result?.[0]) return null;
    
    const result = json.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators?.quote?.[0];
    
    const price = quote?.close?.[0] || 0;
    const prevClose = meta.previousClose || price;
    const change = price - prevClose;
    const changePercent = (change / prevClose) * 100;
    
    return {
      code,
      name: meta.symbol || 'Unknown',
      price,
      change,
      changePercent,
      pe: 0, // 雅虎财经需要额外获取
      pb: 0,
      pePercentile: 50,
      pbPercentile: 50,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to fetch Yahoo data:', error);
    return null;
  }
}

/**
 * 获取历史 PE 数据（从本地文件）
 */
export async function fetchHistoricalPE(code: string): Promise<HistoricalPE[]> {
  try {
    // 在生产环境，从 /data/historical-pe 加载
    const module = await import(`@/data/historical-pe/${code}.json`);
    return module.data || [];
  } catch (error) {
    console.warn(`No historical PE data for ${code}, returning empty array`);
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
