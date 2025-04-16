const request = require('supertest');
const app = require('../app');

jest.setTimeout(15000);

describe('Auth and User API', () => {
  const newUserData = {
    name: "Juanito Tester",
    age: 25,
    nif: "12345678T",
    email: "usertester25@test.com",
    password: "HolaMundo.01"
  };

  const adminCredentials = {
    email: "user25@test.com",
    password: "HolaMundo.01"
  };

  let userToken = '';
  let verificationToken = '';
  let code = '';
  let userId = '';
  let adminToken = '';

  it('should register a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(newUserData)
      .expect(200);

    expect(res.body.message).toContain("Registro pendiente");
    verificationToken = res.body.verificationToken;
    code = res.body.code;
  });

  it('should verify the user', async () => {
    const res = await request(app)
      .post('/api/auth/verify')
      .auth(verificationToken, { type: 'bearer' })
      .send({ code })
      .expect(200);

    userToken = res.body.token;
  });

  it('should login the user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: newUserData.email, password: newUserData.password })
      .expect(200);

    userToken = res.body.token;
  });

  it('should get the authenticated user info', async () => {
    const res = await request(app)
      .get('/api/user')
      .auth(userToken, { type: 'bearer' })
      .expect(200);

    userId = res.body._id;
    expect(res.body.email).toBe(newUserData.email);
  });

  it('should soft delete the user', async () => {
    const res = await request(app)
      .delete('/api/user')
      .auth(userToken, { type: 'bearer' })
      .expect(200);

    expect(res.body.message).toBe("USER_SOFT_DELETED");
  });

  it('should fail to access deleted user', async () => {
    const res = await request(app)
      .get('/api/user')
      .auth(userToken, { type: 'bearer' })
      .expect(403);

      expect(res.text).toBe("USER_DELETED");
  });

  it('should login as admin', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send(adminCredentials)
      .expect(200);

    adminToken = res.body.token;
  });

  it('admin should restore the soft-deleted user', async () => {
    const res = await request(app)
      .patch(`/api/user/restore/${userId}`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);

    expect(res.body.message).toBe("USER_RESTORED_BY_ADMIN");
  });

  it('admin should hard delete the user', async () => {
    const res = await request(app)
      .delete(`/api/user/${userId}?soft=false`)
      .auth(adminToken, { type: 'bearer' })
      .expect(200);

    expect(res.body.message).toBe("User deleted successfully");
  });

  it('should fail login after hard delete', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: newUserData.email, password: newUserData.password })
      .expect(404);
  });
});
