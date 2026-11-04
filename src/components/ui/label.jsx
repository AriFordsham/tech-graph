/* shadcn/ui Label — React primitive */
import * as React from 'react';
import { cn } from '../../lib/utils';

export function Label({ className, ...props }) {
  return <label className={cn('label', className)} {...props} />;
}
