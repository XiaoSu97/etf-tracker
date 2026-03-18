'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { IndexData, HistoricalPE } from '@/types';
import { fetchIndexDataFromEastMoney, fetchIndexDataFromYahoo, fetchHistoricalPE } from '@/lib/api';
import { calculatePEPercentile, calculatePBPercentile, getValuationText } from '@/lib/pe-calculator';

// 全市场指数配置
const MARKET_INDICES = {
  CN: [
    { code: '000001', name: '上证指数', market: 'CN' as const },
    { code: '000300', name: '沪深300', market: 'CN' as const },
    { code: '399975', name: '证券公司', market: 'CN' as const },
    { code: '399999', name: '基金指数', market: 'CN' as const },
  ],
  HK: [
    { code: 'HSI', name: '恒生指数', market: 'HK' as const },
    { code: 'HSTECH', name: '恒生科技', market: 'HK' as const },
  ],
  US: [
    { code: '^DJI', name: '道琼斯', market: 'US' as const },
    { code: '^GSPC', name: '标普500', market: 'US' as const },
    { code: '^IXIC', name: '纳斯达克', market: 'US' as const },
  ],
};

// 百分位颜色配置
function getPercentileStyle(pct: number) {
  if (pct < 20) return { color: '#16a34a', bg: '#f0fdf4', label: '极低估', ring: 'ring-green-200' };
  if (pct < 40) return { color: '#22c55e', bg: '#f0fdf4', label: '低估', ring: 'ring-green-100' };
  if (pct < 60) return { color: '#94a3b8', bg: '#f8fafc', label: '中性', ring: 'ring-gray-200' };
  if (pct < 80) return { color: '#f97316', bg: '#fff7ed', label: '偏高', ring: 'ring-orange-100' };
  return { color: '#ef4444', bg: '#fef2f2', label: '高估', ring: 'ring-red-100' };
}

// 圆形百分位指示器
function PercentileRing({ percentile, size = 56 }: { percentile: number; size?: number }) {
  const style = getPercentileStyle(percentile);
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percentile / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={4} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={style.color}
        strokeWidth={4}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="600" fill={style.color}>
        {percentile}%
      </text>
    </svg>
  );
}

