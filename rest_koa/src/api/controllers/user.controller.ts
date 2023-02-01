import { Context , Request} from 'koa';
import jwt, { JwtPayload} from 'jsonwebtoken';
import config from '../../config'
import { registerUserService, loginUserService, logoutUserService , RefreshTokenService, userFindByIDService } from '../../services/user/user.service';
import { generateToken } from "../../utils";
import passport from 'koa-passport';

export const registerUserController = async (ctx: any) => {
  try {
    const { name, email, password } = ctx.request.body;
    const data = await registerUserService({name,email,password})
    ctx.cookies.set('jwt',data.refreshToken, {httpOnly:true , sameSite:'strict', maxAge:24*60*60*1000})
    return ctx.body = {
        accessToken : data.accessToken
        };
  } catch (error:any) {
    ctx.status = 500;
    ctx.body = {error : error.message}
  }
};

export const loginUserController = async (ctx: any , next : any) => {
  await passport.authenticate('local',{session : false}, (err, user, info, status) => {
    if (user) {
      // If authentication was successful
      const {accessToken,refreshToken} = user;
      ctx.cookies.set('jwt',refreshToken, {httpOnly:true , sameSite:'strict', maxAge:24*60*60*1000})
          return ctx.body = {
      accessToken : accessToken 
        }
    } else {
      // If authentication failed
      ctx.body = { message: 'Failure' };
      ctx.throw(401);
    }
  })(ctx, next);

};


export const refreshTokenController = async (ctx: any , next : any) => { 
    await passport.authenticate('refresh-jwt',{session : false} , (err,user,info,status) => {
      if (user) {
        const {accessToken} = user
        ctx.body = {accessToken}
      }else {
        ctx.body = { message: 'Failure' };
        ctx.throw(401);
      }
    })(ctx, next)

}

export const logoutUserController =async (ctx:any) => {
  const cookies = ctx.cookies.get('jwt')
  if(!cookies) return ctx.status = 204
  const refreshToken = cookies as string

  await logoutUserService(refreshToken)

  ctx.cookies.set('jwt', '')
  ctx.status = 204
  ctx.body = { message : "Logged Out Successfully"}

}

export const protectedRouteController = async (ctx : any , next : any) => {

  await passport.authenticate('jwt',{session : false} ,async  (err,user,info,status) => {
    if (user) {
      const {id} = user;
      const findUser = await userFindByIDService(id)
      ctx.body = {
        name : findUser.name
      }
    }else {
      ctx.body = { message: 'Failure' };
      ctx.throw(401);
    }
  })(ctx, next)
}

