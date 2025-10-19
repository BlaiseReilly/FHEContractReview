# Architecture Guide

Detailed architecture documentation for the FHE Contract Review Platform.

---

## Overview

The FHE Contract Review Platform is a privacy-preserving smart contract application that enables confidential compliance analysis using Fully Homomorphic Encryption (FHE) from Zama.

---

## System Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  • HTML5/CSS3/JavaScript                                 │
│  • Ethers.js v6 (Web3 integration)                      │
│  • MetaMask (Wallet)                                     │
│  • fhevmjs (FHE client library)                         │
└──────────────────────────────────────────────────────────┘
                         ↓ ↑
┌──────────────────────────────────────────────────────────┐
│                Blockchain Layer (Sepolia)                │
│  • PrivacyContractReview.sol (Smart Contract)           │
│  • Zama FHEVM Library (FHE operations)                  │
│  • EVM with FHE support                                  │
└──────────────────────────────────────────────────────────┘
                         ↓ ↑
┌──────────────────────────────────────────────────────────┐
│              FHE Infrastructure (Zama)                   │
│  • Gateway Service (Decryption)                          │
│  • ACL/KMS (Key Management)                              │
│  • TFHE Library (Encryption Scheme)                      │
└──────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Smart Contract Layer

**File**: `contracts/PrivacyContractReview.sol`

**Key Components**:
- Contract submission and metadata storage
- Encrypted data storage (euint8, euint32)
- Role-based access control (owner, reviewers, submitters)
- FHE operations (encrypt, decrypt, compute)
- Permission management

**Data Structures**:
```solidity
ContractDocument {
    string documentHash        // Public: IPFS/SHA256
    euint32 encryptedScore    // Encrypted: 0-100
    euint8 encryptedRiskLevel // Encrypted: 1-5
    address submitter         // Public
    uint256 submissionTime    // Public
    bool isReviewed           // Public
    string publicTitle        // Public
}

PrivacyAnalysis {
    euint32 encryptedDataSensitivity  // Encrypted: 0-100
    euint8 encryptedGDPRCompliance    // Encrypted: 0-10
    euint8 encryptedCCPACompliance    // Encrypted: 0-10
    euint8 encryptedRetentionRisk     // Encrypted: 1-5
    euint8 encryptedSharingRisk       // Encrypted: 1-5
    bool analysisComplete             // Public
}
```

---

### 2. FHE Integration

**Encryption Flow**:
```
Client-Side:
1. User inputs plaintext value (e.g., rating = 8)
2. fhevmjs encrypts to euint8
3. Send encrypted value to blockchain

Smart Contract:
4. Store encrypted value: euint8 encryptedRating = FHE.asEuint8(8)
5. Grant permissions: FHE.allow(encryptedRating, userAddress)
6. Perform computations: FHE.add(), FHE.gt(), etc.

Decryption:
7. User requests decryption with EIP-712 signature
8. Gateway verifies permissions and decrypts
9. Return plaintext to authorized user
```

**FHE Operations Used**:
- `FHE.asEuint8()` - Encrypt 8-bit value
- `FHE.asEuint32()` - Encrypt 32-bit value
- `FHE.add()` - Add encrypted values
- `FHE.div()` - Divide encrypted values
- `FHE.gt()` - Greater than comparison
- `FHE.allow()` - Grant decryption permission
- `FHE.requestDecryption()` - Request gateway decryption

---

### 3. Frontend Architecture

**File**: `index.html`, `app.js`

**Components**:
- Wallet connection (MetaMask)
- Contract interaction (Ethers.js)
- Form submission
- Data display
- Event listening

**Key Functions**:
```javascript
async function connectWallet()
async function submitContract()
async function reviewClause()
async function loadContracts()
async function requestDecryption()
```

---

## Data Flow Diagrams

### Contract Submission Flow

```
User                Frontend              Smart Contract            Zama FHEVM
  │                    │                        │                       │
  ├─ Submit Form ─────>│                        │                       │
  │                    ├─ Connect Wallet ──────>│                       │
  │                    │                        │                       │
  │                    ├─ Call submitContract() │                       │
  │                    │  (documentHash, title) │                       │
  │                    │                        ├─ Create Document ────>│
  │                    │                        ├─ Initialize euint32(0)│
  │                    │                        ├─ Initialize euint8(3) │
  │                    │                        ├─ Grant Permissions ──>│
  │                    │                        │                       │
  │                    │<── Emit Event ─────────┤                       │
  │<─ Show Success ────┤                        │                       │
  │                    │                        │                       │
```

### Review Flow

```
Reviewer            Frontend              Smart Contract            Zama FHEVM
  │                    │                        │                       │
  ├─ Review Form ─────>│                        │                       │
  │  (ratings 0-10)    │                        │                       │
  │                    ├─ Call reviewClause() ─>│                       │
  │                    │  (contractId, type,    │                       │
  │                    │   compliance, sens)    │                       │
  │                    │                        ├─ Encrypt Values ─────>│
  │                    │                        │  FHE.asEuint8(8)      │
  │                    │                        │                       │
  │                    │                        ├─ Store Encrypted ────>│
  │                    │                        ├─ Grant Permissions ──>│
  │                    │                        │  (reviewer, submitter)│
  │                    │<── Emit Event ─────────┤                       │
  │<─ Show Success ────┤                        │                       │
  │                    │                        │                       │
```

### Decryption Flow

