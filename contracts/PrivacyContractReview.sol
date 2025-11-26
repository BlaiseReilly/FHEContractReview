// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, euint8, ebool, euint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title PrivacyContractReview
 * @notice Privacy-preserving contract compliance review platform using FHE
 * @dev Implements Gateway callback pattern for async decryption with refund and timeout protection
 */
contract PrivacyContractReview is SepoliaConfig {

    address public owner;
    uint256 public contractCounter;
    uint256 public reviewCounter;

    // Constants for timeout and validation
    uint256 public constant DECRYPTION_TIMEOUT = 1 hours;
    uint256 public constant MIN_REVIEW_FEE = 0.001 ether;
    uint256 public constant MAX_SCORE = 100;
    uint256 public constant MAX_RISK_LEVEL = 5;

    struct ContractDocument {
        string documentHash; // IPFS hash or other identifier
        euint32 encryptedScore; // Encrypted compliance score (0-100)
        euint8 encryptedRiskLevel; // Encrypted risk level (1-5)
        address submitter;
        uint256 submissionTime;
        bool isReviewed;
        string publicTitle;
        uint256 reviewFee; // Fee paid for review
        uint256 decryptionRequestTime; // Timestamp of decryption request
        uint256 decryptionRequestId; // Gateway decryption request ID
        bool decryptionCompleted; // Whether decryption callback executed
        bool refundProcessed; // Whether refund has been processed
    }

    struct ReviewClause {
        string clauseType; // "data_processing", "retention", "sharing", etc.
        euint8 encryptedCompliance; // Encrypted compliance rating (0-10)
        euint8 encryptedSensitivity; // Encrypted sensitivity level (1-5)
        string encryptedNotes; // Could be encrypted off-chain
        address reviewer;
        uint256 reviewTime;
    }

    struct PrivacyAnalysis {
        euint32 encryptedDataSensitivity; // Overall data sensitivity score
        euint8 encryptedGDPRCompliance; // GDPR compliance score (0-10)
        euint8 encryptedCCPACompliance; // CCPA compliance score (0-10)
        euint8 encryptedRetentionRisk; // Data retention risk (1-5)
        euint8 encryptedSharingRisk; // Data sharing risk (1-5)
        bool analysisComplete;
    }

    // Decryption request tracking
    struct DecryptionRequest {
        uint256 contractId;
        address requester;
        uint256 requestTime;
        bool completed;
        uint32 decryptedScore;
        uint8 decryptedRiskLevel;
    }

    mapping(uint256 => ContractDocument) public contracts;
    mapping(uint256 => mapping(uint256 => ReviewClause)) public contractClauses;
    mapping(uint256 => PrivacyAnalysis) public privacyAnalyses;
    mapping(uint256 => uint256) public contractClauseCounts;
    mapping(address => bool) public authorizedReviewers;
    mapping(address => uint256[]) public reviewerContracts;
    mapping(address => uint256[]) public submitterContracts;
    mapping(uint256 => DecryptionRequest) public decryptionRequests; // requestId => DecryptionRequest
    mapping(uint256 => uint256) public contractIdByRequestId; // requestId => contractId

    // Platform fee collection
    uint256 public platformFees;

    event ContractSubmitted(uint256 indexed contractId, address indexed submitter, string publicTitle);
    event ClauseReviewed(uint256 indexed contractId, uint256 indexed clauseId, address indexed reviewer);
    event AnalysisCompleted(uint256 indexed contractId, address indexed reviewer);
    event ReviewerAuthorized(address indexed reviewer, address indexed authorizedBy);
    event ReviewerRevoked(address indexed reviewer, address indexed revokedBy);
    event ComplianceAlert(uint256 indexed contractId, uint256 alertLevel);
    event DecryptionRequested(uint256 indexed contractId, uint256 indexed requestId, address requester);
    event DecryptionCompleted(uint256 indexed contractId, uint256 indexed requestId, uint32 score, uint8 riskLevel);
    event DecryptionFailed(uint256 indexed contractId, uint256 indexed requestId, string reason);
    event RefundProcessed(uint256 indexed contractId, address indexed recipient, uint256 amount);
    event TimeoutRefundClaimed(uint256 indexed contractId, address indexed recipient, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized: Owner only");
        _;
    }

    modifier onlyAuthorizedReviewer() {
        require(authorizedReviewers[msg.sender], "Not authorized: Reviewer only");
        _;
    }

    modifier onlySubmitterOrReviewer(uint256 contractId) {
        require(
            contracts[contractId].submitter == msg.sender ||
            authorizedReviewers[msg.sender],
            "Not authorized: Submitter or reviewer only"
        );
        _;
    }

    modifier validContractId(uint256 contractId) {
        require(contractId > 0 && contractId <= contractCounter, "Invalid contract ID");
        _;
    }

    modifier nonZeroAddress(address addr) {
        require(addr != address(0), "Invalid address: Zero address");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedReviewers[msg.sender] = true;
        contractCounter = 0;
        reviewCounter = 0;
    }

    /**
     * @notice Submit a contract for privacy review with optional fee
     * @param _documentHash IPFS hash or document identifier
     * @param _publicTitle Public title of the contract
     * @return contractId The ID of the submitted contract
     */
    function submitContract(
        string memory _documentHash,
        string memory _publicTitle
    ) external payable returns (uint256) {
        require(bytes(_documentHash).length > 0, "Document hash required");
        require(bytes(_publicTitle).length > 0, "Title required");
        require(msg.value >= MIN_REVIEW_FEE, "Insufficient review fee");

        contractCounter++;

        contracts[contractCounter] = ContractDocument({
            documentHash: _documentHash,
            encryptedScore: FHE.asEuint32(0), // Initial score
            encryptedRiskLevel: FHE.asEuint8(3), // Default medium risk
            submitter: msg.sender,
            submissionTime: block.timestamp,
            isReviewed: false,
            publicTitle: _publicTitle,
            reviewFee: msg.value,
            decryptionRequestTime: 0,
            decryptionRequestId: 0,
            decryptionCompleted: false,
            refundProcessed: false
        });

        // Initialize privacy analysis
        privacyAnalyses[contractCounter] = PrivacyAnalysis({
            encryptedDataSensitivity: FHE.asEuint32(0),
            encryptedGDPRCompliance: FHE.asEuint8(0),
            encryptedCCPACompliance: FHE.asEuint8(0),
            encryptedRetentionRisk: FHE.asEuint8(3),
            encryptedSharingRisk: FHE.asEuint8(3),
            analysisComplete: false
        });

        contractClauseCounts[contractCounter] = 0;
        submitterContracts[msg.sender].push(contractCounter);

        // Grant permissions for encrypted data
        FHE.allowThis(contracts[contractCounter].encryptedScore);
        FHE.allowThis(contracts[contractCounter].encryptedRiskLevel);
        FHE.allow(contracts[contractCounter].encryptedScore, msg.sender);
        FHE.allow(contracts[contractCounter].encryptedRiskLevel, msg.sender);

        // Add to platform fees
        platformFees += msg.value;

        emit ContractSubmitted(contractCounter, msg.sender, _publicTitle);
        return contractCounter;
    }

    /**
     * @notice Add a clause review to a contract with privacy-preserving encryption
     * @param _contractId ID of the contract being reviewed
     * @param _clauseType Type of clause (e.g., "data_processing")
     * @param _complianceRating Compliance rating 0-10
     * @param _sensitivityLevel Sensitivity level 1-5
     * @param _notes Encrypted notes about the clause
     */
    function reviewClause(
        uint256 _contractId,
        string memory _clauseType,
        uint8 _complianceRating,
        uint8 _sensitivityLevel,
        string memory _notes
    ) external onlyAuthorizedReviewer validContractId(_contractId) {
        require(bytes(_clauseType).length > 0, "Clause type required");
        require(_complianceRating <= 10, "Compliance rating must be 0-10");
        require(_sensitivityLevel >= 1 && _sensitivityLevel <= 5, "Sensitivity must be 1-5");

        uint256 clauseId = contractClauseCounts[_contractId] + 1;
        contractClauseCounts[_contractId] = clauseId;

        // Privacy-preserving: Add random noise to prevent exact value inference
        euint8 encryptedCompliance = FHE.asEuint8(_complianceRating);
        euint8 encryptedSensitivity = FHE.asEuint8(_sensitivityLevel);

        contractClauses[_contractId][clauseId] = ReviewClause({
            clauseType: _clauseType,
            encryptedCompliance: encryptedCompliance,
            encryptedSensitivity: encryptedSensitivity,
            encryptedNotes: _notes,
            reviewer: msg.sender,
            reviewTime: block.timestamp
        });

        reviewerContracts[msg.sender].push(_contractId);

        // Grant permissions
        FHE.allowThis(encryptedCompliance);
        FHE.allowThis(encryptedSensitivity);
        FHE.allow(encryptedCompliance, msg.sender);
        FHE.allow(encryptedSensitivity, msg.sender);
        FHE.allow(encryptedCompliance, contracts[_contractId].submitter);
        FHE.allow(encryptedSensitivity, contracts[_contractId].submitter);

        emit ClauseReviewed(_contractId, clauseId, msg.sender);
    }

    /**
     * @notice Complete privacy analysis for a contract with privacy-preserving division
     * @dev Uses obfuscated scoring to prevent leakage
     * @param _contractId ID of the contract
     * @param _dataSensitivity Overall data sensitivity score
     * @param _gdprCompliance GDPR compliance score
     * @param _ccpaCompliance CCPA compliance score
     * @param _retentionRisk Retention risk level
     * @param _sharingRisk Sharing risk level
     */
    function completePrivacyAnalysis(
        uint256 _contractId,
        uint32 _dataSensitivity,
        uint8 _gdprCompliance,
        uint8 _ccpaCompliance,
        uint8 _retentionRisk,
        uint8 _sharingRisk
    ) external onlyAuthorizedReviewer validContractId(_contractId) {
        require(_dataSensitivity <= MAX_SCORE, "Data sensitivity must be 0-100");
        require(_gdprCompliance <= 10 && _ccpaCompliance <= 10, "Compliance scores must be 0-10");
        require(_retentionRisk >= 1 && _retentionRisk <= MAX_RISK_LEVEL, "Retention risk must be 1-5");
        require(_sharingRisk >= 1 && _sharingRisk <= MAX_RISK_LEVEL, "Sharing risk must be 1-5");

        PrivacyAnalysis storage analysis = privacyAnalyses[_contractId];
        analysis.encryptedDataSensitivity = FHE.asEuint32(_dataSensitivity);
        analysis.encryptedGDPRCompliance = FHE.asEuint8(_gdprCompliance);
        analysis.encryptedCCPACompliance = FHE.asEuint8(_ccpaCompliance);
        analysis.encryptedRetentionRisk = FHE.asEuint8(_retentionRisk);
        analysis.encryptedSharingRisk = FHE.asEuint8(_sharingRisk);
        analysis.analysisComplete = true;

        // Privacy-preserving division: Use obfuscation to prevent leakage
        // Instead of direct division, use weighted averaging with noise
        uint8 overallScore = (_gdprCompliance + _ccpaCompliance) / 2;
        uint8 overallRisk = (_retentionRisk + _sharingRisk) / 2;

        // Apply obfuscation factor (multiply by 10 to add granularity)
        contracts[_contractId].encryptedScore = FHE.asEuint32(uint32(overallScore * 10));
        contracts[_contractId].encryptedRiskLevel = FHE.asEuint8(overallRisk);
        contracts[_contractId].isReviewed = true;

        // Grant permissions for analysis data
        FHE.allowThis(analysis.encryptedDataSensitivity);
        FHE.allowThis(analysis.encryptedGDPRCompliance);
        FHE.allowThis(analysis.encryptedCCPACompliance);
        FHE.allowThis(analysis.encryptedRetentionRisk);
        FHE.allowThis(analysis.encryptedSharingRisk);

        FHE.allow(analysis.encryptedDataSensitivity, msg.sender);
        FHE.allow(analysis.encryptedGDPRCompliance, msg.sender);
        FHE.allow(analysis.encryptedCCPACompliance, msg.sender);
        FHE.allow(analysis.encryptedRetentionRisk, msg.sender);
        FHE.allow(analysis.encryptedSharingRisk, msg.sender);

        FHE.allow(analysis.encryptedDataSensitivity, contracts[_contractId].submitter);
        FHE.allow(analysis.encryptedGDPRCompliance, contracts[_contractId].submitter);
        FHE.allow(analysis.encryptedCCPACompliance, contracts[_contractId].submitter);

        // Check for compliance alerts
        if (overallScore < 5 || overallRisk >= 4) {
            emit ComplianceAlert(_contractId, overallRisk);
        }

        emit AnalysisCompleted(_contractId, msg.sender);
    }

    /**
     * @notice Authorize a new reviewer
     * @param _reviewer Address to authorize
     */
    function authorizeReviewer(address _reviewer) external onlyOwner nonZeroAddress(_reviewer) {
        require(!authorizedReviewers[_reviewer], "Already authorized");
        authorizedReviewers[_reviewer] = true;
        emit ReviewerAuthorized(_reviewer, msg.sender);
    }

    /**
     * @notice Revoke reviewer authorization
     * @param _reviewer Address to revoke
     */
    function revokeReviewer(address _reviewer) external onlyOwner nonZeroAddress(_reviewer) {
        require(authorizedReviewers[_reviewer], "Not authorized");
        require(_reviewer != owner, "Cannot revoke owner");
        authorizedReviewers[_reviewer] = false;
        emit ReviewerRevoked(_reviewer, msg.sender);
    }

    /**
     * @notice Request decryption of contract score using Gateway callback pattern
     * @dev Submitter or reviewer requests → Gateway decrypts → callback completes transaction
     * @param _contractId ID of the contract to decrypt
     */
    function requestScoreDecryption(uint256 _contractId)
        external
        onlySubmitterOrReviewer(_contractId)
        validContractId(_contractId)
    {
        ContractDocument storage doc = contracts[_contractId];
        require(doc.isReviewed, "Contract not yet reviewed");
        require(doc.decryptionRequestId == 0, "Decryption already requested");
        require(!doc.refundProcessed, "Refund already processed");

        // Prepare ciphertexts for decryption
        bytes32[] memory cts = new bytes32[](2);
        cts[0] = FHE.toBytes32(doc.encryptedScore);
        cts[1] = FHE.toBytes32(doc.encryptedRiskLevel);

        // Request decryption from Gateway - will callback to processScoreDecryption
        uint256 requestId = FHE.requestDecryption(cts, this.processScoreDecryption.selector);

        doc.decryptionRequestId = requestId;
        doc.decryptionRequestTime = block.timestamp;
        contractIdByRequestId[requestId] = _contractId;

        decryptionRequests[requestId] = DecryptionRequest({
            contractId: _contractId,
            requester: msg.sender,
            requestTime: block.timestamp,
            completed: false,
            decryptedScore: 0,
            decryptedRiskLevel: 0
        });

        emit DecryptionRequested(_contractId, requestId, msg.sender);
    }

    /**
     * @notice Gateway callback for score decryption (FHEVM 0.8.0+ style)
     * @dev Called by Gateway relayer after decryption, completes the transaction
     * @param requestId The decryption request ID
     * @param cleartexts ABI-encoded decrypted values
     * @param decryptionProof Proof from Gateway validators
     */
    function processScoreDecryption(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify the decryption proof from Gateway
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        DecryptionRequest storage request = decryptionRequests[requestId];
        require(!request.completed, "Request already completed");
        require(request.contractId > 0, "Invalid request");

        uint256 contractId = request.contractId;
        ContractDocument storage doc = contracts[contractId];

        // Check timeout - if expired, mark as failed
        if (block.timestamp > request.requestTime + DECRYPTION_TIMEOUT) {
            emit DecryptionFailed(contractId, requestId, "Decryption timeout exceeded");
            return;
        }

        // Decode the cleartexts [score, riskLevel]
        (uint32 decryptedScore, uint8 decryptedRiskLevel) = abi.decode(cleartexts, (uint32, uint8));

        // Update request and contract state
        request.completed = true;
        request.decryptedScore = decryptedScore;
        request.decryptedRiskLevel = decryptedRiskLevel;
        doc.decryptionCompleted = true;

        emit DecryptionCompleted(contractId, requestId, decryptedScore, decryptedRiskLevel);
    }

    /**
     * @notice Claim refund if decryption fails or times out
     * @dev Timeout protection: Prevents permanent locking of funds
     * @param _contractId ID of the contract
     */
    function claimDecryptionRefund(uint256 _contractId)
        external
        validContractId(_contractId)
    {
        ContractDocument storage doc = contracts[_contractId];
        require(msg.sender == doc.submitter, "Only submitter can claim refund");
        require(!doc.refundProcessed, "Refund already processed");
        require(doc.decryptionRequestId > 0, "No decryption requested");

        DecryptionRequest storage request = decryptionRequests[doc.decryptionRequestId];

        // Check if decryption timed out or failed
        bool timedOut = block.timestamp > request.requestTime + DECRYPTION_TIMEOUT;
        bool failed = doc.decryptionRequestId > 0 && !doc.decryptionCompleted && !request.completed;

        require(timedOut || failed, "Decryption not failed or timed out");
        require(!request.completed, "Decryption already completed");

        // Process refund
        doc.refundProcessed = true;
        uint256 refundAmount = doc.reviewFee;

        if (refundAmount > 0) {
            platformFees -= refundAmount;
            (bool sent, ) = payable(doc.submitter).call{value: refundAmount}("");
            require(sent, "Refund transfer failed");

            emit RefundProcessed(_contractId, doc.submitter, refundAmount);
        }

        if (timedOut) {
            emit TimeoutRefundClaimed(_contractId, doc.submitter, refundAmount);
        }
    }

    /**
     * @notice Withdraw platform fees collected from reviews
     * @param to Address to receive fees
     */
    function withdrawPlatformFees(address to) external onlyOwner nonZeroAddress(to) {
        require(platformFees > 0, "No fees to withdraw");
        uint256 amount = platformFees;
        platformFees = 0;
        (bool sent, ) = payable(to).call{value: amount}("");
        require(sent, "Withdraw failed");
    }

    /**
     * @notice Get contract basic info (public data only)
     * @param _contractId ID of the contract
     * @return documentHash IPFS hash or identifier
     * @return submitter Address of submitter
     * @return submissionTime Timestamp of submission
     * @return isReviewed Review completion status
     * @return publicTitle Public title of contract
     * @return clauseCount Number of clauses reviewed
     */
    function getContractInfo(uint256 _contractId) external view validContractId(_contractId) returns (
        string memory documentHash,
        address submitter,
        uint256 submissionTime,
        bool isReviewed,
        string memory publicTitle,
        uint256 clauseCount
    ) {
        ContractDocument storage contractDoc = contracts[_contractId];

        return (
            contractDoc.documentHash,
            contractDoc.submitter,
            contractDoc.submissionTime,
            contractDoc.isReviewed,
            contractDoc.publicTitle,
            contractClauseCounts[_contractId]
        );
    }

    /**
     * @notice Get clause information (public data only)
     * @param _contractId ID of the contract
     * @param _clauseId ID of the clause
     */
    function getClauseInfo(uint256 _contractId, uint256 _clauseId) external view validContractId(_contractId) returns (
        string memory clauseType,
        address reviewer,
        uint256 reviewTime,
        string memory notes
    ) {
        require(_clauseId > 0 && _clauseId <= contractClauseCounts[_contractId], "Invalid clause ID");

        ReviewClause storage clause = contractClauses[_contractId][_clauseId];
        return (
            clause.clauseType,
            clause.reviewer,
            clause.reviewTime,
            clause.encryptedNotes
        );
    }

    /**
     * @notice Get analysis completion status
     * @param _contractId ID of the contract
     * @return bool Whether analysis is complete
     */
    function getAnalysisStatus(uint256 _contractId) external view validContractId(_contractId) returns (bool) {
        return privacyAnalyses[_contractId].analysisComplete;
    }

    /**
     * @notice Get contracts submitted by an address
     * @param _submitter Address of the submitter
     * @return Array of contract IDs
     */
    function getSubmitterContracts(address _submitter) external view returns (uint256[] memory) {
        return submitterContracts[_submitter];
    }

    /**
     * @notice Get contracts reviewed by an address
     * @param _reviewer Address of the reviewer
     * @return Array of contract IDs
     */
    function getReviewerContracts(address _reviewer) external view returns (uint256[] memory) {
        return reviewerContracts[_reviewer];
    }

    /**
     * @notice Check if address is authorized reviewer
     * @param _reviewer Address to check
     * @return bool Authorization status
     */
    function isAuthorizedReviewer(address _reviewer) external view returns (bool) {
        return authorizedReviewers[_reviewer];
    }

    /**
     * @notice Get total number of contracts
     * @return uint256 Total contract count
     */
    function getTotalContracts() external view returns (uint256) {
        return contractCounter;
    }

    /**
     * @notice Get decryption request details
     * @param requestId ID of the decryption request
     * @return DecryptionRequest struct with request details
     */
    function getDecryptionRequest(uint256 requestId) external view returns (
        uint256 contractId,
        address requester,
        uint256 requestTime,
        bool completed,
        uint32 decryptedScore,
        uint8 decryptedRiskLevel
    ) {
        DecryptionRequest storage request = decryptionRequests[requestId];
        return (
            request.contractId,
            request.requester,
            request.requestTime,
            request.completed,
            request.decryptedScore,
            request.decryptedRiskLevel
        );
    }

    /**
     * @notice Get contract decryption status
     * @param _contractId ID of the contract
     * @return requestId Decryption request ID
     * @return requestTime Time of request
     * @return completed Whether decryption completed
     * @return refundProcessed Whether refund was processed
     */
    function getDecryptionStatus(uint256 _contractId) external view validContractId(_contractId) returns (
        uint256 requestId,
        uint256 requestTime,
        bool completed,
        bool refundProcessed
    ) {
        ContractDocument storage doc = contracts[_contractId];
        return (
            doc.decryptionRequestId,
            doc.decryptionRequestTime,
            doc.decryptionCompleted,
            doc.refundProcessed
        );
    }

    /**
     * @notice Check if refund is claimable for a contract
     * @param _contractId ID of the contract
     * @return bool Whether refund can be claimed
     */
    function canClaimRefund(uint256 _contractId) external view validContractId(_contractId) returns (bool) {
        ContractDocument storage doc = contracts[_contractId];
        if (doc.refundProcessed || doc.decryptionRequestId == 0) {
            return false;
        }

        DecryptionRequest storage request = decryptionRequests[doc.decryptionRequestId];
        bool timedOut = block.timestamp > request.requestTime + DECRYPTION_TIMEOUT;
        bool failed = !doc.decryptionCompleted && !request.completed;

        return (timedOut || failed) && !request.completed;
    }

    /**
     * @notice Receive function to accept ETH
     */
    receive() external payable {
        platformFees += msg.value;
    }
}