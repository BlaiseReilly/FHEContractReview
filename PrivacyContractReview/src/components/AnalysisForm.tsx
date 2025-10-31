'use client';

import { useState } from 'react';
import { BarChart, Loader2 } from 'lucide-react';
import { useContract } from '@/hooks/useContract';
import { useToast } from '@/hooks/useToast';

export default function AnalysisForm({ contractId }: { contractId: number | null }) {
  const { completeAnalysis, isLoading } = useContract();
  const { showToast } = useToast();
  const [dataSensitivity, setDataSensitivity] = useState('');
  const [gdprCompliance, setGdprCompliance] = useState('');
  const [ccpaCompliance, setCcpaCompliance] = useState('');
  const [retentionRisk, setRetentionRisk] = useState('');
  const [sharingRisk, setSharingRisk] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contractId) {
      showToast('Please select a contract first', 'error');
      return;
    }

    if (!dataSensitivity || !gdprCompliance || !ccpaCompliance || !retentionRisk || !sharingRisk) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      await completeAnalysis(
        contractId,
        parseInt(dataSensitivity),
        parseInt(gdprCompliance),
        parseInt(ccpaCompliance),
        parseInt(retentionRisk),
        parseInt(sharingRisk)
      );
      showToast('Privacy analysis completed successfully!', 'success');
      // Reset form
      setDataSensitivity('');
      setGdprCompliance('');
      setCcpaCompliance('');
      setRetentionRisk('');
      setSharingRisk('');
    } catch (error: any) {
      showToast(`Failed to complete analysis: ${error.message}`, 'error');
    }
  };

  return (
    <div className="bg-white bg-opacity-5 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-bold">Complete Privacy Analysis</h3>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Data Sensitivity *
            </label>
            <input
              type="number"
              min="0"
              value={dataSensitivity}
              onChange={(e) => setDataSensitivity(e.target.value)}
              placeholder="0-100"
              className="w-full px-4 py-2 bg-white bg-opacity-10 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              GDPR Compliance (0-10) *
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={gdprCompliance}
              onChange={(e) => setGdprCompliance(e.target.value)}
              placeholder="0-10"
              className="w-full px-4 py-2 bg-white bg-opacity-10 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              CCPA Compliance (0-10) *
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={ccpaCompliance}
              onChange={(e) => setCcpaCompliance(e.target.value)}
              placeholder="0-10"
              className="w-full px-4 py-2 bg-white bg-opacity-10 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Retention Risk (1-5) *
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={retentionRisk}
              onChange={(e) => setRetentionRisk(e.target.value)}
              placeholder="1-5"
              className="w-full px-4 py-2 bg-white bg-opacity-10 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sharing Risk (1-5) *
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={sharingRisk}
              onChange={(e) => setSharingRisk(e.target.value)}
              placeholder="1-5"
              className="w-full px-4 py-2 bg-white bg-opacity-10 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !contractId}
          className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-500 text-white rounded-lg font-medium transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <BarChart className="w-5 h-5" />
              Complete Analysis
            </>
          )}
        </button>
      </form>
    </div>
  );
}
