import { Module } from "@nestjs/common";
import { DatabaseModule } from "@h2-trust/database";
import { CompanyController } from "./company.controller";
import { CompanyService } from "./company.service";



@Module({
    imports: [DatabaseModule],
    controllers: [CompanyController],
    providers: [CompanyService]
})
export class CompanyModule {}