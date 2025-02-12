import Header from '@/components/Header';
import { Inter, Poppins } from 'next/font/google';
import type React from 'react'; // Import React
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata = {
  title: 'DocMosaic - Free Open Source Tool for Visual PDF Creation',
  description:
    'Create beautiful PDF documents by arranging images like a mosaic. Free, open-source tool for visual document creation, perfect for ID cards, photos, and receipts. No registration needed.',
  keywords: [
    'pdf creator',
    'document mosaic',
    'free pdf tool',
    'open source pdf',
    'visual document creator',
    'image arrangement',
    'id document scanner',
  ],
  openGraph: {
    title: 'DocMosaic - Visual PDF Creation Tool',
    description: 'Create beautiful PDFs by arranging images like a mosaic. Free and open source.',
    type: 'website',
    url: 'https://docmosaic.com',
    images: [
      {
        url: 'https://docmosaic.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DocMosaic Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DocMosaic - Visual PDF Creation Tool',
    description: 'Create beautiful PDFs by arranging images like a mosaic. Free and open source.',
    images: [
      {
        url: 'https://docmosaic.com/twitter-image.png',
        width: 1200,
        height: 630,
        alt: 'DocMosaic Preview',
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
