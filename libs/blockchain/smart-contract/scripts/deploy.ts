import { network } from "hardhat";

const contractName = "ProofStorage";
const { ethers, networkName } = await network.connect();

console.log(`Deploying [${contractName}] to [${networkName}]...`);
const contract = await ethers.deployContract(contractName);

console.log('Waiting for the deployment tx to confirm');
await contract.waitForDeployment();

console.log('getAddress()');
console.log(`Contract address: [${await contract.getAddress()}]`);

console.log('storeProof(someUuid, someHash, someCid)');
const tx = await contract.storeProof("someUuid", "someHash", "someCid");

console.log('Waiting for the tx to confirm');
await tx.wait();

console.log('getProof(someUuid)');
const proof = await contract.getProof("someUuid");
console.log(`Retrieved proof for [someUuid]: ${JSON.stringify(proof)}`);

console.log('Deployment successful!');