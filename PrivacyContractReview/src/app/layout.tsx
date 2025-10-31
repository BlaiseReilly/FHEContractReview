'use client';

import './globals.css';
import { FHEVMProvider } from '@fhevm/sdk/react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Privacy Contract Review System</title>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔒</text></svg>" />
      </head>
      <body className={inter.className}>
        <FHEVMProvider
          config={{
            network: (process.env.NEXT_PUBLIC_NETWORK as any) || 'sepolia',
            gatewayUrl: process.env.NEXT_PUBLIC_GATEWAY_URL,
          }}
        >
          {children}
        </FHEVMProvider>
      </body>
    </html>
  );
}
