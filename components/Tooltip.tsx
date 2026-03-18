'use client';

import React, { useState } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

/**
 * 悬浮提示组件
 */
export function Tooltip({ 
  content, 
  children, 
  position = 'top',
  className = ''
}: TooltipProps) {
  const [show, setShow] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div 
          className={`
            absolute z-50 px-3 py-2 text-sm 
            bg-gray-900 text-white rounded-lg shadow-xl
            whitespace-nowrap
            transition-all duration-200
            ${positionClasses[position]}
            ${className}
          `}
        >
          {content}
          {/* 小三角 */}
          {position === 'top' && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          )}
          {position === 'bottom' && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
          )}
        </div>
      )}
    </div>
  );
}
