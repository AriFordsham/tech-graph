/* shadcn/ui Input — React primitive */
import * as React from 'react';
import { cn } from '../../lib/utils';

export function Input({ className, ...props }) {
  return <input className={cn('input', className)} {...props} />;
}
