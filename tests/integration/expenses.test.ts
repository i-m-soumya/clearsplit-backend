import request from 'supertest';
import app from '../../src/index';
import { seed } from '../../src/seed';

let token: string;
let groupId: string;
let userId: string;
let otherUserId: string;

beforeAll(async () => {
  await seed();
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'soumya@clearsplit.app', password: 'password123' });
  token = login.body.data.token;


  // create a group for expense
  const grp = await request(app)
    .post('/api/groups')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Expense group' });
  groupId = grp.body.data.id;

  userId = login.body.data.user.id;
});

describe('Expense routes', () => {
  it('should add an expense with splits', async () => {
    // register a second user to split the expense with
    const second = await request(app)
      .post('/api/auth/register')
      .send({ full_name: 'Another User', email: 'another@clearsplit.app', password: 'password123' });
    const otherUserId = second.body.data.user.id;

    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        group_id: groupId,
        description: 'Lunch',
        amount: 120,
        paid_by: userId,
        splits: [
          { user_id: userId, amount: 60 },
          { user_id: otherUserId, amount: 60 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
  });

  it('should get group expenses', async () => {
    const res = await request(app)
      .get(`/api/expenses/group/${groupId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
