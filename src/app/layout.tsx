import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import './globals.css';
import ClientProviders from '@/components/providers/ClientProviders';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LibraryCompany Dashboard',
  description: '공연 데이터 분석 대시보드',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
