import request from 'supertest';
import app from '../../src/index';
import { seed } from '../../src/seed';

describe('Auth API integration', () => {
  beforeAll(async () => {
    await seed();
  });

  it('should register a new user and return token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test1@example.com', password: 'abc123', full_name: 'Test User' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('should login existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'soumya@clearsplit.app', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });
});
