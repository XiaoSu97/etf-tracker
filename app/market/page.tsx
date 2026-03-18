'use client';

import React from 'react';
import { Header } from '@/components/Header';

export default function MarketPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">
            <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">市场概览</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            功能开发中，敬请期待...
          </p>
          <div className="text-sm text-gray-400 dark:text-gray-500">
            <p>当前支持：</p>
            <ul className="mt-2 space-y-1">
              <li>✅ A 股指数（上证、深证、沪深 300 等）</li>
              <li>✅ 港股指数（恒生科技、恒生指数等）</li>
              <li>✅ 美股指数（纳斯达克、标普 500、道琼斯）</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
