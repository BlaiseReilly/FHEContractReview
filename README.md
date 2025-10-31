# 🔐 FHE Contract Review Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-FFDB1C.svg)](https://hardhat.org/)
[![Zama FHEVM](https://img.shields.io/badge/Powered%20by-Zama%20FHEVM-blue)](https://www.zama.ai/)

**Privacy-preserving contract compliance review platform using Zama FHEVM for confidential clause analysis**

Demonstrating practical privacy-preserving compliance review with Fully Homomorphic Encryption (FHE) technology.

---

## 🌐 Live Demo

- **GitHub Repository**: [https://github.com/BlaiseReilly/FHEContractReview](https://github.com/BlaiseReilly/FHEContractReview)
- **Live Application**: [https://fhe-contract-review.vercel.app/](https://fhe-contract-review.vercel.app/)
- **Demo Video**: Download `demo.mp4` from repository to watch the full workflow demonstration
- **Smart Contract**: `0x5A042B49224ae2d67d5F216DC9A243F6603848F1`
- **Network**: Sepolia Testnet (Chain ID: 11155111)
- **Etherscan**: [View Contract on Sepolia](https://sepolia.etherscan.io/address/0x5A042B49224ae2d67d5F216DC9A243F6603848F1)

**Note**: The demo video (`demo.mp4`) must be downloaded from the repository to view. Direct streaming links are not available.

---

## 📖 Core Concepts

### FHE Contract - Confidential Contract Review

This platform demonstrates **Fully Homomorphic Encryption (FHE)** applied to smart contract privacy analysis. The core concept enables:

**Privacy-Preserving Clause Analysis**
- Contract clauses and compliance scores remain encrypted on-chain
- Reviewers can analyze and compute on encrypted data without decrypting
- Only authorized parties can decrypt specific results
- All sensitive operations happen on encrypted data using FHE operations

**Key FHE Concepts**:

1. **Encrypted Data Types**
   - `euint8` - Encrypted 8-bit integers for ratings (0-10) and risk levels (1-5)
   - `euint32` - Encrypted 32-bit integers for aggregate scores (0-100)
   - All computations performed on encrypted values

2. **Homomorphic Operations**
   - Add encrypted scores: `FHE.add(score1, score2)`
   - Compare encrypted values: `FHE.eq(value1, value2)`
   - Conditional selection: `FHE.select(condition, trueValue, falseValue)`

3. **Confidential Compliance Review**
   - Reviewers submit encrypted compliance ratings
   - Platform computes aggregate scores on encrypted data
   - Privacy-preserving alerts for low compliance
   - Selective decryption only for authorized users

### Privacy Model

**What Remains Encrypted**:
- ✅ GDPR compliance scores
- ✅ CCPA compliance scores
- ✅ Data sensitivity ratings
- ✅ Risk level assessments
- ✅ Individual clause ratings

**What Is Public**:
- ✅ Contract metadata (title, hash, timestamp)
- ✅ Reviewer addresses
- ✅ Clause types (categories)
- ✅ Review completion status

**Who Can Decrypt**:
- 📝 **Contract Submitters** - Their own contract scores
- 👨‍⚖️ **Authorized Reviewers** - Contracts they reviewed
- 👑 **Platform Owner** - Emergency access for compliance

---

## ✨ Features

### Confidential Analysis Capabilities

- 🔐 **Encrypted Compliance Scoring** - GDPR/CCPA compliance analysis without exposing ratings
- 🧮 **Homomorphic Computation** - Calculate aggregate scores on encrypted data using Zama FHEVM
- 🎭 **Role-Based Access Control** - Separate permissions for submitters, reviewers, and administrators
- 📊 **Privacy-First Ratings** - All compliance scores (0-10) and sensitivity levels (1-5) remain encrypted
- 🔍 **Comprehensive Clause Analysis** - 8 clause categories:
  - Data processing policies
  - Data retention practices
  - Third-party data sharing
  - User consent mechanisms
  - User privacy rights
  - Security measures
  - Breach notification procedures
  - Cross-border data transfer

### Technical Features

- ⚡ **FHE Operations** - Real-time encrypted computations (add, compare, select)
- 🚨 **Automated Privacy Alerts** - Detect compliance issues on encrypted data
- 🔒 **EIP-712 Signatures** - Secure decryption authorization
- 🌍 **Production Deployment** - Live on Sepolia testnet with verified contract

### Frontend Implementations

#### 🎨 React Edition (Modern)

The platform now includes a **modern React version** with enhanced developer experience:

**Architecture:**
- **Next.js 14** - App Router with server and client components
- **TypeScript** - Full type safety across the application
- **Tailwind CSS** - Utility-first styling with custom theme
- **FHEVM Universal SDK** - React hooks for FHE operations

**Components:**
- `WalletConnection` - MetaMask integration with connection state
- `SubmitContract` - Contract submission form with validation
- `ReviewContracts` - Reviewer dashboard with contract listing
- `ReviewForm` - Clause review interface with encrypted submissions
- `AnalysisForm` - Privacy analysis with GDPR/CCPA scoring
- `MyContracts` - User's submitted contracts with status tracking
- `AdminPanel` - Reviewer management for contract owners

**Custom Hooks:**
- `useWallet()` - Wallet connection and account management
- `useContract()` - Smart contract interactions with SDK
- `useToast()` - Notification system for user feedback

**SDK Integration:**
```typescript
import { FHEVMProvider, useFHEVM } from '@fhevm/sdk/react';

// Provider setup
<FHEVMProvider config={{ network: 'sepolia' }}>
  <App />
</FHEVMProvider>

// Component usage
const { isInitialized, encrypt, decrypt } = useFHEVM();
```

**Benefits:**
- ✅ Type-safe contract interactions
- ✅ Component-based architecture
- ✅ Hot reload development
- ✅ Better state management
- ✅ Easier testing and maintenance
- ✅ Modern developer experience

#### 📄 Legacy Edition (Static HTML)

Original implementation preserved for:
- ✅ Simple deployment needs
- ✅ No build step required
- ✅ Minimal dependencies
- ✅ Educational reference

Both versions connect to the **same smart contract** and provide **identical functionality** with different user experiences.

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│              FHE Contract Review Platform                    │
│         Privacy-Preserving Compliance Analysis               │
└─────────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
    ┌─────▼──────┐   ┌──────▼──────┐   ┌─────▼──────┐
    │ Submitters │   │  Reviewers  │   │   Admins   │
    │  (Users)   │   │ (Analysts)  │   │  (Owner)   │
    └────────────┘   └─────────────┘   └────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                ┌───────────▼────────────┐
                │   Smart Contract       │
                │  (Zama FHEVM-enabled)  │
                │   Privacy-Preserving   │
                └────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
    ┌─────▼──────┐   ┌──────▼──────┐   ┌─────▼──────┐
    │ Encrypted  │   │   Privacy   │   │ Compliance │
    │  Storage   │   │  Analysis   │   │   Alerts   │
    └────────────┘   └─────────────┘   └────────────┘
```

### Data Flow - Privacy-Preserving Analysis

```
1. User Submits Contract
         ↓
┌────────────────────────────────────┐
│  Public Metadata                   │
│  • Document Hash (IPFS/SHA256)    │
│  • Title                          │
│  • Submitter Address              │
│  • Timestamp                      │
└────────────────────────────────────┘
         ↓
┌────────────────────────────────────┐
│  Encrypted Initial State (FHE)     │
│  • Compliance Score: euint32(0)   │
│  • Risk Level: euint8(3)          │
└────────────────────────────────────┘
         ↓
2. Authorized Reviewer Analyzes Clauses
         ↓
┌────────────────────────────────────┐
│  Clause-by-Clause Review (FHE)     │
│  ┌──────────────────────────────┐ │
│  │ For each clause type:        │ │
│  │ • Compliance: 0-10 (euint8) │ │
│  │ • Sensitivity: 1-5 (euint8) │ │
│  │ • Notes: encrypted          │ │
│  └──────────────────────────────┘ │
│  All ratings stored encrypted     │
└────────────────────────────────────┘
         ↓
3. Privacy Analysis Computation
         ↓
┌────────────────────────────────────┐
│  Aggregate Analysis (FHE Compute)  │
│  ┌──────────────────────────────┐ │
│  │ Homomorphic Operations:      │ │
│  │ • Sum encrypted scores       │ │
│  │ • Calculate averages         │ │
│  │ • Assess overall risk        │ │
│  └──────────────────────────────┘ │
│                                    │
│  Results (all encrypted):          │
│  • Data Sensitivity: euint32      │
│  • GDPR Compliance: euint8        │
│  • CCPA Compliance: euint8        │
│  • Retention Risk: euint8         │
│  • Sharing Risk: euint8           │
└────────────────────────────────────┘
         ↓
4. Authorized Decryption
         ↓
┌────────────────────────────────────┐
│  User requests decryption          │
│  → EIP-712 signature required      │
│  → Access control verified         │
│  → Results decrypted for user      │
└────────────────────────────────────┘
```

### Technical Stack

#### React Edition (Modern - Recommended)

```
┌─────────────────────────────────────┐
│      Frontend Layer (React)         │
│  • React 18 + Next.js 14           │
│  • TypeScript                      │
│  • Tailwind CSS                    │
│  • FHEVM Universal SDK (React)     │
│  • Ethers.js v6                    │
│  • Lucide React Icons              │
│  • MetaMask Integration            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Smart Contract Layer           │
│  • Solidity 0.8.24                 │
│  • Zama FHEVM Library              │
│  • OpenZeppelin (utilities)        │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│    FHE Computation Layer            │
│  • FHEVM Universal SDK             │
│  • fhevmjs - Client library        │
│  • TFHE - Encryption scheme        │
│  • Gateway - Decryption service    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│       Blockchain Layer              │
│  • Ethereum (Sepolia Testnet)      │
│  • Hardhat Development             │
│  • Etherscan Verification          │
└─────────────────────────────────────┘
```

#### Legacy Edition (Static HTML)

```
┌─────────────────────────────────────┐
│    Frontend Layer (Static)          │
│  • HTML5 / CSS3 / JavaScript       │
│  • Ethers.js v6                    │
│  • MetaMask Integration            │
└─────────────────────────────────────┘
              ↓
        (Same layers as above)
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18.0.0
- npm ≥ 9.0.0
- MetaMask wallet
- Sepolia testnet ETH ([Get from faucet](https://sepoliafaucet.com/))

### Installation

```bash
# Clone repository
git clone https://github.com/BlaiseReilly/FHEContractReview.git
cd FHEContractReview

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials:
# - PRIVATE_KEY (wallet private key)
# - SEPOLIA_RPC_URL (Alchemy or Infura)
# - ETHERSCAN_API_KEY (for verification)
```

### Compile Contracts

```bash
npm run compile

# Expected output:
# Compiled 1 Solidity file successfully
```

### Run Tests

```bash
# Run all tests (54+ test cases)
npm test

# Run with gas reporting
npm run test:gas

# Generate coverage report
npm run test:coverage
```

### Deploy to Sepolia

```bash
# Deploy contract
npm run deploy:sepolia

# Verify on Etherscan
npm run verify:sepolia
```

### Run Frontend

#### Option 1: React Edition (Recommended)

```bash
# Navigate to React app
cd PrivacyContractReview

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with contract address

# Start Next.js development server
npm run dev

# Open http://localhost:3002
```

**Features:**
- ✅ Modern React + TypeScript architecture
- ✅ FHEVM Universal SDK integration
- ✅ Component-based UI with Tailwind CSS
- ✅ Hot reload for fast development
- ✅ Type-safe contract interactions

#### Option 2: Legacy Static HTML

```bash
# Start simple HTTP server
npm run dev

# Open browser to displayed localhost URL
```

**Features:**
- ✅ No build step required
- ✅ Lightweight and simple
- ✅ Direct DOM manipulation
```

---

## 🔐 Privacy Contract Review - Usage Guide

### For Contract Submitters

1. **Connect Wallet**
   - Open application
   - Connect MetaMask to Sepolia network
   - Ensure you have Sepolia ETH

2. **Submit Contract for Review**
   ```javascript
   // Example: Submit a contract
   await contract.submitContract(
     "QmXxxx...", // IPFS hash or document identifier
     "Privacy Policy v2.0" // Public title
   );
   ```

3. **View Your Submissions**
   - Check submission status
   - Monitor review progress
   - Request score decryption when reviewed

4. **Decrypt Your Results**
   ```javascript
   // Request decryption (requires EIP-712 signature)
   await contract.requestScoreDecryption(contractId);
   ```

### For Authorized Reviewers

1. **Authorization** (Owner only)
   ```javascript
   // Owner authorizes reviewer
   await contract.authorizeReviewer(reviewerAddress);
   ```

2. **Review Contract Clauses**
   ```javascript
   // Review each clause type
   await contract.reviewClause(
     contractId,
     "data_processing", // Clause type
     8, // Compliance rating (0-10)
     4, // Sensitivity level (1-5)
     "Notes about this clause"
   );
   ```

3. **Complete Privacy Analysis**
   ```javascript
   // Submit overall analysis (all values encrypted)
   await contract.completePrivacyAnalysis(
     contractId,
     85, // Data sensitivity (0-100)
     9,  // GDPR compliance (0-10)
     8,  // CCPA compliance (0-10)
     2,  // Retention risk (1-5)
     3   // Sharing risk (1-5)
   );
   ```

### Clause Types

| Clause Type | Description | Focus Area |
|-------------|-------------|------------|
| `data_processing` | How personal data is processed | Processing lawfulness, purpose limitation |
| `retention` | Data retention policies | Storage duration, deletion procedures |
| `sharing` | Third-party data sharing | Data transfers, processor agreements |
| `consent` | User consent mechanisms | Consent collection, withdrawal rights |
| `user_rights` | User privacy rights | Access, rectification, erasure, portability |
| `security` | Security measures | Technical and organizational measures |
| `breach_notification` | Breach response procedures | Notification timelines, procedures |
| `cross_border` | International data transfers | Transfer mechanisms, adequacy decisions |

---

## 📊 FHEVM Integration

### Encrypted Data Types Used

```solidity
import { FHE, euint32, euint8 } from "@fhevm/solidity/lib/FHE.sol";

// Contract structure with encrypted fields
struct ContractDocument {
    string documentHash;           // Public: IPFS/SHA256 hash
    euint32 encryptedScore;       // Encrypted: Overall score (0-100)
    euint8 encryptedRiskLevel;    // Encrypted: Risk (1-5)
    address submitter;            // Public: Submitter address
    uint256 submissionTime;       // Public: Timestamp
    bool isReviewed;              // Public: Status
    string publicTitle;           // Public: Title
}

struct PrivacyAnalysis {
    euint32 encryptedDataSensitivity;  // Encrypted: 0-100
    euint8 encryptedGDPRCompliance;    // Encrypted: 0-10
    euint8 encryptedCCPACompliance;    // Encrypted: 0-10
    euint8 encryptedRetentionRisk;     // Encrypted: 1-5
    euint8 encryptedSharingRisk;       // Encrypted: 1-5
    bool analysisComplete;             // Public: Status
}
```

### FHE Operations Examples

```solidity
// 1. Encrypt plain values
euint8 encryptedCompliance = FHE.asEuint8(8); // Encrypt rating of 8

// 2. Grant permissions for encrypted data
FHE.allow(encryptedCompliance, reviewerAddress);
FHE.allow(encryptedCompliance, submitterAddress);

// 3. Comparison operations
ebool isHighRisk = FHE.gt(encryptedRisk, FHE.asEuint8(3)); // Check if risk > 3

// 4. Arithmetic on encrypted values
euint8 averageScore = FHE.div(
    FHE.add(gdprScore, ccpaScore),
    FHE.asEuint8(2)
);

// 5. Request decryption (requires authorization)
bytes32[] memory cts = new bytes32[](1);
cts[0] = FHE.toBytes32(encryptedScore);
FHE.requestDecryption(cts, callbackSelector);
```

### Privacy Guarantees

✅ **On-Chain Privacy**
- All compliance scores encrypted at rest
- No plaintext sensitive data on blockchain
- Computations performed on encrypted values

✅ **Access Control**
- Only authorized parties can decrypt
- EIP-712 signatures for decryption requests
- Granular permission management

✅ **Transparency Where Needed**
- Public metadata for auditability
- Contract addresses remain visible
- Review status publicly accessible

---

## 🧪 Testing

### Test Coverage

The platform includes **54+ comprehensive test cases**:

**Deployment Tests** (5 tests)
- ✅ Correct owner assignment
- ✅ Initial counter values
- ✅ Owner reviewer authorization

**Reviewer Authorization** (8 tests)
- ✅ Owner can authorize reviewers
- ✅ Authorization events emitted
- ✅ Authorization status tracking
- ✅ Revocation functionality

**Contract Submission** (7 tests)
- ✅ Users can submit contracts
- ✅ Correct metadata storage
- ✅ Encrypted initial values
- ✅ Event emissions

**Clause Review** (10 tests)
- ✅ Authorized reviewers can review
- ✅ Validation of ratings
- ✅ Encrypted storage
- ✅ Multiple clause types

**Privacy Analysis** (12 tests)
- ✅ Complete analysis submission
- ✅ Aggregate score calculation
- ✅ Risk assessment
- ✅ Compliance alerts

**Access Control** (8 tests)
- ✅ Permission checks
- ✅ Unauthorized access prevention
- ✅ Role validation

**Decryption** (4+ tests)
- ✅ Authorized decryption
- ✅ EIP-712 signature verification
- ✅ Permission-based access

### Running Tests

```bash
# All tests
npm test

# With gas reporting
npm run test:gas

# Coverage report
npm run test:coverage

# Specific test file
npx hardhat test test/PrivacyContractReview.test.js
```

---

## 📁 Project Structure

```
FHEContractReview/
├── contracts/
│   └── PrivacyContractReview.sol      # Main FHE contract
│
├── scripts/
│   ├── deploy.js                      # Deployment script
│   ├── verify.js                      # Etherscan verification
│   ├── interact.js                    # Contract interaction
│   └── simulate.js                    # Full workflow simulation
│
├── test/
│   └── PrivacyContractReview.test.js  # 54+ test cases
│
├── docs/
│   ├── API.md                         # API documentation
│   ├── ARCHITECTURE.md                # Architecture details
│   ├── DEPLOYMENT.md                  # Deployment guide
│   └── SECURITY.md                    # Security considerations
│
├── .github/
│   └── workflows/
│       ├── test.yml                   # Automated testing
│       ├── coverage.yml               # Coverage reporting
│       ├── security.yml               # Security scans
│       └── ci.yml                     # Continuous integration
│
├── index.html                         # Frontend application
├── app.js                             # Application logic
├── hardhat.config.js                  # Hardhat configuration
├── .env.example                       # Environment template
├── package.json                       # Dependencies
├── demo.mp4                           # Demo video (download to view)
└── README.md                          # This file
```

---

## 🔒 Security Features

### Smart Contract Security

- ✅ **Access Control** - Role-based permissions (owner, reviewers, submitters)
- ✅ **Input Validation** - Range checks on all ratings and parameters
- ✅ **Reentrancy Protection** - Follows checks-effects-interactions pattern
- ✅ **Integer Safety** - Solidity 0.8.x built-in overflow protection
- ✅ **Event Logging** - Comprehensive event emissions for auditability

### FHE Security

- ✅ **End-to-End Encryption** - Data encrypted client-side before submission
- ✅ **Homomorphic Operations** - Computations on encrypted data only
- ✅ **Access Control Lists** - Granular permissions per encrypted value
- ✅ **EIP-712 Signatures** - Secure decryption authorization

### Automated Security

- ✅ **Solhint** - Solidity linting with 15+ security rules
- ✅ **ESLint** - JavaScript security checks
- ✅ **npm audit** - Dependency vulnerability scanning
- ✅ **Pre-commit hooks** - Automated security checks before commits
- ✅ **CI/CD security** - GitHub Actions security workflows

---

## 📈 Gas Optimization

### Gas Costs (Sepolia Testnet)

| Operation | Gas Used | Est. Cost @ 50 gwei |
|-----------|----------|---------------------|
| Deploy Contract | ~2,800,000 | ~0.14 ETH |
| Submit Contract | ~150,000 | ~0.0075 ETH |
| Review Clause | ~120,000 | ~0.006 ETH |
| Complete Analysis | ~200,000 | ~0.01 ETH |
| Authorize Reviewer | ~50,000 | ~0.0025 ETH |
| Request Decryption | ~80,000 | ~0.004 ETH |

### Optimization Techniques

- ✅ **Compiler Optimization** - 200 runs for balanced gas costs
- ✅ **Storage Packing** - Efficient struct layouts
- ✅ **Function Optimization** - External over public where possible
- ✅ **Minimal Storage** - Off-chain data storage (IPFS)

---

## 🌐 Deployment

### Live Deployment Information

- **Contract Address**: `0x5A042B49224ae2d67d5F216DC9A243F6603848F1`
- **Network**: Sepolia Testnet
- **Chain ID**: 11155111
- **Block Explorer**: [Sepolia Etherscan](https://sepolia.etherscan.io/address/0x5A042B49224ae2d67d5F216DC9A243F6603848F1)
- **Deployment Date**: 2024
- **Status**: ✅ Verified and Active

### Network Configuration

```javascript
// Sepolia RPC endpoints
https://rpc.sepolia.org
https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
https://sepolia.infura.io/v3/YOUR_PROJECT_ID

// Faucets for Sepolia ETH
https://sepoliafaucet.com/
https://sepolia-faucet.pk910.de/
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using conventional commits
4. Run tests (`npm test`)
5. Push to your branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Workflow

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Run tests
npm test

# Check test coverage
npm run test:coverage

# Compile contracts
npm run compile

# Deploy to local network
npm run deploy:local
```

---

## 📚 Documentation

For detailed documentation, see the `docs/` folder:

- **[API Documentation](./docs/API.md)** - Complete contract API reference
- **[Architecture Guide](./docs/ARCHITECTURE.md)** - System design and FHE integration
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Step-by-step deployment instructions
- **[Security Considerations](./docs/SECURITY.md)** - Security model and best practices

---

## 🎬 Demo Video

**Download the demo video** (`demo.mp4`) from the repository to see:

1. **Platform Overview** (0:00 - 1:00)
   - System architecture
   - Privacy features
   - FHE concepts

2. **Contract Submission** (1:00 - 2:30)
   - Connect wallet
   - Submit contract
   - View submission

3. **Reviewer Workflow** (2:30 - 5:00)
   - Authorization process
   - Clause-by-clause review
   - Privacy analysis completion

4. **Decryption Demo** (5:00 - 6:30)
   - EIP-712 signature
   - Authorized decryption
   - View results

5. **FHE Operations** (6:30 - 8:00)
   - Encrypted computations
   - Homomorphic operations
   - Privacy guarantees

**Note**: The video file must be downloaded from the GitHub repository. Streaming is not supported.

---

## 🛠️ Technology Stack

### Smart Contract

- **Solidity** 0.8.24 - Smart contract language
- **Zama FHEVM** 0.5.0 - Fully Homomorphic Encryption library
- **Hardhat** 2.20.1 - Development environment
- **OpenZeppelin** - Contract utilities

### Frontend

- **HTML5** / **CSS3** / **JavaScript** - Web interface
- **Ethers.js** 6.11.1 - Ethereum library
- **MetaMask** - Wallet integration
- **fhevmjs** 0.5.0 - FHE client library

### Development Tools

- **TypeScript** - Type safety (optional)
- **ESLint** - JavaScript linting
- **Solhint** - Solidity linting
- **Prettier** - Code formatting
- **Husky** - Git hooks

### Testing & CI/CD

- **Hardhat Testing Framework** - Contract tests
- **Chai** - Assertion library
- **Codecov** - Coverage reporting
- **GitHub Actions** - CI/CD automation

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## 📂 Project Structure

### React Edition

```
PrivacyContractReview/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # Root layout with FHEVMProvider
│   │   ├── page.tsx             # Main page with tabbed interface
│   │   └── globals.css          # Tailwind CSS styles
│   ├── components/              # React Components
│   │   ├── WalletConnection.tsx # MetaMask wallet integration
│   │   ├── SubmitContract.tsx   # Contract submission form
│   │   ├── ReviewContracts.tsx  # Reviewer dashboard
│   │   ├── ReviewForm.tsx       # Clause review interface
│   │   ├── AnalysisForm.tsx     # Privacy analysis form
│   │   ├── MyContracts.tsx      # User contracts listing
│   │   └── AdminPanel.tsx       # Admin controls
│   └── hooks/                   # Custom React Hooks
│       ├── useWallet.ts         # Wallet management
│       ├── useContract.ts       # Contract interactions with SDK
│       └── useToast.ts          # Toast notifications
├── contracts/                   # Solidity smart contracts
│   └── PrivacyContractReview.sol
├── scripts/                     # Deployment scripts
├── test/                        # Test files
├── index-legacy.html           # Legacy static version
├── app-legacy.js              # Legacy JavaScript
├── package.json
├── next.config.js
├── tsconfig.json
└── tailwind.config.js
```

### Smart Contracts

```
contracts/
├── PrivacyContractReview.sol    # Main contract with FHE
├── interfaces/
└── libraries/
```

---

## 🙏 Acknowledgments

- **[Zama](https://www.zama.ai/)** - For FHEVM technology and FHE innovation
- **[fhevmjs](https://github.com/zama-ai/fhevmjs)** - JavaScript FHE library
- **[FHEVM Universal SDK](https://github.com/zama-ai/fhevm-react-template)** - React SDK for FHEVM
- **[Next.js](https://nextjs.org/)** - React framework for production
- **[Hardhat](https://hardhat.org/)** - Ethereum development environment
- **[OpenZeppelin](https://openzeppelin.com/)** - Smart contract libraries
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **Ethereum Community** - For testnet infrastructure

---

## 📞 Support

- **GitHub Issues**: [Report bugs](https://github.com/BlaiseReilly/FHEContractReview/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/BlaiseReilly/FHEContractReview/discussions)
- **Zama Discord**: [Join community](https://discord.gg/zama)

---

## 🗺️ Roadmap

### Current Version (v1.0)

**Core Features:**
- ✅ FHE-enabled contract review
- ✅ 8 clause types for privacy analysis
- ✅ Role-based access control
- ✅ Sepolia testnet deployment
- ✅ Comprehensive testing (54+ test cases)

**Frontend Implementations:**
- ✅ React + Next.js 14 edition with TypeScript
- ✅ FHEVM Universal SDK integration
- ✅ Tailwind CSS responsive design
- ✅ Component-based architecture
- ✅ Custom React hooks for state management
- ✅ Legacy static HTML version

### Version 1.1 (In Progress)

- 🔄 Enhanced React UI with advanced features
- 🔄 Real-time contract status updates
- 🔄 Improved mobile responsiveness
- 🔄 Dark mode support

### Future Enhancements (v2.0)

- 🔮 Multi-signature reviewer approvals
- 🔮 Advanced FHE operations (comparison, conditional logic)
- 🔮 IPFS integration for document storage
- 🔮 Additional compliance frameworks (SOC 2, ISO 27001)
- 🔮 Batch review capabilities
- 🔮 GraphQL API for better data querying
- 🔮 Progressive Web App (PWA) support

---

**Built with privacy-first principles using Zama FHEVM technology**

**Making confidential compliance review accessible and practical**
