/**
 * Authorization integration tests (DB-free).
 *
 * User lookup inside the `protect` middleware is stubbed so we can verify
 * end-to-end route protection: JWT parsing, role checks, and validation
 * that runs before any database query.
 */
const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const User = require('../models/User');
const app = require('../app');

const originalFindById = User.findById.bind(User);

const stubUser = (user) => {
    User.findById = () => ({ select: async () => user });
};

const tokenFor = (id = '64b000000000000000000001') =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });

const asRole = (role) => {
    stubUser({ _id: '64b000000000000000000001', name: 'Test', role, status: 'active' });
    return tokenFor();
};

describe('receptionist route authorization', () => {
    beforeEach(() => { User.findById = originalFindById; });

    test('rejects a malformed token', async () => {
        const res = await request(app)
            .get('/api/receptionist/appointments')
            .set('Authorization', 'Bearer not-a-real-token');
        assert.strictEqual(res.status, 401);
    });

    test('rejects a client-role user with 403', async () => {
        const token = asRole('client');
        const res = await request(app)
            .get('/api/receptionist/appointments')
            .set('Authorization', `Bearer ${token}`);
        assert.strictEqual(res.status, 403);
    });

    test('rejects a lawyer-role user with 403', async () => {
        const token = asRole('lawyer');
        const res = await request(app)
            .get('/api/receptionist/appointments')
            .set('Authorization', `Bearer ${token}`);
        assert.strictEqual(res.status, 403);
    });

    test('rejects a suspended receptionist with 403', async () => {
        stubUser({ _id: '64b000000000000000000001', name: 'Test', role: 'receptionist', status: 'suspended' });
        const res = await request(app)
            .get('/api/receptionist/appointments')
            .set('Authorization', `Bearer ${tokenFor()}`);
        assert.strictEqual(res.status, 403);
    });

    test('receptionist gets 400 for an invalid status filter (passes role gate)', async () => {
        const token = asRole('receptionist');
        const res = await request(app)
            .get('/api/receptionist/appointments?status=NotAStatus')
            .set('Authorization', `Bearer ${token}`);
        assert.strictEqual(res.status, 400);
        assert.match(res.body.message, /invalid status/i);
    });

    test('receptionist reject endpoint requires a reason (passes role gate)', async () => {
        const token = asRole('receptionist');
        const res = await request(app)
            .put('/api/receptionist/appointments/64b000000000000000000002/reject')
            .set('Authorization', `Bearer ${token}`)
            .send({});
        assert.strictEqual(res.status, 400);
        assert.match(res.body.message, /reason/i);
    });

    test('receptionist reschedule validates date and time before touching data', async () => {
        const token = asRole('receptionist');
        const noBody = await request(app)
            .put('/api/receptionist/appointments/64b000000000000000000002/reschedule')
            .set('Authorization', `Bearer ${token}`)
            .send({});
        assert.strictEqual(noBody.status, 400);

        const pastDate = await request(app)
            .put('/api/receptionist/appointments/64b000000000000000000002/reschedule')
            .set('Authorization', `Bearer ${token}`)
            .send({ date: '2020-01-01', time: '10:00' });
        assert.strictEqual(pastDate.status, 400);
        assert.match(pastDate.body.message, /past/i);
    });

    test('client cannot update appointment status (receptionist-independent guard)', async () => {
        const token = asRole('client');
        const res = await request(app)
            .put('/api/appointments/64b000000000000000000002/status')
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'Confirmed' });
        assert.strictEqual(res.status, 403);
    });

    test('admin passes the receptionist role gate', async () => {
        const token = asRole('admin');
        const res = await request(app)
            .get('/api/receptionist/appointments?status=NotAStatus')
            .set('Authorization', `Bearer ${token}`);
        // 400 (validation) proves the admin got PAST the 401/403 gates
        assert.strictEqual(res.status, 400);
    });
});
