'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { IndexData, HistoricalPE } from '@/types';
import { fetchIndexDataFromEastMoney, fetchIndexDataFromYahoo, fetchHistoricalPE } from '@/lib/api';
import { calculatePEPercentile, calculatePBPercentile, getPEStats, getValuationText } from '@/lib/pe-calculator';

// echarts-for-react 依赖 window，必须关闭 SSR
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

// 百分位进度条组件（仿 etf.run 风格）
function PercentileBar({ value, percentile, label, min, max, avg, unit = '' }: {
  value: number;
  percentile: number;
  label: string;
  min?: number;
  max?: number;
  avg?: number;
  unit?: string;
}) {
  const getColor = (pct: number) => {
    if (pct < 20) return { bar: '#16a34a', bg: '#dcfce7', text: '#15803d', label: '极低估' };
    if (pct < 40) return { bar: '#22c55e', bg: '#f0fdf4', text: '#16a34a', label: '低估' };
    if (pct < 60) return { bar: '#94a3b8', bg: '#f8fafc', text: '#64748b', label: '中性' };
    if (pct < 80) return { bar: '#f97316', bg: '#fff7ed', text: '#ea580c', label: '偏高' };
    return { bar: '#ef4444', bg: '#fef2f2', text: '#dc2626', label: '高估' };
  };
  const c = getColor(percentile);

  return (
    <div className="py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
            {value > 0 ? value.toFixed(2) : '--'}{unit}
          </div>
        </div>
        <div className="text-right">
          <div
            className="inline-block text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: c.bg, color: c.text }}
          >
            {c.label}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {percentile}% 分位
          </div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="h-full bg-green-200 dark:bg-green-900/40" style={{ width: '40%' }} />
          <div className="h-full bg-gray-200 dark:bg-gray-700" style={{ width: '20%' }} />
          <div className="h-full bg-orange-200 dark:bg-orange-900/40" style={{ width: '20%' }} />
          <div className="h-full bg-red-200 dark:bg-red-900/40" style={{ width: '20%' }} />
        </div>
        <div
          className="absolute top-0 h-full w-1 rounded-full shadow-sm transition-all duration-500"
          style={{ left: `${Math.min(Math.max(percentile, 1), 99)}%`, backgroundColor: c.bar, transform: 'translateX(-50%)' }}
        />
      </div>

      {/* 历史区间 */}
      {(min !== undefined && max !== undefined && avg !== undefined) && (
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1.5">
          <span>最低 {min.toFixed(1)}</span>
          <span>均值 {avg.toFixed(1)}</span>
          <span>最高 {max.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
}

// PE 历史走势图（线图）
function PEHistoryChart({ data, currentPE }: { data: HistoricalPE[]; currentPE: number }) {
  const [tab, setTab] = useState<'pe' | 'pb' | 'price'>('pe');

  const chartData = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    return sorted;
  }, [data]);

  const seriesData = chartData.map(d => {
    if (tab === 'pe') return d.pe;
    if (tab === 'pb') return d.pb;
    return d.price;
  });

  const dates = chartData.map(d => d.date);
  const avg = seriesData.reduce((a, b) => a + b, 0) / seriesData.length;
  const label = tab === 'pe' ? 'PE' : tab === 'pb' ? 'PB' : '价格';

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', lineStyle: { color: '#94a3b8' } },
      formatter: (params: any[]) => {
        const p = params[0];
        return `${p.axisValue}<br/>${label}: <b>${Number(p.value).toFixed(2)}</b>`;
      },
    },
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        fontSize: 11,
        formatter: (val: string) => val.slice(0, 7),
        interval: Math.floor(dates.length / 6),
        color: '#94a3b8',
      },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 11, color: '#94a3b8' },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      axisLine: { show: false },
    },
    series: [
      {
        name: label,
        type: 'line',
        data: seriesData,
        smooth: true,
        lineStyle: { color: '#3b82f6', width: 2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59,130,246,0.15)' },
              { offset: 1, color: 'rgba(59,130,246,0)' },
            ],
          },
        },
        symbol: 'none',
        markLine: {
          silent: true,
          data: [
            {
              yAxis: avg,
              label: { formatter: `均值 ${avg.toFixed(1)}`, position: 'end', fontSize: 10, color: '#94a3b8' },
              lineStyle: { color: '#94a3b8', type: 'dashed', width: 1 },
            },
            ...(tab === 'pe' && currentPE > 0 ? [{
              yAxis: currentPE,
              label: { formatter: `当前 ${currentPE.toFixed(1)}`, position: 'end', fontSize: 10, color: '#3b82f6' },
              lineStyle: { color: '#3b82f6', type: 'solid', width: 1.5 },
            }] : []),
          ],
        },
      },
    ],
  };

  return (
    <div>
      <div className="flex space-x-1 mb-4">
        {(['pe', 'pb', 'price'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              tab === t
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {t === 'pe' ? 'PE 走势' : t === 'pb' ? 'PB 走势' : '价格走势'}
          </button>
        ))}
      </div>
      <ReactECharts option={option} style={{ height: 280 }} />
    </div>
  );
}

