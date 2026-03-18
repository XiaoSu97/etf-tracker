'use client';

import React, { useState } from 'react';
import { WatchlistItem } from '@/types';
import { addToWatchlist } from '@/lib/storage';

interface AddSymbolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: WatchlistItem) => void;
}

/**
 * 添加自选弹窗组件
 */
export function AddSymbolModal({ isOpen, onClose, onAdd }: AddSymbolModalProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [market, setMarket] = useState<'CN' | 'HK' | 'US'>('CN');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('请输入代码');
      return;
    }

    const item: WatchlistItem = {
      code: code.trim().toUpperCase(),
      name: name.trim() || code.trim(),
      type: 'index',
      addedAt: Date.now(),
      market,
    };

    const success = addToWatchlist(item);
    if (success) {
      onAdd(item);
      setCode('');
      setName('');
      setError('');
      onClose();
    } else {
      setError('该指数已在自选列表中');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* 标题 */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">添加自选指数</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 代码输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                指数代码 *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="如：399975, HSTECH, ^IXIC"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              <p className="mt-1 text-xs text-gray-500">
                A 股：399975 | 港股：HSTECH | 美股：^IXIC
              </p>
            </div>

            {/* 名称输入（可选） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                指数名称（可选）
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="如：证券公司、恒生科技"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 市场选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                市场 *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['CN', 'HK', 'US'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMarket(m)}
                    className={`
                      px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${market === m 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    `}
                  >
                    {m === 'CN' ? 'A 股' : m === 'HK' ? '港股' : '美股'}
                  </button>
                ))}
              </div>
            </div>

            {/* 错误信息 */}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded">
                {error}
              </div>
            )}

            {/* 按钮 */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                添加
              </button>
            </div>
          </form>

          {/* 常用指数快捷添加 */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">常用指数：</p>
            <div className="flex flex-wrap gap-2">
              {[
                { code: '399975', name: '证券公司', market: 'CN' as const },
                { code: '000001', name: '上证指数', market: 'CN' as const },
                { code: 'HSTECH', name: '恒生科技', market: 'HK' as const },
                { code: 'HSI', name: '恒生指数', market: 'HK' as const },
                { code: '^IXIC', name: '纳斯达克', market: 'US' as const },
                { code: '^GSPC', name: '标普 500', market: 'US' as const },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setCode(item.code);
                    setName(item.name);
                    setMarket(item.market);
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded transition-colors"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
