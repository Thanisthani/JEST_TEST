import {
    Body,
    Controller,
    Get,
    Post,
    Res
} from '@nestjs/common';
import { userCreatedto } from './dto/userCreate.dto';
import { UserService } from './user.service';
import {
    Public,
    Roles
} from 'nest-keycloak-connect';
import {
    Request,
    Response
} from 'express'
import { Req } from '@nestjs/common/decorators';
import {
    HttpStatus,
    HttpException,
    Inject,
    LoggerService
} from '@nestjs/common';
import { logindto } from './dto/login.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston/dist/winston.constants';

@Controller('user')
export class UserController {
    constructor(
        private userService: UserService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService
    ) { }
    
    // Login user
    @Public()
    @Post('login')
    async loginUserController(
        @Body() loginUserDTO: logindto,
        @Res({ passthrough: true }) response: Response
    )
    {
        try
        {
            const result = await this.userService.loginUserService(loginUserDTO);

            
            // Set refreshToken on cookieresult.refreshToken
            response.cookie('jwt',result.refreshToken , { httpOnly: true, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });

            return{
                accessToken: result.accessToken
             }
        }
        catch (error)
        {
            this.logger.error('User not log in ', error.stack);
            throw new HttpException({
                status: HttpStatus.NOT_ACCEPTABLE,
                error: error.message
            }, HttpStatus.NOT_ACCEPTABLE);
        }
    }


    // Register user
    @Public()
    @Post('register')
    async registerUserController(
        @Body() userCreateDTO: userCreatedto,
        @Res({ passthrough: true }) response: Response
    )
    {
        try
        {
            const result = await this.userService.registerUserService(userCreateDTO);

            // Set refreshToken on cookie
            response.cookie('jwt', result.refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });

            return{
                accessToken: result.accessToken
             }
        }
        catch (error)
        {
            // this.logger.error('User not created', error.stack);
            throw new HttpException({
                status: HttpStatus.NOT_ACCEPTABLE,
                error: error.message
            }, HttpStatus.NOT_ACCEPTABLE);
        }
    }
    
    //logout
    @Public()
    @Post('logout')
    async logoutUserController(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response
    )
    {
        try
        {
            const cookies = request.cookies;

            if (!cookies?.jwt)
            {
                this.logger.error('Refresh token not stored on cookie');
                throw new HttpException({
                    status: HttpStatus.NO_CONTENT,
                }, HttpStatus.NO_CONTENT);
            }

            const refreshToken = cookies.jwt;

            await this.userService.logoutUserService(refreshToken);

            // clear cookie
            await response.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: true });
      
            return {
                message:"Sucessfully user logged out"
            }
    
        }
        catch (error)
        {
            this.logger.error('User not logged out' + error.stack);

            throw new HttpException({
                status: HttpStatus.NOT_ACCEPTABLE,
                error: error.message
            }, HttpStatus.NOT_ACCEPTABLE);
        }
    }


    // refresh token
    @Public()
    @Get('refreshtoken')
    async refreshTokenController(@Req() request: Request)
    {
        try
        {
            const cookies = request.cookies;

            if (!cookies?.jwt)
            {
                this.logger.error('Refresh token not stored on cookie');
                throw new HttpException({
                    status: HttpStatus.NO_CONTENT,
                }, HttpStatus.NO_CONTENT);
            }

            const refreshToken = cookies.jwt as string;
      
            const data = await this.userService.refreshTokenService(refreshToken);
            const accessToken = data.access_token;

            return {
                accessToken
            }
        }
        catch (error)
        {
            this.logger.error('Can\'t generate access token' + error.stack);

            throw new HttpException({
                status: HttpStatus.NOT_ACCEPTABLE,
                error: error.message
            }, HttpStatus.NOT_ACCEPTABLE); 
        }
    } 

    // protect route

    // @Roles({ roles: [] })
    @Get('private')
    async protectedRouteController(@Req() request: any)
    {
        try
        {
            const username = request.user?.preferred_username;

            return {
                username: username
            };
        }
        catch (error)
        {
            // this.logger.error('Error on protect route' + error.stack);

            throw new HttpException({
                status: HttpStatus.NOT_ACCEPTABLE,
                error: error.message
            }, HttpStatus.NOT_ACCEPTABLE);
        }
    }

}


