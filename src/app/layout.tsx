import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { siteConfig } from '@/lib/config/site';
import { AuthProvider } from '@/features/auth/context/auth-context';

import { WatchlistProvider } from '@/features/watchlist/context/watchlist-context';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

import { ProfileProvider } from '@/features/profile/context/profile-context';
import { ProfilePickerModal } from '@/features/profile/components/profile-picker-modal';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark antialiased`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 selection:bg-red-500 selection:text-white" suppressHydrationWarning>
        <AuthProvider>
          <ProfileProvider>
            <WatchlistProvider>
              <Navbar />
              <main className="flex-1 pb-24 md:pb-0 data-[fullscreen=true]:pb-0">{children}</main>
              <Footer />
              <ProfilePickerModal />
            </WatchlistProvider>
          </ProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
