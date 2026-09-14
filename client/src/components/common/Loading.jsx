// client/src/components/common/Loading.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

export function Loading({ label = 'Loading information...', size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 gap-3 text-slate-500 ${className}`}>
      <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-blue-600`} />
      {label && <p className="text-xs font-medium text-slate-500 tracking-wide">{label}</p>}
    </div>
  );
}

export default Loading;
