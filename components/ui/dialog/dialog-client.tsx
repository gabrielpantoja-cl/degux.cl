import * as React from 'react';
import { cn } from '@/lib/utils';
import type { DialogProps } from './types';

export function DialogClient({ open, onClose, title, description, buttons }: DialogProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Cerrar diálogo"
      />
      
      <div className="relative z-50 w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="mt-2 text-gray-600">{description}</p>
        
        <div className="mt-6 flex justify-end gap-3">
          {buttons.map((button, index) => (
            <button
              key={index}
              onClick={button.onClick}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium",
                button.variant === 'danger' 
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}