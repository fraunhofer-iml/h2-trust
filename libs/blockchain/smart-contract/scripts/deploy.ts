import { verifyContract } from "@nomicfoundation/hardhat-verify/verify";
import hre, { network } from "hardhat";

const contractName = "ProofStorage";
const uuid = "019c28ac-5ac3-736a-ba99-0466b7541afe";
const hash = "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069";
const cid = "bafybeicn7i3soqdgr7dwnrwytgq4zxy7a5jpkizrvhm5mv6bgjd32wm3q4";

const { ethers, networkName } = await network.connect();

console.log(`deployContract(${contractName}) to ${networkName}\n`);
const contract = await ethers.deployContract(contractName);
await contract.waitForDeployment();

const contractAddress = await contract.getAddress();
console.log(`getAddress(): ${contractAddress}\n`);

console.log("\nstoring and retrieving a proof example\n");
console.log(`storeProof(${uuid}, ${hash}, ${cid})\n`);
const tx = await contract.storeProof(uuid, hash, cid);
await tx.wait();

console.log(`getProofByUuid(${uuid}): ${await contract.getProofByUuid(uuid)}\n`);

if (networkName === "arbitrumSepolia") {
    console.log("\nVerifying contract on Arbiscan Sepolia");
    await verifyContract({ address: contractAddress }, hre);
}