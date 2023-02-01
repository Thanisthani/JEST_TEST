import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import {
  KeycloakConnectModule,
  PolicyEnforcementMode,
  TokenValidation,
  RoleGuard,
  AuthGuard} from 'nest-keycloak-connect';
import { WinstonModule } from 'nest-winston';
import { join } from 'path';
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
    GraphQLModule.forRoot({
      driver: ApolloDriver,
        // playground: true,
      autoSchemaFile: join(process.cwd(), "src/schema.graphql"),
      context: ({ req, res }) => ({ req, res }),
      formatError: (error: any) => {
        const graphQLFormattedError = {
          message:
            error.extensions?.exception?.response?.message || error.message,
          code:
            error.extensions?.code,
          status: error.extensions?.exception?.response,
          name: error.extensions?.exception?.name || error.name,
        };
        return graphQLFormattedError;
      },
    }),
    KeycloakConnectModule.register(
      {
        authServerUrl: process.env.AUTH_SEVER_URL,
        realm: process.env.REALM,
        clientId: process.env.CLIENT_ID,
        secret: process.env.SECRET_ID,  
        policyEnforcement: PolicyEnforcementMode.PERMISSIVE, 
        tokenValidation: TokenValidation.ONLINE,
       }),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    WinstonModule.forRoot( useLogger),
    UserModule
  ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    }
  ],
})
export class AppModule {}
