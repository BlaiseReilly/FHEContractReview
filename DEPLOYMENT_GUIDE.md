# Deployment Guide - Privacy Contract Review Platform

This guide provides step-by-step instructions for deploying the Privacy Contract Review smart contract using Hardhat.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Compilation](#compilation)
4. [Local Deployment](#local-deployment)
5. [Sepolia Testnet Deployment](#sepolia-testnet-deployment)
6. [Contract Verification](#contract-verification)
7. [Post-Deployment Testing](#post-deployment-testing)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- **Node.js**: Version 16.x or higher
- **npm** or **yarn**: Package manager
- **Git**: For version control
- **MetaMask** or compatible wallet
- **Testnet ETH**: For Sepolia deployment

### Check Your Environment

```bash
node --version    # Should be v16.0.0 or higher
npm --version     # Should be 8.0.0 or higher
```

---

## Environment Setup

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages:
- Hardhat
- Ethers.js v6
- Hardhat Toolbox
- FHE Solidity library
- Testing frameworks

### 2. Configure Environment Variables

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
PRIVATE_KEY=0x1234567890abcdef...
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
```

### Where to Get Credentials

#### Private Key
- Use MetaMask: Settings → Security & Privacy → Reveal Private Key
- **IMPORTANT**: Use a dedicated testnet wallet, never your mainnet wallet

#### Sepolia RPC URL
- **Alchemy**: https://www.alchemy.com/
  1. Create free account
  2. Create new app (select Sepolia network)
  3. Copy HTTPS endpoint

- **Infura**: https://infura.io/
  1. Create free account
  2. Create new project
  3. Select Sepolia network
  4. Copy endpoint URL

#### Etherscan API Key
- Visit: https://etherscan.io/myapikey
- Create account and generate API key

#### Get Sepolia Testnet ETH
- **Alchemy Faucet**: https://sepoliafaucet.com/
- **Infura Faucet**: https://www.infura.io/faucet/sepolia
- **Chainlink Faucet**: https://faucets.chain.link/sepolia

You'll need approximately 0.1 ETH for deployment and testing.

---

## Compilation

Compile the smart contracts before deployment:

```bash
npm run compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

This generates:
- `/artifacts/` - Compiled contract artifacts
- `/cache/` - Hardhat cache files
- `/typechain-types/` - TypeScript type definitions

---

## Local Deployment

### 1. Start Local Hardhat Node

In one terminal:
```bash
npm run node
```

This starts a local Ethereum node at `http://127.0.0.1:8545/` with 20 test accounts.

### 2. Deploy to Local Network

In another terminal:
```bash
npm run deploy:local
```

Expected output:
```
=================================================
Privacy Contract Review Platform - Deployment
=================================================

Network: hardhat
Deployer address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Deployer balance: 10000.0 ETH

Deploying PrivacyContractReview contract...
⏳ Please wait...

✅ Contract deployed successfully!
📍 Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### 3. Run Simulation

Test the complete workflow:
```bash
npm run simulate
```

This simulates:
- Reviewer authorization
- Contract submissions
- Clause reviews
- Privacy analysis completion
- Access control verification

---

## Sepolia Testnet Deployment

### 1. Verify Prerequisites

Ensure you have:
- ✅ Configured `.env` file
- ✅ Sepolia ETH in your wallet (check: https://sepolia.etherscan.io/)
- ✅ Valid RPC endpoint

### 2. Deploy to Sepolia

```bash
npm run deploy:sepolia
```

Deployment process:
1. Connects to Sepolia network
2. Checks deployer balance
3. Deploys PrivacyContractReview contract
4. Saves deployment info to `deployments/sepolia_latest.json`
5. Displays Etherscan link

Expected output:
```
=================================================
Privacy Contract Review Platform - Deployment
=================================================

Network: sepolia
Deployer address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Deployer balance: 0.15 ETH

Deploying PrivacyContractReview contract...
⏳ Please wait...

✅ Contract deployed successfully!
📍 Contract Address: 0x5A042B49224ae2d67d5F216DC9A243F6603848F1
🔗 Transaction Hash: 0xabc123...
⛽ Gas Used: 2841923
🔍 Etherscan: https://sepolia.etherscan.io/address/0x5A042B49224ae2d67d5F216DC9A243F6603848F1

=================================================
Contract Information
=================================================
Owner: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Initial Contract Counter: 0
Deployer is authorized reviewer: true

📄 Deployment info saved to: sepolia_1234567890.json
```

### 3. Verify Deployment

Check the deployment on Etherscan:
1. Open the Etherscan URL from deployment output
2. Verify transaction status is "Success"
3. Check contract creation details

---

## Contract Verification

Verify your contract source code on Etherscan:

```bash
npm run verify:sepolia
```

This will:
1. Read deployment info from `deployments/sepolia_latest.json`
2. Submit source code to Etherscan
3. Verify contract compilation

Expected output:
```
=================================================
Contract Verification on Etherscan
=================================================

Network: sepolia
Contract Address: 0x5A042B49224ae2d67d5F216DC9A243F6603848F1
Contract Name: PrivacyContractReview

⏳ Starting verification...

Successfully submitted source code for contract
contracts/PrivacyContractReview.sol:PrivacyContractReview at
0x5A042B49224ae2d67d5F216DC9A243F6603848F1
for verification on the block explorer. Waiting for verification result...

Successfully verified contract PrivacyContractReview on Etherscan.
https://sepolia.etherscan.io/address/0x5A042B49224ae2d67d5F216DC9A243F6603848F1#code

✅ Contract verified successfully!
```

After verification, users can:
- Read contract source code on Etherscan
- Interact with contract directly via Etherscan UI
- View verified contract details

---

## Post-Deployment Testing

### 1. Interact with Deployed Contract

```bash
npm run interact
```

This script:
- Connects to deployed contract
- Displays current state
- Submits example contract
- Performs example review (if authorized)
- Shows available functions

### 2. Manual Testing via Etherscan

1. Go to contract on Etherscan
2. Click "Contract" tab → "Write Contract"
3. Connect your wallet
4. Test functions:
   - `submitContract()` - Submit a test contract
   - `authorizeReviewer()` - Authorize a reviewer (owner only)
   - `reviewClause()` - Review a clause (reviewers only)

### 3. Query Contract State

Use Etherscan "Read Contract" tab:
- `getTotalContracts()` - See total submissions
- `isAuthorizedReviewer(address)` - Check reviewer status
- `getContractInfo(uint256)` - Get contract details
- `owner()` - View contract owner

---

## Troubleshooting

### Common Issues

#### 1. "Insufficient funds for gas"

**Problem**: Not enough ETH for deployment
**Solution**:
```bash
# Check your balance
npm run balance

# Get more testnet ETH from faucet
# https://sepoliafaucet.com/
```

#### 2. "Invalid API Key"

**Problem**: Incorrect Etherscan API key
**Solution**:
- Verify API key at https://etherscan.io/myapikey
- Ensure no extra spaces in `.env` file
- Regenerate API key if needed

#### 3. "Network connection error"

**Problem**: RPC endpoint not responding
**Solution**:
- Check RPC URL in `.env`
- Try alternative RPC provider
- Verify network status: https://etherscan.io/gastracker

#### 4. "Contract already verified"

**Problem**: Attempting to verify already-verified contract
**Solution**: This is not an error - your contract is already verified!

#### 5. "Nonce too high/low"

**Problem**: Transaction nonce mismatch
**Solution**:
```bash
# Reset account in MetaMask
# Settings → Advanced → Clear activity and nonce data
```

#### 6. "Gas price too low"

**Problem**: Network congestion requires higher gas
**Solution**:
- Wait for lower network activity
- Check current gas prices: https://etherscan.io/gastracker
- Hardhat will auto-adjust gas prices

### Deployment Verification Checklist

- ✅ Contract deployed successfully
- ✅ Deployment transaction confirmed
- ✅ Contract address saved to `deployments/` directory
- ✅ Contract verified on Etherscan
- ✅ Owner set correctly
- ✅ Initial state is correct (counter = 0)
- ✅ Can interact with contract
- ✅ Events are emitted correctly

---

## Advanced Deployment Options

### Deploy to Zama Network (FHE)

For FHE-specific deployment:

```bash
npm run deploy:zama
```

Configure Zama network in `.env`:
```env
ZAMA_RPC_URL=https://devnet.zama.ai
```

### Custom Network Configuration

Edit `hardhat.config.js` to add custom networks:

```javascript
networks: {
  customNetwork: {
    url: "https://custom-rpc-url",
    accounts: [process.env.PRIVATE_KEY],
    chainId: 12345,
  }
}
```

Then deploy:
```bash
npx hardhat run scripts/deploy.js --network customNetwork
```

---

## Deployment Information Storage

All deployments are automatically saved to `deployments/` directory:

```
deployments/
├── sepolia_latest.json           # Latest Sepolia deployment
├── sepolia_1234567890.json       # Timestamped backup
└── hardhat_latest.json            # Local deployment info
```

Each file contains:
```json
{
  "network": "sepolia",
  "contractName": "PrivacyContractReview",
  "contractAddress": "0x5A042B...",
  "deployer": "0x742d35C...",
  "deploymentTime": "2024-01-15T10:30:00.000Z",
  "transactionHash": "0xabc123...",
  "blockNumber": 5123456,
  "owner": "0x742d35C...",
  "etherscanUrl": "https://sepolia.etherscan.io/address/0x5A042B...",
  "verified": true,
  "verificationTime": "2024-01-15T10:35:00.000Z"
}
```

---

## Next Steps

After successful deployment:

1. **Update Frontend**: Update contract address in `script.js`
2. **Test Workflows**: Run simulation script to verify functionality
3. **Documentation**: Update README with new deployment details
4. **Security**: Review contract on Etherscan for any issues
5. **Monitoring**: Set up event monitoring for contract activity

---

## Support

For issues or questions:

- Check Hardhat documentation: https://hardhat.org/docs
- Review Ethers.js docs: https://docs.ethers.org/
- Etherscan verification guide: https://docs.etherscan.io/
- FHE documentation: https://docs.zama.ai/

---

**Last Updated**: 2024
**Hardhat Version**: 2.20.1
**Solidity Version**: 0.8.24
