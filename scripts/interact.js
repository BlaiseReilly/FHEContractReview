const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=================================================");
  console.log("Privacy Contract Review Platform - Interaction");
  console.log("=================================================\n");

  const network = hre.network.name;
  const [signer] = await hre.ethers.getSigners();

  console.log("Network:", network);
  console.log("Signer Address:", signer.address);

  // Load deployment info
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const latestFile = path.join(deploymentsDir, `${network}_latest.json`);

  if (!fs.existsSync(latestFile)) {
    console.error("❌ No deployment found for network:", network);
    console.log("Please deploy the contract first.");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(latestFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log("Contract Address:", contractAddress);
  console.log("\n⏳ Connecting to contract...\n");

  const PrivacyContractReview = await hre.ethers.getContractFactory("PrivacyContractReview");
  const contract = PrivacyContractReview.attach(contractAddress);

  console.log("=================================================");
  console.log("Contract State");
  console.log("=================================================");

  const owner = await contract.owner();
  const totalContracts = await contract.getTotalContracts();
  const isReviewer = await contract.isAuthorizedReviewer(signer.address);

  console.log("Owner:", owner);
  console.log("Total Contracts Submitted:", totalContracts.toString());
  console.log("Your Address is Authorized Reviewer:", isReviewer);

  console.log("\n=================================================");
  console.log("Available Interactions");
  console.log("=================================================");

  console.log("\n1. Submit a Contract for Review");
  console.log("   Function: submitContract(documentHash, publicTitle)");
  console.log("   Example:");
  console.log('   await contract.submitContract("QmHash123...", "Vendor Agreement 2024")');

  console.log("\n2. Review a Clause (Authorized Reviewers Only)");
  console.log("   Function: reviewClause(contractId, clauseType, complianceRating, sensitivityLevel, notes)");
  console.log("   Clause Types: data_processing, retention, sharing, consent, user_rights, security, breach, transfer");
  console.log("   Compliance Rating: 0-10 (0=non-compliant, 10=fully compliant)");
  console.log("   Sensitivity Level: 1-5 (1=low, 5=high)");
  console.log("   Example:");
  console.log('   await contract.reviewClause(1, "data_processing", 8, 4, "GDPR compliant data collection")');

  console.log("\n3. Complete Privacy Analysis (Authorized Reviewers Only)");
  console.log("   Function: completePrivacyAnalysis(contractId, dataSensitivity, gdprCompliance, ccpaCompliance, retentionRisk, sharingRisk)");
  console.log("   Example:");
  console.log("   await contract.completePrivacyAnalysis(1, 75, 9, 8, 2, 3)");

  console.log("\n4. Authorize a Reviewer (Owner Only)");
  console.log("   Function: authorizeReviewer(reviewerAddress)");
  console.log("   Example:");
  console.log('   await contract.authorizeReviewer("0x123...")');

  console.log("\n5. Get Contract Information");
  console.log("   Function: getContractInfo(contractId)");
  console.log("   Example:");
  console.log("   await contract.getContractInfo(1)");

  console.log("\n=================================================");
  console.log("Example Workflow");
  console.log("=================================================");

  // Example: Submit a contract
  console.log("\n📝 Example: Submitting a new contract...");

  try {
    const documentHash = "QmExample" + Date.now(); // Example IPFS hash
    const publicTitle = "Example Privacy Policy Review";

    console.log("Document Hash:", documentHash);
    console.log("Title:", publicTitle);

    const tx = await contract.submitContract(documentHash, publicTitle);
    console.log("Transaction sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("Block Number:", receipt.blockNumber);
    console.log("Gas Used:", receipt.gasUsed.toString());

    // Get the contract ID from the event
    const contractId = await contract.getTotalContracts();
    console.log("📋 New Contract ID:", contractId.toString());

    // Get contract info
    const contractInfo = await contract.getContractInfo(contractId);
    console.log("\n📄 Contract Information:");
    console.log("   Document Hash:", contractInfo.documentHash);
    console.log("   Submitter:", contractInfo.submitter);
    console.log("   Public Title:", contractInfo.publicTitle);
    console.log("   Is Reviewed:", contractInfo.isReviewed);
    console.log("   Clause Count:", contractInfo.clauseCount.toString());
    console.log("   Submission Time:", new Date(Number(contractInfo.submissionTime) * 1000).toISOString());

    // If user is authorized reviewer, demonstrate review functionality
    if (isReviewer) {
      console.log("\n📊 Example: Reviewing a clause...");

      const reviewTx = await contract.reviewClause(
        contractId,
        "data_processing",
        8, // compliance rating (0-10)
        4, // sensitivity level (1-5)
        "Data collection complies with GDPR requirements"
      );

      console.log("Review transaction sent:", reviewTx.hash);
      const reviewReceipt = await reviewTx.wait();
      console.log("✅ Clause review submitted!");
      console.log("Gas Used:", reviewReceipt.gasUsed.toString());

      // Get updated clause count
      const updatedInfo = await contract.getContractInfo(contractId);
      console.log("Updated Clause Count:", updatedInfo.clauseCount.toString());
    }

  } catch (error) {
    console.error("❌ Error during interaction:");
    console.error(error.message);
  }

  console.log("\n=================================================");
  console.log("Interaction Complete");
  console.log("=================================================");
  console.log("Contract Address:", contractAddress);
  if (deploymentInfo.etherscanUrl) {
    console.log("View on Etherscan:", deploymentInfo.etherscanUrl);
  }
  console.log("=================================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
