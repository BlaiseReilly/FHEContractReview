const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=================================================");
  console.log("Privacy Contract Review Platform - Deployment");
  console.log("=================================================\n");

  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log("Network:", network);
  console.log("Deployer address:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH\n");

  console.log("Deploying PrivacyContractReview contract...");
  console.log("⏳ Please wait...\n");

  const PrivacyContractReview = await hre.ethers.getContractFactory("PrivacyContractReview");
  const contract = await PrivacyContractReview.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("✅ Contract deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("🔗 Transaction Hash:", contract.deploymentTransaction().hash);
  console.log("⛽ Gas Used:", contract.deploymentTransaction().gasLimit.toString());

  if (network === "sepolia") {
    console.log("🔍 Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
  } else if (network === "zamaDevnet" || network === "zamaTestnet") {
    console.log("🔍 Block Explorer:", `https://explorer.zama.ai/address/${contractAddress}`);
  }

  console.log("\n=================================================");
  console.log("Contract Information");
  console.log("=================================================");

  const owner = await contract.owner();
  const contractCounter = await contract.contractCounter();

  console.log("Owner:", owner);
  console.log("Initial Contract Counter:", contractCounter.toString());
  console.log("Deployer is authorized reviewer:", owner === deployer.address);

  // Save deployment information
  const deploymentInfo = {
    network: network,
    contractName: "PrivacyContractReview",
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: contract.deploymentTransaction().hash,
    blockNumber: contract.deploymentTransaction().blockNumber,
    owner: owner,
    etherscanUrl: network === "sepolia"
      ? `https://sepolia.etherscan.io/address/${contractAddress}`
      : network.includes("zama")
      ? `https://explorer.zama.ai/address/${contractAddress}`
      : "N/A"
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const fileName = `${network}_${Date.now()}.json`;
  const filePath = path.join(deploymentsDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n📄 Deployment info saved to:", fileName);

  // Save latest deployment
  const latestFile = path.join(deploymentsDir, `${network}_latest.json`);
  fs.writeFileSync(latestFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n=================================================");
  console.log("Next Steps");
  console.log("=================================================");
  console.log("1. Verify contract on Etherscan:");
  console.log("   npm run verify:sepolia");
  console.log("\n2. Interact with the contract:");
  console.log("   npm run interact");
  console.log("\n3. Run simulation:");
  console.log("   npm run simulate");
  console.log("=================================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
