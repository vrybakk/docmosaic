import type { ReactNode } from 'react';
import './globals.css';

// A root layout is required because a root `not-found.tsx` exists. The real
// layout — <html>/<body>, providers, fonts and metadata — lives in
// `app/[locale]/layout.tsx`; this only passes children through.
export default function RootLayout({ children }: { children: ReactNode }) {
    return children;
}
