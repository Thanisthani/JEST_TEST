import dotenv from 'dotenv';

if(process.env.NODE_ENV !== 'production'){
    dotenv.config()
}

export default {
    dbURL: process.env.MONGO_URL,
    port: process.env.PORT,
    authServerUrl: process.env.KEYCLOAK_AUTH_SEVER_URL,
    realm: process.env.KEYCLOAK_REALM,
    clientId: process.env.KEYCLOAK_CLIENT_ID,
    secret: process.env.KEYCLOAK_SECRET_ID,
    realmPublicKey: process.env.KEYCLOAK_REALM_PUBLIC_KEY,
    tokenClientId: process.env.KEYCLOAK_TOKEN_CLIENT_ID,
    tokenSecretId: process.env.KEYCLOAK_TOKEN_SECRET_ID
}