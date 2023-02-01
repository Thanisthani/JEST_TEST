import Router from 'koa-router';
import passport from 'koa-passport' 
import { registerUserController, loginUserController, refreshTokenController,logoutUserController,protectedRouteController } from '../../controllers/user.controller';

const router: Router = new Router({prefix : '/user'});

router.post('/register', registerUserController);
router.post('/login',loginUserController);
router.get('/refreshtoken', refreshTokenController);
router.post('/logout', logoutUserController)
router.get('/private' , passport.authenticate('jwt',{session:false}), protectedRouteController)
 

export default router;


