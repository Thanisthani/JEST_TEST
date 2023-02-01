import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserSchema
} from '../database/entities/user.entity';
import { UserRepository } from '../database/repository/user.repository';


@Module({
  imports: [
    MongooseModule.forFeature([{
      name: User.name, schema: UserSchema
    }]),
    HttpModule
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository]
})
export class UserModule {}
