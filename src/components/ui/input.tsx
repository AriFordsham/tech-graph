/* shadcn/ui Input — React primitive */
import * as React from 'react';
import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Input = forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<'input'> & { className?: string }>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn('input', className)} {...props} />
  ),
);
Input.displayName = 'Input';
