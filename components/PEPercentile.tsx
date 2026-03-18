'use client';

import React from 'react';
import { getValuationText, getValuationColorClass } from '@/lib/pe-calculator';
import { Tooltip } from './Tooltip';

interface PEPercentileProps {
  pe: number;
  percentile: number;
  historical?: {
    min: number;
    max: number;
    avg: number;
  };
  size?: 'sm' | 'md' | 'lg';
}

/**
 * PE 百分位显示组件
 */
export function PEPercentile({ pe, percentile, historical, size = 'md' }: PEPercentileProps) {
  const status = getValuationText(percentile);
  const colorClass = getValuationColorClass(percentile);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  // 计算在历史区间的位置
  const position = historical 
    ? ((pe - historical.min) / (historical.max - historical.min)) * 100 
    : percentile;

  return (
    <Tooltip
      content={
        <div className="space-y-1">
          <div>当前 PE: {pe.toFixed(2)}</div>
          <div>历史最小：{historical?.min.toFixed(2)}</div>
          <div>历史最大：{historical?.max.toFixed(2)}</div>
          <div>历史平均：{historical?.avg.toFixed(2)}</div>
          <div className="pt-1 border-t border-gray-700">
            估值状态：{status}
          </div>
        </div>
      }
      position="right"
    >
      <div className={`${sizeClasses[size]} cursor-help`}>
        {/* 百分位进度条 */}
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          {/* 低估区域 (0-30%) */}
          <div className="absolute left-0 top-0 h-full w-[30%] bg-green-200" />
          {/* 中性区域 (30-70%) */}
          <div className="absolute left-[30%] top-0 h-full w-[40%] bg-gray-300" />
          {/* 高估区域 (70-100%) */}
          <div className="absolute left-[70%] top-0 h-full w-[30%] bg-red-200" />
          
          {/* 当前位置标记 */}
          <div 
            className={`absolute top-0 h-full w-1 ${colorClass.replace('text-', 'bg-').replace('bg-', 'bg-')}`}
            style={{ left: `${Math.min(position, 100)}%` }}
          />
        </div>

        {/* 数值显示 */}
        <div className="flex justify-between items-center mt-1">
          <span className={`font-medium ${colorClass}`}>
            {percentile}%
          </span>
          <span className="text-xs text-gray-500">
            PE: {pe.toFixed(1)}
          </span>
        </div>

        {/* 状态标签 */}
        <div className={`text-xs text-center mt-1 px-2 py-0.5 rounded ${colorClass}`}>
          {status}
        </div>
      </div>
    </Tooltip>
  );
}
