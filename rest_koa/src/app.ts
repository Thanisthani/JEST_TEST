import Koa from 'koa';
import { DefaultState, DefaultContext } from 'koa';
import cors from '@koa/cors';
import cookieParser from 'koa-cookie'
import userRoutes from './api/routes/user/user.routes';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';
import config from './config/index'

import passport from 'koa-passport';
import { initializeJwtStrategy } from './stratergies/accessJwtStrategy';
import { initializeLocalStrategy } from './stratergies/localStrategy';
import { initializeRefreshJwtStrategy } from './stratergies/refreshJwtStrategy';
import connection from './database/connection';


connection()

 const app: Koa<DefaultState, DefaultContext> = new Koa();


app.use(cors({origin : [ 'http://localhost:3000'] , credentials : true }))
app.use(json())
app.use(bodyParser())
app.use(cookieParser())

initializeLocalStrategy(passport)
initializeJwtStrategy(passport)
initializeRefreshJwtStrategy(passport)

app.use(userRoutes.routes()).use(userRoutes.allowedMethods);

const server = app.listen(config.port, () => {
  console.log(`This application is listening on port ${config.port}`);
});
 

export {app,server}