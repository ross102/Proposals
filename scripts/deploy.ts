import { ethers } from "hardhat";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

async function main() {
  console.log("Deploying Ballot contract");
  console.log("Proposals: ");
  PROPOSALS.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);
  });
  const ballotFacctory = await ethers.getContractFactory("Ballot");
  const ballot = await ballotFacctory.deploy(PROPOSALS);
  await ballot.deployed();

  // const text  = await  ballot.getText()
  console.log("Ballot Proposal deployed to:", ballot.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
