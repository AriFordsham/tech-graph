/* shadcn/ui Label — React primitive */
import * as React from 'react';
import { cn } from '../../lib/utils';

export function Label({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'label'> & { className?: string }) {
  return <label className={cn('label', className)} {...props} />;
}
