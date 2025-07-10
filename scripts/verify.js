const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=================================================");
  console.log("Contract Verification on Etherscan");
  console.log("=================================================\n");

  const network = hre.network.name;

  // Load latest deployment info
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const latestFile = path.join(deploymentsDir, `${network}_latest.json`);

  if (!fs.existsSync(latestFile)) {
    console.error("❌ No deployment found for network:", network);
    console.log("Please deploy the contract first using:");
    console.log(`   npm run deploy:${network}`);
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(latestFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log("Network:", network);
  console.log("Contract Address:", contractAddress);
  console.log("Contract Name:", deploymentInfo.contractName);
  console.log("\n⏳ Starting verification...\n");

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });

    console.log("\n✅ Contract verified successfully!");
    console.log("🔍 View on Etherscan:", deploymentInfo.etherscanUrl);

    // Update deployment info with verification status
    deploymentInfo.verified = true;
    deploymentInfo.verificationTime = new Date().toISOString();
    fs.writeFileSync(latestFile, JSON.stringify(deploymentInfo, null, 2));

    console.log("\n=================================================");
    console.log("Verification Complete");
    console.log("=================================================");

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified on Etherscan");
      console.log("🔍 View on Etherscan:", deploymentInfo.etherscanUrl);
    } else {
      console.error("❌ Verification failed:");
      console.error(error.message);
      process.exit(1);
    }
  }

  console.log("\n=================================================");
  console.log("Next Steps");
  console.log("=================================================");
  console.log("1. Interact with the verified contract:");
  console.log("   npm run interact");
  console.log("\n2. View contract on Etherscan:");
  console.log("  ", deploymentInfo.etherscanUrl);
  console.log("=================================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
