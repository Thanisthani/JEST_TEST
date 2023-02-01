import { ExtractJwt, Strategy} from 'passport-jwt'
import config from '../config'
import { userFindByIDService } from '../services/user/user.service'

export const initializeJwtStrategy = (passport : any)=> {
    passport.use('jwt',new Strategy({
        jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey : config.accessTokenKey,
        ignoreExpiration: false
    },  (payload,done) => {
        try {
            return done(null,{id :payload.id})
        } catch (error : any) {
            return done(null,false,{message : error.message})
        }
    }))

}