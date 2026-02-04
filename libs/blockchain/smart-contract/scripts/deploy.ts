import { verifyContract } from "@nomicfoundation/hardhat-verify/verify";
import hre, { network } from "hardhat";

const contractName = "ProofStorage";
const { ethers, networkName } = await network.connect();

console.log(`Deploying [${contractName}] to [${networkName}]...`);
const contract = await ethers.deployContract(contractName);
await contract.waitForDeployment();

const contractAddress = await contract.getAddress();
console.log(`Contract address: [${contractAddress}]`);

if (networkName === "arbitrumSepolia") {
    console.log("Verifying contract on Arbiscan...");
    await verifyContract({ address: contractAddress }, hre);
}

console.log('storeProof(someUuid, someHash, someCid)');
const tx = await contract.storeProof("someUuid", "someHash", "someCid");
await tx.wait();

console.log(`getProofByUuid(someUuid): [${await contract.getProofByUuid("someUuid")}]`);

console.log('Deployment successful!');