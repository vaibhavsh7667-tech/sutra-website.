import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SUTRA — AI Scientific Calculator & Problem Solver',
  description:
    'Calculate. Solve. Visualize. An intelligent scientific workspace for mathematics, science, equations, graphs, and problem solving.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased min-h-screen bg-[#F7F9FC] text-slate-900 font-sans selection:bg-blue-500/20 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
