'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { PEPercentile } from '@/components/PEPercentile';
import { ValuationChart } from '@/components/ValuationChart';
import { Tooltip } from '@/components/Tooltip';
import { IndexData, HistoricalPE, ComponentStock } from '@/types';
import { fetchIndexDataFromEastMoney, fetchIndexDataFromYahoo, fetchHistoricalPE, fetchComponentStocks } from '@/lib/api';
import { getPEStats } from '@/lib/pe-calculator';

export default function IndexDetail() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [data, setData] = useState<IndexData | null>(null);
  const [historicalPE, setHistoricalPE] = useState<HistoricalPE[]>([]);
  const [components, setComponents] = useState<ComponentStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 获取指数数据
      let indexData: IndexData | null = null;
      if (code.startsWith('^')) {
        indexData = await fetchIndexDataFromYahoo(code);
      } else {
        const market = code.includes('HSTECH') || code.includes('HSI') ? 'HK' : 'CN';
        indexData = await fetchIndexDataFromEastMoney(code, market);
      }

      if (indexData) {
        // 获取历史 PE 数据
        const histPE = await fetchHistoricalPE(code);
        setHistoricalPE(histPE);

        // 重新计算百分位
        if (histPE.length > 0) {
          const { calculatePEPercentile, calculatePBPercentile } = await import('@/lib/pe-calculator');
          indexData.pePercentile = calculatePEPercentile(indexData.pe, histPE);
          indexData.pbPercentile = calculatePBPercentile(indexData.pb, histPE);
        }

        setData(indexData);

        // 获取成分股
        const comps = await fetchComponentStocks(code);
        setComponents(comps);
      }

      setLoading(false);
    };

    fetchData();

    // 每 5 分钟刷新
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600">加载数据中...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">无法加载数据</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  const peStats = getPEStats(historicalPE);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回按钮 + 标题 */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
            <p className="text-sm text-gray-500">{code} · 更新于 {new Date(data.updatedAt).toLocaleTimeString('zh-CN')}</p>
          </div>
        </div>

        {/* 价格和涨跌幅 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-baseline space-x-4">
            <span className="text-4xl font-bold text-gray-900">{data.price.toFixed(2)}</span>
            <span className={`text-lg font-medium ${data.change >= 0 ? 'text-up' : 'text-down'}`}>
              {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)} ({data.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* PE 和 PB 百分位 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">市盈率 (PE)</h2>
            <div className="text-3xl font-bold mb-4">{data.pe.toFixed(2)}</div>
            <PEPercentile 
              pe={data.pe} 
              percentile={data.pePercentile}
              historical={{ min: peStats.min, max: peStats.max, avg: peStats.avg }}
              size="lg"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">市净率 (PB)</h2>
            <div className="text-3xl font-bold mb-4">{data.pb.toFixed(2)}</div>
            <PEPercentile 
              pe={data.pb} 
              percentile={data.pbPercentile}
              size="lg"
            />
          </div>
        </div>

        {/* 估值分布图 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <ValuationChart 
            data={historicalPE} 
            currentPE={data.pe}
            height={350}
          />
        </div>

        {/* 成分股 */}
        {components.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">前十大成分股</h2>
            <div className="space-y-3">
              {components.slice(0, 10).map((stock, index) => (
                <Tooltip
                  key={stock.code}
                  content={
                    <div>
                      <div>代码：{stock.code}</div>
                      <div>权重：{stock.weight.toFixed(2)}%</div>
                      {stock.price && <div>价格：{stock.price}</div>}
                      {stock.change && <div>涨跌：{stock.change}%</div>}
                    </div>
                  }
                >
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 cursor-help">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500 w-6">{index + 1}</span>
                      <span className="font-medium text-gray-900">{stock.name}</span>
                      <span className="text-xs text-gray-500">{stock.code}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(stock.weight * 2, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-16 text-right">
                        {stock.weight.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
