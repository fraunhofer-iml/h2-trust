import { PowerAccessApprovalEntity, UserDetailsEntity } from "@h2-trust/amqp";
import { PowerAccessApprovalRepository, UserRepository } from "libs/database/src/lib";
import { Injectable } from "@nestjs/common";
import { PowerAccessApprovalStatus } from "@prisma/client";


@Injectable()
export class PowerAccessApprovalService {
    constructor(private readonly powerAccessApprovalRepository: PowerAccessApprovalRepository,
        private readonly userRepository: UserRepository
    ) { }

    async findAll(userId: string, powerAccessApprovalStatus: PowerAccessApprovalStatus): Promise<PowerAccessApprovalEntity[]> {
        const userWithCompany: UserDetailsEntity = await this.userRepository.findUserWithCompany(userId);
        return this.powerAccessApprovalRepository.findAll(userWithCompany.company.id, powerAccessApprovalStatus);
    }
}