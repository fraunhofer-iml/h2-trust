import { PowerAccessApprovalEntity } from "@h2-trust/amqp";
import { PowerAccessApprovalRepository } from "libs/database/src/lib";
import { Injectable } from "@nestjs/common";
import { PowerAccessApprovalStatus } from "@prisma/client";


@Injectable()
export class PowerAccessApprovalService {
    constructor(private readonly repository: PowerAccessApprovalRepository) {}

    async findAll(companyId: string, _status: PowerAccessApprovalStatus): Promise<PowerAccessApprovalEntity[]> {
        return this.repository.findAll(companyId, _status);
    }
}