'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';

export function ThemeProvider({ children }) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="light">
      {children}
    </NextThemeProvider>
  );
} 