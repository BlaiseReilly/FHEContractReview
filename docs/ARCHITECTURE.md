# Architecture Documentation

## Privacy-Preserving Contract Review Platform

### Overview

This platform implements a **privacy-first** contract compliance review system using **Fully Homomorphic Encryption (FHE)** technology from Zama. The system enables confidential analysis of contract clauses while maintaining transparency where needed.

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FHE Contract Review Platform                  │
│               Privacy-Preserving Compliance Analysis             │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
          ┌─────▼──────┐ ┌────▼────┐ ┌─────▼──────┐
          │ Submitters │ │Reviewers│ │   Admins   │
          │   (Users)  │ │(Analysts)│ │  (Owner)   │
          └────────────┘ └─────────┘ └────────────┘
                │             │             │
                └─────────────┼─────────────┘
                              │
                    ┌─────────▼────────────┐
                    │   Smart Contract     │
                    │  (FHEVM-enabled)     │
                    │  • Encrypted Storage │
                    │  • Gateway Callbacks │
                    │  • Refund Protection │
                    └──────────────────────┘
                              │
                    ┌─────────▼────────────┐
                    │   Zama Gateway       │
                    │  • FHE Operations    │
                    │  • Async Decryption  │
                    │  • Proof Validation  │
                    └──────────────────────┘
```

---

## Core Components

### 1. Smart Contract Layer

#### Contract Structure

```solidity
contract PrivacyContractReview is SepoliaConfig {
    // Core data structures
    - ContractDocument: Stores encrypted compliance data
    - ReviewClause: Individual clause analysis
    - PrivacyAnalysis: Comprehensive privacy assessment
    - DecryptionRequest: Gateway callback tracking
}
```

#### Key Features

**Encrypted Data Storage**
- `euint32` for compliance scores (0-100)
- `euint8` for risk levels (1-5)
- `euint8` for individual ratings (0-10)

**Gateway Callback Pattern**
```
User Request → requestScoreDecryption()
     ↓
Gateway Processing (Async)
     ↓
Callback → processScoreDecryption()
     ↓
Update State with Decrypted Values
```

**Refund Mechanism**
```
Decryption Request
     ↓
Timeout Check (1 hour)
     ↓
If Failed/Timed Out → claimDecryptionRefund()
     ↓
Refund Processed → Fees Returned
```

---

## Data Flow

### Complete Review Workflow

```
┌────────────────────────────────────────────────────────────────┐
│ 1. Contract Submission                                         │
│    User → submitContract(hash, title) + fee                    │
│    • Public metadata stored                                    │
│    • Encrypted fields initialized                              │
│    • Review fee collected                                      │
└────────────────────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────────────────────┐
│ 2. Clause-by-Clause Review                                     │
│    Reviewer → reviewClause(contractId, type, rating...)        │
│    • Compliance rating encrypted (0-10)                        │
│    • Sensitivity level encrypted (1-5)                         │
│    • Notes stored (encrypted off-chain)                        │
│    • Permissions granted to submitter & reviewer               │
└────────────────────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────────────────────┐
│ 3. Privacy Analysis Completion                                 │
│    Reviewer → completePrivacyAnalysis(...)                     │
│    • GDPR compliance score (encrypted)                         │
│    • CCPA compliance score (encrypted)                         │
│    • Data sensitivity assessment (encrypted)                   │
│    • Risk calculations (obfuscated)                            │
│    • Alerts generated if needed                                │
└────────────────────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────────────────────┐
│ 4. Decryption Request (Gateway Pattern)                        │
│    User → requestScoreDecryption(contractId)                   │
│    • Request sent to Gateway                                   │
│    • Timestamp recorded                                        │
│    • Request ID tracked                                        │
└────────────────────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────────────────────┐
│ 5a. Successful Decryption                                      │
│     Gateway → processScoreDecryption(requestId, cleartexts...) │
│     • Proof validated                                          │
│     • Values decrypted                                         │
│     • State updated                                            │
│     • Event emitted                                            │
└────────────────────────────────────────────────────────────────┘
                        OR
┌────────────────────────────────────────────────────────────────┐
│ 5b. Timeout/Failure Handling                                   │
│     User → claimDecryptionRefund(contractId)                   │
│     • Timeout checked (> 1 hour)                               │
│     • Refund processed                                         │
│     • Fees returned to submitter                               │
│     • Protection against permanent locking                     │
└────────────────────────────────────────────────────────────────┘
```

---

## Privacy-Preserving Techniques

### 1. Division Problem Solution

**Challenge:** Direct division on encrypted values can leak information.

**Solution:** Privacy-preserving obfuscation
```solidity
// Bad: Direct division (leaks range)
score = (a + b) / 2;

