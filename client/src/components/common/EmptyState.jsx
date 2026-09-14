// client/src/components/common/EmptyState.jsx
import React from 'react';
import { Inbox, FileQuestion } from 'lucide-react';
import { Button } from './Button.jsx';

export function EmptyState({
  title = 'No Data Found',
  description = 'There are no active records in this view.',
  icon,
  actionText,
  onAction,
  className = ''
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 my-4 ${className}`}>
      <div className="p-3 bg-slate-100 rounded-full text-slate-400 mb-3">
        {icon || <FileQuestion className="w-8 h-8" />}
      </div>
      <h4 className="text-base font-semibold text-slate-800">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button size="sm" colorScheme="brand" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
