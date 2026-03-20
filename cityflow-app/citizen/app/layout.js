import { Inter } from 'next/font/google';
import './globals.css';
import { CitizenProvider } from '@/lib/CitizenContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CityFlow — Tamilnadu Government Portal',
  description: 'Official platform for citizens and workers to report issues, track services and stay informed.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-blue-100 selection:text-blue-900">
        <CitizenProvider>
          {children}
        </CitizenProvider>
      </body>
    </html>
  );
}
