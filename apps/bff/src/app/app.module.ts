import { AuthGuard, KeycloakConnectModule } from 'nest-keycloak-connect';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigurationModule, KeycloakConfigurationService } from '@h2-trust/configuration';
import { UnitModule } from './unit/unit.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigurationModule,
    UserModule,
    UnitModule,
    KeycloakConnectModule.registerAsync({
      useExisting: KeycloakConfigurationService,
      imports: [ConfigurationModule],
    }),
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
