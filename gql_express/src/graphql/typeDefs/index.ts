import { buildSchema } from 'graphql';


export const schema = buildSchema(`
    type Query {
        protectedRouteResolver:ProtectPayload! ,
        refreshTokenResolver : AuthPayload
    }

    type Mutation {
        registerUserResolver(username:String!,email:String!,password:String!) : AuthPayload! ,
        loginUserResolver(email:String!,password:String!) : AuthPayload!,
        logoutUserResolver: String  
    }

    type User {
        id: ID!
        username: String!
        email: String!
    }

    type AuthPayload {
        accessToken: String!
    }

    type ProtectPayload {
        username: String!
    }

    type ProtectRoute{
        message: String
    }
`);



