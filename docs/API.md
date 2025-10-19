# API Documentation

Complete API reference for the FHE Contract Review Platform smart contract.

---

## Contract Address

**Sepolia Testnet**: `0x5A042B49224ae2d67d5F216DC9A243F6603848F1`

---

## Public State Variables

### `owner`
```solidity
address public owner
```
Returns the contract owner address.

### `contractCounter`
```solidity
uint256 public contractCounter
```
Total number of contracts submitted for review.

### `reviewCounter`
```solidity
uint256 public reviewCounter
```
Total number of reviews conducted (currently tracked for future use).

---

## Functions

### Contract Submission

#### `submitContract`
```solidity
function submitContract(
    string memory _documentHash,
    string memory _publicTitle
) external returns (uint256)
```

Submit a contract for privacy compliance review.

**Parameters:**
- `_documentHash` - IPFS hash or SHA256 of the contract document
- `_publicTitle` - Public title/description of the contract

**Returns:**
- `uint256` - The ID of the submitted contract

**Emits:**
- `ContractSubmitted(contractId, submitter, publicTitle)`

**Example:**
```javascript
const tx = await contract.submitContract(
    "QmXyZ...",
    "Privacy Policy v2.0"
);
const receipt = await tx.wait();
```

---

### Clause Review

#### `reviewClause`
```solidity
function reviewClause(
    uint256 _contractId,
    string memory _clauseType,
    uint8 _complianceRating,
    uint8 _sensitivityLevel,
    string memory _notes
) external onlyAuthorizedReviewer
```

Review a specific clause of a contract (encrypted ratings).

**Parameters:**
- `_contractId` - ID of the contract to review
- `_clauseType` - Type of clause (data_processing, retention, sharing, etc.)
- `_complianceRating` - Compliance score 0-10 (encrypted as euint8)
- `_sensitivityLevel` - Sensitivity level 1-5 (encrypted as euint8)
- `_notes` - Review notes (can be encrypted off-chain)

**Requirements:**
- Caller must be an authorized reviewer
- `_complianceRating` must be 0-10
- `_sensitivityLevel` must be 1-5

**Emits:**
- `ClauseReviewed(contractId, clauseId, reviewer)`

**Example:**
```javascript
await contract.reviewClause(
    1,
    "data_processing",
    8,
    4,
    "Good processing practices"
);
```

---

### Privacy Analysis

#### `completePrivacyAnalysis`
```solidity
function completePrivacyAnalysis(
    uint256 _contractId,
    uint32 _dataSensitivity,
    uint8 _gdprCompliance,
    uint8 _ccpaCompliance,
    uint8 _retentionRisk,
    uint8 _sharingRisk
) external onlyAuthorizedReviewer
```

Complete the overall privacy analysis for a contract (all values encrypted).

**Parameters:**
- `_contractId` - ID of the contract
- `_dataSensitivity` - Overall data sensitivity 0-100 (encrypted as euint32)
- `_gdprCompliance` - GDPR compliance score 0-10 (encrypted as euint8)
- `_ccpaCompliance` - CCPA compliance score 0-10 (encrypted as euint8)
- `_retentionRisk` - Data retention risk 1-5 (encrypted as euint8)
- `_sharingRisk` - Data sharing risk 1-5 (encrypted as euint8)

**Requirements:**
- Caller must be an authorized reviewer
- `_gdprCompliance` and `_ccpaCompliance` must be 0-10
- `_retentionRisk` and `_sharingRisk` must be 1-5

**Emits:**
- `AnalysisCompleted(contractId, reviewer)`
- `ComplianceAlert(contractId, alertLevel)` - If compliance is low

**Example:**
```javascript
await contract.completePrivacyAnalysis(
    1,
    85,  // data sensitivity
    9,   // GDPR
    8,   // CCPA
    2,   // retention risk
    3    // sharing risk
);
```

---

### Authorization

#### `authorizeReviewer`
```solidity
function authorizeReviewer(address _reviewer) external onlyOwner
```

Authorize an address to review contracts.

**Parameters:**
- `_reviewer` - Address to authorize

**Requirements:**
- Caller must be the owner

**Emits:**
- `ReviewerAuthorized(reviewer, authorizedBy)`

**Example:**
```javascript
await contract.authorizeReviewer("0x1234...");
```

#### `revokeReviewer`
```solidity
function revokeReviewer(address _reviewer) external onlyOwner
```

Revoke reviewer authorization.

**Parameters:**
- `_reviewer` - Address to revoke

**Requirements:**
- Caller must be the owner

**Emits:**
- `ReviewerRevoked(reviewer, revokedBy)`

---

### View Functions

#### `getContractInfo`
```solidity
function getContractInfo(uint256 _contractId) external view returns (
    string memory documentHash,
    address submitter,
    uint256 submissionTime,
    bool isReviewed,
    string memory publicTitle,
    uint256 clauseCount
)
```

Get public information about a contract (no encrypted data).

**Example:**
```javascript
const info = await contract.getContractInfo(1);
console.log(info.publicTitle);
```

#### `getClauseInfo`
```solidity
function getClauseInfo(uint256 _contractId, uint256 _clauseId) external view returns (
    string memory clauseType,
    address reviewer,
    uint256 reviewTime,
    string memory notes
)
```

Get public information about a specific clause review.

