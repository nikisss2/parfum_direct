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
  getUserOrdersFromDb,
  exportUserDataInDb,
  deleteUserAccountInDb,
  getDbInstance,
} from '../server/db';

import {
  calculateRetailPrice,
  getPriceMarkup,
  isArabianPerfume,
  isPerfumeProduct,
} from '../server/pricing';

async function runTests() {
  console.log('================================================================');
  console.log('🧪 MAISON ARÔME: ПОЛНОЕ АВТОМАТИЧЕСКОЕ ТЕСТИРОВАНИЕ СИСТЕМЫ');
  console.log('   (Лояльность, Заказы, Корзина, 152-ФЗ, БД, Ценообразование)');
  console.log('================================================================\n');

  let totalTests = 0;
  let failures = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
    } else {
      console.error(`  ❌ [FAIL] ${testName}`, details || '');
      failures++;
    }
  }

  const testSuffix = Math.random().toString(36).substring(2, 7);
  const emailUserA = `client_alpha_${testSuffix}@maisonarome.ru`;
  const emailUserB = `client_beta_${testSuffix}@maisonarome.ru`;
  const passwordA = 'AlphaSecret2026!';
  const newPasswordA = 'NewSuperPass777!';

  // ============================================================================
  // 1. ТЕСТ РЕГИСТРАЦИИ ПО EMAIL И ВХОДА (БЕЗ ЛОГИНА)
  // ============================================================================
  console.log('▶ [1. Регистрация и аутентификация строго по Email]');
  const regA = registerUser({ email: emailUserA, password: passwordA, fullName: 'Анна Воронцова' });
  const regB = registerUser({ email: emailUserB, password: passwordA }); // ФИО не указано — проверяем автовывод

  const userA = regA.user;
  const userB = regB.user;

  assert(Boolean(userA && userA.id), `Пользователь A успешно создан (ID: ${userA?.id})`);
  assert(Boolean(userB && userB.id), `Пользователь B успешно создан (ID: ${userB?.id})`);
  assert(userA.email === emailUserA.toLowerCase(), 'Email нормализуется в нижний регистр');
  assert(userB.fullName.length > 0, `Автоматическая генерация имени при отсутствии: "${userB.fullName}"`);

  // Проверка входа по email
  const loginRes = loginUser(emailUserA.toUpperCase(), passwordA); // Проверка нечувствительности к регистру email
  assert(loginRes.user.id === userA.id, 'Успешный вход по Email (case-insensitive)');

  // ============================================================================
  // 2. БОНУСНАЯ КАРТА: ПРИВЕТСТВЕННЫЙ БАЛАНС 500 РУБЛЕЙ
  // ============================================================================
  console.log('\n▶ [2. Бонусная карта и приветственный баланс 500 ₽]');
  const cardA = getOrCreateBonusCard(userA.id);
  const cardB = getOrCreateBonusCard(userB.id);

  assert(cardA.balance === 500, `Пользователь A: начальный баланс 500 ₽ (получено: ${cardA.balance})`);
  assert(cardB.balance === 500, `Пользователь B: начальный баланс 500 ₽ (получено: ${cardB.balance})`);
  assert(Boolean(cardA.card_number), `Сгенерирован номер виртуальной карты: ${cardA.card_number}`);
  assert(cardA.tier === 'Silver', `Стартовый уровень лояльности: ${cardA.tier}`);
  assert(cardA.cashback_percent === 5, `Стартовый кэшбэк: ${cardA.cashback_percent}%`);

  // ============================================================================
  // 3. ИЗОЛЯЦИЯ КОРЗИНЫ ПО АККАУНТУ (НЕ ПО БРАУЗЕРУ)
  // ============================================================================
  console.log('\n▶ [3. Привязка корзины к аккаунту и изоляция]');
  const cartA = [
    { id: 'item-1', perfumeId: 101, name: 'Baccarat Rouge 540', brand: 'Maison Francis Kurkdjian', price: 2990, quantity: 2, volume: '10ml' }
  ];
  const cartB = [
    { id: 'item-2', perfumeId: 202, name: 'Angels Share', brand: 'Kilian', price: 3490, quantity: 1, volume: '5ml' }
  ];

  saveUserCartInDb(userA.id, cartA);
  saveUserCartInDb(userB.id, cartB);

  const fetchedCartA = getUserCartFromDb(userA.id);
  const fetchedCartB = getUserCartFromDb(userB.id);

  assert(fetchedCartA.length === 1 && fetchedCartA[0].name === 'Baccarat Rouge 540', 'Корзина Пользователя A сохранена в его аккаунте');
  assert(fetchedCartB.length === 1 && fetchedCartB[0].name === 'Angels Share', 'Корзина Пользователя B сохранена в его аккаунте');
  assert(fetchedCartA[0].name !== fetchedCartB[0].name, 'Корзины разных пользователей не смешиваются');

  // ============================================================================
  // 4. СМЕНА ПАРОЛЯ С ПОДТВЕРЖДЕНИЕМ СТАРОГО
  // ============================================================================
  console.log('\n▶ [4. Безопасная смена пароля с верификацией старого]');
  let wrongOldPassCaught = false;
  try {
    changeUserPasswordInDb(userA.id, 'WrongPassword123!', newPasswordA);
  } catch {
    wrongOldPassCaught = true;
  }
  assert(wrongOldPassCaught, 'Отказ при неверном старом пароле');

  const changeSuccess = changeUserPasswordInDb(userA.id, passwordA, newPasswordA);
  assert(changeSuccess === true, 'Пароль успешно обновлен при правильном старом пароле');

  let oldAuthFailed = false;
  try {
    loginUser(emailUserA, passwordA);
  } catch {
    oldAuthFailed = true;
  }
  assert(oldAuthFailed, 'Старый пароль больше не подходит');

  const newLogin = loginUser(emailUserA, newPasswordA);
  assert(newLogin.user.id === userA.id, 'Новый пароль успешно авторизует пользователя');

  // ============================================================================
  // 5. СОЗДАНИЕ ЗАКАЗА И ОТЛОЖЕННОЕ НАЧИСЛЕНИЕ КЭШБЭКА
  // ============================================================================
  console.log('\n▶ [5. Создание заказа и отложенный кэшбэк (только после подтверждения админом)]');
  const orderAmount1 = 10000;
  const order1 = createOrderInDb({
    userId: userA.id,
    items: cartA,
    totalAmount: orderAmount1,
    discount: 0,
    deliveryMethod: 'СДЭК Доставка',
    deliveryPrice: 0,
    paymentMethod: 'СБП',
    isPaid: false,
    recipient: {
      fullName: 'Анна Воронцова',
      phone: '+7 912 000-11-22',
      email: emailUserA,
      city: 'Москва',
      address: 'ул. Тверская, 10',
    },
  });

  assert(Boolean(order1 && order1.id), `Заказ 1 создан: ${order1.orderNumber}`);

  // Проверяем, что кэшбэк НЕ начислен сразу
  const cardBeforeConfirm = getOrCreateBonusCard(userA.id);
  assert(cardBeforeConfirm.balance === 500, `Баланс до подтверждения админом: 500 ₽ (преждевременного начисления нет)`);

  // Подтверждение админом: статус -> 'paid'
  console.log('\n▶ [6. Подтверждение статуса заказа администратором: paid]');
  const expectedCashback1 = Math.round(orderAmount1 * 0.05); // 500 руб.
  updateOrderStatusInDb(order1.id, 'paid');

  const cardAfterPaid = getOrCreateBonusCard(userA.id);
  const expectedBalance1 = 500 + expectedCashback1;
  assert(
    cardAfterPaid.balance === expectedBalance1,
    `Статус 'paid': начислен кэшбэк 5% (${expectedCashback1} ₽), итого баланс = ${cardAfterPaid.balance} ₽`
  );

  // Проверка идемпотентности: статус -> 'sent' и 'delivered' НЕ должны дублировать начисление
  updateOrderStatusInDb(order1.id, 'sent', 'CDEK-TEST-998877');
  const cardAfterSent = getOrCreateBonusCard(userA.id);
  assert(cardAfterSent.balance === expectedBalance1, `Статус 'sent': баланс остался ${cardAfterSent.balance} ₽ (без повторного начисления)`);

  updateOrderStatusInDb(order1.id, 'delivered');
  const cardAfterDelivered = getOrCreateBonusCard(userA.id);
  assert(cardAfterDelivered.balance === expectedBalance1, `Статус 'delivered': баланс остался ${cardAfterDelivered.balance} ₽ (идемпотентность соблюдена)`);

  // ============================================================================
  // 6. ОТОБРАЖЕНИЕ ЗАКАЗОВ В ИСТОРИИ ПОКУПОК
  // ============================================================================
  console.log('\n▶ [7. Отображение покупок в личном кабинете]');
  const userOrders = getUserOrdersFromDb(userA.id, emailUserA);
  assert(userOrders.length >= 1, `В истории покупок отображается ${userOrders.length} заказ(ов)`);
  assert(userOrders[0].orderNumber === order1.orderNumber, 'Номер заказа соответствует оформленному');
  assert(userOrders[0].trackingNumber === 'CDEK-TEST-998877', 'Трек-номер СДЭК корректно сохранен и выводится');
  assert(userOrders[0].recipient.fullName === 'Анна Воронцова', 'Получатель заказа сохранен верно');

  // ============================================================================
  // 7. РОСТ УРОВНЯ КАРТЫ ЛОЯЛЬНОСТИ (SILVER -> GOLD -> PLATINUM)
  // ============================================================================
  console.log('\n▶ [8. Прогрессия статуса бонусной карты при накоплении покупок]');
  // Создаем еще 4 подтвержденных заказа для достижения порога 5 заказов (уровень Gold / 7%)
  for (let i = 2; i <= 5; i++) {
    const o = createOrderInDb({
      userId: userA.id,
      items: cartA,
      totalAmount: 3000,
      discount: 0,
      deliveryMethod: 'СДЭК',
      deliveryPrice: 0,
      paymentMethod: 'СБП',
      isPaid: false,
      recipient: {
        fullName: 'Анна Воронцова',
        phone: '+7 912 000-11-22',
        email: emailUserA,
        city: 'Москва',
        address: 'ул. Тверская, 10',
      },
    });
    updateOrderStatusInDb(o.id, 'paid');
  }

  const cardGold = getOrCreateBonusCard(userA.id);
  assert(cardGold.order_count >= 5, `Счетчик оплаченных заказов: ${cardGold.order_count} (>= 5)`);
  assert(cardGold.tier === 'Gold', `Уровень автоматически повышен до Gold (получено: ${cardGold.tier})`);
  assert(cardGold.cashback_percent === 7, `Процент кэшбэка повышен до 7%`);

  // Создаем еще 10 заказов для достижения порога 15 заказов (уровень Platinum / 10%)
  for (let i = 6; i <= 15; i++) {
    const o = createOrderInDb({
      userId: userA.id,
      items: cartA,
      totalAmount: 2000,
      discount: 0,
      deliveryMethod: 'СДЭК',
      deliveryPrice: 0,
      paymentMethod: 'СБП',
      isPaid: false,
      recipient: {
        fullName: 'Анна Воронцова',
        phone: '+7 912 000-11-22',
        email: emailUserA,
        city: 'Москва',
        address: 'ул. Тверская, 10',
      },
    });
    updateOrderStatusInDb(o.id, 'paid');
  }

  const cardPlatinum = getOrCreateBonusCard(userA.id);
  assert(cardPlatinum.order_count >= 15, `Счетчик оплаченных заказов: ${cardPlatinum.order_count} (>= 15)`);
  assert(cardPlatinum.tier === 'Platinum', `Уровень автоматически повышен до Platinum (получено: ${cardPlatinum.tier})`);
  assert(cardPlatinum.cashback_percent === 10, `Максимальный VIP кэшбэк: 10%`);

  // ============================================================================
  // 8. СПИСАНИЕ БОНУСНЫХ БАЛЛОВ ПРИ ОПЛАТЕ
  // ============================================================================
  console.log('\n▶ [9. Списание бонусов при оформлении заказа]');
  const balanceBeforeRedeem = cardPlatinum.balance;
  const redeemAmount = 500;
  const redeemRes = useBonusPoints(userA.id, redeemAmount);
  assert(redeemRes.success === true, 'Успешное списание 500 бонусных рублей');
  const cardAfterRedeem = getOrCreateBonusCard(userA.id);
  assert(
    cardAfterRedeem.balance === balanceBeforeRedeem - redeemAmount,
    `Баланс уменьшился на ${redeemAmount} ₽ (было ${balanceBeforeRedeem}, стало ${cardAfterRedeem.balance})`
  );

  // ============================================================================
  // 9. СОБЛЮДЕНИЕ 152-ФЗ И GDPR: ВЫГРУЗКА И УДАЛЕНИЕ ДАННЫХ
  // ============================================================================
  console.log('\n▶ [10. Соблюдение 152-ФЗ: выгрузка архива и право на забвение]');
  const exportData = exportUserDataInDb(userA.id);
  assert(Boolean(exportData && exportData.profile), 'Архив персональных данных сформирован');
  assert(exportData.profile.email === emailUserA.toLowerCase(), 'Архив содержит профиль');
  assert(Array.isArray(exportData.orders) && exportData.orders.length >= 15, `Архив содержит историю заказов (${exportData.orders.length} шт)`);
  assert(exportData.loyaltyCard?.tier === 'Platinum', 'Архив содержит данные бонусной карты');

  // Удаление / обезличивание аккаунта
  const deleteRes = deleteUserAccountInDb(userA.id);
  assert(deleteRes.success === true, 'Запрос на удаление/обезличивание аккаунта выполнен успешно');

  // Проверяем, что PII обезличено (ст. 21 152-ФЗ), а заказы сохранены для фискальной отчетности
  const db = getDbInstance();
  const anonymizedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userA.id) as any;
  assert(anonymizedUser.full_name === 'Удаленный пользователь', 'ФИО пользователя обезличено');
  assert(anonymizedUser.phone === '', 'Телефон удален');
  assert(anonymizedUser.password_hash === '', 'Пароль и соль удалены');
  assert(anonymizedUser.email.includes('anonymized_'), 'Email заменен на анонимный идентификатор');

  // ============================================================================
  // 10. ПРОВЕРКА ЦЕНООБРАЗОВАНИЯ И НАЦЕНОК (ЛЮКС/НИША vs АРАБСКАЯ)
  // ============================================================================
  console.log('\n▶ [11. Верификация правил наценки для всех категорий и объемов]');
  
  // Люкс и ниша
  assert(calculateRetailPrice(1500, 'perfume', 'niche') === 1500 + 700, 'Люкс/Ниша 0-2к: наценка +700 ₽');
  assert(calculateRetailPrice(3500, 'perfume', 'niche') === 3500 + 1200, 'Люкс/Ниша 2-5к: наценка +1200 ₽');
  assert(calculateRetailPrice(8000, 'perfume', 'niche') === 8000 + 2000, 'Люкс/Ниша 5-10к: наценка +2000 ₽');
  assert(calculateRetailPrice(12000, 'perfume', 'niche') === 12000 + 3000, 'Люкс/Ниша 10-15к: наценка +3000 ₽');
  assert(calculateRetailPrice(18000, 'perfume', 'niche') === 18000 + 4000, 'Люкс/Ниша 15-20к: наценка +4000 ₽');
  assert(calculateRetailPrice(22000, 'perfume', 'niche') === 22000 + 4500, 'Люкс/Ниша 20-25к: наценка +4500 ₽');
  assert(calculateRetailPrice(27000, 'perfume', 'niche') === 27000 + 5000, 'Люкс/Ниша 25-30к: наценка +5000 ₽');
  assert(calculateRetailPrice(35000, 'perfume', 'niche') === 35000 + 6000, 'Люкс/Ниша >30к: наценка +6000 ₽');

  // Арабская парфюмерия
  assert(calculateRetailPrice(1500, 'perfume', 'arabian') === 1500 + 750, 'Арабская 0-2к: наценка +750 ₽');
  assert(calculateRetailPrice(3000, 'perfume', 'arabian') === 3000 + 1200, 'Арабская 2-5к: наценка +1200 ₽');
  assert(calculateRetailPrice(6000, 'perfume', 'arabian') === 6000 + 2000, 'Арабская 5-7к: наценка +2000 ₽');
  assert(calculateRetailPrice(8500, 'perfume', 'arabian') === 8500 + 3000, 'Арабская 7-10к: наценка +3000 ₽');
  assert(calculateRetailPrice(12000, 'perfume', 'arabian') === 12000 + 3500, 'Арабская 10-15к: наценка +3500 ₽');
  assert(calculateRetailPrice(18000, 'perfume', 'arabian') === 18000 + 4000, 'Арабская 15-20к: наценка +4000 ₽');
  assert(calculateRetailPrice(25000, 'perfume', 'arabian') === 25000 + 5000, 'Арабская >20к: наценка +5000 ₽');

  // Не-парфюмерия (косметика/уход): без наценки (+0 ₽)
  assert(calculateRetailPrice(3000, 'cosmetics', 'skincare') === 3000, 'Косметика/Уход: наценка 0 ₽ (цена без изменений)');

  // ============================================================================
  // 11. ПРОВЕРКА ЦЕЛОСТНОСТИ БАЗЫ ДАННЫХ (PRAGMA integrity_check & foreign_keys)
  // ============================================================================
  console.log('\n▶ [12. Проверка целостности базы данных SQLite]');
  const integrityRow = db.prepare('PRAGMA integrity_check').get() as any;
  const integrityResult = integrityRow['integrity_check'] || integrityRow[Object.keys(integrityRow)[0]];
  assert(integrityResult === 'ok', `PRAGMA integrity_check: ${integrityResult}`);

  const fkViolations = db.prepare('PRAGMA foreign_key_check').all();
  assert(fkViolations.length === 0, `PRAGMA foreign_key_check: 0 нарушений связей`);

  console.log('\n================================================================');
  if (failures === 0) {
    console.log(`🎉 ВСЕ ${totalTests} ТЕСТОВ ПРОЙДЕНЫ УСПЕШНО! 100% ВЕРИФИКАЦИЯ.`);
  } else {
    console.error(`💥 ПРОВАЛЕНО ТЕСТОВ: ${failures} из ${totalTests}.`);
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Критическая ошибка тестирования:', err);
  process.exit(1);
});
