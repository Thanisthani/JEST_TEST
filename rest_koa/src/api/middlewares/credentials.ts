import {allowedOrigins} from '../../config/allowedOrigins';

import { Context, Next } from 'koa';

export const credentials = (ctx : any, next: Next) => {
    const origin = ctx.request.headers.origin as string;
    if (allowedOrigins.includes(origin)) {
        ctx.set('Access-Control-Allow-Credentials', 'true');
    }
    next();
}