import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Learn Fullstack Tasks',
  description: 'A learning project with Next.js, Express, PostgreSQL and Redis.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
