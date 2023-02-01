import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
    User,
    UserDocument
} from '../models/user.entity'
import {
    CreateUserDto,
    SaveRefreshTokenDto
} from "../dto/repository.dto";

@Injectable()
export class UserRepository
{
    constructor(
        @InjectModel('User')
        private readonly model: Model<UserDocument>
    ) { }

    // create user
    async createUserRepo(createUserDto: CreateUserDto)
    {
        try
        { 
            const userResult = await new this.model({
                ...createUserDto
            }).save();

            return userResult;
        }
        catch (error)
        {
            console.log(error); 
            return error;
        }
         
    }
    
    // find user by email

    async findUserRepo({ email }: any)
    {
        try
        {
            const result = await this.model.findOne({ email: email });
            return result;
        }
        catch (error)
        {
            console.log(error);
            return error;
        }
       
    }

    // find user by refreshtoken

    async findUserByTokenRepo(refreshToken: string)
    {
        try
        {
            const existingUser = await this.model.findOne({ refreshToken: refreshToken });
            return existingUser;
            
        }
        catch (error)
        {
            console.log(error);
            return error;
        }
    }

    // save refreshToken
    

    async saveRefreshTokenRepo(saveRefreshTokenDto: SaveRefreshTokenDto): Promise<User>
    {
        try
        {
            const { refreshToken,userID } = saveRefreshTokenDto
            const results = await this.model.findByIdAndUpdate(userID, { refreshToken: refreshToken }).exec();
            return results;
        }
        catch (error)
        {
            console.log(error);
            return error;
        }
       
    }


    // remove refresh token from db
    async removeRefreshTokenRepo(refreshToken: string)
    { 
        try
        {
            const user = await this.findUserByTokenRepo(refreshToken);
            const updatedUser = await this.model.findByIdAndUpdate(user.id, { refreshToken: "" }).exec();
        }
        catch (error)
        {
            console.log(error);
            return error;
        }
       
    }

    // find user by id
    async findUserByIdRepo(userID: string)
    {
        try
        {
            const existingUser = await this.model.findById(userID).select('-password').select('-refreshToken')

            return existingUser;
        }
        catch (error)
        {
            console.log(error);
            return error;
        }
    }

}