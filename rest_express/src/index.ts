import express, {
    Express,
    Request,
    Response
} from 'express';
import 'reflect-metadata';
import bodyparser from 'body-parser';
import userRouter from './api/routes/userRoutes';
import {
    getKeycloak,
    getStore
} from './config/keycloak-config';
import session from 'express-session';
import cookieParser from 'cookie-parser'
import connection from './database/connection';
import cors from 'cors';
import { corsOptions } from './config/corsOptions';
import { credentials } from './api/middlewares/credentials';
import config from './config';
import { errorMiddleware } from './api/middlewares/errorHandler';


//GETTING PORT FROM .ENV FILE:
const PORT = config.port || 3000;

// get keycloak
const keycloak = getKeycloak(); 

const app: Express = express();

const memoryStore = getStore();

app.use(session({
    secret: "Mysecret",
    resave: false,
    saveUninitialized: true,
    store: memoryStore
}));
  
app.use(keycloak.middleware(
    {
        logout: '/logout',
        admin: '/',
        protected:'/protected/resource'
    }
));

app.use(credentials)
app.use(cors(corsOptions));
app.use(express.json());
app.use((bodyparser.urlencoded({ extended: true })));
app.use(cookieParser());

//CONNECTING TO DATABASE:
connection();

app.get('/',(req: Request, res: Response) => {
    res.json({ data: "hello" })
});

app.use('/user', userRouter);

app.use(errorMiddleware);

//CONNECTION TO PORT:
const server = app.listen(PORT, () => {
  console.log(`This application is listening on port ${PORT}`);
});

export {app,server};