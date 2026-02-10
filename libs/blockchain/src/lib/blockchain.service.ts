import { readFileSync } from 'fs';
import { ProofEntity } from '@h2-trust/amqp';
import { ConfigurationService } from '@h2-trust/configuration';
import { Injectable, Logger } from '@nestjs/common';
import { BaseContract, Contract, type ContractTransactionResponse, JsonRpcProvider, NonceManager, Wallet } from 'ethers';

export interface ProofEntry {
    uuid: string;
    hash: string;
    cid: string;
}

interface Proof {
    hash: string;
    cid: string;
}

interface ProofStorageContract extends BaseContract {
    storeProofs(proofs: ProofEntry[]): Promise<ContractTransactionResponse>;
    getProofByUuid(uuid: string): Promise<Proof>;
}

@Injectable()
export class BlockchainService {
    private readonly logger = new Logger(this.constructor.name);
    private readonly contract: ProofStorageContract;

    constructor(private readonly configurationService: ConfigurationService) {
        this.contract = this.createContract();
    }

    private createContract(): ProofStorageContract {
        const blockchainConfiguration = this.configurationService.getGlobalConfiguration().blockchain;

        const smartContractAddress = blockchainConfiguration.smartContractAddress;

        const { abi } = JSON.parse(readFileSync(blockchainConfiguration.artifactPath, 'utf-8'));

        const provider = new JsonRpcProvider(blockchainConfiguration.rpcUrl);
        const wallet = new Wallet(blockchainConfiguration.privateKey, provider);
        const signer = new NonceManager(wallet);

        return new Contract(smartContractAddress, abi, signer) as unknown as ProofStorageContract;
    }

    async storeProofs(proofEntries: ProofEntry[]): Promise<string> {
        this.logger.debug(`Storing proofs:\n${proofEntries.map((e) => JSON.stringify(e)).join('\n')}`);

        const tx = await this.contract.storeProofs(proofEntries);
        await tx.wait();

        this.logger.debug(`Proof stored: ${tx.hash}`);
        return tx.hash;
    }

    async getProofByUuid(uuid: string): Promise<ProofEntity> {
        this.logger.debug(`Retrieving proof: ${uuid}`);

        const proof: Proof = await this.contract.getProofByUuid(uuid);
        this.logger.debug(`Retrieved proof: ${JSON.stringify(proof)}`);

        return new ProofEntity(uuid, proof.hash, proof.cid);
    }
}
