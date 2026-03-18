'use client';

import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { HistoricalPE } from '@/types';

interface ValuationChartProps {
  data: HistoricalPE[];
  currentPE: number;
  currentPB?: number;
  height?: number;
}

/**
 * 估值分布图组件
 */
export function ValuationChart({ 
  data, 
  currentPE, 
  currentPB,
  height = 300 
}: ValuationChartProps) {
  // 准备 PE 分布数据
  const peDistribution = useMemo(() => {
    const valid = data.filter(d => d.pe > 0 && d.pe < 1000);
    if (valid.length === 0) return { categories: [], values: [] };

    // 分成 10 个区间
    const min = Math.floor(Math.min(...valid.map(d => d.pe)));
    const max = Math.ceil(Math.max(...valid.map(d => d.pe)));
    const step = (max - min) / 10;
    
    const categories: string[] = [];
    const values: number[] = [];
    
    for (let i = 0; i < 10; i++) {
      const start = min + i * step;
      const end = min + (i + 1) * step;
      categories.push(`${start.toFixed(0)}-${end.toFixed(0)}`);
      
      const count = valid.filter(d => d.pe >= start && d.pe < end).length;
      values.push(count);
    }
    
    return { categories, values };
  }, [data]);

  const option = {
    title: {
      text: 'PE 历史分布',
      left: 'center',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: peDistribution.categories,
      axisLabel: { rotate: 45, fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: '出现次数'
    },
    series: [
      {
        name: 'PE 分布',
        type: 'bar',
        data: peDistribution.values.map((value, index) => {
          // 标记当前 PE 所在的区间
          const isCurrent = peDistribution.categories[index].includes(currentPE.toFixed(0));
          return {
            value,
            itemStyle: {
              color: isCurrent ? '#ef4444' : '#3b82f6'
            }
          };
        }),
        showBackground: true,
        backgroundStyle: { color: 'rgba(180, 180, 180, 0.2)' }
      },
      {
        name: '当前 PE',
        type: 'markLine',
        silent: true,
        lineStyle: { color: '#ef4444', width: 2, type: 'dashed' },
        label: { formatter: `当前：${currentPE.toFixed(1)}`, position: 'end' },
        data: [{ xAxis: peDistribution.categories.findIndex((cat, i) => {
          const range = cat.split('-').map(Number);
          return currentPE >= range[0] && currentPE < range[1];
        }) + 0.5 }]
      }
    ]
  };

  return (
    <div style={{ height }}>
      <ReactECharts option={option} style={{ height: '100%' }} />
    </div>
  );
}
