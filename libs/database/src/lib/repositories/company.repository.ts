import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CompanyEntity } from "@h2-trust/amqp";
import { companyResultFields } from "../result-fields";


@Injectable()
export class CompanyRepository {
  constructor(private readonly prismaService: PrismaService) { }

  async findAll(): Promise<CompanyEntity[]> {
    return this.prismaService.company.findMany({
      ...companyResultFields,
    })
      .then((result) => result.map(CompanyEntity.fromDatabase));
  }
}
