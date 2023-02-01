
import request from 'supertest';
import { app, server } from '../src/index';

describe('Test the user resolver', () => {
    let refreshToken: string;
    let accessToken: string;

    afterAll(done => {
        done();
        server.close();
    });

    // Register user controller test case
    test('Register user route test', async () => {
        const response = await request(app)
            .post("/graphql")
            .send({
                query:
                    'mutation {registerUserResolver(username:"test50",email: "test50@gmail.com", password: "123456") { accessToken}}',
            });
        const cookies = response.headers['set-cookie']
        refreshToken = cookies[0];
        
        expect(response.status).toBe(200);
        expect(response.body.data.registerUserResolver).toEqual({
            accessToken: expect.any(String)
        });

    });
    
    // Login user controller test case
    test('Login user route test', async () => {
        const response = await request(app)
            .post("/graphql")
            .send({
                query:
                    'mutation {loginUserResolver(email: "test50@gmail.com", password: "123456") { accessToken}}',
            });
        const cookies = response.headers['set-cookie']
        refreshToken = cookies[0];

        expect(response.status).toBe(200);
        expect(response.body.data.loginUserResolver).toEqual({
            accessToken: expect.any(String)
        });
    });

    // Refreshtoken controller test case
    test('Refreshtoken route test', async () => {
        const response = await request(app)
            .post("/graphql")
            .send({ query: '{refreshTokenResolver {accessToken}}' })
            .set('Cookie', [`${refreshToken}`]);
        accessToken = response.body.accessToken;

        expect(response.status).toBe(200);
        expect(response.body.data.refreshTokenResolver).toEqual({
            accessToken: expect.any(String)
        });
    });
    
    // Protectedroute controller test case
    test('Protected route test', async () => {
        const response = await request(app)
            .post("/graphql")
            .send({ query: '{protectedRouteResolver {username}}' })
            .set('Authorization', `Bearer ${accessToken}`);
        
        expect(response.status).toBe(200);
    });

     // Logout user controller test case
    test('LogOut user test', async () => {
        const response = await request(app)
            .post("/graphql")
            .send({
                query:
                    'mutation {logoutUserResolver}',
            })
            .set('Cookie', [`${refreshToken}`]);
        
        expect(response.status).toBe(204);
    });
    
    // Register user controller error test case
    test('should response user friendly error if user\'s email is already registered ', async () => {
        const response = await request(app)
            .post("/graphql")
            .send({
                query:
                    'mutation {registerUserResolver(username:"test50",email: "test50@gmail.com", password: "123456") { accessToken}}',
            });
        
        expect(response.body.errors[0].message).toEqual('Email Already Registered');
    });

    // Register user controller error test case
    test('should response user friendly error if user\'s username is already registered ', async () => {
        const response = await request(app)
            .post("/graphql")
            .send({
                query:
                    'mutation {registerUserResolver(username:"test50",email: "test50xx@gmail.com", password: "123456") { accessToken}}',
            });
        
        expect(response.body.errors[0].message).toEqual('Username Already Registered');

    });
    
    // Login user controller error test case
    test('should response user friendly error if user\'s password is incorrect', async () => {
        const response = await request(app)
            .post("/graphql")
            .send({
                query:
                    'mutation {loginUserResolver(email: "test50@gmail.com", password: "12x3456") { accessToken}}',
            });
        
        expect(response.body.errors[0].message).toEqual('User not found');
    });
    
    // Login user controller error test case
    test('should response user friendly error if user\'s email isn\'t registered ', async () => {
        const response = await request(app)
            .post("/graphql")
            .send({
                query:
                    'mutation {loginUserResolver(email: "test50x@gmail.com", password: "123456") { accessToken}}',
            });
        
        expect(response.body.errors[0].message).toEqual('User not found');

    });

});
