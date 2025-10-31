'use client';

import { useEffect } from 'react';
import { FileText, Calendar, CheckCircle, Clock } from 'lucide-react';
import { useContract } from '@/hooks/useContract';
import { useWallet } from '@/hooks/useWallet';

export default function MyContracts() {
  const { address } = useWallet();
  const { userContracts, loadUserContracts, isLoading } = useContract();

  useEffect(() => {
    if (address) {
      loadUserContracts();
    }
  }, [address]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">My Submitted Contracts</h2>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-400">Loading your contracts...</p>
        </div>
      ) : !address ? (
        <div className="text-center py-12 text-gray-400">
          Please connect your wallet to view your contracts
        </div>
      ) : userContracts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No contracts submitted yet
        </div>
      ) : (
        <div className="grid gap-4">
          {userContracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-white bg-opacity-5 border border-gray-700 rounded-lg p-6 hover:border-primary transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    Contract #{contract.id}: {contract.title}
                  </h3>
                </div>
                <span
                  className={`status-badge ${
                    contract.isReviewed ? 'status-reviewed' : 'status-pending'
                  }`}
                >
                  {contract.isReviewed ? (
                    <>
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Reviewed
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 inline mr-1" />
                      Pending Review
                    </>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Submitted: {new Date(contract.timestamp * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-gray-300">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Document: {contract.documentHash.substring(0, 16)}...
                </div>
                <div className="text-gray-300">Clauses Reviewed: {contract.clauseCount}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
