'use client';

import * as React from 'react';
import type { DialogProps } from './types';
import { DialogClient } from './dialog-client';

export function DialogWrapper(props: DialogProps) {
  const { onClose } = props;

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!props.open) return null;

  return <DialogClient {...props} />;
}