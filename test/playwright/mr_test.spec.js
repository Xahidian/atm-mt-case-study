const { test, expect, request } = require('@playwright/test');
const { sourceInput, followUpInput } = require('../mrs/mr1');
const { sourceInput: mr2Source, followUpInput: mr2FollowUp } = require('../mrs/mr2');
const { A, B, C, M1, M2 } = require('../mrs/mr3');
const { A: A4, B: B4, C: C4, M: M4 } = require('../mrs/mr4');
const { A: A5, M: M5 } = require('../mrs/mr5');
const { A: A6, B: B6, M: M6 } = require('../mrs/mr6');

test('MR1: ΔA\' ≤ 2ΔA and ΔB\' = 2ΔB', async () => {
  const apiContext = await request.newContext();

  // ✅ Reset DB first
  await apiContext.post('http://localhost:3000/transfer/reset-db');

  const res1 = await apiContext.post('http://localhost:3000/transfer', { data: sourceInput });
  if (!res1.ok()) {
    console.log('Source transfer failed:', await res1.text());
  }
  expect(res1.ok()).toBeTruthy();
  const out1 = await res1.json();

  const res2 = await apiContext.post('http://localhost:3000/transfer', { data: followUpInput });
  expect(res2.ok()).toBeTruthy();
  const out2 = await res2.json();

  expect(out2.deltaB).toBeCloseTo(2 * out1.deltaB, 0);
  expect(out2.deltaA).toBeLessThanOrEqual(2 * out1.deltaA);
});


test('MR2: Reverse transfer should result in minimal net change (only fees)', async () => {
  const apiContext = await request.newContext();

  // Reset DB before test
  await apiContext.post('http://localhost:3000/transfer/reset-db');

  // First: A → B
  const res1 = await apiContext.post('http://localhost:3000/transfer', { data: mr2Source });
  expect(res1.ok()).toBeTruthy();
  const out1 = await res1.json();

  // Reverse: B → A
  const res2 = await apiContext.post('http://localhost:3000/transfer', { data: mr2FollowUp });
  expect(res2.ok()).toBeTruthy();
  const out2 = await res2.json();

  const deltaA = out1.deltaA - out2.deltaB;
  const deltaB = out1.deltaB - out2.deltaA;
  const totalFees = out1.fee + out2.fee;

  // The only net effect should be the fees
  expect(Math.abs(deltaA)).toBeLessThanOrEqual(totalFees);
  expect(Math.abs(deltaB)).toBeLessThanOrEqual(totalFees);
});


test('MR3: ΔA1 + ΔA2 ≈ ΔA_combined (Additivity)', async () => {
  const apiContext = await request.newContext();

  // Reset DB before first two transfers
  await apiContext.post('http://localhost:3000/transfer/reset-db');

  // A → B with M1
  const res1 = await apiContext.post('http://localhost:3000/transfer', {
    data: { A, B, M: M1 }
  });
  expect(res1.ok()).toBeTruthy();
  const out1 = await res1.json();

  // A → C with M2
// A → C with M2
const res2 = await apiContext.post('http://localhost:3000/transfer', {
  data: { A, B: C, M: M2 }
});

if (!res2.ok()) {
  console.log('Transfer A → C failed:', await res2.text());
}
expect(res2.ok()).toBeTruthy();
const out2 = await res2.json();
;

  const combinedSplit = out1.deltaA + out2.deltaA;

  // Reset DB again for single combined transfer
  await apiContext.post('http://localhost:3000/transfer/reset-db');

  // A → B with (M1 + M2)
  const res3 = await apiContext.post('http://localhost:3000/transfer', {
    data: { A, B, M: M1 + M2 }
  });
  expect(res3.ok()).toBeTruthy();
  const out3 = await res3.json();

  const combinedSingle = out3.deltaA;

  // Assert that sum of separate transfers ≈ one combined transfer (within fee tolerance)
  expect(Math.abs(combinedSplit - combinedSingle)).toBeLessThanOrEqual(5);
});



test('MR4: A → B → C vs A → C should have similar ΔA and ΔC (Associativity)', async () => {
  const apiContext = await request.newContext();

  // Reset DB before sequence transfers
  await apiContext.post('http://localhost:3000/transfer/reset-db');

  // A → B
  const res1 = await apiContext.post('http://localhost:3000/transfer', {
    data: { A: A4, B: B4, M: M4 }
  });
  expect(res1.ok()).toBeTruthy();
  const out1 = await res1.json();

  // B → C
  const res2 = await apiContext.post('http://localhost:3000/transfer', {
    data: { A: B4, B: C4, M: M4 }
  });
  expect(res2.ok()).toBeTruthy();
  const out2 = await res2.json();

  const totalDeltaA_seq = out1.deltaA;      // A → B
  const totalDeltaC_seq = out2.deltaB;      // B → C

  // Reset again for direct transfer
  await apiContext.post('http://localhost:3000/transfer/reset-db');

  // A → C directly
  const res3 = await apiContext.post('http://localhost:3000/transfer', {
    data: { A: A4, B: C4, M: M4 }
  });
  expect(res3.ok()).toBeTruthy();
  const out3 = await res3.json();

  const deltaA_direct = out3.deltaA;
  const deltaC_direct = out3.deltaB;

  // Assert approximate equality with small fee-based tolerance
  expect(Math.abs(totalDeltaA_seq - deltaA_direct)).toBeLessThanOrEqual(10);
  expect(Math.abs(totalDeltaC_seq - deltaC_direct)).toBeLessThanOrEqual(10);
});


test('MR5: A → A should not change balance significantly (Self-transfer)', async () => {
  const apiContext = await request.newContext();

  // Reset DB
  await apiContext.post('http://localhost:3000/transfer/reset-db');

  // A → A
  const res = await apiContext.post('http://localhost:3000/transfer', {
    data: { A: A5, B: A5, M: M5 }
  });

  expect(res.ok()).toBeTruthy();
  const out = await res.json();

  // Assert deltaB (what the receiver got) is M
  expect(out.deltaB).toBe(M5);

  // Assert deltaA is M or M + fee depending on fee rules
  // But net effect should not exceed M + fee
  const maxExpected = M5 + out.fee;

  expect(out.deltaA).toBeLessThanOrEqual(maxExpected);
  expect(out.deltaA).toBeGreaterThanOrEqual(out.fee); // just fee or fee + M
});


test('MR6: A → B with zero amount should not affect balances (Zero-amount transfer)', async () => {
  const apiContext = await request.newContext();

  // Reset DB
  await apiContext.post('http://localhost:3000/transfer/reset-db');

  // A → B with M = 0
  const res = await apiContext.post('http://localhost:3000/transfer', {
    data: { A: A6, B: B6, M: M6 }
  });

  expect(res.ok()).toBeTruthy();
  const out = await res.json();

  // ΔB should be 0, and fee should be 0
  expect(out.deltaB).toBe(0);

  // ΔA should be equal to fee (should be 0 ideally)
  expect(out.deltaA).toBe(out.fee);
});
