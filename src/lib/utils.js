/**
 * shadcn/ui cn() utility — merges classNames conditionally.
 * Standalone implementation (no tailwind-merge/clsx dependency).
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
