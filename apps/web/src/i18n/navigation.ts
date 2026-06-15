import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// Locale-aware wrappers around Next.js' navigation APIs. Using these instead of
// `next/navigation` keeps the active locale when navigating between pages.
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
