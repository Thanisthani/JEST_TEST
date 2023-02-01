import { ExtractJwt, Strategy} from 'passport-jwt'
import config from '../config'
import { userFindByIDService } from '../services/user/user.service'
import { generateToken } from '../utils'

export const initializeRefreshJwtStrategy = (passport : any)=> {
    passport.use('refresh-jwt',new Strategy({
        jwtFromRequest : ExtractJwt.fromExtractors([(ctx: any) =>{
            let data = ctx.cookies.get('jwt');
            if(!data){
                return null;
            }
            return data
        }]),
        secretOrKey : config.refreshTokenKey,

    }, async (payload,done) => {
        try {
            const user : any = await userFindByIDService(payload.id)

            const accessToken = await  generateToken({email:user.email , id: user.id})
            return done(null,{accessToken})
        } catch (error : any) {
            return done(null,false,{message : error.message})
        } 
    }))

}