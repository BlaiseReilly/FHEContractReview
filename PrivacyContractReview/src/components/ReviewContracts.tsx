'use client';

import { useState, useEffect } from 'react';
import { Search, FileText, Calendar, User, CheckCircle, Clock } from 'lucide-react';
import { useContract } from '@/hooks/useContract';
import ReviewForm from './ReviewForm';
import AnalysisForm from './AnalysisForm';

export default function ReviewContracts() {
  const { contracts, loadContracts, isLoading } = useContract();
  const [selectedContract, setSelectedContract] = useState<number | null>(null);

  useEffect(() => {
    loadContracts();
  }, []);

  return (
    <div className="space-y-8">
      {/* Available Contracts */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Search className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Available Contracts for Review</h2>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-400">Loading contracts...</p>
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No contracts available for review
          </div>
        ) : (
          <div className="grid gap-4">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="bg-white bg-opacity-5 border border-gray-700 rounded-lg p-6 hover:border-primary transition-all cursor-pointer"
                onClick={() => setSelectedContract(contract.id)}
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
                        Pending
                      </>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <User className="w-4 h-4" />
                    <span>{contract.submitter.substring(0, 10)}...</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(contract.timestamp * 1000).toLocaleDateString()}</span>
                  </div>
                  <div className="text-gray-300">
                    <FileText className="w-4 h-4 inline mr-1" />
                    {contract.documentHash.substring(0, 12)}...
                  </div>
                  <div className="text-gray-300">
                    Clauses: {contract.clauseCount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Forms */}
      <div className="grid md:grid-cols-2 gap-8">
        <ReviewForm contractId={selectedContract} />
        <AnalysisForm contractId={selectedContract} />
      </div>
    </div>
  );
}
