import { expect } from "chai";
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { Ballot } from  "../../typechain"

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
  const bytes32Array = [];
  for (let index = 0; index < array.length; index++) {
    bytes32Array.push(ethers.utils.formatBytes32String(array[index]));
  }
  return bytes32Array;
}

async function giveRightToVote(ballotContract: Ballot, voterAddress: any) {
  const tx = await ballotContract.giveRightToVote(voterAddress);
  await tx.wait();
}

describe("Ballot", function () {
  let ballotContract: Ballot;
  let accounts: any[];

  this.beforeEach(async function () {
    accounts = await ethers.getSigners();
    const ballotFactory = await ethers.getContractFactory("Ballot");
    ballotContract = await ballotFactory.deploy(
      convertStringArrayToBytes32(PROPOSALS)
    ) 
    await ballotContract.deployed();
  });

  describe("when the contract is deployed", function () {
    it("has the provided proposals", async function () {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(ethers.utils.parseBytes32String(proposal.name)).to.eq(
          PROPOSALS[index]
        );
      }
    });

    it("has zero votes for all proposals", async function () {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(proposal.voteCount.toNumber()).to.eq(0);
      }
    });

    it("sets the deployer address as chairperson", async function () {
      const chairperson = await ballotContract.chairperson();
      expect(chairperson).to.eq(accounts[0].address);
    });

    it("sets the voting weight for the chairperson as 1", async function () {
      const chairpersonVoter = await ballotContract.voters(accounts[0].address);
      expect(chairpersonVoter.weight.toNumber()).to.eq(1);
    });
  });

  describe("when the chairperson interacts with the giveRightToVote function in the contract", function () {
    it("gives right to vote for another address", async function () {
      const voterAddress = accounts[1].address;
      await giveRightToVote(ballotContract, voterAddress);
      const voter = await ballotContract.voters(voterAddress);
      expect(voter.weight.toNumber()).to.eq(1);
    });

    it("can not give right to vote for someone that has voted", async function () {
      const voterAddress = accounts[1].address;
      await giveRightToVote(ballotContract, voterAddress);
      await ballotContract.connect(accounts[1]).vote(0);
      await expect(
        giveRightToVote(ballotContract, voterAddress)
      ).to.be.revertedWith("The voter already voted.");
    });

    it("can not give right to vote for someone that has already voting rights", async function () {
      const voterAddress = accounts[1].address;
      await giveRightToVote(ballotContract, voterAddress);
      await expect(
        giveRightToVote(ballotContract, voterAddress)
      ).to.be.revertedWith("");
    });
  });

  describe("The Voter  interact with the vote function in the contract", function () {
    // DONE
    it("The voter votes for a proposal", async function () {
       const voterAddress = accounts[2].address;
       await giveRightToVote(ballotContract, voterAddress);
       await ballotContract.connect(accounts[2]).vote(0);
       await expect(
        ballotContract.connect(accounts[2]).vote(0)
      ).to.be.revertedWith("Already voted.");
    });
  });

  describe("when the voter interact with the delegate function in the contract", function () {
    // DONE
    it("Delegate a vote to the voter", async function () {
      const voterAddress = accounts[4].address;
       await giveRightToVote(ballotContract, voterAddress);
       await ballotContract.connect(accounts[3]).delegate(voterAddress);
       await expect(
        ballotContract.connect(accounts[3]).delegate(voterAddress)
      ).to.be.revertedWith("You already voted.");
    });
  });

  describe("when the attacker interact with the giveRightToVote function in the contract", function () {
    // DONE
    it("Only chairperson can give right to vote", async function () {
      const voterAddress = accounts[2].address;
      await ballotContract.connect(accounts[0]).giveRightToVote(voterAddress);
      await expect(
        ballotContract.connect(accounts[1]).giveRightToVote(voterAddress)
      ).to.be.revertedWith("Only chairperson can give right to vote.");
    });
  });

  describe("when the attacker interact with the vote function in the contract", function () {
    // DONE
    it("Can not vote without having the right to vote", async function () {
      const voterAddress = accounts[2].address;
       await giveRightToVote(ballotContract, voterAddress);
       await ballotContract.connect(accounts[2]).vote(0);
       await expect(
        ballotContract.connect(accounts[5]).vote(0)
      ).to.be.revertedWith("Has no right to vote");
    });
  });

  describe("when the an attacker interact with the delegate function in the contract", function () {
    // DONE
    it("can not self delegate votes", async function () {
      const voterAddress = accounts[4].address;
       await giveRightToVote(ballotContract, voterAddress);
       await ballotContract.connect(accounts[3]).delegate(voterAddress);
       await expect(
        ballotContract.connect(accounts[4]).delegate(voterAddress)
      ).to.be.revertedWith("Self-delegation is disallowed.");
    });
  });

  describe("when someone interact with the winningProposal function before any votes are cast", function () {
    // DONE
    it("Can not interact with winning proposal without voting", async function () {
      const voterAddress = accounts[2].address;
       await giveRightToVote(ballotContract, voterAddress);
       await ballotContract.connect(accounts[2]).vote(0);
       await ballotContract.connect(accounts[2]).winningProposal();
       await expect(
        ballotContract.connect(accounts[6]).winningProposal()
      ).to.be.revertedWith("Not voted.");
    });
  });

  describe("when someone interact with the winningProposal function after one vote is cast for the first proposal", function () {
    // DONE
    it("same with first proposal", async function () {
      const voterAddress = accounts[2].address;
      await giveRightToVote(ballotContract, voterAddress);
      await ballotContract.connect(accounts[2]).vote(0);
    const proposal =  await ballotContract.connect(accounts[2]).winningProposal();
      await expect(
       proposal.toNumber()
     ).to.be.eq(0);
    });
  });

  describe("when someone interact with the winnerName function before any votes are cast", function () {
    // DONE
    it("can not interact with winnerName function", async function () {
        await expect(
        ballotContract.connect(accounts[6]).winnerName()
      ).to.be.revertedWith("Not voted.");
    });
  });

  describe("when someone interact with the winnerName function after one vote is cast for the first proposal", function () {
    // DONE
    it("winnerName should be first proposal name", async function () {
      const voterAddress = accounts[2].address;
      await giveRightToVote(ballotContract, voterAddress);
      await ballotContract.connect(accounts[2]).vote(0);
      const winnerName = await ballotContract.connect(accounts[2]).winnerName()
      await expect(
        ethers.utils.parseBytes32String(winnerName)
      ).to.eq(PROPOSALS[0]);
    });
  });

  describe("when someone interact with the winningProposal function and winnerName after 5 random votes are cast for the proposals", function () {
    // DONE
    it("Can announce the winner", async function () {
      
      let i = 2
      while (i <= 6) {
      const voterAddress = accounts[i].address;
      const ind = Math.floor(Math.random()*3)
       console.log(ind, i)
      await giveRightToVote(ballotContract, voterAddress);
      await ballotContract.connect(accounts[i]).vote(ind);
      i++;
      }
        
      const proposal =  await ballotContract.connect(accounts[2]).winningProposal();
      const winnerName =  await ballotContract.connect(accounts[2]).winnerName();
      console.log('Winner is : ' + ethers.utils.parseBytes32String(winnerName)); 
     
      await expect(
        ethers.utils.parseBytes32String(winnerName)
      ).to.eq(PROPOSALS[proposal.toNumber()]);

    });
  });
});

  