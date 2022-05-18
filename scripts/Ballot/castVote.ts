import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
// eslint-disable-next-line node/no-missing-import
import { Ballot } from "../../typechain";
// key is exposed just for testing
const EXPOSED_KEY =
  "0xea6c44ac03bff858b476bba40716402b03e41b8e97e276d1baec7c37d42484a0";

async function main() {
  const wallet =
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
      : new ethers.Wallet(EXPOSED_KEY);
  console.log(`Using address ${wallet.address}`);
  const provider = ethers.providers.getDefaultProvider("ropsten");
  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.001) {
    throw new Error("Not enough ether");
  }
  const Addresses = ["0x0064c293bf0b58bf58053b3ed00c33a916665d77",
   "0xbda5747bfd65f08deb54cb465eb87d40e51b197e", "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199",
   "0x2546bcd3c84621e976d8185a91a922ae77ecec30", "0x2546bcd3c84621e976d8185a91a922ae77ecec30"]

  if (Addresses.length < 3) throw new Error("Ballot address missing");
  const ballotAddress = Addresses[1];
  if (Addresses.length < 4) throw new Error("Voter address missing");
  const voterAddress = Addresses[1];
  console.log(
    `Attaching ballot contract interface to address ${ballotAddress}`
  );
  const ballotContract: Ballot = new Contract(
    ballotAddress,
    ballotJson.abi,
    signer
  ) as Ballot;
  
  //The signer already has the right to vote
  const tx = await ballotContract.vote(1);
  console.log(`Awaiting confirmations of casting votes`);
  await tx.wait();
  console.log(`Transaction completed. Hash: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