```
User                Frontend              Smart Contract          Gateway/KMS
  │                    │                        │                       │
  ├─ Request Decrypt ─>│                        │                       │
  │                    ├─ Sign EIP-712 ────────>│                       │
  │                    │  (signature)           │                       │
  │                    │                        ├─ Verify Permissions ─>│
  │                    │                        ├─ Request Decrypt ────>│
  │                    │                        │  (ciphertext)         │
  │                    │                        │<── Return Plaintext ──┤
  │                    │<── Return Value ───────┤                       │
  │<─ Display Result ──┤                        │                       │
  │                    │                        │                       │
```

---

## Security Architecture

### Access Control

```
Owner
  ├─ authorizeReviewer()
  ├─ revokeReviewer()
  └─ (implicit) all contract control

Authorized Reviewer
  ├─ reviewClause()
  ├─ completePrivacyAnalysis()
  └─ requestScoreDecryption() (for reviewed contracts)

Submitter
  ├─ submitContract()
  └─ requestScoreDecryption() (for own contracts)

Public
  ├─ getContractInfo()
  ├─ getClauseInfo()
  ├─ getAnalysisStatus()
  └─ view functions
```

### Permission Model

**FHE Permissions**:
```solidity
// Grant permission to decrypt encrypted value
FHE.allow(encryptedValue, userAddress);

// Grant permission to contract itself (for computations)
FHE.allowThis(encryptedValue);
```

**Permission Matrix**:

| Data | Owner | Reviewer | Submitter | Public |
|------|-------|----------|-----------|--------|
| Document Hash | ✅ | ✅ | ✅ | ✅ |
| Title | ✅ | ✅ | ✅ | ✅ |
| Encrypted Score | ✅ | ✅ (if reviewed) | ✅ (if owner) | ❌ |
| Risk Level | ✅ | ✅ (if reviewed) | ✅ (if owner) | ❌ |
| Clause Ratings | ✅ | ✅ (if reviewed) | ✅ (if owner) | ❌ |

---

## Storage Architecture

### On-Chain Storage

**Mappings**:
```solidity
mapping(uint256 => ContractDocument) public contracts;
mapping(uint256 => mapping(uint256 => ReviewClause)) public contractClauses;
mapping(uint256 => PrivacyAnalysis) public privacyAnalyses;
mapping(uint256 => uint256) public contractClauseCounts;
mapping(address => bool) public authorizedReviewers;
mapping(address => uint256[]) public reviewerContracts;
mapping(address => uint256[]) public submitterContracts;
```

**Storage Optimization**:
- Use mappings over arrays for O(1) lookups
- Store encrypted data only (minimize storage)
- Use events for historical data
- Off-chain storage for large documents (IPFS)

---

## Scalability Considerations

### Current Limitations

1. **Gas Costs**: FHE operations are gas-intensive
   - Encryption: ~50k gas per operation
   - Decryption: ~80k gas per request
   - Computation: Varies by operation

2. **Throughput**: Limited by blockchain capacity
   - Sepolia: ~15 TPS
   - Ethereum mainnet: ~15-30 TPS

### Future Optimizations

1. **Batch Operations**: Process multiple reviews in single transaction
2. **Layer 2 Solutions**: Deploy on rollups for lower costs
3. **Optimistic Verification**: Verify only when challenged
4. **Storage Sharding**: Distribute data across multiple contracts

---

## Integration Points

### External Systems

**IPFS Integration** (Future):
```
Contract Documents
      ↓
Upload to IPFS
      ↓
Store Hash on Blockchain
      ↓
Retrieve via Hash
```

**Oracle Integration** (Future):
```
Off-Chain Analysis
      ↓
Oracle Submission
      ↓
On-Chain Verification
      ↓
Update Contract State
```

---

## Deployment Architecture

### Network Topology

```
Developer Machine
      ↓
  Hardhat Deploy
      ↓
Sepolia Testnet
      ↓
Etherscan Verification
      ↓
Frontend (Vercel)
      ↓
End Users
```

### Configuration

**Hardhat Networks**:
```javascript
{
  sepolia: {
    url: SEPOLIA_RPC_URL,
    accounts: [PRIVATE_KEY],
    chainId: 11155111
  }
}
```

---

## Monitoring & Observability

### Events for Monitoring

```solidity
event ContractSubmitted(...)    // Track submissions
event ClauseReviewed(...)       // Track reviews
event AnalysisCompleted(...)    // Track completions
event ComplianceAlert(...)      // Track compliance issues
event ReviewerAuthorized(...)   // Track authorization changes
```

### Metrics to Track

- Contracts submitted per day
- Reviews completed per day
- Average compliance scores
- Number of compliance alerts
- Active reviewers
- Gas costs per operation

---

## Technology Stack Summary

| Layer | Technology | Version |
|-------|------------|---------|
| Smart Contract | Solidity | 0.8.24 |
| FHE Library | Zama FHEVM | 0.5.0 |
| Development | Hardhat | 2.20.1 |
| Frontend | Ethers.js | 6.11.1 |
| FHE Client | fhevmjs | 0.5.0 |
| Blockchain | Ethereum (Sepolia) | - |
| Wallet | MetaMask | - |

---

## Design Patterns Used

1. **Access Control**: Role-based permissions
2. **Factory Pattern**: Contract submission creates documents
3. **Observer Pattern**: Event emissions for state changes
4. **Strategy Pattern**: Different review strategies per clause type
5. **State Machine**: Contract review lifecycle (submitted → reviewed → completed)

---

For implementation details, see [API Documentation](./API.md).

For security considerations, see [Security Guide](./SECURITY.md).
