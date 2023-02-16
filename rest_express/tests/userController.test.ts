import request  from 'supertest';
import {app,server} from'../src/index'
import mongoose from 'mongoose';//mongoose
import { connection } from '../src/database/connection';//typeorm


describe('Test the user controller', () => {

    let refreshToken: string;
    let accessToken: string;

    afterAll(async () => {
        server.close();
        // for mongoose
         mongoose.disconnect();
        
         // For type orm
        const conn = await connection();
        conn.close();

        // We don't need to disconnect the database when using Dynamoose, as the database will automatically disconnect when the server is closed.
         
    });

    // Register user controller test case
  test('Register user route test', async () => {
    const response = await request(app)
      .post('/user/register')
      .send({ name: 'test', email: 'test@gmail.com', password: '123456' });
    const cookies = response.headers['set-cookie'];
    refreshToken = cookies[0];
        
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      accessToken: expect.any(String),
    });

  });

  // Login user controller test case
  test('Login user route test', async () => {
    const response = await request(app)
      .post('/user/login')
      .send({ email: 'test@gmail.com', password: '123456' });
    const cookies = response.headers['set-cookie'];
    refreshToken = cookies[0];
        
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      accessToken: expect.any(String),
    });

  });

  // Refreshtoken controller test case
  test('Refreshtoken route test', async () => {
    const response = await request(app)
      .get('/user/refreshToken')
      .set('Cookie', [`${refreshToken}`]);
    accessToken = response.body.accessToken;

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      accessToken: expect.any(String),
    });

  });

  // Protectedroute controller test case
  test('Protected route test', async () => {
    const response = await request(app)
      .get('/user/private')
      .set('Authorization', `Bearer ${accessToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      name: expect.any(String),
    });
  });

  // // Logout user controller test case
  test('LogOut user test', async () => {
    const response = await request(app)
      .post('/user/logout')
      .set('Cookie', [`${refreshToken}`]);
        
    expect(response.status).toBe(204);

  });

  // Register user controller error test case
  test('should response user friendly error if user\'s email is already registered ', async () => {
    const response = await request(app)
      .post('/user/register')
      .send({ name: 'employee199', email: 'employee199@gmail.com', password: '123456' });
        
    expect(response.body.error.message).toEqual('Email Already Registered');
  });
    
  // Register user controller error test case - only for keycloak
  test('should response user friendly error if user\'s name is already registered ', async () => {
    const response = await request(app)
      .post('/user/register')
      .send({ name: 'employee199', email: 'employee199s@gmail.com', password: '123456' });
        
    expect(response.body.error.message).toEqual('Username Already Registered');
  });
    
  // // Login user controller error test case
  test('should response user friendly error if user\'s password is incorrect', async () => {
    const response = await request(app)
      .post('/user/login')
      .send({ email: 'employee199', password: '123456e' });
        
    expect(response.body.error.message).toEqual('User not found');
  });
    
  // // Login user controller error test case
  test('should response user friendly error if user\'s email isn\'t registered ', async () => {
    const response = await request(app)
      .post('/user/login')
      .send({ email: 'employee199s@gmail.com', password: '123456' });
            
    expect(response.body.error.message).toEqual('User not found');
  });

});
