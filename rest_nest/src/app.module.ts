import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import {
  KeycloakConnectModule,
  PolicyEnforcementMode,
  TokenValidation,
  AuthGuard,
  RoleGuard
} from 'nest-keycloak-connect';
import { WinstonModule } from 'nest-winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { useLogger } from './util/userLogger';

@Module({
  imports: [
    ConfigModule.forRoot(
      {
        envFilePath: '.env',
        isGlobal: true
    }
    ),
    KeycloakConnectModule.register(
      {
        authServerUrl: process.env.KEYCLOAK_AUTH_SEVER_URL,
        realm: process.env.KEYCLOAK_REALM,
        clientId: process.env.KEYCLOAK_CLIENT_ID,
        secret: process.env.KEYCLOAK_SECRET_ID,  
        policyEnforcement: PolicyEnforcementMode.PERMISSIVE, 
        tokenValidation: TokenValidation.ONLINE,
      }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    WinstonModule.forRoot( useLogger),
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}
