import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/AppContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CityFlow Admin — Tamilnadu Government',
  description: 'Executive management platform for Tamilnadu Government services. Real-time issue tracking, workforce management, and analytics.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-blue-100 selection:text-blue-900">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
