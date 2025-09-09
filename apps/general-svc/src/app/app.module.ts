import { Module } from '@nestjs/common';
import { ConfigurationModule } from '@h2-trust/configuration';
import { CompanyModule } from './company/company.module';
import { PowerAccessApprovalModule } from './power-access-approval/power-access-approval.module';
import { UnitModule } from './unit/unit.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ConfigurationModule, UserModule, UnitModule, PowerAccessApprovalModule, CompanyModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
