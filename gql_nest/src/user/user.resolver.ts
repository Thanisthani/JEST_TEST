import {
    Resolver,
    Query,
    Mutation,
    Args,
    Context
} from '@nestjs/graphql';
import { CreateUserOutput } from './outputs/createUser.output';
import { LoggedInUserOutput } from './outputs/loginUser.output';
import { UserService } from './user.service';
import {
    Public
} from 'nest-keycloak-connect';
import {
    Response,
    Request
} from 'express';
import {
    HttpException,
    HttpStatus,
    Inject,
    LoggerService
} from '@nestjs/common';
import { ProtectRouteOutput } from './outputs/protectRoute.output';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Resolver()
export class UserResolver
{
    constructor(
        private userService: UserService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER)
        private readonly logger: LoggerService
    ) { }
    
     // login
    
     @Public()
     @Mutation((returns) => LoggedInUserOutput)
     async loginUserResolver(
         @Args('email') email: string,
         @Args('password') password: string,
         @Context('res') res: Response
     )
     {
         const data = await this.userService.loginUserService({email,password});
         res.cookie('jwt', data.refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });
         
         return {
            accessToken: data.accessToken
        };
     }
     
     // register
     @Public()
     @Mutation((returns) => LoggedInUserOutput)
     async registerUserResolver(
         @Args('username') username: string,
         @Args('email') email: string,
         @Args('password') password: string,
         @Context('res') res: Response
     )
     {
         const data = await this.userService.registerUserService({ username, email, password });
         
        //  set cookies
         res.cookie('jwt', data.refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });
         
         return {
            accessToken: data.accessToken
        };
     }
    
    // logout user
     @Public()
     @Mutation((returns) => CreateUserOutput)
     async logoutUserResolver(
         @Context('req') req: Request,
         @Context('res') res: Response
     )
     {
         const cookies = req.cookies;
         if (!cookies?.jwt)
         {
             this.logger.error('Refresh token not stored on cookie');
             throw new HttpException({
                 status: HttpStatus.NO_CONTENT,
             }, HttpStatus.NO_CONTENT);
         }
         const refreshToken = cookies.jwt;

         await this.userService.logoutUserService(refreshToken);

         await res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: true });
         
         return {
             message: "Sucessfully user logged out"
         };
        
     }
   
    // get accessToken from refresh token
    @Public()
    @Query((returns) => LoggedInUserOutput)
    async refreshTokenResolver(
        @Context('req') req: Request
    )
    {
        const cookies = req.cookies;
        
        if (!cookies?.jwt)
        {
            this.logger.error('Refresh token not stored on cookie');
            throw new HttpException({
                status: HttpStatus.NO_CONTENT,
            }, HttpStatus.NO_CONTENT);
        }
        const refreshToken = cookies.jwt;

        const data = await this.userService.refreshTokenService(refreshToken);
        const accessToken = data.access_token;

        return {
            accessToken
          }
    }
    
    // protect route

    // @Roles({ roles: ['user'] })
    @Query((returns) => ProtectRouteOutput)
    async protectedRouteResolver(@Context('req') req: any)
    {
        const username = req.user?.preferred_username;

        return {
            username:username
        };
    }
}
