import { ProofEntity } from "@h2-trust/amqp";
import { Logger } from "@nestjs/common";

export class BlockchainService {
    private readonly logger = new Logger(this.constructor.name);

    async storeProof(proof: ProofEntity): Promise<void> {
        this.logger.log(`Storing proof: ${JSON.stringify(proof)}`);
    }

    async getProofByUuid(uuid: string): Promise<ProofEntity> {
        this.logger.log(`Retrieving proof: ${uuid}`);
        const proof = new ProofEntity(uuid, "some hash", "some cid");
        this.logger.log(`Retrieved Proof: ${JSON.stringify(proof)}`);
        return proof;
    }
}