'use client';

import { useEffect, useState } from 'react';
import { Wallet, AlertCircle } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useContract } from '@/hooks/useContract';

export default function WalletConnection() {
  const { address, isConnected, connect, disconnect } = useWallet();
  const { isOwner, isReviewer } = useContract();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getRole = () => {
    if (isOwner) return 'Owner';
    if (isReviewer) return 'Authorized Reviewer';
    return 'User';
  };

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary bg-opacity-20 rounded-lg">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Wallet Connection</h2>
            {isConnected && address && (
              <p className="text-sm text-gray-300 mt-1">
                Connected: {address.substring(0, 6)}...{address.substring(38)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isConnected && address ? (
            <>
              <div className="text-right">
                <div className="text-sm text-gray-400">Network</div>
                <div className="font-medium">
                  {process.env.NEXT_PUBLIC_NETWORK || 'Sepolia'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Role</div>
                <div className="font-medium text-primary">{getRole()}</div>
              </div>
              <button
                onClick={disconnect}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all transform hover:scale-105"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={connect}
              className="px-6 py-3 bg-gradient-to-r from-primary to-pink-600 hover:from-pink-600 hover:to-primary text-white rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
            >
              Connect MetaMask
            </button>
          )}
        </div>
      </div>

      {!isConnected && (
        <div className="mt-4 p-4 bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-100">
            <p className="font-medium mb-1">MetaMask Required</p>
            <p className="text-blue-200">
              Please install MetaMask and connect your wallet to use this application.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
