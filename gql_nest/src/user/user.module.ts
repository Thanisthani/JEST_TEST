import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserRepository } from '../database/repository/user.repository';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config'; 
import { MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserSchema
} from '../database/models/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot(
      {
        envFilePath: '.env',
      }
    ),
    MongooseModule.forFeature([{
      name: User.name,
      schema: UserSchema
    }]),
    HttpModule  
  ],
  providers: [
    UserService,
    UserResolver,
    UserRepository
  ]
})
export class UserModule {}
