'use client';

import { useState } from 'react';
import { Shield } from 'lucide-react';
import WalletConnection from '@/components/WalletConnection';
import SubmitContract from '@/components/SubmitContract';
import ReviewContracts from '@/components/ReviewContracts';
import MyContracts from '@/components/MyContracts';
import AdminPanel from '@/components/AdminPanel';
import { useContract } from '@/hooks/useContract';

export default function Home() {
  const [activeTab, setActiveTab] = useState('submit');
  const { isOwner, isReviewer } = useContract();

  const tabs = [
    { id: 'submit', label: 'Submit Contract', show: true },
    { id: 'review', label: 'Review Contracts', show: isReviewer },
    { id: 'my-contracts', label: 'My Contracts', show: true },
    { id: 'admin', label: 'Admin', show: isOwner },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <header className="text-center mb-12 animate-fadeIn">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shield className="w-12 h-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold">
            Privacy Contract Review System
          </h1>
        </div>
        <p className="text-lg text-gray-300">
          Secure, Private Contract Compliance Review on Blockchain
        </p>
        <div className="mt-4 text-sm text-gray-400">
          Powered by{' '}
          <span className="text-primary font-semibold">FHEVM Universal SDK</span>
        </div>
      </header>

      {/* Wallet Connection */}
      <WalletConnection />

      {/* Main Content */}
      <div className="mt-8 animate-fadeIn">
        {/* Tabs */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-t-2xl border-b border-gray-600">
          <div className="flex flex-wrap">
            {tabs.map((tab) =>
              tab.show ? (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-6 py-4 font-medium transition-all
                    ${
                      activeTab === tab.id
                        ? 'text-primary border-b-2 border-primary bg-white bg-opacity-5'
                        : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-5'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ) : null
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-b-2xl p-8 shadow-2xl">
          {activeTab === 'submit' && <SubmitContract />}
          {activeTab === 'review' && <ReviewContracts />}
          {activeTab === 'my-contracts' && <MyContracts />}
          {activeTab === 'admin' && <AdminPanel />}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-400 text-sm">
        <p>
          Built with React, Next.js, and FHEVM Universal SDK
        </p>
        <p className="mt-2">
          Contract: {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.substring(0, 10)}...
        </p>
      </footer>
    </div>
  );
}
