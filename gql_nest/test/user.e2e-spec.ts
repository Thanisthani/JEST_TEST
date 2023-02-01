import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserModule } from '../src/user/user.module';
import * as cookieParser from 'cookie-parser';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  let refreshToken: any;
  let accessToken: any;
  let moduleFixture: TestingModule;

    beforeEach(async () => {
        moduleFixture = await Test.createTestingModule({
            imports: [AppModule, UserModule],
        }).compile();

      app = moduleFixture.createNestApplication();
      app.use(cookieParser());
      await app.init();
  });

    afterEach(async () => {
        await moduleFixture.close();
    });

    // Register user controller test case
    test('Register user route test', async () => {
        const response = await request(app.getHttpServer())
            .post("/graphql")
            .send({
                query:
                    'mutation {registerUserResolver(username:"test52",email: "test52@gmail.com", password: "123456") { accessToken}}',
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
        const response = await request(app.getHttpServer())
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
        const response = await request(app.getHttpServer())
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
        const response = await request(app.getHttpServer())
            .post("/graphql")
            .send({ query: '{protectedRouteResolver {username}}' })
            .set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(200);
        console.log(response.body.data)
    });
  
   // Logout user controller test case
   test('LogOut user test', async () => {
       const response = await request(app.getHttpServer())
           .post("/graphql")
           .send({
               query:
                   'mutation {logoutUserResolver{message}}',
           })
           .set('Cookie', [`${refreshToken}`]);
    
       expect(response.status).toBe(200);
   });
  
   // Register user controller error test case
   test('should response user friendly error if user\'s email is already registered ', async () => {
       const response = await request(app.getHttpServer())
           .post("/graphql")
           .send({
               query:
                   'mutation {registerUserResolver(username:"test50",email: "test50@gmail.com", password: "123456") { accessToken}}',
           });
       
       expect(response.body.errors[0].message).toEqual('Email Already Registered');

   });
  
   // Register user controller error test case
   test('should response user friendly error if user\'s username is already registered ', async () => {
       const response = await request(app.getHttpServer())
           .post("/graphql")
           .send({
               query:
                   'mutation {registerUserResolver(username:"test50",email: "test50xx@gmail.com", password: "123456") { accessToken}}',
           });
       
       expect(response.body.errors[0].message).toEqual('Username Already Registered');
   });

  // Login user controller error test case
    test('should response user friendly error if user\'s password is incorrect', async () => {
        const response = await request(app.getHttpServer())
            .post("/graphql")
            .send({
                query:
                    'mutation {loginUserResolver(email: "test50@gmail.com", password: "12x3456") { accessToken}}',
            });
        expect(response.body.errors[0].message).toEqual('User not found');
    });
  
    // Login user controller error test case
    test('should response user friendly error if user\'s email isn\'t registered ', async () => {
        const response = await request(app.getHttpServer())
            .post("/graphql")
            .send({
                query:
                    'mutation {loginUserResolver(email: "test50x@gmail.com", password: "123456") { accessToken}}',
            });
        
        expect(response.body.errors[0].message).toEqual('User not found');
    });
});
