


export const authMiddleware =async (ctx : any) => {
    (err, user, info, status) => {
        if (user) {
          // If authentication was successful
          ctx.body = user;
          
        } else {
          // If authentication failed
          ctx.body = { message: 'Failure' };
          ctx.throw(401);
        }
      }
}