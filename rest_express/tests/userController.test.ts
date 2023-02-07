import request  from 'supertest';
import {app,server} from'../src/index'


describe('Test the user controller', () => {

    let refreshToken: string;
    let accessToken: string;

    afterAll(done => {
        done();
        server.close();
    });

    // Register user controller test case
    test('Register user route test', async () => {
        const response = await request(app)
            .post("/user/register")
            .send({ name: 'test23', email: "test23@gmail.com", password: "123456" });
        const cookies = response.headers['set-cookie']
        refreshToken = cookies[0];

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            accessToken: expect.any(String)
        });

    });

    // Login user controller test case
    test('Login user route test', async () => {
        const response = await request(app)
            .post("/user/login")
            .send({ email: "test5@gmail.com", password: "123456" });
        const cookies = response.headers['set-cookie']
        refreshToken = cookies[0];

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            accessToken: expect.any(String)
        });

    });

    // Refreshtoken controller test case
    test('Refreshtoken route test', async () => {
        const response = await request(app)
            .get("/user/refreshToken")
            .set('Cookie', [`${refreshToken}`]);
        accessToken = response.body.accessToken;

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            accessToken: expect.any(String)
        });

    });

    // Protectedroute controller test case
    test('Protected route test', async () => {
        const response = await request(app)
            .get("/user/private")
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            name: expect.any(String)
        });
    });

    // Logout user controller test case
    test('LogOut user test', async () => {
        const response = await request(app)
            .post("/user/logout")
            .set('Cookie', [`${refreshToken}`]);

        expect(response.status).toBe(204);

    });

    // Register user controller error test case
    test('should response user friendly error if user\'s email is already registered ', async () => {
        const response = await request(app)
            .post("/user/register")
            .send({ username: 'test20', email: "test20@gmail.com", password: "123456" });

        expect(response.body.error.message).toEqual('Email Already Registered');
    });

    // Register user controller error test case
    test('should response user friendly error if user\'s username is already registered ', async () => {
        const response = await request(app)
            .post("/user/register")
            .send({ username: 'test20', email: "test20sss@gmail.com", password: "123456" });

        expect(response.body.error.message).toEqual('Username Already Registered');
    });

    // Login user controller error test case
    test('should response user friendly error if user\'s password is incorrect', async () => {
        const response = await request(app)
            .post("/user/login")
            .send({ email: "test5@gmail.com", password: "123456e" });

        expect(response.body.error.message).toEqual('User not found');
    });

    // Login user controller error test case
    test('should response user friendly error if user\'s email isn\'t registered ', async () => {
        const response = await request(app)
            .post("/user/login")
            .send({ email: "test5d@gmail.com", password: "123456" });

        expect(response.body.error.message).toEqual('User not found');
    });

});
