// 自选列表项
export interface WatchlistItem {
  code: string;        // 指数代码，如 "399975" 或 "HSTECH"
  name: string;        // 名称，如 "证券公司" 或 "恒生科技"
  type: 'index' | 'stock';  // 类型
  addedAt: number;     // 添加时间戳
  market: 'CN' | 'HK' | 'US'; // 市场
}

// 指数数据
export interface IndexData {
  code: string;
  name: string;
  price: number;           // 当前点位
  change: number;          // 涨跌
  changePercent: number;   // 涨跌幅
  pe: number;              // 当前 PE
  pb: number;              // 当前 PB
  pePercentile: number;    // PE 百分位 (0-100)
  pbPercentile: number;    // PB 百分位
  updatedAt: string;       // 更新时间
}

// 历史 PE 数据
export interface HistoricalPE {
  date: string;    // 日期 "2024-01-15"
  pe: number;      // 市盈率
  pb: number;      // 市净率
  price: number;   // 点位
}

// 成分股
export interface ComponentStock {
  code: string;
  name: string;
  weight: number;  // 权重百分比
  price?: number;  // 股价（可选）
  change?: number; // 涨跌幅（可选）
}

// 搜索结果
export interface SearchResult {
  code: string;
  name: string;
  market: 'CN' | 'HK' | 'US';
  type: 'index' | 'stock';
}
