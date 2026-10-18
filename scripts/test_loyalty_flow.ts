import {
  registerUser,
  loginUser,
  changeUserPasswordInDb,
  saveUserCartInDb,
  getUserCartFromDb,
  getOrCreateBonusCard,
  createOrderInDb,
  updateOrderStatusInDb,
  useBonusPoints,
} from '../server/db';

async function runTests() {
  console.log('--- 🧪 STARTING MAISON ARÔME AUTOMATED TESTS ---');
  let failures = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
    } else {
      console.error(`  ❌ FAIL: ${testName}`, details || '');
      failures++;
    }
  }

  const testSuffix = Math.random().toString(36).substring(2, 7);
  const emailUserA = `test_user_a_${testSuffix}@example.com`;
  const emailUserB = `test_user_b_${testSuffix}@example.com`;
  const passwordA = 'Pass12345!';
  const newPasswordA = 'NewPass54321!';

  // 1. Create Users & Test Welcome Bonus (500 pts)
  console.log('\n[1. Testing Registration & Loyalty 500 Points]');
  const regA = registerUser({ email: emailUserA, password: passwordA, fullName: 'Пользователь А' });
  const regB = registerUser({ email: emailUserB, password: passwordA, fullName: 'Пользователь Б' });

  const userA = regA.user;
  const userB = regB.user;

  assert(Boolean(userA && userA.id), 'User A registered in SQLite');
  assert(Boolean(userB && userB.id), 'User B registered in SQLite');

  const cardA = getOrCreateBonusCard(userA.id);
  const cardB = getOrCreateBonusCard(userB.id);

  assert(cardA.balance === 500, `User A initial bonus balance is 500 (got ${cardA.balance})`);
  assert(cardB.balance === 500, `User B initial bonus balance is 500 (got ${cardB.balance})`);

  // 2. Test Cart Isolation per User Account
  console.log('\n[2. Testing Cart Isolation by Account]');
  const cartA = [
    { id: 'perf-1', perfumeId: 1, name: 'Baccarat Rouge 540', brand: 'Maison Francis Kurkdjian', price: 2990, quantity: 2, volume: '10ml' }
  ];
  const cartB = [
    { id: 'perf-2', perfumeId: 2, name: 'Angels Share', brand: 'Kilian', price: 3490, quantity: 1, volume: '5ml' }
  ];

  saveUserCartInDb(userA.id, cartA);
  saveUserCartInDb(userB.id, cartB);

  const fetchedCartA = getUserCartFromDb(userA.id);
  const fetchedCartB = getUserCartFromDb(userB.id);

  assert(fetchedCartA.length === 1 && fetchedCartA[0].name === 'Baccarat Rouge 540', 'User A cart isolated and retrieved correctly');
  assert(fetchedCartB.length === 1 && fetchedCartB[0].name === 'Angels Share', 'User B cart isolated and retrieved correctly');
  assert(fetchedCartA[0].name !== fetchedCartB[0].name, 'Carts are strictly separate and not leaking across accounts');

  // 3. Test Password Change with Old Password
  console.log('\n[3. Testing Password Change & Verification]');
  let wrongOldPassFailed = false;
  try {
    changeUserPasswordInDb(userA.id, 'WrongOldPass!', newPasswordA);
  } catch {
    wrongOldPassFailed = true;
  }
  assert(wrongOldPassFailed, 'Reject password change with invalid old password');

  const correctOldPassResult = changeUserPasswordInDb(userA.id, passwordA, newPasswordA);
  assert(correctOldPassResult === true, 'Accept password change with correct old password');

  let oldLoginFailed = false;
  try {
    loginUser(emailUserA, passwordA);
  } catch {
    oldLoginFailed = true;
  }
  assert(oldLoginFailed, 'Old password no longer authenticates');

  let newLoginPassed = false;
  try {
    const loginRes = loginUser(emailUserA, newPasswordA);
    if (loginRes?.user?.id === userA.id) newLoginPassed = true;
  } catch {}
  assert(newLoginPassed, 'New password successfully authenticates');

  // 4. Test Order Creation (Cashback MUST NOT be awarded yet)
  console.log('\n[4. Testing Order Creation & Delayed Cashback]');
  const orderAmount = 10000;
  const order = createOrderInDb({
    userId: userA.id,
    items: cartA,
    totalAmount: orderAmount,
    discount: 0,
    deliveryMethod: 'СДЭК Доставка',
    deliveryPrice: 0,
    paymentMethod: 'СБП',
    isPaid: false,
    recipient: {
      fullName: 'Пользователь А',
      phone: '+7 999 111-22-33',
      email: emailUserA,
      city: 'Москва',
      address: 'ул. Тверская, 1',
    },
  });

  assert(Boolean(order && order.id), `Order created: ${order.orderNumber}`);

  const cardAfterOrder = getOrCreateBonusCard(userA.id);
  assert(cardAfterOrder.balance === 500, `Bonus balance is still 500 upon order creation (got ${cardAfterOrder.balance}) - NO premature cashback`);

  // 5. Test Admin Confirmation: Status -> 'paid' (Cashback awarded)
  console.log('\n[5. Testing Admin Confirmation: Status -> paid]');
  const expectedCashback = Math.round(orderAmount * 0.05); // 500 pts
  updateOrderStatusInDb(order.id, 'paid');

  const cardAfterPaid = getOrCreateBonusCard(userA.id);
  const expectedBalanceAfterPaid = 500 + expectedCashback;
  assert(
    cardAfterPaid.balance === expectedBalanceAfterPaid,
    `Status 'paid' awards 5% cashback: expected ${expectedBalanceAfterPaid}, got ${cardAfterPaid.balance}`
  );

  // 6. Test Idempotency: Status -> 'sent' and 'delivered' (MUST NOT award cashback again)
  console.log('\n[6. Testing Loyalty Accrual Idempotency]');
  updateOrderStatusInDb(order.id, 'sent', 'CDEK-TEST-TRACKING-123');
  const cardAfterSent = getOrCreateBonusCard(userA.id);
  assert(
    cardAfterSent.balance === expectedBalanceAfterPaid,
    `Status 'sent' does not duplicate cashback: balance remains ${cardAfterSent.balance}`
  );

  updateOrderStatusInDb(order.id, 'delivered');
  const cardAfterDelivered = getOrCreateBonusCard(userA.id);
  assert(
    cardAfterDelivered.balance === expectedBalanceAfterPaid,
    `Status 'delivered' does not duplicate cashback: balance remains ${cardAfterDelivered.balance}`
  );

  // 7. Test Bonus Points Redemption
  console.log('\n[7. Testing Bonus Points Redemption in Checkout]');
  const redeemResult = useBonusPoints(userA.id, 500, order.id);
  assert(redeemResult.success === true, '500 bonus points successfully redeemed');
  const cardAfterRedeem = getOrCreateBonusCard(userA.id);
  assert(cardAfterRedeem.balance === expectedCashback, `Balance after redeeming 500 is ${expectedCashback} (got ${cardAfterRedeem.balance})`);

  console.log('\n=================================================');
  if (failures === 0) {
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! 100% VERIFIED!');
  } else {
    console.error(`💥 TESTS FAILED WITH ${failures} ERRORS.`);
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Unhandled test error:', err);
  process.exit(1);
});
