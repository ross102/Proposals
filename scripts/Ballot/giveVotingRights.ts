import { Contract, ethers } from "ethers";
import "dotenv/config";
import * as ballotJson from "../../artifacts/contracts/Ballot.sol/Ballot.json";
// eslint-disable-next-line node/no-missing-import
import { Ballot } from "../../typechain";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY =
  "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e";

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
  if (balance < 0.00001) {
    throw new Error("Not enough ether");
  }
  const Addresses = ["0x0064c293bf0b58bf58053b3ed00c33a916665d77",
  "0xbda5747bfd65f08deb54cb465eb87d40e51b197e", "0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199",
  "0x2546bcd3c84621e976d8185a91a922ae77ecec30",
  "0xfabb0ac9d68b0b445fb7357272ff202c5651694a", "0x1cbd3b2770909d4e10f157cabc84c7264073c9ec"]

  if (Addresses.length < 3) throw new Error("Ballot address missing");
  // added the contract address as the first address in the array
  const ballotAddress = Addresses[0];
  if (Addresses.length < 4) throw new Error("Voter address missing");
  const voterAddress = Addresses[5];
  console.log(
    `Attaching ballot contract interface to address ${ballotAddress}`
  );
  const ballotContract: Ballot = new Contract(
    ballotAddress,
    ballotJson.abi,
    signer
  ) as Ballot;
  const chairpersonAddress = await ballotContract.chairperson();
  if (chairpersonAddress !== signer.address)
    throw new Error("Caller is not the chairperson for this contract");
  console.log(`Giving right to vote to ${voterAddress}`);
  const tx = await ballotContract.giveRightToVote(voterAddress);
  console.log("Awaiting confirmations");
  await tx.wait();
  console.log(`Transaction completed. Hash: ${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
