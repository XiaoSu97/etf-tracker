'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { WatchlistCard } from '@/components/WatchlistCard';
import { AddSymbolModal } from '@/components/AddSymbolModal';
import { WatchlistItem, IndexData } from '@/types';
import { getWatchlist, removeFromWatchlist } from '@/lib/storage';
import { fetchIndexDataFromEastMoney, fetchIndexDataFromYahoo, fetchHistoricalPE } from '@/lib/api';
import { calculatePEPercentile, calculatePBPercentile } from '@/lib/pe-calculator';

export default function Home() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [indexData, setIndexData] = useState<Record<string, IndexData>>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 加载自选列表
  useEffect(() => {
    const list = getWatchlist();
    setWatchlist(list);
    setLoading(false);
  }, []);

  // 获取指数数据
  useEffect(() => {
    if (watchlist.length === 0) return;

    const fetchData = async () => {
      const dataMap: Record<string, IndexData> = {};

      for (const item of watchlist) {
        try {
          let data: IndexData | null = null;

          if (item.market === 'US') {
            data = await fetchIndexDataFromYahoo(item.code);
          } else {
            data = await fetchIndexDataFromEastMoney(item.code, item.market);
          }

          if (data) {
            // 获取历史 PE 数据并计算百分位
            const historicalPE = await fetchHistoricalPE(item.code);
            if (historicalPE.length > 0) {
              data.pePercentile = calculatePEPercentile(data.pe, historicalPE);
              data.pbPercentile = calculatePBPercentile(data.pb, historicalPE);
            }
            dataMap[item.code] = data;
          }
        } catch (error) {
          console.error(`Failed to fetch data for ${item.code}:`, error);
        }
      }

      setIndexData(dataMap);
    };

    fetchData();

    // 每 5 分钟刷新一次
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [watchlist]);

  const handleDelete = (code: string) => {
    removeFromWatchlist(code);
    setWatchlist(getWatchlist());
    const newData = { ...indexData };
    delete newData[code];
    setIndexData(newData);
  };

  const handleAdd = () => {
    const list = getWatchlist();
    setWatchlist(list);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">我的自选</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              跟踪 {watchlist.length} 个指数，实时估值分析
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>添加自选</span>
          </button>
        </div>

        {/* 内容区域 */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
              <div className="ml-4 text-lg text-gray-600 dark:text-gray-400">加载数据中...</div>
            </div>
            <p className="mt-4 text-sm text-gray-400 dark:text-gray-500">正在获取指数估值数据</p>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-dark-card rounded-xl shadow-md border border-gray-100 dark:border-dark-border">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
              <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">暂无自选指数</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              开始添加你关注的指数，我们会实时跟踪估值数据，帮你把握投资机会
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
            >
              添加第一个指数
            </button>
            <div className="mt-8 flex flex-wrap justify-center gap-2 text-sm text-gray-400 dark:text-gray-500">
              <span>热门：</span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">证券公司</span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">恒生科技</span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">纳斯达克</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {watchlist.map((item) => (
              <WatchlistCard
                key={item.code}
                data={indexData[item.code] || {
                  code: item.code,
                  name: item.name,
                  price: 0,
                  change: 0,
                  changePercent: 0,
                  pe: 0,
                  pb: 0,
                  pePercentile: 50,
                  pbPercentile: 50,
                  updatedAt: new Date().toISOString(),
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* 添加自选弹窗 */}
      <AddSymbolModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAdd}
      />
    </div>
  );
}
