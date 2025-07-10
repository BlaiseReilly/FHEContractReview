// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint32, euint8, ebool, euint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivacyContractReview is SepoliaConfig {

    address public owner;
    uint256 public contractCounter;
    uint256 public reviewCounter;

    struct ContractDocument {
        string documentHash; // IPFS hash or other identifier
        euint32 encryptedScore; // Encrypted compliance score (0-100)
        euint8 encryptedRiskLevel; // Encrypted risk level (1-5)
        address submitter;
        uint256 submissionTime;
        bool isReviewed;
        string publicTitle;
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

    mapping(uint256 => ContractDocument) public contracts;
    mapping(uint256 => mapping(uint256 => ReviewClause)) public contractClauses;
    mapping(uint256 => PrivacyAnalysis) public privacyAnalyses;
    mapping(uint256 => uint256) public contractClauseCounts;
    mapping(address => bool) public authorizedReviewers;
    mapping(address => uint256[]) public reviewerContracts;
    mapping(address => uint256[]) public submitterContracts;

    event ContractSubmitted(uint256 indexed contractId, address indexed submitter, string publicTitle);
    event ClauseReviewed(uint256 indexed contractId, uint256 indexed clauseId, address indexed reviewer);
    event AnalysisCompleted(uint256 indexed contractId, address indexed reviewer);
    event ReviewerAuthorized(address indexed reviewer, address indexed authorizedBy);
    event ReviewerRevoked(address indexed reviewer, address indexed revokedBy);
    event ComplianceAlert(uint256 indexed contractId, uint256 alertLevel);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyAuthorizedReviewer() {
        require(authorizedReviewers[msg.sender], "Not authorized reviewer");
        _;
    }

    modifier onlySubmitterOrReviewer(uint256 contractId) {
        require(
            contracts[contractId].submitter == msg.sender ||
            authorizedReviewers[msg.sender],
            "Not authorized to access"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedReviewers[msg.sender] = true;
        contractCounter = 0;
        reviewCounter = 0;
    }

    // Submit a contract for privacy review
    function submitContract(
        string memory _documentHash,
        string memory _publicTitle
    ) external returns (uint256) {
        contractCounter++;

        contracts[contractCounter] = ContractDocument({
            documentHash: _documentHash,
            encryptedScore: FHE.asEuint32(0), // Initial score
            encryptedRiskLevel: FHE.asEuint8(3), // Default medium risk
            submitter: msg.sender,
            submissionTime: block.timestamp,
            isReviewed: false,
            publicTitle: _publicTitle
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

        emit ContractSubmitted(contractCounter, msg.sender, _publicTitle);
        return contractCounter;
    }

    // Add a clause review to a contract
    function reviewClause(
        uint256 _contractId,
        string memory _clauseType,
        uint8 _complianceRating,
        uint8 _sensitivityLevel,
        string memory _notes
    ) external onlyAuthorizedReviewer {
        require(_contractId <= contractCounter && _contractId > 0, "Invalid contract ID");
        require(_complianceRating <= 10, "Compliance rating must be 0-10");
        require(_sensitivityLevel >= 1 && _sensitivityLevel <= 5, "Sensitivity must be 1-5");

        uint256 clauseId = contractClauseCounts[_contractId] + 1;
        contractClauseCounts[_contractId] = clauseId;

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

    // Complete privacy analysis for a contract
    function completePrivacyAnalysis(
        uint256 _contractId,
        uint32 _dataSensitivity,
        uint8 _gdprCompliance,
        uint8 _ccpaCompliance,
        uint8 _retentionRisk,
        uint8 _sharingRisk
    ) external onlyAuthorizedReviewer {
        require(_contractId <= contractCounter && _contractId > 0, "Invalid contract ID");
        require(_gdprCompliance <= 10 && _ccpaCompliance <= 10, "Compliance scores must be 0-10");
        require(_retentionRisk >= 1 && _retentionRisk <= 5, "Retention risk must be 1-5");
        require(_sharingRisk >= 1 && _sharingRisk <= 5, "Sharing risk must be 1-5");

        PrivacyAnalysis storage analysis = privacyAnalyses[_contractId];
        analysis.encryptedDataSensitivity = FHE.asEuint32(_dataSensitivity);
        analysis.encryptedGDPRCompliance = FHE.asEuint8(_gdprCompliance);
        analysis.encryptedCCPACompliance = FHE.asEuint8(_ccpaCompliance);
        analysis.encryptedRetentionRisk = FHE.asEuint8(_retentionRisk);
        analysis.encryptedSharingRisk = FHE.asEuint8(_sharingRisk);
        analysis.analysisComplete = true;

        // Calculate overall compliance score and risk level
        uint8 overallScore = (_gdprCompliance + _ccpaCompliance) / 2;
        uint8 overallRisk = (_retentionRisk + _sharingRisk) / 2;

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

    // Authorize a new reviewer
    function authorizeReviewer(address _reviewer) external onlyOwner {
        authorizedReviewers[_reviewer] = true;
        emit ReviewerAuthorized(_reviewer, msg.sender);
    }

    // Revoke reviewer authorization
    function revokeReviewer(address _reviewer) external onlyOwner {
        authorizedReviewers[_reviewer] = false;
        emit ReviewerRevoked(_reviewer, msg.sender);
    }

    // Get contract basic info (public data only)
    function getContractInfo(uint256 _contractId) external view returns (
        string memory documentHash,
        address submitter,
        uint256 submissionTime,
        bool isReviewed,
        string memory publicTitle,
        uint256 clauseCount
    ) {
        require(_contractId <= contractCounter && _contractId > 0, "Invalid contract ID");
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

    // Get clause information (public data only)
    function getClauseInfo(uint256 _contractId, uint256 _clauseId) external view returns (
        string memory clauseType,
        address reviewer,
        uint256 reviewTime,
        string memory notes
    ) {
        require(_contractId <= contractCounter && _contractId > 0, "Invalid contract ID");
        require(_clauseId <= contractClauseCounts[_contractId] && _clauseId > 0, "Invalid clause ID");

        ReviewClause storage clause = contractClauses[_contractId][_clauseId];
        return (
            clause.clauseType,
            clause.reviewer,
            clause.reviewTime,
            clause.encryptedNotes
        );
    }

    // Get analysis completion status
    function getAnalysisStatus(uint256 _contractId) external view returns (bool) {
        require(_contractId <= contractCounter && _contractId > 0, "Invalid contract ID");
        return privacyAnalyses[_contractId].analysisComplete;
    }

    // Get contracts submitted by an address
    function getSubmitterContracts(address _submitter) external view returns (uint256[] memory) {
        return submitterContracts[_submitter];
    }

    // Get contracts reviewed by an address
    function getReviewerContracts(address _reviewer) external view returns (uint256[] memory) {
        return reviewerContracts[_reviewer];
    }

    // Check if address is authorized reviewer
    function isAuthorizedReviewer(address _reviewer) external view returns (bool) {
        return authorizedReviewers[_reviewer];
    }

    // Get total number of contracts
    function getTotalContracts() external view returns (uint256) {
        return contractCounter;
    }

    // Decrypt contract score (only for authorized users)
    function requestScoreDecryption(uint256 _contractId) external onlySubmitterOrReviewer(_contractId) {
        require(_contractId <= contractCounter && _contractId > 0, "Invalid contract ID");
        require(contracts[_contractId].isReviewed, "Contract not yet reviewed");

        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(contracts[_contractId].encryptedScore);
        FHE.requestDecryption(cts, this.processScoreDecryption.selector);
    }

    // Callback for score decryption
    function processScoreDecryption(
        uint256 requestId,
        uint32 decryptedScore,
        bytes[] memory signatures
    ) external {
        // Process decrypted score as needed
        // This is a placeholder - implement specific logic as required
    }
}