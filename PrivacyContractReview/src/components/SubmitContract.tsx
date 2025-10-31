'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useContract } from '@/hooks/useContract';
import { useToast } from '@/hooks/useToast';

export default function SubmitContract() {
  const { submitContract, isLoading } = useContract();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [documentHash, setDocumentHash] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !documentHash) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      await submitContract(documentHash, title);
      showToast('Contract submitted successfully!', 'success');
      setTitle('');
      setDocumentHash('');
    } catch (error: any) {
      showToast(`Failed to submit contract: ${error.message}`, 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Send className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Submit Contract for Review</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Contract Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a descriptive title for your contract"
            className="w-full px-4 py-3 bg-white bg-opacity-10 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Document Hash / IPFS Hash
          </label>
          <input
            type="text"
            value={documentHash}
            onChange={(e) => setDocumentHash(e.target.value)}
            placeholder="Enter IPFS hash or document identifier"
            className="w-full px-4 py-3 bg-white bg-opacity-10 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white placeholder-gray-400"
            required
          />
          <p className="mt-2 text-sm text-gray-400">
            Example: QmTzQ1JRkWErjk39mryYw2WVaphAZNAREyMchXzYQ8e3qF
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 bg-gradient-to-r from-primary to-pink-600 hover:from-pink-600 hover:to-primary text-white rounded-lg font-medium transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Contract
            </>
          )}
        </button>
      </form>

      <div className="mt-8 p-4 bg-yellow-500 bg-opacity-10 border border-yellow-500 rounded-lg">
        <h3 className="font-medium text-yellow-300 mb-2">How It Works</h3>
        <ul className="text-sm text-yellow-100 space-y-1">
          <li>• Upload your contract document to IPFS</li>
          <li>• Submit the IPFS hash and a descriptive title</li>
          <li>• Authorized reviewers will analyze your contract</li>
          <li>• Review results are encrypted and stored on-chain</li>
        </ul>
      </div>
    </div>
  );
}