export default function IndexDetail() {
  const params = useParams();
  const router = useRouter();
  const code = decodeURIComponent(params.code as string);

  const [data, setData] = useState<IndexData | null>(null);
  const [historicalPE, setHistoricalPE] = useState<HistoricalPE[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let indexData: IndexData | null = null;
        if (code.startsWith('^')) {
          indexData = await fetchIndexDataFromYahoo(code);
        } else {
          const market = (code === 'HSI' || code === 'HSTECH') ? 'HK' : 'CN';
          indexData = await fetchIndexDataFromEastMoney(code, market);
        }

        if (!indexData) {
          setError('无法获取数据，请检查指数代码是否正确');
          setLoading(false);
          return;
        }

        const histPE = await fetchHistoricalPE(code);
        setHistoricalPE(histPE);

        if (histPE.length > 0) {
          indexData.pePercentile = calculatePEPercentile(indexData.pe, histPE);
          indexData.pbPercentile = calculatePBPercentile(indexData.pb, histPE);
        }

        setData(indexData);
      } catch (e) {
        setError('数据获取失败，请稍后重试');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60 * 1000);
    return () => clearInterval(interval);
  }, [code]);

  const peStats = useMemo(() => getPEStats(historicalPE), [historicalPE]);
  const pbStats = useMemo(() => {
    const valid = historicalPE.filter(h => h.pb > 0 && h.pb < 100);
    if (valid.length === 0) return { min: 0, max: 0, avg: 0 };
    const pbs = valid.map(h => h.pb);
    return {
      min: Math.min(...pbs),
      max: Math.max(...pbs),
      avg: pbs.reduce((a, b) => a + b, 0) / pbs.length,
    };
  }, [historicalPE]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">加载数据中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error || '无法加载数据'}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isUp = data.change >= 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 返回按钮 */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>返回</span>
        </button>

        {/* 顶部：指数名称 + 价格 */}
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-6 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{data.name}</h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                {code} · {new Date(data.updatedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })} 更新
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900 dark:text-white tabular-nums">
                {data.price.toFixed(2)}
              </div>
              <div className={`text-lg font-medium mt-1 ${isUp ? 'text-red-500' : 'text-green-500'}`}>
                {isUp ? '+' : ''}{data.change.toFixed(2)}
                <span className="text-base ml-1">({isUp ? '+' : ''}{data.changePercent.toFixed(2)}%)</span>
              </div>
            </div>
          </div>

          {/* 今日数据 */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div>
              <div className="text-xs text-gray-400 dark:text-gray-500">今开</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{data.open?.toFixed(2) ?? '--'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 dark:text-gray-500">最高</div>
              <div className="text-sm font-medium text-red-500">{data.high?.toFixed(2) ?? '--'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 dark:text-gray-500">最低</div>
              <div className="text-sm font-medium text-green-500">{data.low?.toFixed(2) ?? '--'}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 指数估值指标 */}
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">指数指标</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              基于 {historicalPE.length} 个历史数据点计算百分位
            </p>

            <PercentileBar
              label="市盈率 (PE-TTM)"
              value={data.pe}
              percentile={data.pePercentile}
              min={peStats.min}
              max={peStats.max}
              avg={peStats.avg}
            />
            <PercentileBar
              label="市净率 (PB)"
              value={data.pb}
              percentile={data.pbPercentile}
              min={pbStats.min}
              max={pbStats.max}
              avg={pbStats.avg}
            />

            {/* 综合估值评级 */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">PE 综合评级</span>
                <span className={`text-sm font-semibold ${
                  data.pePercentile < 40 ? 'text-green-600' :
                  data.pePercentile < 60 ? 'text-gray-500' : 'text-red-500'
                }`}>
                  {getValuationText(data.pePercentile)}
                </span>
              </div>
            </div>
          </div>

          {/* 历史走势图 */}
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">历史走势</h2>
            {historicalPE.length > 0 ? (
              <PEHistoryChart data={historicalPE} currentPE={data.pe} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500 text-sm">
                暂无历史数据
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

