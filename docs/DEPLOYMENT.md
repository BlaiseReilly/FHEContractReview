# Deployment Guide

Step-by-step guide for deploying the FHE Contract Review Platform.

---

## Prerequisites

- Node.js ≥ 18.0.0
- npm ≥ 9.0.0
- MetaMask wallet with Sepolia ETH
- Alchemy or Infura RPC endpoint
- Etherscan API key

---

## Quick Deployment

```bash
# 1. Clone and install
git clone https://github.com/BlaiseReilly/FHEContractReview.git
cd FHEContractReview
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Compile contracts
npm run compile

# 4. Run tests
npm test

# 5. Deploy to Sepolia
npm run deploy:sepolia

# 6. Verify on Etherscan
npm run verify:sepolia
```

---

## Detailed Steps

### 1. Environment Setup

Create `.env` file:

```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
DEFAULT_NETWORK=sepolia
```

### 2. Compile Contracts

```bash
npm run compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

### 3. Deploy

```bash
npm run deploy:sepolia
```

The deployment script will:
- Deploy PrivacyContractReview contract
- Save deployment info to `deployments/`
- Display contract address and transaction hash

### 4. Verify

```bash
npm run verify:sepolia
```

Verification confirms contract source code on Etherscan.

### 5. Test Deployment

```bash
npx hardhat run scripts/interact.js --network sepolia
```

---

## Network Information

### Sepolia Testnet

- **Chain ID**: 11155111
- **RPC**: https://rpc.sepolia.org
- **Explorer**: https://sepolia.etherscan.io
- **Faucets**:
  - https://sepoliafaucet.com/
  - https://sepolia-faucet.pk910.de/

---

## Current Deployment

- **Contract**: `0x5A042B49224ae2d67d5F216DC9A243F6603848F1`
- **Network**: Sepolia
- **Status**: ✅ Verified
- **View**: [Etherscan](https://sepolia.etherscan.io/address/0x5A042B49224ae2d67d5F216DC9A243F6603848F1)

---

## Troubleshooting

### Issue: "Insufficient funds"

Get Sepolia ETH from faucets listed above.

### Issue: "Nonce too high"

Reset MetaMask: Settings → Advanced → Reset Account

### Issue: "Contract not verified"

Manually verify on Etherscan using Solidity 0.8.24 with optimization enabled (200 runs).

---

For more details, see the main [README](../README.md).
