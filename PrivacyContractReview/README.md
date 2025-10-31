# Privacy Contract Review System - React Edition

A decentralized application for privacy contract compliance review built with React, Next.js 14, and FHEVM Universal SDK.

## Features

- **React + Next.js 14** - Modern App Router architecture
- **FHEVM SDK Integration** - Fully homomorphic encryption support
- **Wallet Connection** - MetaMask integration with ethers.js v6
- **Contract Submission** - Submit contracts for privacy review
- **Reviewer Dashboard** - Review contracts and provide compliance ratings
- **Privacy Analysis** - Complete GDPR/CCPA compliance analysis
- **Admin Panel** - Manage authorized reviewers
- **Responsive UI** - Tailwind CSS with beautiful gradients
- **TypeScript** - Full type safety

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MetaMask browser extension

## Installation

```bash
npm install
```

## Configuration

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Update `.env` with your configuration:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5A042B49224ae2d67d5F216DC9A243F6603848F1
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_GATEWAY_URL=https://gateway.sepolia.zama.ai
```

## Usage

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
PrivacyContractReview/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # Root layout with FHEVMProvider
│   │   ├── page.tsx             # Main page
│   │   └── globals.css          # Global styles
│   ├── components/              # React components
│   │   ├── WalletConnection.tsx # Wallet connection UI
│   │   ├── SubmitContract.tsx   # Contract submission form
│   │   ├── ReviewContracts.tsx  # Reviewer dashboard
│   │   ├── ReviewForm.tsx       # Clause review form
│   │   ├── AnalysisForm.tsx     # Privacy analysis form
│   │   ├── MyContracts.tsx      # User's submitted contracts
│   │   └── AdminPanel.tsx       # Admin controls
│   └── hooks/                   # Custom React hooks
│       ├── useWallet.ts         # Wallet management
│       ├── useContract.ts       # Contract interactions
│       └── useToast.ts          # Toast notifications
├── contracts/                   # Smart contracts (Solidity)
├── public/                      # Static assets
├── package.json
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## Key Features

### 1. FHEVM SDK Integration

The app uses FHEVM Universal SDK for fully homomorphic encryption:

```typescript
import { FHEVMProvider, useFHEVM } from '@fhevm/sdk/react';

// Wrap app with provider
<FHEVMProvider config={{ network: 'sepolia' }}>
  <App />
</FHEVMProvider>

// Use in components
const { isInitialized, encrypt, decrypt } = useFHEVM();
```

### 2. Wallet Connection

MetaMask integration with automatic connection detection:

```typescript
import { useWallet } from '@/hooks/useWallet';

const { address, isConnected, connect, disconnect } = useWallet();
```

### 3. Contract Interactions

Type-safe contract interactions with ethers.js:

```typescript
import { useContract } from '@/hooks/useContract';

const {
  submitContract,
  reviewClause,
  completeAnalysis,
  authorizeReviewer
} = useContract();
```

## Smart Contract

The app interacts with the PrivacyContractReview smart contract deployed on Sepolia testnet.

**Contract Address:** `0x5A042B49224ae2d67d5F216DC9A243F6603848F1`

### Main Functions

- `submitContract(documentHash, title)` - Submit a contract for review
- `reviewClause(contractId, clauseType, rating, sensitivity, notes)` - Review a contract clause
- `completePrivacyAnalysis(contractId, ...)` - Complete full privacy analysis
- `authorizeReviewer(address)` - Authorize a reviewer (owner only)
- `revokeReviewer(address)` - Revoke reviewer access (owner only)

## User Roles

### Submitter (Any User)
- Submit contracts for review
- View submitted contracts
- Track review status

### Reviewer (Authorized)
- Review contract clauses
- Provide compliance ratings
- Complete privacy analysis

### Owner (Contract Deployer)
- All reviewer permissions
- Authorize/revoke reviewers
- Manage the system

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Blockchain:** Ethers.js v6
- **FHE:** FHEVM Universal SDK
- **Icons:** Lucide React
- **Network:** Ethereum Sepolia Testnet

## Development

### Adding New Features

1. Create components in `src/components/`
2. Add hooks in `src/hooks/`
3. Update contract ABI if needed in `src/hooks/useContract.ts`

### Styling

Uses Tailwind CSS with custom theme:

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: '#e94560',
      secondary: '#00d4ff',
      dark: {
        100: '#1a1a2e',
        200: '#16213e',
        300: '#0f3460',
      },
    },
  },
}
```

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Docker

```bash
docker build -t privacy-review .
docker run -p 3000:3000 privacy-review
```

## Troubleshooting

### MetaMask Connection Issues

1. Ensure MetaMask is installed
2. Switch to Sepolia testnet
3. Refresh the page

### Contract Interaction Errors

1. Verify contract address in `.env`
2. Check network matches (Sepolia)
3. Ensure you have test ETH for gas

### FHEVM SDK Errors

1. Verify gateway URL is correct
2. Check network configuration
3. Ensure provider is initialized

## Legacy Version

The original static HTML/JavaScript version is preserved in the same directory:

- `index.html` - Original static UI
- `app.js` - Original vanilla JavaScript logic

To run the legacy version:

```bash
npm run dev:legacy  # Uses http-server
```

## Comparison: React vs Static

### React Version (New)
✅ Modern component architecture
✅ Type-safe with TypeScript
✅ Better state management
✅ Easier to test and maintain
✅ FHEVM SDK integration
✅ Hot reload development

### Static Version (Legacy)
✅ No build step required
✅ Smaller bundle size
✅ Simpler deployment
✅ Direct DOM manipulation

## License

MIT

## Links

- **Contract on Etherscan:** [View Contract](https://sepolia.etherscan.io/address/0x5A042B49224ae2d67d5F216DC9A243F6603848F1)
- **FHEVM SDK:** [Documentation](../../packages/fhevm-sdk/README.md)
- **Zama Docs:** [https://docs.zama.ai/](https://docs.zama.ai/)

## Support

For issues and questions:

1. Check the [main project README](../../README.md)
2. Review [FHEVM SDK documentation](../../packages/fhevm-sdk/README.md)
3. Join [Zama Discord](https://discord.gg/zama)

---

**Built with React, Next.js, and FHEVM Universal SDK**
