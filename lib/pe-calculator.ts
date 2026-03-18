import { HistoricalPE } from '@/types';

/**
 * 计算 PE 百分位
 * @param currentPE 当前 PE
 * @param historicalPE 历史 PE 数据数组
 * @returns 百分位 (0-100)
 */
export function calculatePEPercentile(currentPE: number, historicalPE: HistoricalPE[]): number {
  const valid = historicalPE.filter(h => h.pe > 0 && h.pe < 1000); // 过滤异常值
  if (valid.length === 0) return 50;
  
  const below = valid.filter(h => h.pe < currentPE).length;
  return Math.round((below / valid.length) * 100);
}

/**
 * 计算 PB 百分位
 */
export function calculatePBPercentile(currentPB: number, historicalPE: HistoricalPE[]): number {
  const valid = historicalPE.filter(h => h.pb > 0 && h.pb < 100);
  if (valid.length === 0) return 50;
  
  const below = valid.filter(h => h.pb < currentPB).length;
  return Math.round((below / valid.length) * 100);
}

/**
 * 根据百分位获取估值状态
 */
export function getValuationStatus(percentile: number): 'low' | 'mid' | 'high' {
  if (percentile < 30) return 'low';    // 低估
  if (percentile < 70) return 'mid';    // 中性
  return 'high';                         // 高估
}

/**
 * 获取估值状态文本
 */
export function getValuationText(percentile: number): string {
  if (percentile < 20) return '极低估';
  if (percentile < 30) return '低估';
  if (percentile < 50) return '偏低';
  if (percentile < 70) return '中性';
  if (percentile < 80) return '偏高';
  if (percentile < 90) return '高估';
  return '极高估';
}

/**
 * 获取估值颜色类名
 */
export function getValuationColorClass(percentile: number): string {
  if (percentile < 30) return 'text-green-600 bg-green-50';
  if (percentile < 70) return 'text-gray-600 bg-gray-50';
  return 'text-red-600 bg-red-50';
}

/**
 * 获取历史 PE 统计数据
 */
export function getPEStats(historicalPE: HistoricalPE[]) {
  const valid = historicalPE.filter(h => h.pe > 0 && h.pe < 1000);
  if (valid.length === 0) {
    return { min: 0, max: 0, avg: 0, median: 0 };
  }
  
  const pes = valid.map(h => h.pe).sort((a, b) => a - b);
  const min = pes[0];
  const max = pes[pes.length - 1];
  const avg = pes.reduce((a, b) => a + b, 0) / pes.length;
  const median = pes[Math.floor(pes.length / 2)];
  
  return { min, max, avg, median };
}