// Good: Obfuscated with granularity
score = (a + b) / 2 * 10;  // Adds noise layer
```

### 2. Price/Score Obfuscation

**Technique:** Multiply scores by factor before encryption
- Original score: 85/100
- Obfuscated: 850/1000
- Prevents exact value inference from ciphertext size

### 3. Homomorphic Operations

**Encrypted Arithmetic:**
```solidity
// All operations on encrypted values
euint8 avg = FHE.div(
    FHE.add(gdprScore, ccpaScore),
    FHE.asEuint8(2)
);
```

### 4. Access Control Lists

**Granular Permissions:**
```solidity
// Grant read access selectively
FHE.allow(encryptedScore, submitter);
FHE.allow(encryptedScore, reviewer);
// Owner has no automatic access
```

---

## Gateway Callback Pattern

### Why Gateway Pattern?

**Traditional approach issues:**
- ❌ Synchronous decryption blocks transaction
- ❌ High gas costs
- ❌ No failure recovery

**Gateway pattern benefits:**
- ✅ Asynchronous processing
- ✅ Lower gas costs
- ✅ Built-in failure handling
- ✅ Timeout protection

### Implementation

```solidity
// Step 1: Request decryption
function requestScoreDecryption(uint256 contractId) external {
    bytes32[] memory cts = new bytes32[](2);
    cts[0] = FHE.toBytes32(encryptedScore);
    cts[1] = FHE.toBytes32(encryptedRiskLevel);

    uint256 requestId = FHE.requestDecryption(
        cts,
        this.processScoreDecryption.selector
    );

    // Store request details
    decryptionRequests[requestId] = DecryptionRequest({
        contractId: contractId,
        requester: msg.sender,
        requestTime: block.timestamp,
        completed: false,
        ...
    });
}

// Step 2: Gateway callback (async)
function processScoreDecryption(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external {
    // Verify Gateway signatures
    FHE.checkSignatures(requestId, cleartexts, decryptionProof);

    // Check timeout
    if (block.timestamp > requestTime + DECRYPTION_TIMEOUT) {
        emit DecryptionFailed(...);
        return;
    }

    // Decode and store results
    (uint32 score, uint8 risk) = abi.decode(cleartexts, (uint32, uint8));
    // Update state...
}
```

---

## Refund Mechanism

### Purpose
Prevent permanent locking of user funds if decryption fails.

### Conditions for Refund

1. **Timeout Condition**
   ```solidity
   block.timestamp > requestTime + DECRYPTION_TIMEOUT
   ```

2. **Failure Condition**
   ```solidity
   decryptionRequestId > 0 &&
   !decryptionCompleted &&
   !requestCompleted
   ```

### Refund Process

```solidity
function claimDecryptionRefund(uint256 contractId) external {
    // Validate conditions
    require(!refundProcessed, "Already refunded");
    require(timedOut || failed, "Not eligible");

    // Process refund
    refundProcessed = true;
    platformFees -= reviewFee;

    // Transfer funds
    (bool sent, ) = payable(submitter).call{value: reviewFee}("");
    require(sent, "Transfer failed");

    emit RefundProcessed(contractId, submitter, reviewFee);
}
```

---

## Security Architecture

### Input Validation

**All inputs validated:**
```solidity
modifier validContractId(uint256 contractId) {
    require(contractId > 0 && contractId <= contractCounter, "Invalid ID");
    _;
}

// Range checks
require(_complianceRating <= 10, "Must be 0-10");
require(_sensitivityLevel >= 1 && _sensitivityLevel <= 5, "Must be 1-5");
require(_dataSensitivity <= MAX_SCORE, "Must be 0-100");
```

### Access Control

**Three-tier permission model:**
1. **Owner:** Platform administration
2. **Reviewers:** Authorized analysts
3. **Submitters:** Contract owners

```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Owner only");
    _;
}

modifier onlyAuthorizedReviewer() {
    require(authorizedReviewers[msg.sender], "Reviewer only");
    _;
}

modifier onlySubmitterOrReviewer(uint256 contractId) {
    require(
        contracts[contractId].submitter == msg.sender ||
        authorizedReviewers[msg.sender],
        "Not authorized"
    );
    _;
}
```

### Overflow Protection

**Built-in Solidity 0.8.24:**
- Automatic overflow/underflow checks
- No SafeMath required
- Gas-efficient validation

### Reentrancy Protection

**Checks-Effects-Interactions pattern:**
```solidity
// 1. Checks
require(!refundProcessed, "Already processed");

// 2. Effects
refundProcessed = true;
platformFees -= amount;

// 3. Interactions
(bool sent, ) = payable(user).call{value: amount}("");
require(sent, "Transfer failed");
```

---

## Gas Optimization (HCU)

### Homomorphic Computation Units (HCU)

**Strategy:** Minimize on-chain FHE operations

**Optimizations:**

1. **Batch Operations**
   ```solidity
   // Instead of multiple allows
   FHE.allow(data, user1);
   FHE.allow(data, user2);

   // Group related operations
   FHE.allowThis(data);
   FHE.allow(data, user1);
   FHE.allow(data, user2);
   ```

2. **Storage Packing**
   ```solidity
   struct ContractDocument {
       // Pack small values
       uint8 riskLevel;      // 1 byte
       bool isReviewed;      // 1 byte
       bool refundProcessed; // 1 byte
       // Total: 3 bytes in one slot
   }
   ```

3. **External over Public**
   ```solidity
   // Uses less gas
   function getData() external view returns (uint256) {
       return data;
   }
   ```

4. **Minimize Storage Writes**
   ```solidity
   // Cache storage variables
   ContractDocument storage doc = contracts[contractId];
   doc.isReviewed = true;
   doc.decryptionCompleted = true;
   ```

---

## Event-Driven Architecture

### Events for All State Changes

```solidity
// Submission events
event ContractSubmitted(uint256 indexed contractId, address indexed submitter, string title);

