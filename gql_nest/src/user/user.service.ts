import { HttpException, HttpStatus, Inject, Injectable, LoggerService } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { stringify } from 'qs';
import { UserRepository } from '../database/repository/user.repository';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { userCreatedto } from './dto/userCreate.dto';
import { logindto } from './dto/login.dto';

@Injectable()
export class UserService {

    constructor(
        private userRepositary: UserRepository,
        private readonly httpService: HttpService,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
    ) { }

      // Register user
    
    async registerUserService(createUserInput: userCreatedto)
    {   
        const {
            username,
            password,
            email
        } = createUserInput;

        const existingUser = await this.userRepositary.findUserRepo({ email });

        if (!existingUser)
        {
            try
            {
                const token = await this.genarateUserToken();
                const response = await this.httpService.axiosRef(
                    {
                        method: 'post',
                        url: `${process.env.AUTH_SEVER_URL}admin/realms/${process.env.REALM}/users`,
                        data: {
                            "enabled": true,
                            "username": username,
                            'email': email,
                            "credentials": [{
                                "type": "password",
                                "value": password,
                                "temporary": false
                            }]
                        },
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        }
                        
                    });

                const newUser = await this.userRepositary.createUserRepo({ username, email, password });

                const loginResponse = await this.loginUserService({ email, password });
                
                await this.userRepositary.saveRefreshTokenRepo({ userID: newUser?.id, refreshToken: loginResponse.refreshToken });

                return{
                    refreshToken:loginResponse.refreshToken,
                    accessToken: loginResponse.accessToken
                };

            }
            catch (error)
            {
                this.logger.error('User not created' , error.stack);
                throw new HttpException({
                    status: HttpStatus.NOT_ACCEPTABLE,
                    message: 'Username Already Registered'
                }, HttpStatus.NOT_ACCEPTABLE);
            }

        }
        else
        {

            throw new HttpException({
                status: HttpStatus.NOT_ACCEPTABLE,
                message: 'Email Already Registered'
            }, HttpStatus.NOT_ACCEPTABLE);
        }
        
       
    }

    // login user

    async loginUserService(loginUserInput: logindto)
    {
        const { email, password } = loginUserInput;
        let data :any;
        try{
            const response = await this.httpService.axiosRef(
            {
                    method: 'post',
                    url: `${process.env.AUTH_SEVER_URL}realms/${process.env.REALM}/protocol/openid-connect/token`,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
                    data: stringify({
                        client_id: process.env.CLIENT_ID,
                        grant_type: 'password',
                        client_secret: process.env.SECRET_ID,
                        username: email,
                        password: password
                    })
            
                });
            data = response.data;
            }
            catch (error)
        {
            this.logger.error('User not log in ' ,error.stack);

                throw new HttpException({
                    status: HttpStatus.UNAUTHORIZED,
                    message: "User not found",
                }, HttpStatus.UNAUTHORIZED);
            }
            
        const user = await this.userRepositary.findUserRepo({ email });
        
        await this.userRepositary.saveRefreshTokenRepo({ userID: user?.id, refreshToken: data.refresh_token });
            
        return {
            refreshToken: data.refresh_token,
            accessToken: data.access_token
        };
    
    }
    
// logout user
    async logoutUserService(refreshToken: string): Promise<void>
    {
        try
        {
            const response = await this.httpService.axiosRef(
                {
                method: 'post',
                url: `${process.env.AUTH_SEVER_URL}realms/${process.env.REALM}/protocol/openid-connect/logout`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    Authorization: `Bearer ${refreshToken}`
                    },
                    data: stringify({
                        client_id: process.env.CLIENT_ID,
                        client_secret: process.env.SECRET_ID,
                        refresh_token: refreshToken
                    })
            });
    
            console.log(response);
            // remove refresh token from DB
            await this.userRepositary.removeRefreshTokenRepo(refreshToken);
    
        }
        catch (error)
        {
            this.logger.error('User not logged out' + error.stack);
            console.log(error);  
        }
    }

    // Get access token from refresh token
    async refreshTokenService(refreshToken: string)
    {
        try
        {
            const response = await this.httpService.axiosRef({
                method: 'post',
                url: `${process.env.AUTH_SEVER_URL}realms/${process.env.REALM}/protocol/openid-connect/token`,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8', },
                data: stringify({
                    grant_type: 'refresh_token',
                    client_id: process.env.CLIENT_ID,
                    client_secret: process.env.SECRET_ID,
                    refresh_token: refreshToken
                })
            });

        return response.data;

    }
    catch (error)
        {
            console.log(error);
            this.logger.error('Can\'t generate access token' + error.stack);
            return 'Refresh token not accepted';
        }
    }

    //public token

    async genarateUserToken() {
        try{
            const response = await this.httpService.axiosRef(
                {
                    method: 'post',
                    url: `${process.env.AUTH_SEVER_URL}realms/master/protocol/openid-connect/token`,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
                    data: stringify({
                        grant_type: 'client_credentials',
                        client_id: process.env.TOKEN_CLIENT_ID,
                        client_secret: process.env.TOKEN_SECRET_ID
                    })
                });
            const token = response.data.access_token;

            return token;
        }
        
        catch(error)
        {
            this.logger.error('Can\'t generate public access token' + error.stack);
            return error;
        }
    }

}

