'use client';

import { useState } from 'react';
import { Edit, Loader2 } from 'lucide-react';
import { useContract } from '@/hooks/useContract';
import { useToast } from '@/hooks/useToast';

const CLAUSE_TYPES = [
  { value: 'data_processing', label: 'Data Processing' },
  { value: 'retention', label: 'Data Retention' },
  { value: 'sharing', label: 'Data Sharing' },
  { value: 'consent', label: 'User Consent' },
  { value: 'rights', label: 'User Rights' },
  { value: 'security', label: 'Security Measures' },
  { value: 'breach', label: 'Breach Notification' },
  { value: 'transfer', label: 'Data Transfer' },
];

export default function ReviewForm({ contractId }: { contractId: number | null }) {
  const { reviewClause, isLoading } = useContract();
  const { showToast } = useToast();
  const [clauseType, setClauseType] = useState('');
  const [complianceRating, setComplianceRating] = useState('');
  const [sensitivityLevel, setSensitivityLevel] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contractId) {
      showToast('Please select a contract first', 'error');
      return;
    }

    if (!clauseType || !complianceRating || !sensitivityLevel) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      await reviewClause(
        contractId,
        clauseType,
        parseInt(complianceRating),
        parseInt(sensitivityLevel),
        notes
      );
      showToast('Clause review submitted successfully!', 'success');
      // Reset form
      setClauseType('');
      setComplianceRating('');
      setSensitivityLevel('');
      setNotes('');
    } catch (error: any) {
      showToast(`Failed to submit review: ${error.message}`, 'error');
    }
  };

  return (
    <div className="bg-white bg-opacity-5 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Edit className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-bold">Review Contract Clause</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Contract ID
          </label>
          <input
            type="number"
            value={contractId || ''}
            readOnly
            placeholder="Select a contract above"
            className="w-full px-4 py-2 bg-white bg-opacity-10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Clause Type *
          </label>
          <select
            value={clauseType}
            onChange={(e) => setClauseType(e.target.value)}
            className="w-full px-4 py-2 bg-white bg-opacity-10 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white"
            required
          >
            <option value="">Select clause type</option>
            {CLAUSE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Compliance Rating (0-10) *
          </label>
          <input
            type="number"
            min="0"
            max="10"
            value={complianceRating}
            onChange={(e) => setComplianceRating(e.target.value)}
            placeholder="Rate compliance 0-10"
            className="w-full px-4 py-2 bg-white bg-opacity-10 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sensitivity Level (1-5) *
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={sensitivityLevel}
            onChange={(e) => setSensitivityLevel(e.target.value)}
            placeholder="Rate sensitivity 1-5"
            className="w-full px-4 py-2 bg-white bg-opacity-10 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Review Notes
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter detailed review notes and recommendations"
            className="w-full px-4 py-2 bg-white bg-opacity-10 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !contractId}
          className="w-full px-6 py-3 bg-gradient-to-r from-secondary to-blue-600 hover:from-blue-600 hover:to-secondary text-white rounded-lg font-medium transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Edit className="w-5 h-5" />
              Submit Review
            </>
          )}
        </button>
      </form>
    </div>
  );
}
