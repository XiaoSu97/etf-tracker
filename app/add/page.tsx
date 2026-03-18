'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { AddSymbolModal } from '@/components/AddSymbolModal';
import { WatchlistItem } from '@/types';
import { getWatchlist } from '@/lib/storage';

export default function AddPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleAdd = () => {
    // 刷新自选列表
    const list = getWatchlist();
    console.log('Added to watchlist:', list);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">添加自选指数</h1>
          <p className="text-gray-500 mb-8">
            搜索并添加你关注的指数，我们会持续跟踪估值数据
          </p>

          {/* 说明卡片 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">支持的市场</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">🇨🇳</div>
                <div className="font-medium">A 股</div>
                <div className="text-xs text-gray-500 mt-1">如：399975</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">🇭🇰</div>
                <div className="font-medium">港股</div>
                <div className="text-xs text-gray-500 mt-1">如：HSTECH</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">🇺🇸</div>
                <div className="font-medium">美股</div>
                <div className="text-xs text-gray-500 mt-1">如：^IXIC</div>
              </div>
            </div>
          </div>

          {/* 常用指数列表 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">热门指数</h2>
            <div className="space-y-2">
              {[
                { code: '399975', name: '证券公司', market: 'A 股' },
                { code: '000001', name: '上证指数', market: 'A 股' },
                { code: '000300', name: '沪深 300', market: 'A 股' },
                { code: 'HSTECH', name: '恒生科技', market: '港股' },
                { code: 'HSI', name: '恒生指数', market: '港股' },
                { code: '^IXIC', name: '纳斯达克 100', market: '美股' },
                { code: '^GSPC', name: '标普 500', market: '美股' },
                { code: '^DJI', name: '道琼斯', market: '美股' },
              ].map((item) => (
                <div 
                  key={item.code}
                  className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.code}</div>
                  </div>
                  <div className="text-sm text-gray-500">{item.market}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 提示 */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">提示</p>
                <p>点击右下角"添加自选"按钮，输入指数代码即可添加。添加后会在首页显示实时估值数据。</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 添加自选弹窗 */}
      <AddSymbolModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          router.push('/');
        }}
        onAdd={handleAdd}
      />
    </div>
  );
}
