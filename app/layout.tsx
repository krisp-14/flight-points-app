import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'pointsaway - Maximize Your Loyalty Points for Award Travel',
  description: 'Find the best award flights and optimize your loyalty points across all your programs. Search, compare, and book flights using points.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Header />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
