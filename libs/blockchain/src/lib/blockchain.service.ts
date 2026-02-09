import { readFileSync } from 'fs';
import { ProofEntity } from '@h2-trust/amqp';
import { ConfigurationService } from '@h2-trust/configuration';
import { Injectable, Logger } from '@nestjs/common';
import { BaseContract, Contract, type ContractTransactionResponse, JsonRpcProvider, NonceManager, Wallet } from 'ethers';

interface ProofStorageContract extends BaseContract {
    storeProof(uuid: string, hash: string, cid: string): Promise<ContractTransactionResponse>;
    getProofByUuid(uuid: string): Promise<[string, string]>;
}

@Injectable()
export class BlockchainService {
    private readonly logger = new Logger(this.constructor.name);
    private readonly contract: ProofStorageContract;

    constructor(private readonly configurationService: ConfigurationService) {
        const blockchainConfiguration = this.configurationService.getGlobalConfiguration().blockchain;

        const { abi } = JSON.parse(readFileSync(blockchainConfiguration.artifactPath, 'utf-8'));

        const provider = new JsonRpcProvider(blockchainConfiguration.rpcUrl);
        const wallet = new Wallet(blockchainConfiguration.privateKey, provider);
        const signer = new NonceManager(wallet);
        this.contract = new Contract(blockchainConfiguration.smartContractAddress, abi, signer) as unknown as ProofStorageContract;
    }

    async storeProof(proof: ProofEntity): Promise<String> {
        this.logger.log(`Storing proof: ${JSON.stringify(proof)}`);

        const tx = await this.contract.storeProof(proof.uuid, proof.hash, proof.cid);
        await tx.wait();

        this.logger.log(`Proof stored on-chain. Tx hash: ${tx.hash}`);
        return tx.hash;
    }

    async getProofByUuid(uuid: string): Promise<ProofEntity> {
        this.logger.log(`Retrieving proof: ${uuid}`);

        const [hash, cid] = await this.contract.getProofByUuid(uuid);
        const proof = new ProofEntity(uuid, hash, cid);

        this.logger.log(`Retrieved proof: ${JSON.stringify(proof)}`);
        return proof;
    }
}
