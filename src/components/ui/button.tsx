/* shadcn/ui Button — React primitive */
import * as React from 'react';
import { cn } from '../../lib/utils';

export function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: React.ComponentPropsWithoutRef<'button'> & {
  variant?: 'default' | 'primary' | 'outline' | 'link';
  size?: 'default' | 'sm';
  className?: string;
}) {
  return (
    <button
      className={cn(
        'btn',
        variant === 'default' && 'btn-default',
        variant === 'primary' && 'btn-primary',
        variant === 'outline' && 'btn-outline',
        variant === 'link' && 'btn-link',
        size === 'sm' && 'btn-sm',
        className,
      )}
      {...props}
    />
  );
}
