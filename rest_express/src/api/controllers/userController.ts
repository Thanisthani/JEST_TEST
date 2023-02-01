import {
    Request,
    Response,
    NextFunction
} from "express"
import userLogger from "../../utils/logger";
import {
    loginUserService,
    logoutUserService,
    protectedRouteService,
    refreshTokenService,
    registerUserService
} from "../../services/userService";

// RegisterUser
export const registerUserController = async (req :Request,res : Response,next : NextFunction) =>{
        try {
            const {
                username,
                email,
                password } = req.body;
            
            const data = await registerUserService({ username, email, password });
            
            // set cookie on refresh token
            res.cookie('jwt', data.refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });
            
            return res.json({
                accessToken: data.accessToken
            });
        }
        catch (error: any)
        {
            // userLogger.log('error', 'Register unsucessful ' + error.stack);
          
            // res.status(500).json({
            //     error: error.message
            // });
            next(error);
        }
    }

export const loginUserController = async (req: Request, res: Response, next: NextFunction) => {
    try
    {

        const { email, password } = req.body;
        const data = await loginUserService({ email, password });

        // set cookie on refresh token
        res.cookie('jwt', data.refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000 });

        return res.json({
            accessToken: data.accessToken
        });
       
    }
    catch (error: any)
    {
        // userLogger.log('error', 'Login unsucessful ' + error.stack);

        // res.status(500).json({
        //     error: error.message
        // });
        next(error);
        
    }    
}

//Get access token
export const refreshTokenController = async (req: Request, res: Response, next : NextFunction) =>
{
    try
    {
        const cookies = req.cookies;

        if (!cookies?.jwt)
        {
            userLogger.log('error', 'Refresh token not stored on cookie');
            return res.sendStatus(204);
        }
    
        const refreshToken = cookies.jwt as string;

        const data = await refreshTokenService(refreshToken);

        const accessToken = data.access_token;

        res.json({ accessToken });
    }
    catch (error)
    {
        // userLogger.log('error', 'Can\'t generate access token ' + error.stack);

        // res.status(500).json({
        //     error: error.message
        // });
        next(error);
    }

}
  
// logout user
export const logoutUserController = async (req: Request, res: Response, next : NextFunction) => {
    try
    {
        const cookies = req.cookies;

        if (!cookies?.jwt)
        {
            userLogger.log('error', 'Refresh token not stored on cookie');
            return res.sendStatus(204);
        }
    
        const refreshToken = cookies.jwt as string;

        await logoutUserService(refreshToken);

        // clear cookie
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: true });

        return res.sendStatus(204);
    }
    catch (error)
    {
        // userLogger.log('error', 'User not logged out' + error.stack);

        // res.status(500).json({
        //     error: error.message
        // });
        next(error);
    }
}  


// protect route
export const protectedRouteController = async (req: Request, res: Response , next : NextFunction) => {
    try
    {
        // get aceess token from header
        const accessToken = req.headers.authorization;

        const data = await protectedRouteService(accessToken);

        res.json({
            username:data.username
        }); 
    }
    catch (error)
    {
        // userLogger.log('error', 'User not authorized'+error.stack);

        // res.status(403).json({
        //     error: error.message
        // });
        next(error);
    }

}