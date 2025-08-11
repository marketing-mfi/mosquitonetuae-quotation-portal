import { Inter } from 'next/font/google';
import './globals.css'; // Import global styles, including Tailwind CSS

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Mosquitonet Quotation Portal',
  description: 'On-site quotation preparation web application for Mosquitonet.ae',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
