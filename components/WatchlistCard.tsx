'use client';

import React from 'react';
import Link from 'next/link';
import { IndexData } from '@/types';
import { getValuationText, getValuationColorClass } from '@/lib/pe-calculator';
import { Tooltip } from './Tooltip';

interface WatchlistCardProps {
  data: IndexData;
  onDelete?: (code: string) => void;
}

/**
 * 自选列表卡片组件
 */
export function WatchlistCard({ data, onDelete }: WatchlistCardProps) {
  const peStatus = getValuationText(data.pePercentile);
  const peColor = getValuationColorClass(data.pePercentile);

  return (
    <Link href={`/index/${data.code}`}>
      <div className="card-hover bg-white dark:bg-dark-card rounded-xl p-4 shadow-md border border-gray-100 dark:border-dark-border transition-colors">
        {/* 头部：名称 + 删除按钮 */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{data.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{data.code}</p>
          </div>
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete(data.code);
              }}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="删除自选"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* 价格 */}
        <div className="mb-3">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.price.toFixed(2)}
          </div>
          <div className={`text-sm ${data.change >= 0 ? 'text-up' : 'text-down'}`}>
            {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)} ({data.changePercent.toFixed(2)}%)
          </div>
        </div>

        {/* PE 和百分位 */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Tooltip 
            content={
              <div>
                <div>PE: {data.pe.toFixed(2)}</div>
                <div>百分位：{data.pePercentile}%</div>
                <div>估值：{peStatus}</div>
              </div>
            }
          >
            <div className="bg-gray-50 dark:bg-gray-800 rounded px-2 py-1">
              <div className="text-xs text-gray-500 dark:text-gray-400">PE</div>
              <div className="font-medium text-gray-900 dark:text-white">{data.pe.toFixed(1)}</div>
            </div>
          </Tooltip>

          <Tooltip 
            content={
              <div>
                <div>PB: {data.pb.toFixed(2)}</div>
                <div>百分位：{data.pbPercentile}%</div>
              </div>
            }
          >
            <div className="bg-gray-50 dark:bg-gray-800 rounded px-2 py-1">
              <div className="text-xs text-gray-500 dark:text-gray-400">PB</div>
              <div className="font-medium text-gray-900 dark:text-white">{data.pb.toFixed(1)}</div>
            </div>
          </Tooltip>
        </div>

        {/* 估值状态 */}
        <div className={`mt-3 text-xs text-center py-1 rounded ${peColor}`}>
          PE 百分位：{data.pePercentile}% - {peStatus}
        </div>

        {/* 更新时间 */}
        <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-center">
          更新于 {new Date(data.updatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </Link>
  );
}
