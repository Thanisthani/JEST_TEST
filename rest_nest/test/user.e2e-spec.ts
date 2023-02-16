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
      imports: [AppModule , UserModule],
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
        .post("/user/register")
        .send({ name:'test',email: "test@gmail.com", password: "123456" });
        const cookies = response.headers['set-cookie']
    refreshToken = cookies[0];
    
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      accessToken: expect.any(String)
    });
   });
  
  // Login user controller test case
  test('Login user route test', async () => {
    const response = await request(app.getHttpServer())
      .post("/user/login")
      .send({ email: "test@gmail.com", password: "123456" });
    const cookies = response.headers['set-cookie']
    refreshToken = cookies[0];
      
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      accessToken: expect.any(String)
    })
  });
    
  // Refreshtoken controller test case
  test('Refreshtoken route test', async () => {
    const response = await request(app.getHttpServer())
      .get("/user/refreshToken")
      .set('Cookie', refreshToken);
    accessToken = response.body.accessToken;

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      accessToken: expect.any(String)
    });
  });

  // Protectedroute controller test case
  test('Protected route test', async () => {
    const response = await request(app.getHttpServer())
      .get("/user/private")
      .set('Authorization', `Bearer ${accessToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      name: expect.any(String)
    });
  });
  
  // Logout user controller test case
  test('LogOut user test', async () => {
    const response = await request(app.getHttpServer())
      .post("/user/logout")
      .set('Cookie', [`${refreshToken}`]);
        
    expect(response.status).toBe(201);
  });
  
  // Register user controller error test case
  test('should response user friendly error if user\'s email is already registered ', async () => {
    const response = await request(app.getHttpServer())
      .post("/user/register")
      .send({ name:'test',email: "test@gmail.com", password: "123456" });
  
    expect(response.body.error.message).toEqual('Email Already Registered');
  });

  // Register user controller error test case- only for keycloak
  test('should response user friendly error if user\'s username is already registered ', async () => {
    const response = await request(app.getHttpServer())
      .post("/user/register")
      .send({ name:'test',email: "testsss@gmail.com", password: "123456" });
  
    expect(response.body.error.message).toEqual('Username Already Registered');
  });

  // Login user controller error test case
  test('should response user friendly error if user\'s password is incorrect', async () => {
    const response = await request(app.getHttpServer())
      .post("/user/login")
      .send({ email: "test@gmail.com", password: "123456e" });
  
    expect(response.body.error.message).toEqual('User not found');;
  });

  // Login user controller error test case
  test('should response user friendly error if user\'s email isn\'t registered ', async () => {
    const response = await request(app.getHttpServer())
      .post("/user/login")
      .send({ email: "testd@gmail.com", password: "123456" });
      
    expect(response.body.error.message).toEqual('User not found');
  });
});