// 单个指数卡片（etf.run 全市场估值风格）
function IndexValuationCard({
  config,
  data,
}: {
  config: { code: string; name: string; market: 'CN' | 'HK' | 'US' };
  data?: IndexData | null;
}) {
  const isLoading = data === undefined;
  const isUp = data && data.change >= 0;
  const peStyle = data ? getPercentileStyle(data.pePercentile) : null;

  return (
    <Link href={`/index/${config.code}`}>
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-4 sm:p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          </div>
        ) : !data ? (
          <div className="space-y-2">
            <div className="font-semibold text-gray-900 dark:text-white">{config.name}</div>
            <div className="text-sm text-gray-400 dark:text-gray-500">数据暂时无法获取</div>
          </div>
        ) : (
          <>
            {/* 名称行 */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{data.name}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500">{config.code}</div>
              </div>
              {/* 估值标签 */}
              {peStyle && (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: peStyle.bg, color: peStyle.color }}
                >
                  {peStyle.label}
                </span>
              )}
            </div>

            {/* 价格 */}
            <div className="mb-3">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                {data.price.toFixed(2)}
              </div>
              <div className={`text-sm font-medium ${isUp ? 'text-red-500' : 'text-green-500'}`}>
                {isUp ? '+' : ''}{data.change.toFixed(2)} ({isUp ? '+' : ''}{data.changePercent.toFixed(2)}%)
              </div>
            </div>

            {/* PE / PB + 百分位条 */}
            <div className="space-y-2">
              {/* PE 行 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400 dark:text-gray-500">PE-TTM</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {data.pe > 0 ? data.pe.toFixed(1) : '--'}
                    </span>
                    <span className="text-xs text-gray-400">|</span>
                    <span className="text-xs" style={{ color: peStyle?.color }}>{data.pePercentile}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(data.pePercentile, 100)}%`,
                      backgroundColor: peStyle?.color ?? '#94a3b8',
                    }}
                  />
                </div>
              </div>

              {/* PB 行 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400 dark:text-gray-500">PB</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {data.pb > 0 ? data.pb.toFixed(2) : '--'}
                    </span>
                    <span className="text-xs text-gray-400">|</span>
                    <span className="text-xs text-gray-500">{data.pbPercentile}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 bg-blue-400"
                    style={{ width: `${Math.min(data.pbPercentile, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}

// 市场分区标题
function MarketSection({
  title,
  flag,
  subtitle,
  children,
}: {
  title: string;
  flag: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="flex items-center space-x-3 mb-4">
        <span className="text-2xl">{flag}</span>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {children}
      </div>
    </section>
  );
}

export default function MarketPage() {
  // undefined = loading, null = error, IndexData = success
  const [dataMap, setDataMap] = useState<Record<string, IndexData | null>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const allIndices = [
    ...MARKET_INDICES.CN,
    ...MARKET_INDICES.HK,
    ...MARKET_INDICES.US,
  ];

  useEffect(() => {
    const fetchAll = async () => {
      const results = await Promise.allSettled(
        allIndices.map(async (idx) => {
          let d: IndexData | null = null;
          if (idx.market === 'US') {
            d = await fetchIndexDataFromYahoo(idx.code);
          } else {
            d = await fetchIndexDataFromEastMoney(idx.code, idx.market);
          }
          if (!d) return { code: idx.code, data: null };

          const hist = await fetchHistoricalPE(idx.code);
          if (hist.length > 0) {
            d.pePercentile = calculatePEPercentile(d.pe, hist);
            d.pbPercentile = calculatePBPercentile(d.pb, hist);
          }
          return { code: idx.code, data: d };
        })
      );

      const map: Record<string, IndexData | null> = {};
      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value) {
          map[r.value.code] = r.value.data;
        }
      });
      setDataMap(map);
      setLastUpdated(new Date());
    };

    fetchAll();
    const interval = setInterval(fetchAll, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const isLoading = Object.keys(dataMap).length === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* 页面标题 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">全市场估值</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              A 股 · 港股 · 美股主要指数实时估值追踪
            </p>
          </div>
          {lastUpdated && (
            <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center space-x-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>更新于 {lastUpdated.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>

        {/* 估值说明条 */}
        <div className="flex flex-wrap gap-3 mb-8 text-xs">
          {[
            { label: '极低估', color: '#16a34a', bg: '#f0fdf4', range: '0-20%' },
            { label: '低估', color: '#22c55e', bg: '#dcfce7', range: '20-40%' },
            { label: '中性', color: '#94a3b8', bg: '#f1f5f9', range: '40-60%' },
            { label: '偏高', color: '#f97316', bg: '#fff7ed', range: '60-80%' },
            { label: '高估', color: '#ef4444', bg: '#fef2f2', range: '80-100%' },
          ].map(s => (
            <div
              key={s.label}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full"
              style={{ backgroundColor: s.bg, color: s.color }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="font-medium">{s.label}</span>
              <span className="opacity-60">{s.range}</span>
            </div>
          ))}
        </div>

        {/* A 股 */}
        <MarketSection title="A 股" flag="🇨🇳" subtitle="沪深两市主要宽基与行业指数">
          {MARKET_INDICES.CN.map((idx) => (
            <IndexValuationCard
              key={idx.code}
              config={idx}
              data={isLoading ? undefined : (dataMap[idx.code] ?? null)}
            />
          ))}
        </MarketSection>

        {/* 港股 */}
        <MarketSection title="港股" flag="🇭🇰" subtitle="恒生系列主要指数">
          {MARKET_INDICES.HK.map((idx) => (
            <IndexValuationCard
              key={idx.code}
              config={idx}
              data={isLoading ? undefined : (dataMap[idx.code] ?? null)}
            />
          ))}
        </MarketSection>

        {/* 美股 */}
        <MarketSection title="美股" flag="🇺🇸" subtitle="美国主要股指">
          {MARKET_INDICES.US.map((idx) => (
            <IndexValuationCard
              key={idx.code}
              config={idx}
              data={isLoading ? undefined : (dataMap[idx.code] ?? null)}
            />
          ))}
        </MarketSection>
      </main>
    </div>
  );
}
