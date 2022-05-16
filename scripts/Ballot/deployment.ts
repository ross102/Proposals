import * as dotenv from "dotenv";

import { ethers } from "ethers";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";

dotenv.config();


const EXPOSED_KEY =
  "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199";

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

async function main() {
  const wallet =
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
      : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
  console.log(`Using address ${wallet.address}`);
  const provider = ethers.providers.getDefaultProvider("ropsten");
  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();
  console.log(signer);
  // const balance = await ethers.utils.formatEther(balanceBN);
  // console.log(`Wallet balance ${balance}`);
  // if (balance) {
  //   throw new Error("Not enough ether");
  // }
  console.log("Deploying Ballot contract");
  console.log("Proposals: ");
  const proposals = ["prop1", "prop2", "prop3"]
  if (proposals.length < 2) throw new Error("Not enough proposals provided");
  proposals.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);
  });
  const ballotFactory = new ethers.ContractFactory(
    ballotJson.abi,
    ballotJson.bytecode,
  );
  const ballotContract = await ballotFactory.deploy(
    convertStringArrayToBytes32(proposals)
  );
  console.log("Awaiting confirmations");
  await ballotContract.deployed();
  console.log("Completed");
  console.log(`Contract deployed at ${ballotContract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
