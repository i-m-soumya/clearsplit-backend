import request from 'supertest';
import app from '../../src/index';
import { seed } from '../../src/seed';

let token: string;

beforeAll(async () => {
  await seed();
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'soumya@clearsplit.app', password: 'password123' });
  token = login.body.data.token;
});

describe('Group routes', () => {
  it('should create a group', async () => {
    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Group', description: 'desc' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
  });

  it('should fetch user groups', async () => {
    const res = await request(app)
      .get('/api/groups')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
