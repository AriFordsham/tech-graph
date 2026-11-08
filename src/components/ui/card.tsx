/* shadcn/ui Card — React primitives */
import * as React from 'react';
import { cn } from '../../lib/utils';

export function Card({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & { className?: string }) {
  return <div className={cn('card', className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'h3'> & { className?: string }) {
  return <h3 className={cn('card-title', className)} {...props} />;
}

export function CardDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'p'> & { className?: string }) {
  return <p className={cn('card-description', className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & { className?: string }) {
  return <div className={cn('card-content', className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & { className?: string }) {
  return <div className={cn('card-footer', className)} {...props} />;
}