// Review events
event ClauseReviewed(uint256 indexed contractId, uint256 clauseId, address reviewer);
event AnalysisCompleted(uint256 indexed contractId, address reviewer);

// Decryption events
event DecryptionRequested(uint256 indexed contractId, uint256 requestId, address requester);
event DecryptionCompleted(uint256 indexed contractId, uint256 requestId, uint32 score, uint8 risk);
event DecryptionFailed(uint256 indexed contractId, uint256 requestId, string reason);

// Refund events
event RefundProcessed(uint256 indexed contractId, address recipient, uint256 amount);
event TimeoutRefundClaimed(uint256 indexed contractId, address recipient, uint256 amount);

// Admin events
event ReviewerAuthorized(address indexed reviewer, address authorizedBy);
event ReviewerRevoked(address indexed reviewer, address revokedBy);

// Alert events
event ComplianceAlert(uint256 indexed contractId, uint256 alertLevel);
```

---

## Technology Stack

### Smart Contract Layer
- **Solidity:** 0.8.24
- **FHEVM:** Zama's FHE library
- **License:** BSD-3-Clause-Clear

### Encryption Layer
- **FHE Scheme:** TFHE (Torus FHE)
- **Key Types:**
  - `euint8`: 8-bit encrypted integers
  - `euint32`: 32-bit encrypted integers
  - `euint64`: 64-bit encrypted integers
  - `ebool`: Encrypted booleans

### Development Tools
- **Hardhat:** Smart contract development
- **OpenZeppelin:** Contract utilities
- **TypeScript:** Type-safe interactions

---

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Frontend Layer                         │
│  • React/Next.js or Vanilla JS                           │
│  • FHEVM SDK for encryption                              │
│  • MetaMask wallet integration                           │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│                   Contract Layer                          │
│  • PrivacyContractReview.sol                             │
│  • Deployed on Sepolia Testnet                           │
│  • Verified on Etherscan                                 │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│                    Gateway Layer                          │
│  • Zama Gateway Service                                  │
│  • Async decryption processing                           │
│  • Signature validation                                  │
│  • Callback execution                                    │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│                  Blockchain Layer                         │
│  • Ethereum (Sepolia Testnet)                            │
│  • Block confirmations                                   │
│  • Event indexing                                        │
└──────────────────────────────────────────────────────────┘
```

---

## Scalability Considerations

### Current Limitations

1. **Decryption Time:** 1-5 minutes (Gateway processing)
2. **Gas Costs:** Higher due to FHE operations
3. **Storage:** All encrypted data on-chain

### Future Improvements

1. **Layer 2 Integration**
   - Deploy on rollups (Arbitrum, Optimism)
   - Reduced gas costs
   - Faster confirmations

2. **Batch Decryption**
   - Multiple contracts in one request
   - Reduced callback overhead

3. **IPFS Integration**
   - Store large encrypted data off-chain
   - Only hashes on-chain

4. **Caching Layer**
   - Cache decrypted results
   - Reduce redundant decryptions

---

## Comparison with Traditional Systems

| Feature | Traditional | This Platform |
|---------|------------|---------------|
| **Data Privacy** | Plaintext on-chain | Encrypted (FHE) |
| **Computation** | Public values | Encrypted values |
| **Compliance Scores** | Visible to all | Authorized only |
| **Decryption** | Instant | Async (1-5 min) |
| **Refunds** | Manual/complex | Automatic timeout |
| **Gas Costs** | Low | Moderate (FHE) |
| **Security** | Trust-based | Cryptographic |

---

## Audit Recommendations

### Security Audit Points

1. **FHE Implementation**
   - Verify correct FHE.allow() usage
   - Check permission grants
   - Validate decryption callbacks

2. **Refund Logic**
   - Test timeout calculations
   - Verify reentrancy protection
   - Check refund conditions

3. **Access Control**
   - Test all modifiers
   - Verify role transitions
   - Check authorization revocation

4. **Gas Analysis**
   - Profile HCU usage
   - Optimize storage patterns
   - Test worst-case scenarios

5. **Integration Testing**
   - Gateway callback scenarios
   - Timeout handling
   - Concurrent requests

---

## Conclusion

This architecture implements a **production-ready** privacy-preserving contract review platform with:

✅ **Gateway callback pattern** for async decryption
✅ **Refund mechanism** for failed decryptions
✅ **Timeout protection** against fund locking
✅ **Privacy-preserving computation** using FHE
✅ **Comprehensive security** with input validation
✅ **Gas-optimized** HCU usage
✅ **Event-driven** architecture for transparency

The system balances **privacy**, **security**, and **usability** while maintaining practical gas costs and user experience.
