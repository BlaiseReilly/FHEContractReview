const hre = require("hardhat");

async function main() {
  console.log("=================================================");
  console.log("Privacy Contract Review - Complete Workflow Simulation");
  console.log("=================================================\n");

  const [owner, reviewer1, reviewer2, submitter1, submitter2] = await hre.ethers.getSigners();

  console.log("👥 Test Accounts:");
  console.log("   Owner/Deployer:", owner.address);
  console.log("   Reviewer 1:", reviewer1.address);
  console.log("   Reviewer 2:", reviewer2.address);
  console.log("   Submitter 1:", submitter1.address);
  console.log("   Submitter 2:", submitter2.address);

  console.log("\n📦 Deploying PrivacyContractReview contract...");
  const PrivacyContractReview = await hre.ethers.getContractFactory("PrivacyContractReview");
  const contract = await PrivacyContractReview.deploy();
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ Contract deployed at:", contractAddress);

  console.log("\n=================================================");
  console.log("Step 1: Authorize Reviewers");
  console.log("=================================================");

  console.log("Authorizing Reviewer 1...");
  let tx = await contract.connect(owner).authorizeReviewer(reviewer1.address);
  await tx.wait();
  console.log("✅ Reviewer 1 authorized");

  console.log("Authorizing Reviewer 2...");
  tx = await contract.connect(owner).authorizeReviewer(reviewer2.address);
  await tx.wait();
  console.log("✅ Reviewer 2 authorized");

  // Verify authorization
  const isReviewer1 = await contract.isAuthorizedReviewer(reviewer1.address);
  const isReviewer2 = await contract.isAuthorizedReviewer(reviewer2.address);
  console.log("Reviewer 1 status:", isReviewer1);
  console.log("Reviewer 2 status:", isReviewer2);

  console.log("\n=================================================");
  console.log("Step 2: Submit Contracts for Review");
  console.log("=================================================");

  console.log("\n📝 Submitter 1: Submitting vendor agreement...");
  tx = await contract.connect(submitter1).submitContract(
    "QmVendorAgreement2024ABCD1234",
    "Vendor Data Processing Agreement 2024"
  );
  await tx.wait();
  console.log("✅ Contract 1 submitted");

  console.log("\n📝 Submitter 2: Submitting privacy policy...");
  tx = await contract.connect(submitter2).submitContract(
    "QmPrivacyPolicyXYZ5678",
    "Company Privacy Policy Update"
  );
  await tx.wait();
  console.log("✅ Contract 2 submitted");

  console.log("\n📝 Submitter 1: Submitting another contract...");
  tx = await contract.connect(submitter1).submitContract(
    "QmUserConsent9999",
    "User Consent Management Terms"
  );
  await tx.wait();
  console.log("✅ Contract 3 submitted");

  const totalContracts = await contract.getTotalContracts();
  console.log("\n📊 Total Contracts Submitted:", totalContracts.toString());

  console.log("\n=================================================");
  console.log("Step 3: Review Contract Clauses");
  console.log("=================================================");

  console.log("\n📋 Reviewer 1: Reviewing Contract 1 clauses...");

  // Data Processing Clause
  console.log("   Reviewing data processing clause...");
  tx = await contract.connect(reviewer1).reviewClause(
    1, // contractId
    "data_processing",
    8, // compliance rating (0-10)
    4, // sensitivity level (1-5)
    "Personal data collection clearly defined. GDPR Article 6 basis documented."
  );
  await tx.wait();
  console.log("   ✅ Data processing clause reviewed");

  // Data Retention Clause
  console.log("   Reviewing data retention clause...");
  tx = await contract.connect(reviewer1).reviewClause(
    1,
    "retention",
    9,
    3,
    "Retention periods align with legal requirements. Clear deletion policies."
  );
  await tx.wait();
  console.log("   ✅ Data retention clause reviewed");

  // Data Sharing Clause
  console.log("   Reviewing data sharing clause...");
  tx = await contract.connect(reviewer1).reviewClause(
    1,
    "sharing",
    7,
    5,
    "Third-party sharing disclosed. Additional DPA review recommended."
  );
  await tx.wait();
  console.log("   ✅ Data sharing clause reviewed");

  // User Consent Clause
  console.log("   Reviewing user consent clause...");
  tx = await contract.connect(reviewer1).reviewClause(
    1,
    "consent",
    9,
    3,
    "Clear consent mechanisms. Opt-out options available."
  );
  await tx.wait();
  console.log("   ✅ User consent clause reviewed");

  console.log("\n📋 Reviewer 2: Reviewing Contract 2 clauses...");

  // Security Measures Clause
  console.log("   Reviewing security measures clause...");
  tx = await contract.connect(reviewer2).reviewClause(
    2,
    "security",
    6,
    4,
    "Basic security measures described. Encryption standards need clarification."
  );
  await tx.wait();
  console.log("   ✅ Security measures clause reviewed");

  // Breach Notification Clause
  console.log("   Reviewing breach notification clause...");
  tx = await contract.connect(reviewer2).reviewClause(
    2,
    "breach",
    8,
    3,
    "72-hour notification timeline complies with GDPR Article 33."
  );
  await tx.wait();
  console.log("   ✅ Breach notification clause reviewed");

  // User Rights Clause
  console.log("   Reviewing user rights clause...");
  tx = await contract.connect(reviewer2).reviewClause(
    2,
    "user_rights",
    10,
    2,
    "Comprehensive user rights section. Access, rectification, deletion well-documented."
  );
  await tx.wait();
  console.log("   ✅ User rights clause reviewed");

  console.log("\n=================================================");
  console.log("Step 4: Complete Privacy Analysis");
  console.log("=================================================");

  console.log("\n📊 Reviewer 1: Completing analysis for Contract 1...");
  tx = await contract.connect(reviewer1).completePrivacyAnalysis(
    1, // contractId
    85, // dataSensitivity (0-100)
    8, // gdprCompliance (0-10)
    9, // ccpaCompliance (0-10)
    2, // retentionRisk (1-5)
    3  // sharingRisk (1-5)
  );
  await tx.wait();
  console.log("✅ Privacy analysis completed for Contract 1");

  console.log("\n📊 Reviewer 2: Completing analysis for Contract 2...");
  tx = await contract.connect(reviewer2).completePrivacyAnalysis(
    2,
    70,
    7,
    8,
    2,
    2
  );
  await tx.wait();
  console.log("✅ Privacy analysis completed for Contract 2");

  console.log("\n=================================================");
  console.log("Step 5: Query Contract Information");
  console.log("=================================================");

  for (let i = 1; i <= 3; i++) {
    console.log(`\n📄 Contract ${i} Details:`);
    const info = await contract.getContractInfo(i);
    const analysisStatus = await contract.getAnalysisStatus(i);

    console.log("   Document Hash:", info.documentHash);
    console.log("   Public Title:", info.publicTitle);
    console.log("   Submitter:", info.submitter);
    console.log("   Submission Time:", new Date(Number(info.submissionTime) * 1000).toISOString());
    console.log("   Is Reviewed:", info.isReviewed);
    console.log("   Clause Count:", info.clauseCount.toString());
    console.log("   Analysis Complete:", analysisStatus);

    // Get clause details
    if (info.clauseCount > 0n) {
      console.log("   Clauses:");
      for (let j = 1; j <= Number(info.clauseCount); j++) {
        const clause = await contract.getClauseInfo(i, j);
        console.log(`      ${j}. Type: ${clause.clauseType}, Reviewer: ${clause.reviewer}`);
      }
    }
  }

  console.log("\n=================================================");
  console.log("Step 6: Query Submitter and Reviewer Statistics");
  console.log("=================================================");

  const submitter1Contracts = await contract.getSubmitterContracts(submitter1.address);
  const submitter2Contracts = await contract.getSubmitterContracts(submitter2.address);
  const reviewer1Contracts = await contract.getReviewerContracts(reviewer1.address);
  const reviewer2Contracts = await contract.getReviewerContracts(reviewer2.address);

  console.log("\n👤 Submitter 1 (" + submitter1.address + ")");
  console.log("   Contracts Submitted:", submitter1Contracts.length);
  console.log("   Contract IDs:", submitter1Contracts.map(id => id.toString()).join(", "));

  console.log("\n👤 Submitter 2 (" + submitter2.address + ")");
  console.log("   Contracts Submitted:", submitter2Contracts.length);
  console.log("   Contract IDs:", submitter2Contracts.map(id => id.toString()).join(", "));

  console.log("\n👨‍⚖️ Reviewer 1 (" + reviewer1.address + ")");
  console.log("   Contracts Reviewed:", reviewer1Contracts.length);
  console.log("   Contract IDs:", reviewer1Contracts.map(id => id.toString()).join(", "));

  console.log("\n👨‍⚖️ Reviewer 2 (" + reviewer2.address + ")");
  console.log("   Contracts Reviewed:", reviewer2Contracts.length);
  console.log("   Contract IDs:", reviewer2Contracts.map(id => id.toString()).join(", "));

  console.log("\n=================================================");
  console.log("Step 7: Test Access Control");
  console.log("=================================================");

  console.log("\n🔒 Testing unauthorized review attempt...");
  try {
    await contract.connect(submitter1).reviewClause(
      1,
      "test",
      5,
      3,
      "Should fail"
    );
    console.log("❌ SECURITY ISSUE: Unauthorized review succeeded!");
  } catch (error) {
    console.log("✅ Access control working: Unauthorized review blocked");
  }

  console.log("\n🔒 Testing unauthorized authorization attempt...");
  try {
    await contract.connect(reviewer1).authorizeReviewer(submitter2.address);
    console.log("❌ SECURITY ISSUE: Unauthorized authorization succeeded!");
  } catch (error) {
    console.log("✅ Access control working: Non-owner authorization blocked");
  }

  console.log("\n=================================================");
  console.log("Simulation Summary");
  console.log("=================================================");
  console.log("✅ Contract Deployed:", contractAddress);
  console.log("✅ Reviewers Authorized: 2");
  console.log("✅ Contracts Submitted: 3");
  console.log("✅ Clauses Reviewed: 7");
  console.log("✅ Privacy Analyses Completed: 2");
  console.log("✅ Access Control Verified: Working correctly");
  console.log("\n🎉 Full workflow simulation completed successfully!");
  console.log("=================================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Simulation failed:");
    console.error(error);
    process.exit(1);
  });
