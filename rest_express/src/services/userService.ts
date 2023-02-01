import config from '../config';
import { genarateUserToken} from '../utils/index';
import qs from 'qs';
import axios from 'axios';
import {
    createUserRepo,
    findUserRepo,
    removeRefreshTokenRepo,
    saveRefreshTokenRepo
} from '../database/repository/userRepository';
import { AppError } from '../utils/errorHandler';


export interface RegisterInputs {
    username:string,
    email:string,
    password:string
}
  
export interface LoginInputs {    
    email: string,
    password:string
}
  


// SignUp
export const registerUserService = async (userInputs: RegisterInputs) => {

    const {
        username,
        email,
        password
    } = userInputs;

    const TOKEN_DATA = await genarateUserToken();
    const checkExistingUser = await findUserRepo({ email });
         
    if (!checkExistingUser)
    {         
        try
        {
            const response = await axios({
                method: 'post',
                url: `${config.authServerUrl}admin/realms/${config.realm}/users`,
                data: {
                    "enabled": true,
                    "username": username,
                    "email":email,
                    "credentials": [{
                        "type": "password",
                        "value": password,
                        "temporary": false
                    }]
                },
                headers: {
                    Authorization: `Bearer ${TOKEN_DATA.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

        }
        catch (error)
        {
            console.log(error);
            throw new AppError(409,"Username Already Registered")
        }

        // DB 
        const newUser: any = await createUserRepo({ username, email, password });

        const loginResponse = await loginUserService({ email, password });

        return{
            refreshToken:loginResponse.refreshToken,
            accessToken: loginResponse.accessToken
        };
    }
    else
    {
        throw new AppError(409,"Email Already Registered")
    }

}

// Login
export const loginUserService = async (userInputs: LoginInputs) =>
{
    const { email, password } = userInputs;
    
    try
    {
        const response = await axios({
            method: 'post',
            url: `${config.authServerUrl}realms/${config.realm}/protocol/openid-connect/token`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8', },
            data: qs.stringify({
                grant_type: 'password',
                client_id: config.clientId,
                client_secret: config.secret,
                username: email,
                password: password
            })
        });
        
        const data = response.data;
   
        // get user info from repo
        const user = await findUserRepo({ email });

        //save refresh token on DB
        await saveRefreshTokenRepo(user?.id, data.refresh_token);

        return{
            refreshToken:data.refresh_token,
            accessToken: data.access_token
        };
        
    }
    catch (error)
    {
        throw new AppError(401, "User not found");
    }

}

//logout user
export const logoutUserService = async (refreshToken : string) : Promise<void> =>
{
    try
    {
        const response = await axios({
            method: 'post',
            url: `${config.authServerUrl}realms/${config.realm}/protocol/openid-connect/logout`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                Authorization: `Bearer ${refreshToken}`
            },
            data: qs.stringify({
                client_id: config.clientId,
                client_secret: config.secret,
                refresh_token: refreshToken
            })
        });

        // remove refresh token from DB
        await removeRefreshTokenRepo(refreshToken);

    }
    catch (error)
    {
        console.log(error);
        throw new Error(error.stack);
        
    }
}

// Get access token from refresh token

export const refreshTokenService = async (refreshToken: string) =>
{
    try
    {
        const response = await axios({
            method: 'post',
            url: `${config.authServerUrl}realms/${config.realm}/protocol/openid-connect/token`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8', },
            data: qs.stringify({
                grant_type: 'refresh_token',
                client_id: config.clientId,
                client_secret: config.secret,
                refresh_token: refreshToken
            })
        });

        return response.data;

    }
    catch (error)
    {
        throw new Error(error.stack);
    }
}

// Get user info from accesstoken

export const protectedRouteService = async (accessToken: string) =>
{
    try
    {
        const response = await axios({
            method: 'post',
            url: `${config.authServerUrl}realms/${config.realm}/protocol/openid-connect/userinfo`,
            headers: {
                Authorization: accessToken
            }
        });

        return {
            username : response.data.preferred_username
        }
    }
    catch (error)
    {
        console.log(error);
        throw new Error(error.stack);
    }
 }
