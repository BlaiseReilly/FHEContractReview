'use client';

import { useState } from 'react';
import { Shield, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useContract } from '@/hooks/useContract';
import { useToast } from '@/hooks/useToast';
import { ethers } from 'ethers';

export default function AdminPanel() {
  const { authorizeReviewer, revokeReviewer, isLoading } = useContract();
  const { showToast } = useToast();
  const [reviewerAddress, setReviewerAddress] = useState('');

  const handleAuthorize = async () => {
    if (!reviewerAddress) {
      showToast('Please enter a reviewer address', 'error');
      return;
    }

    if (!ethers.isAddress(reviewerAddress)) {
      showToast('Please enter a valid Ethereum address', 'error');
      return;
    }

    try {
      await authorizeReviewer(reviewerAddress);
      showToast('Reviewer authorized successfully!', 'success');
      setReviewerAddress('');
    } catch (error: any) {
      showToast(`Failed to authorize reviewer: ${error.message}`, 'error');
    }
  };

  const handleRevoke = async () => {
    if (!reviewerAddress) {
      showToast('Please enter a reviewer address', 'error');
      return;
    }

    if (!ethers.isAddress(reviewerAddress)) {
      showToast('Please enter a valid Ethereum address', 'error');
      return;
    }

    try {
      await revokeReviewer(reviewerAddress);
      showToast('Reviewer revoked successfully!', 'success');
      setReviewerAddress('');
    } catch (error: any) {
      showToast(`Failed to revoke reviewer: ${error.message}`, 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Reviewer Management</h2>
      </div>

      <div className="bg-white bg-opacity-5 rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Reviewer Address
          </label>
          <input
            type="text"
            value={reviewerAddress}
            onChange={(e) => setReviewerAddress(e.target.value)}
            placeholder="Enter Ethereum address (0x...)"
            className="w-full px-4 py-3 bg-white bg-opacity-10 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-400"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={handleAuthorize}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500 text-white rounded-lg font-medium transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Authorize Reviewer
              </>
            )}
          </button>

          <button
            onClick={handleRevoke}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-rose-600 hover:to-red-500 text-white rounded-lg font-medium transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <UserMinus className="w-5 h-5" />
                Revoke Reviewer
              </>
            )}
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg">
          <h3 className="font-medium text-blue-300 mb-2">Admin Controls</h3>
          <ul className="text-sm text-blue-100 space-y-1">
            <li>• Authorize trusted reviewers to evaluate contracts</li>
            <li>• Revoke reviewer permissions when necessary</li>
            <li>• Only contract owner has admin access</li>
            <li>• All actions are recorded on-chain</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
