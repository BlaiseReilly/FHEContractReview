'use client';

import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { useFHEVM } from '@fhevm/sdk/react';

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isInitialized } = useFHEVM();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAddress(accounts[0].address);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const connect = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use this application');
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);

      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet: ' + error.message);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
  };

  return {
    address,
    isConnected,
    connect,
    disconnect,
    isSDKReady: isInitialized,
  };
}
