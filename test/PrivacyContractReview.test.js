const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrivacyContractReview", function () {
  let contract;
  let owner;
  let reviewer1;
  let reviewer2;
  let submitter1;
  let submitter2;
  let unauthorized;

  beforeEach(async function () {
    [owner, reviewer1, reviewer2, submitter1, submitter2, unauthorized] = await ethers.getSigners();

    const PrivacyContractReview = await ethers.getContractFactory("PrivacyContractReview");
    contract = await PrivacyContractReview.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should initialize contract counter to 0", async function () {
      expect(await contract.contractCounter()).to.equal(0);
    });

    it("Should authorize owner as default reviewer", async function () {
      expect(await contract.isAuthorizedReviewer(owner.address)).to.be.true;
    });

    it("Should return correct total contracts count", async function () {
      expect(await contract.getTotalContracts()).to.equal(0);
    });
  });

  describe("Reviewer Authorization", function () {
    it("Should allow owner to authorize reviewers", async function () {
      await expect(contract.authorizeReviewer(reviewer1.address))
        .to.emit(contract, "ReviewerAuthorized")
        .withArgs(reviewer1.address, owner.address);

      expect(await contract.isAuthorizedReviewer(reviewer1.address)).to.be.true;
    });

    it("Should allow owner to revoke reviewers", async function () {
      await contract.authorizeReviewer(reviewer1.address);

      await expect(contract.revokeReviewer(reviewer1.address))
        .to.emit(contract, "ReviewerRevoked")
        .withArgs(reviewer1.address, owner.address);

      expect(await contract.isAuthorizedReviewer(reviewer1.address)).to.be.false;
    });

    it("Should prevent non-owner from authorizing reviewers", async function () {
      await expect(
        contract.connect(unauthorized).authorizeReviewer(reviewer1.address)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should prevent non-owner from revoking reviewers", async function () {
      await contract.authorizeReviewer(reviewer1.address);

      await expect(
        contract.connect(unauthorized).revokeReviewer(reviewer1.address)
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Contract Submission", function () {
    it("Should allow anyone to submit a contract", async function () {
      const documentHash = "QmTestHash123";
      const publicTitle = "Test Privacy Policy";

      await expect(contract.connect(submitter1).submitContract(documentHash, publicTitle))
        .to.emit(contract, "ContractSubmitted")
        .withArgs(1, submitter1.address, publicTitle);

      expect(await contract.getTotalContracts()).to.equal(1);
    });

    it("Should store contract information correctly", async function () {
      const documentHash = "QmTestHash456";
      const publicTitle = "Vendor Agreement";

      await contract.connect(submitter1).submitContract(documentHash, publicTitle);

      const contractInfo = await contract.getContractInfo(1);
      expect(contractInfo.documentHash).to.equal(documentHash);
      expect(contractInfo.submitter).to.equal(submitter1.address);
      expect(contractInfo.publicTitle).to.equal(publicTitle);
      expect(contractInfo.isReviewed).to.be.false;
      expect(contractInfo.clauseCount).to.equal(0);
    });

    it("Should track submitter contracts", async function () {
      await contract.connect(submitter1).submitContract("Hash1", "Contract 1");
      await contract.connect(submitter1).submitContract("Hash2", "Contract 2");
      await contract.connect(submitter2).submitContract("Hash3", "Contract 3");

      const submitter1Contracts = await contract.getSubmitterContracts(submitter1.address);
      const submitter2Contracts = await contract.getSubmitterContracts(submitter2.address);

      expect(submitter1Contracts.length).to.equal(2);
      expect(submitter2Contracts.length).to.equal(1);
    });

    it("Should increment contract counter correctly", async function () {
      await contract.connect(submitter1).submitContract("Hash1", "Contract 1");
      expect(await contract.contractCounter()).to.equal(1);

      await contract.connect(submitter2).submitContract("Hash2", "Contract 2");
      expect(await contract.contractCounter()).to.equal(2);
    });
  });

  describe("Clause Review", function () {
    beforeEach(async function () {
      await contract.authorizeReviewer(reviewer1.address);
      await contract.connect(submitter1).submitContract("QmHash", "Test Contract");
    });

    it("Should allow authorized reviewer to review clause", async function () {
      await expect(
        contract.connect(reviewer1).reviewClause(
          1,
          "data_processing",
          8,
          4,
          "GDPR compliant"
        )
      ).to.emit(contract, "ClauseReviewed")
        .withArgs(1, 1, reviewer1.address);
    });

    it("Should prevent unauthorized user from reviewing", async function () {
      await expect(
        contract.connect(unauthorized).reviewClause(
          1,
          "data_processing",
          8,
          4,
          "Test"
        )
      ).to.be.revertedWith("Not authorized reviewer");
    });

    it("Should validate compliance rating range", async function () {
      await expect(
        contract.connect(reviewer1).reviewClause(1, "retention", 11, 3, "Test")
      ).to.be.revertedWith("Compliance rating must be 0-10");
    });

    it("Should validate sensitivity level range", async function () {
      await expect(
        contract.connect(reviewer1).reviewClause(1, "sharing", 7, 6, "Test")
      ).to.be.revertedWith("Sensitivity must be 1-5");

      await expect(
        contract.connect(reviewer1).reviewClause(1, "sharing", 7, 0, "Test")
      ).to.be.revertedWith("Sensitivity must be 1-5");
    });

    it("Should reject invalid contract ID", async function () {
      await expect(
        contract.connect(reviewer1).reviewClause(999, "consent", 8, 3, "Test")
      ).to.be.revertedWith("Invalid contract ID");
    });

    it("Should store clause information correctly", async function () {
      await contract.connect(reviewer1).reviewClause(
        1,
        "user_rights",
        9,
        2,
        "Comprehensive user rights"
      );

      const clauseInfo = await contract.getClauseInfo(1, 1);
      expect(clauseInfo.clauseType).to.equal("user_rights");
      expect(clauseInfo.reviewer).to.equal(reviewer1.address);
      expect(clauseInfo.notes).to.equal("Comprehensive user rights");
    });

    it("Should increment clause count", async function () {
      await contract.connect(reviewer1).reviewClause(1, "security", 8, 4, "Good");
      await contract.connect(reviewer1).reviewClause(1, "breach", 7, 3, "Acceptable");

      const contractInfo = await contract.getContractInfo(1);
      expect(contractInfo.clauseCount).to.equal(2);
    });

    it("Should track reviewer contracts", async function () {
      await contract.connect(submitter1).submitContract("Hash2", "Contract 2");

      await contract.connect(reviewer1).reviewClause(1, "data_processing", 8, 4, "Test");
      await contract.connect(reviewer1).reviewClause(2, "retention", 7, 3, "Test");

      const reviewerContracts = await contract.getReviewerContracts(reviewer1.address);
      expect(reviewerContracts.length).to.equal(2);
    });
  });

  describe("Privacy Analysis", function () {
    beforeEach(async function () {
      await contract.authorizeReviewer(reviewer1.address);
      await contract.connect(submitter1).submitContract("QmHash", "Test Contract");
    });

    it("Should allow authorized reviewer to complete analysis", async function () {
      await expect(
        contract.connect(reviewer1).completePrivacyAnalysis(
          1,
          85,  // dataSensitivity
          9,   // gdprCompliance
          8,   // ccpaCompliance
          2,   // retentionRisk
          3    // sharingRisk
        )
      ).to.emit(contract, "AnalysisCompleted")
        .withArgs(1, reviewer1.address);
    });

    it("Should prevent unauthorized user from completing analysis", async function () {
      await expect(
        contract.connect(unauthorized).completePrivacyAnalysis(1, 75, 8, 7, 2, 2)
      ).to.be.revertedWith("Not authorized reviewer");
    });

    it("Should validate compliance scores", async function () {
      await expect(
        contract.connect(reviewer1).completePrivacyAnalysis(1, 80, 11, 8, 2, 3)
      ).to.be.revertedWith("Compliance scores must be 0-10");

      await expect(
        contract.connect(reviewer1).completePrivacyAnalysis(1, 80, 8, 11, 2, 3)
      ).to.be.revertedWith("Compliance scores must be 0-10");
    });

    it("Should validate risk levels", async function () {
      await expect(
        contract.connect(reviewer1).completePrivacyAnalysis(1, 80, 8, 7, 6, 3)
      ).to.be.revertedWith("Retention risk must be 1-5");

      await expect(
        contract.connect(reviewer1).completePrivacyAnalysis(1, 80, 8, 7, 2, 0)
      ).to.be.revertedWith("Sharing risk must be 1-5");
    });

    it("Should mark contract as reviewed", async function () {
      await contract.connect(reviewer1).completePrivacyAnalysis(1, 75, 8, 8, 2, 2);

      const contractInfo = await contract.getContractInfo(1);
      expect(contractInfo.isReviewed).to.be.true;
    });

    it("Should update analysis status", async function () {
      expect(await contract.getAnalysisStatus(1)).to.be.false;

      await contract.connect(reviewer1).completePrivacyAnalysis(1, 75, 8, 8, 2, 2);

      expect(await contract.getAnalysisStatus(1)).to.be.true;
    });

    it("Should emit compliance alert for low scores", async function () {
      await expect(
        contract.connect(reviewer1).completePrivacyAnalysis(
          1,
          60,
          4,  // Low GDPR score
          3,  // Low CCPA score
          4,  // High retention risk
          5   // High sharing risk
        )
      ).to.emit(contract, "ComplianceAlert");
    });

    it("Should emit compliance alert for high risk", async function () {
      await expect(
        contract.connect(reviewer1).completePrivacyAnalysis(
          1,
          80,
          8,
          8,
          4,  // High retention risk
          4   // High sharing risk
        )
      ).to.emit(contract, "ComplianceAlert");
    });

    it("Should reject invalid contract ID", async function () {
      await expect(
        contract.connect(reviewer1).completePrivacyAnalysis(999, 75, 8, 8, 2, 2)
      ).to.be.revertedWith("Invalid contract ID");
    });
  });

  describe("Data Retrieval", function () {
    beforeEach(async function () {
      await contract.authorizeReviewer(reviewer1.address);
      await contract.connect(submitter1).submitContract("QmTestHash", "Test Contract");
      await contract.connect(reviewer1).reviewClause(1, "data_processing", 8, 4, "Good");
      await contract.connect(reviewer1).reviewClause(1, "retention", 9, 3, "Excellent");
    });

    it("Should retrieve contract information", async function () {
      const info = await contract.getContractInfo(1);

      expect(info.documentHash).to.equal("QmTestHash");
      expect(info.submitter).to.equal(submitter1.address);
      expect(info.publicTitle).to.equal("Test Contract");
      expect(info.clauseCount).to.equal(2);
    });

    it("Should retrieve clause information", async function () {
      const clause1 = await contract.getClauseInfo(1, 1);
      const clause2 = await contract.getClauseInfo(1, 2);

      expect(clause1.clauseType).to.equal("data_processing");
      expect(clause1.reviewer).to.equal(reviewer1.address);
      expect(clause1.notes).to.equal("Good");

      expect(clause2.clauseType).to.equal("retention");
      expect(clause2.notes).to.equal("Excellent");
    });

    it("Should reject invalid clause ID", async function () {
      await expect(contract.getClauseInfo(1, 999)).to.be.revertedWith("Invalid clause ID");
    });

    it("Should return analysis status", async function () {
      expect(await contract.getAnalysisStatus(1)).to.be.false;

      await contract.connect(reviewer1).completePrivacyAnalysis(1, 80, 8, 8, 2, 3);

      expect(await contract.getAnalysisStatus(1)).to.be.true;
    });
  });

  describe("Complex Workflow", function () {
    it("Should handle complete review workflow", async function () {
      // Authorize reviewers
      await contract.authorizeReviewer(reviewer1.address);
      await contract.authorizeReviewer(reviewer2.address);

      // Submit contracts
      await contract.connect(submitter1).submitContract("Hash1", "Contract 1");
      await contract.connect(submitter2).submitContract("Hash2", "Contract 2");

      // Review multiple clauses
      await contract.connect(reviewer1).reviewClause(1, "data_processing", 8, 4, "Test");
      await contract.connect(reviewer1).reviewClause(1, "retention", 9, 3, "Test");
      await contract.connect(reviewer2).reviewClause(2, "sharing", 7, 5, "Test");

      // Complete analyses
      await contract.connect(reviewer1).completePrivacyAnalysis(1, 85, 9, 8, 2, 3);
      await contract.connect(reviewer2).completePrivacyAnalysis(2, 70, 7, 7, 3, 4);

      // Verify final state
      expect(await contract.getTotalContracts()).to.equal(2);

      const contract1Info = await contract.getContractInfo(1);
      const contract2Info = await contract.getContractInfo(2);

      expect(contract1Info.isReviewed).to.be.true;
      expect(contract2Info.isReviewed).to.be.true;
      expect(contract1Info.clauseCount).to.equal(2);
      expect(contract2Info.clauseCount).to.equal(1);
    });
  });
});
