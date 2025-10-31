'use client';

import { useState, useCallback } from 'react';
import { Contract, BrowserProvider } from 'ethers';
import { useFHEVM } from '@fhevm/sdk/react';
import { useWallet } from './useWallet';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

const CONTRACT_ABI = [
  'function submitContract(string memory _documentHash, string memory _publicTitle) external returns (uint256)',
  'function reviewClause(uint256 _contractId, string memory _clauseType, uint8 _complianceRating, uint8 _sensitivityLevel, string memory _notes) external',
  'function completePrivacyAnalysis(uint256 _contractId, uint32 _dataSensitivity, uint8 _gdprCompliance, uint8 _ccpaCompliance, uint8 _retentionRisk, uint8 _sharingRisk) external',
  'function authorizeReviewer(address _reviewer) external',
  'function revokeReviewer(address _reviewer) external',
  'function getContractInfo(uint256 _contractId) external view returns (string memory, address, uint256, bool, string memory, uint256)',
  'function getSubmitterContracts(address _submitter) external view returns (uint256[])',
  'function getTotalContracts() external view returns (uint256)',
  'function isAuthorizedReviewer(address _reviewer) external view returns (bool)',
  'function owner() external view returns (address)',
];

interface ContractInfo {
  id: number;
  documentHash: string;
  submitter: string;
  timestamp: number;
  isReviewed: boolean;
  title: string;
  clauseCount: number;
}

export function useContract() {
  const [isLoading, setIsLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isReviewer, setIsReviewer] = useState(false);
  const [contracts, setContracts] = useState<ContractInfo[]>([]);
  const [userContracts, setUserContracts] = useState<ContractInfo[]>([]);
  const { address } = useWallet();
  const { isInitialized } = useFHEVM();

  const getContract = useCallback(async () => {
    if (typeof window.ethereum === 'undefined' || !address) return null;

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }, [address]);

  const checkRoles = useCallback(async () => {
    try {
      const contract = await getContract();
      if (!contract || !address) return;

      const owner = await contract.owner();
      setIsOwner(owner.toLowerCase() === address.toLowerCase());

      const reviewer = await contract.isAuthorizedReviewer(address);
      setIsReviewer(reviewer);
    } catch (error) {
      console.error('Error checking roles:', error);
    }
  }, [address, getContract]);

  const submitContract = async (documentHash: string, title: string) => {
    setIsLoading(true);
    try {
      const contract = await getContract();
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.submitContract(documentHash, title);
      await tx.wait();
    } finally {
      setIsLoading(false);
    }
  };

  const reviewClause = async (
    contractId: number,
    clauseType: string,
    complianceRating: number,
    sensitivityLevel: number,
    notes: string
  ) => {
    setIsLoading(true);
    try {
      const contract = await getContract();
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.reviewClause(
        contractId,
        clauseType,
        complianceRating,
        sensitivityLevel,
        notes
      );
      await tx.wait();
    } finally {
      setIsLoading(false);
    }
  };

  const completeAnalysis = async (
    contractId: number,
    dataSensitivity: number,
    gdprCompliance: number,
    ccpaCompliance: number,
    retentionRisk: number,
    sharingRisk: number
  ) => {
    setIsLoading(true);
    try {
      const contract = await getContract();
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.completePrivacyAnalysis(
        contractId,
        dataSensitivity,
        gdprCompliance,
        ccpaCompliance,
        retentionRisk,
        sharingRisk
      );
      await tx.wait();
    } finally {
      setIsLoading(false);
    }
  };

  const authorizeReviewer = async (reviewerAddress: string) => {
    setIsLoading(true);
    try {
      const contract = await getContract();
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.authorizeReviewer(reviewerAddress);
      await tx.wait();
    } finally {
      setIsLoading(false);
    }
  };

  const revokeReviewer = async (reviewerAddress: string) => {
    setIsLoading(true);
    try {
      const contract = await getContract();
      if (!contract) throw new Error('Contract not initialized');

      const tx = await contract.revokeReviewer(reviewerAddress);
      await tx.wait();
    } finally {
      setIsLoading(false);
    }
  };

  const loadContracts = async () => {
    setIsLoading(true);
    try {
      const contract = await getContract();
      if (!contract) return;

      const total = await contract.getTotalContracts();
      const contractList: ContractInfo[] = [];

      for (let i = 1; i <= Number(total); i++) {
        const info = await contract.getContractInfo(i);
        contractList.push({
          id: i,
          documentHash: info[0],
          submitter: info[1],
          timestamp: Number(info[2]),
          isReviewed: info[3],
          title: info[4],
          clauseCount: Number(info[5]),
        });
      }

      setContracts(contractList);
    } catch (error) {
      console.error('Error loading contracts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserContracts = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const contract = await getContract();
      if (!contract) return;

      const contractIds = await contract.getSubmitterContracts(address);
      const contractList: ContractInfo[] = [];

      for (const id of contractIds) {
        const info = await contract.getContractInfo(id);
        contractList.push({
          id: Number(id),
          documentHash: info[0],
          submitter: info[1],
          timestamp: Number(info[2]),
          isReviewed: info[3],
          title: info[4],
          clauseCount: Number(info[5]),
        });
      }

      setUserContracts(contractList);
    } catch (error) {
      console.error('Error loading user contracts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isOwner,
    isReviewer,
    contracts,
    userContracts,
    checkRoles,
    submitContract,
    reviewClause,
    completeAnalysis,
    authorizeReviewer,
    revokeReviewer,
    loadContracts,
    loadUserContracts,
  };
}
