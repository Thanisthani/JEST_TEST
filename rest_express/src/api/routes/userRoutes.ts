import { initKeycloak } from '../../config/keycloak-config';
import express, { Request, Response, Router } from 'express';
import { loginUserController, logoutUserController, protectedRouteController, refreshTokenController, registerUserController } from '../controllers/userController';


const userRouter: Router = express.Router();

// initalize keycloak
const keycloak = initKeycloak();
console.log("keycloak initaied");

userRouter.post('/register', registerUserController);
userRouter.post('/login', loginUserController);
userRouter.get('/refreshToken', refreshTokenController);
userRouter.post('/logout', logoutUserController);

//protected route 
userRouter.get('/private',keycloak.protect(),protectedRouteController);

export default userRouter;

