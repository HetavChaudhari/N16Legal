/**
 * Unit tests for the receptionist approval workflow.
 * Run with: npm test  (node --test)
 *
 * These tests are DB-independent: they exercise the status transition
 * state machine, role middleware, and request validation paths that
 * run before any database access.
 */
const { test, describe } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const Appointment = require('../models/Appointment');
const { APPOINTMENT_STATUSES, STATUS_TRANSITIONS } = require('../models/Appointment');
const { authorize } = require('../middlewares/auth');
const app = require('../app');

const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

const makeAppointment = (status = 'Pending') =>
    new Appointment({
        guestName: 'Test Guest',
        guestEmail: 'guest@example.com',
        guestPhone: '1234567890',
        date: futureDate,
        time: '10:00 AM',
        caseType: 'Family Law',
        status,
    });

describe('Appointment status model', () => {
    test('includes all required workflow statuses', () => {
        const required = [
            'Pending', 'Receptionist Approved', 'Waiting Lawyer Confirmation',
            'Confirmed', 'Completed', 'Cancelled', 'Rejected',
        ];
        for (const s of required) {
            assert.ok(APPOINTMENT_STATUSES.includes(s), `missing status: ${s}`);
        }
    });

    test('every transition target is a valid status', () => {
        for (const [from, targets] of Object.entries(STATUS_TRANSITIONS)) {
            assert.ok(APPOINTMENT_STATUSES.includes(from));
            for (const to of targets) {
                assert.ok(APPOINTMENT_STATUSES.includes(to), `invalid target ${to} from ${from}`);
            }
        }
    });

    test('happy path: Pending -> Receptionist Approved -> Waiting Lawyer Confirmation -> Confirmed -> Completed', () => {
        const appt = makeAppointment();
        appt.transitionTo('Receptionist Approved');
        appt.transitionTo('Waiting Lawyer Confirmation');
        appt.transitionTo('Confirmed');
        appt.transitionTo('Completed');
        assert.strictEqual(appt.status, 'Completed');
        assert.strictEqual(appt.statusHistory.length, 4);
    });

    test('rejects invalid transition Pending -> Confirmed', () => {
        const appt = makeAppointment();
        assert.throws(() => appt.transitionTo('Confirmed'), /Invalid status transition/);
        assert.strictEqual(appt.status, 'Pending');
    });

    test('terminal statuses cannot transition', () => {
        for (const terminal of ['Completed', 'Cancelled', 'Rejected']) {
            const appt = makeAppointment(terminal);
            assert.throws(() => appt.transitionTo('Pending'));
            assert.throws(() => appt.transitionTo('Confirmed'));
        }
    });

    test('receptionist can reject or cancel a pending request', () => {
        const a = makeAppointment();
        a.transitionTo('Rejected', undefined, 'Duplicate request');
        assert.strictEqual(a.status, 'Rejected');
        assert.strictEqual(a.statusHistory[0].reason, 'Duplicate request');

        const b = makeAppointment();
        b.transitionTo('Cancelled');
        assert.strictEqual(b.status, 'Cancelled');
    });

    test('rescheduling a confirmed appointment returns it to lawyer confirmation', () => {
        const appt = makeAppointment('Confirmed');
        appt.transitionTo('Waiting Lawyer Confirmation');
        assert.strictEqual(appt.status, 'Waiting Lawyer Confirmation');
    });
});

describe('authorize role middleware', () => {
    const run = (role, ...allowed) => {
        let nextCalled = false;
        let statusCode = null;
        const req = { user: role ? { role } : null };
        const res = {
            status(code) { statusCode = code; return this; },
            json() { return this; },
        };
        authorize(...allowed)(req, res, () => { nextCalled = true; });
        return { nextCalled, statusCode };
    };

    test('allows matching role', () => {
        assert.strictEqual(run('receptionist', 'receptionist', 'admin').nextCalled, true);
        assert.strictEqual(run('admin', 'receptionist', 'admin').nextCalled, true);
    });

    test('blocks non-matching role with 403', () => {
        const r = run('client', 'receptionist', 'admin');
        assert.strictEqual(r.nextCalled, false);
        assert.strictEqual(r.statusCode, 403);
    });

    test('blocks missing user with 403', () => {
        const r = run(null, 'receptionist');
        assert.strictEqual(r.nextCalled, false);
        assert.strictEqual(r.statusCode, 403);
    });
});

describe('API wiring and validation (no DB required)', () => {
    test('GET / responds with API status', async () => {
        const res = await request(app).get('/');
        assert.strictEqual(res.status, 200);
    });

    test('unknown route returns 404 JSON', async () => {
        const res = await request(app).get('/api/does-not-exist');
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.message, 'Route not found');
    });

    test('receptionist routes require authentication', async () => {
        const res = await request(app).get('/api/receptionist/appointments');
        assert.strictEqual(res.status, 401);
    });

    test('notification routes require authentication', async () => {
        const res = await request(app).get('/api/notifications');
        assert.strictEqual(res.status, 401);
    });

    test('appointment creation rejects missing fields', async () => {
        const res = await request(app).post('/api/appointments').send({ name: 'X' });
        assert.strictEqual(res.status, 400);
    });

    test('appointment creation rejects invalid email', async () => {
        const res = await request(app).post('/api/appointments').send({
            name: 'X', email: 'not-an-email', phone: '123',
            date: futureDate, time: '10:00 AM', caseType: 'Family',
        });
        assert.strictEqual(res.status, 400);
        assert.match(res.body.message, /valid email/i);
    });

    test('appointment creation rejects past dates', async () => {
        const res = await request(app).post('/api/appointments').send({
            name: 'X', email: 'x@example.com', phone: '123',
            date: '2020-01-01', time: '10:00 AM', caseType: 'Family',
        });
        assert.strictEqual(res.status, 400);
        assert.match(res.body.message, /past/i);
    });

    test('appointment creation rejects invalid time format', async () => {
        const res = await request(app).post('/api/appointments').send({
            name: 'X', email: 'x@example.com', phone: '123',
            date: futureDate, time: 'sometime', caseType: 'Family',
        });
        assert.strictEqual(res.status, 400);
        assert.match(res.body.message, /valid time/i);
    });
});
