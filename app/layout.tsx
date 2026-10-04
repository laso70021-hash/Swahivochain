import type {Metadata} from 'next';
import { Jost } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

const jost = Jost({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jost',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Logistics Chain — Global Freight & Intelligent Supply Chain Platform',
  description: 'Fast, secure, and reliable multimodal logistics solutions. From containerized ocean freight to express air cargo and smart warehousing, move your world with Logistics Chain.',
  openGraph: {
    title: 'Logistics Chain — Global Freight & Supply Chain Platform',
    description: 'Fast, secure, and reliable multimodal logistics solutions. Global ocean, air, road, and warehousing solutions with real-time tracking.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Logistics Chain — Global Freight & Supply Chain Platform',
    description: 'Fast, secure, and reliable multimodal logistics solutions.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={jost.variable} suppressHydrationWarning>
      <body className="bg-[#070d18] text-slate-100 font-sans antialiased selection:bg-[#00e5c9] selection:text-[#070d18] min-h-screen flex flex-col" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
