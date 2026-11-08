/* shadcn/ui Select — React primitive */
import * as React from 'react';
import { cn } from '../../lib/utils';

export function Select({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'select'> & { className?: string }) {
  return <select className={cn('select', className)} {...props} />;
}
