/* shadcn/ui Separator — React primitive */
import * as React from 'react';
import { cn } from '../../lib/utils';

export function Separator({ className, ...props }) {
  return <div className={cn('separator', className)} {...props} />;
}