#### `getAnalysisStatus`
```solidity
function getAnalysisStatus(uint256 _contractId) external view returns (bool)
```

Check if analysis is complete for a contract.

#### `getSubmitterContracts`
```solidity
function getSubmitterContracts(address _submitter) external view returns (uint256[] memory)
```

Get all contract IDs submitted by an address.

#### `getReviewerContracts`
```solidity
function getReviewerContracts(address _reviewer) external view returns (uint256[] memory)
```

Get all contract IDs reviewed by an address.

#### `isAuthorizedReviewer`
```solidity
function isAuthorizedReviewer(address _reviewer) external view returns (bool)
```

Check if an address is an authorized reviewer.

#### `getTotalContracts`
```solidity
function getTotalContracts() external view returns (uint256)
```

Get the total number of submitted contracts.

---

### Decryption

#### `requestScoreDecryption`
```solidity
function requestScoreDecryption(uint256 _contractId)
    external
    onlySubmitterOrReviewer(_contractId)
```

Request decryption of contract scores (requires EIP-712 signature).

**Parameters:**
- `_contractId` - ID of the contract

**Requirements:**
- Contract must be reviewed
- Caller must be submitter or authorized reviewer
- EIP-712 signature required for decryption authorization

---

## Events

### `ContractSubmitted`
```solidity
event ContractSubmitted(
    uint256 indexed contractId,
    address indexed submitter,
    string publicTitle
)
```

### `ClauseReviewed`
```solidity
event ClauseReviewed(
    uint256 indexed contractId,
    uint256 indexed clauseId,
    address indexed reviewer
)
```

### `AnalysisCompleted`
```solidity
event AnalysisCompleted(
    uint256 indexed contractId,
    address indexed reviewer
)
```

### `ReviewerAuthorized`
```solidity
event ReviewerAuthorized(
    address indexed reviewer,
    address indexed authorizedBy
)
```

### `ReviewerRevoked`
```solidity
event ReviewerRevoked(
    address indexed reviewer,
    address indexed revokedBy
)
```

### `ComplianceAlert`
```solidity
event ComplianceAlert(
    uint256 indexed contractId,
    uint256 alertLevel
)
```

---

## Modifiers

### `onlyOwner`
Restricts function to contract owner only.

### `onlyAuthorizedReviewer`
Restricts function to authorized reviewers only.

### `onlySubmitterOrReviewer`
Restricts function to contract submitter or authorized reviewers.

---

## Data Structures

### `ContractDocument`
```solidity
struct ContractDocument {
    string documentHash;           // Public
    euint32 encryptedScore;       // Encrypted
    euint8 encryptedRiskLevel;    // Encrypted
    address submitter;            // Public
    uint256 submissionTime;       // Public
    bool isReviewed;              // Public
    string publicTitle;           // Public
}
```

### `ReviewClause`
```solidity
struct ReviewClause {
    string clauseType;            // Public
    euint8 encryptedCompliance;   // Encrypted
    euint8 encryptedSensitivity;  // Encrypted
    string encryptedNotes;        // Public (encrypt off-chain if needed)
    address reviewer;             // Public
    uint256 reviewTime;           // Public
}
```

### `PrivacyAnalysis`
```solidity
struct PrivacyAnalysis {
    euint32 encryptedDataSensitivity;  // Encrypted
    euint8 encryptedGDPRCompliance;    // Encrypted
    euint8 encryptedCCPACompliance;    // Encrypted
    euint8 encryptedRetentionRisk;     // Encrypted
    euint8 encryptedSharingRisk;       // Encrypted
    bool analysisComplete;             // Public
}
```

---

## Error Messages

- `"Not authorized"` - Caller is not the owner
- `"Not authorized reviewer"` - Caller is not an authorized reviewer
- `"Not authorized to access"` - Caller is not submitter or reviewer
- `"Invalid contract ID"` - Contract ID does not exist
- `"Compliance rating must be 0-10"` - Rating out of range
- `"Sensitivity must be 1-5"` - Sensitivity level out of range
- `"Compliance scores must be 0-10"` - Scores out of range
- `"Retention risk must be 1-5"` - Risk level out of range
- `"Sharing risk must be 1-5"` - Risk level out of range
- `"Invalid clause ID"` - Clause ID does not exist
- `"Contract not yet reviewed"` - Decryption requested before review completion

---

## Usage Examples

### Complete Workflow

```javascript
// 1. Connect to contract
const contract = new ethers.Contract(
    "0x5A042B49224ae2d67d5F216DC9A243F6603848F1",
    ABI,
    signer
);

// 2. Submit contract
const submitTx = await contract.submitContract(
    "QmXyZ...",
    "Privacy Policy v2.0"
);
await submitTx.wait();

// 3. Get contract ID
const submittedIds = await contract.getSubmitterContracts(
    await signer.getAddress()
);
const contractId = submittedIds[submittedIds.length - 1];

// 4. Review clauses (as authorized reviewer)
await contract.reviewClause(
    contractId,
    "data_processing",
    8,
    4,
    "Good practices"
);

// 5. Complete analysis
await contract.completePrivacyAnalysis(
    contractId,
    85, 9, 8, 2, 3
);

// 6. Request decryption
await contract.requestScoreDecryption(contractId);
```

---

For more information, see the main [README](../README.md).
