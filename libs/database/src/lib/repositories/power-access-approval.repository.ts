import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { PowerAccessApprovalStatus } from "@prisma/client";
import { PowerAccessApprovalEntity } from '@h2-trust/amqp';
import { powerAccessApprovalResultFields } from "../result-fields/power-access-approval.queries";


@Injectable()
export class PowerAccessApprovalRepository {
  constructor(private readonly prismaService: PrismaService) { }

  async findAll(companyId: string, _status: PowerAccessApprovalStatus): Promise<PowerAccessApprovalEntity[]> {
    console.log(companyId);
    return this.prismaService.powerAccessApproval.findMany({
      where: {
        OR: [
          { powerProducerId: companyId, },
          { hydrogenProducerId: companyId, },
        ],
        powerAccessApprovalStatus: _status,
      },
      ...powerAccessApprovalResultFields 
    })
      .then((result) => result.map(PowerAccessApprovalEntity.fromDatabase));
  }
}
