import { AuthGuard, KeycloakConnectModule } from 'nest-keycloak-connect';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigurationModule, KeycloakConfigurationService } from '@h2-trust/configuration';
import { BottlingModule } from './bottling/bottling.module';
import { CompanyModule } from './company/company.module';
import { PowerAccessApprovalModule } from './power-access-approval/power-access-approval.module';
import { ProductionModule } from './production/production.module';
import { UnitModule } from './unit/unit.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigurationModule,
    UserModule,
    UnitModule,
    CompanyModule,
    PowerAccessApprovalModule,
    KeycloakConnectModule.registerAsync({
      useExisting: KeycloakConfigurationService,
      imports: [ConfigurationModule],
    }),
    BottlingModule,
    ProductionModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
