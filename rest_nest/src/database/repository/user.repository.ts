import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
    CreateUserDto,
    SaveRefreshTokenDto
} from "../dto/repository.dto";
import { User, UserDocument } from '../entities/user.entity';

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
            throw new HttpException({
                status: HttpStatus.NOT_ACCEPTABLE,
                message: error.message
            }, HttpStatus.NOT_ACCEPTABLE);  
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
            throw new HttpException({
                status: HttpStatus.NOT_ACCEPTABLE,
                message: error.message
            }, HttpStatus.NOT_ACCEPTABLE); 
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
            throw new HttpException({
                status: HttpStatus.NOT_ACCEPTABLE,
                message: error.message
            }, HttpStatus.NOT_ACCEPTABLE); 
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
            throw new HttpException({
                status: HttpStatus.NOT_ACCEPTABLE,
                message: error.message
            }, HttpStatus.NOT_ACCEPTABLE); 
        }
       
    }


    // remove refresh token from db
    async removeRefreshTokenRepo(refreshToken: string)
    { 
        try
        {
            const user = await this.findUserByTokenRepo(refreshToken);
            const updatedUser = await this.model.findByIdAndUpdate(user._id, { refreshToken: "" }).exec();
            return updatedUser
        }
        catch (error)
        {
            throw new HttpException({
                status: HttpStatus.NOT_ACCEPTABLE,
                message: error.message
            }, HttpStatus.NOT_ACCEPTABLE); 
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
            throw new HttpException({
                status: HttpStatus.NOT_ACCEPTABLE,
                message: error.message
            }, HttpStatus.NOT_ACCEPTABLE); 
        }
    }

}