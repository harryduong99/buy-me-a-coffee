// scripts/withdraw.js

import { ethers } from "hardhat";
const abi = require("../artifacts/contracts/BuyMeACoffee.sol/BuyMeACoffee.json");

async function getBalance(provider: any, address: any) {
  const balanceBigInt = await provider.getBalance(address);
  return ethers.formatEther(balanceBigInt);
}

async function main() {
  // Get the contract that has been deployed to Goerli.
  const contractAddress = "0x24085235faE69308f0048f2EbCb17C42Ff48E9a9";
  const contractABI = abi.abi;

  // Get the node connection and wallet connection.
  const provider = new ethers.JsonRpcProvider(process.env.GOERLI_URL, "goerli");

  // Ensure that signer is the SAME address as the original contract deployer,
  // or else this script will fail with an error.
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);

  // Instantiate connected contract.
  const buyMeACoffee = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  // Check starting balances.
  console.log(
    "current balance of owner: ",
    await getBalance(provider, signer.address),
    "ETH"
  );
  const contractBalance = await getBalance(provider, contractAddress);
  console.log(
    "current balance of contract: ",
    await getBalance(provider, contractAddress),
    "ETH"
  );

  // Withdraw funds if there are funds to withdraw.
  if (contractBalance !== "0.0") {
    console.log("withdrawing funds..");
    const withdrawTxn = await buyMeACoffee.withdrawTips();
    await withdrawTxn.wait();
  } else {
    console.log("no funds to withdraw!");
  }

  // Check ending balance.
  console.log(
    "current balance of owner: ",
    await getBalance(provider, signer.address),
    "ETH"
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
