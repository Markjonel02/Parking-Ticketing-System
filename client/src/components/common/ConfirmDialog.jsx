// client/src/components/common/ConfirmDialog.jsx
import React from 'react';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { Modal } from './Modal.jsx';
import { Button } from './Button.jsx';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this operation?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  colorScheme = 'red', // red, brand, amber
  type = 'danger', // danger, warning, info
  isLoading = false
}) {
  const iconMap = {
    danger: <AlertTriangle className="w-6 h-6 text-red-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    info: <Info className="w-6 h-6 text-blue-600" />
  };

  const bgMap = {
    danger: 'bg-red-50',
    warning: 'bg-amber-50',
    info: 'bg-blue-50'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" colorScheme="gray" size="sm" onClick={onClose} isDisabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            colorScheme={colorScheme}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-full shrink-0 ${bgMap[type] || bgMap.danger}`}>
          {iconMap[type] || iconMap.danger}
        </div>
        <div className="text-sm text-slate-600 leading-relaxed pt-1">
          {message}
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
