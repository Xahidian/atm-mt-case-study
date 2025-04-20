const { test, expect, request } = require('@playwright/test');

const apiURL = 'http://localhost:3000/transfer';

// Helper to reset the DB before each test
test.beforeEach(async () => {
  const apiContext = await request.newContext();
  await apiContext.post(`${apiURL}/reset-db`);
});

test('Functional: A → B valid transfer should succeed', async () => {
  const apiContext = await request.newContext();

  const res = await apiContext.post(apiURL, {
    data: { A: 1000000000, B: 2000000000, M: 1000 }
  });

  expect(res.ok()).toBeTruthy();
  const out = await res.json();

  expect(out.deltaA).toBeGreaterThanOrEqual(1000);
  expect(out.deltaB).toBe(1000);
  expect(out.fee).toBeGreaterThanOrEqual(0);
});

test('Functional: Transfer should fail if sender has insufficient balance', async () => {
  const apiContext = await request.newContext();

  const res = await apiContext.post(apiURL, {
    data: { A: 1000000000, B: 2000000000, M: 999999 } // too high
  });

  expect(res.status()).toBe(400);
  const errorMsg = await res.text();
  expect(errorMsg.toLowerCase()).toContain('insufficient');
});

test('Functional: Transfer should fail if receiver account does not exist', async () => {
  const apiContext = await request.newContext();

  const res = await apiContext.post(apiURL, {
    data: { A: 1000000000, B: 9999999999, M: 500 }
  });

  expect(res.status()).toBe(404);
  const errorMsg = await res.text();
  expect(errorMsg.toLowerCase()).toContain('account not found');
});

test('Functional: Transfer to self should succeed but with no effect', async () => {
  const apiContext = await request.newContext();

  const res = await apiContext.post(apiURL, {
    data: { A: 1000000000, B: 1000000000, M: 500 }
  });

  expect(res.ok()).toBeTruthy();
  const out = await res.json();

  expect(out.deltaB).toBe(500);
  expect(out.deltaA).toBeGreaterThanOrEqual(out.fee);
});

test('Functional: Zero-amount transfer should result in no balance change', async () => {
  const apiContext = await request.newContext();

  const res = await apiContext.post(apiURL, {
    data: { A: 1000000000, B: 2000000000, M: 0 }
  });

  expect(res.ok()).toBeTruthy();
  const out = await res.json();

  expect(out.deltaA).toBe(out.fee);
  expect(out.deltaB).toBe(0);
});
