/**
 * shadcn/ui cn() utility — merges classNames conditionally.
 * Standalone implementation (no tailwind-merge/clsx dependency).
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
