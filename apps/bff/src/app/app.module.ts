import { KeycloakConnectModule } from 'nest-keycloak-connect';
import { Module } from '@nestjs/common';
import { ConfigurationModule, KeycloakConfigurationService } from '@h2-trust/configuration';
import { CompanyModule } from './company/company.module';
import { UnitModule } from './unit/unit.module';
import { UserModule } from './user/user.module';
import { ProcessStepModule } from './process-step/process-step.module';

@Module({
  imports: [
    ConfigurationModule,
    UserModule,
    UnitModule,
    CompanyModule,
    KeycloakConnectModule.registerAsync({
      useExisting: KeycloakConfigurationService,
      imports: [ConfigurationModule],
    }),
    ProcessStepModule,
  ],
  controllers: [],
  providers: [
    // TODO-MP: do we need to activate this?
    // Activate lines to enable password authorization
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthGuard,
    // },
  ],
})
export class AppModule {}
