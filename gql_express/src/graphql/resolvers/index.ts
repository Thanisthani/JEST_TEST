import {
    loginUserService,
    logoutUserService,
    refreshTokenService,
    registerUserService
} from '../../services/userService';
import userLogger from '../../utils/logger';
 
export const resolver = {
    
    loginUserResolver: async ({ email, password }: any, context: any) =>
    {
        try
        {
            const data = await loginUserService({ email, password });

            // Set refresh token on cookies
            context.res.cookie('jwt', data.refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });

            userLogger.log('info', 'User sucessfully logged in');

            return {
                accessToken: data.accessToken
            };
            
        }
        catch (error: any)
        {
            console.log(error);
            userLogger.log('error', 'Login unsucessful ' + error.message);
            throw new Error(error.message);
            
        }

    },

    registerUserResolver: async ({ username, email, password }: any,context:any) =>
    {
        try
        {    
            const data = await registerUserService({ username, email, password });
        
            // Set refresh token on cookies
            context.res.cookie('jwt', data.refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });

            userLogger.log('info', 'User sucessfully created');

            return {
                accessToken: data.accessToken
            };

        }
        catch (error: any)
        {
            userLogger.log('error', 'Register unsucessful ' + error.message);
            throw new Error(error.message);
        }       
    },

    // get accessToken from refresh token
    refreshTokenResolver: async ({}:any, context:any) =>
    {
        try
        {
            const cookies = context.req.cookies;
            if (!cookies?.jwt)
            {
                userLogger.log('error', 'Refresh token not stored on cookie');
                return context.res.sendStatus(204);
            }
        
            const refreshToken = cookies.jwt as string;

            const data = await refreshTokenService(refreshToken);
            const accessToken = data.access_token;

            userLogger.log('info', 'Access token generated ');
          
            return {
                accessToken
            }
        }
        catch (error: any)
        {
            userLogger.log('error', 'Can\'t generate access token ' + error.message);
            throw new Error(error.message);
        }
    },

    // logout user

    logoutUserResolver: async ({ }, context: any) =>
    {
        try
        {
            const cookies = context.req.cookies;
         
            if (!cookies?.jwt)
            {
                userLogger.log('error', 'Refresh token not stored on cookie');
                return context.res.sendStatus(204);  
            }
                
            const refreshToken = cookies.jwt;

            await logoutUserService(refreshToken);

            // remove refresh token from cookies
            context.res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: true });

            userLogger.log('info', 'Sucessfully user logged out');

            context.res.status(204);
        }
        catch (error: any)
        {
            userLogger.log('error', 'User not logged out' + error.message);
            throw new Error(error.message);
        }
    },
    
    // Protect
    
    protectedRouteResolver: async ({ }: any, context: any) =>
    {
        const kauth = context.kauth;

        console.log(kauth)
        const username: any = kauth.accessToken?.content?.preferred_username;
        
        if (username)
        {
            userLogger.log('info', 'Sucessfully user authorized to access this resolver');

            return{
                username: username
            };

        }
        userLogger.log('error', 'User not authorized');
        throw new Error("You are not authorized");
    }
}
