import { ethers } from "hardhat";

// Return the Eth balance of a given address.

async function getBalance(address: any) {
  const balanceBigInt = await ethers.provider.getBalance(address);
  return ethers.formatEther(balanceBigInt);
}

async function printBalances(addresses: any) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} balance: `, await getBalance(address));
    idx++;
  }
}

async function printMemos(memos: any) {
  for (const memo of memos) {
    const timestamp = memo.timestamp;
    const tipper = memo.name;
    const tipperAddress = memo.from;
    const message = memo.message;
    console.log(`At ${timestamp}, ${tipper} (${tipperAddress}) said: "${message}"`)
  }
}

async function main() {
  // Get example accounts
  const [owner, tipper, tipper2, tipper3] = await ethers.getSigners();
  // get the contract to deploy

  const buyMeACoffee = await ethers.deployContract("BuyMeACoffee");
  await buyMeACoffee.waitForDeployment();

  console.log("BuyMeACoffee deployed to ", await buyMeACoffee.getAddress());

  // check balances before coffee purchase

  const addresses = [owner.address, tipper.address, await buyMeACoffee.getAddress()];
  console.log("Starting...");
  await printBalances(addresses);

  // buy the owner a few coffee

  const tip = {value: ethers.parseEther("1")}; // number of tipped ETH
  await buyMeACoffee.connect(tipper).buyCoffee("Harry", "OK", tip);
  await buyMeACoffee.connect(tipper2).buyCoffee("Duong", "Oh no", tip);
  await buyMeACoffee.connect(tipper3).buyCoffee("Minh Nam", "!!! Let's go", tip);

  // Check balances after coffee purchase.
  console.log("Bought Coffee...");
  await printBalances(addresses);

  // Withdraw funds

  await buyMeACoffee.connect(owner).withdrawTips();
  // Check balance after withdraw
  console.log("Withdraw Tips...");
  await printBalances(addresses);

  // read all the memos left for the owner
  console.log("Memo...");
  const memos = await buyMeACoffee.getMemos();
  printMemos(memos);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
