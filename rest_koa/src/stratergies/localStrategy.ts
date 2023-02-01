
import { PassportStatic } from 'passport';
import {Strategy } from 'passport-local';
import { loginUserService } from '../services/user/user.service';
 

export const initializeLocalStrategy = (passport : PassportStatic)=> {
    passport.use(new Strategy({
        usernameField : "email"
    }, async (email,password,done) => { 
        try {
            const data =  await loginUserService({email,password})
            return done(null,data)
        } catch (error : any) {
            return done(error,false)
        }   
    }))
}