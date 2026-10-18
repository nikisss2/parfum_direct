import {
  getTelegramConfig,
  registerSubscriberChat,
  sendTelegramMessage,
  escapeHtml,
} from './telegramNotifier.js';
import {
  getAllOrdersFromDb,
  updateOrderStatusInDb,
  getAdminStats,
  findOrderForTracking,
} from './db.js';

let isPolling = false;
let shouldStop = false;
let pollingOffset = 0;

export function startTelegramBot(): void {
  if (isPolling) return;
  isPolling = true;
  shouldStop = false;
  console.log('[TELEGRAM BOT] Запуск службы интерактивного бота @maison_arome_bot...');
  pollLoop().catch(err => {
    console.error('[TELEGRAM BOT] Фатальная ошибка в цикле бота:', err);
    isPolling = false;
  });
}

export function stopTelegramBot(): void {
  shouldStop = true;
  isPolling = false;
  console.log('[TELEGRAM BOT] Служба бота остановлена.');
}

async function pollLoop() {
  while (!shouldStop) {
    const config = getTelegramConfig();
    const token = config.botToken;

    if (!token) {
      await sleep(10000);
      continue;
    }

    try {
      const url = `https://api.telegram.org/bot${token}/getUpdates?offset=${pollingOffset}&timeout=20`;
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      const data = (await res.json()) as {
        ok: boolean;
        result?: Array<{
          update_id: number;
          message?: {
            message_id: number;
            from?: { id: number; first_name?: string; username?: string };
            chat: { id: number; type: string };
            text?: string;
          };
          callback_query?: {
            id: string;
            from: { id: number; first_name?: string };
            message?: { chat: { id: number }; message_id: number };
            data?: string;
          };
        }>;
      };

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          pollingOffset = update.update_id + 1;
          try {
            await handleUpdate(update);
          } catch (err) {
            console.error('[TELEGRAM BOT] Ошибка обработки команды:', err);
          }
        }
      } else {
        await sleep(3000);
      }
    } catch (err: any) {
      // Игнорируем сетевые таймауты long-polling, ждем перед повтором
      await sleep(3000);
    }
  }
}

async function handleUpdate(update: any) {
  // 1. Обычные текстовые сообщения и команды
  if (update.message && update.message.text) {
    const chatId = update.message.chat.id;
    const text = update.message.text.trim();
    const fromUser = update.message.from?.username
      ? `@${update.message.from.username}`
      : (update.message.from?.first_name || 'Администратор');

    // Автоматическая регистрация чата для отправки уведомлений
    registerSubscriberChat(chatId);

    // Команда /start
    if (text === '/start' || text.startsWith('/start ')) {
      const welcome =
`✨ <b>Добро пожаловать в Maison Arôme Bot!</b>
━━━━━━━━━━━━━━━━━━━━
Здравствуйте, <b>${escapeHtml(fromUser)}</b>!

Ваш чат <code>${chatId}</code> успешно подключен к системе магазина.
Сюда будут автоматически приходить уведомления о всех новых заказах с деталями и контактами клиентов.

<b>📋 Доступные команды:</b>
📦 /orders — Список последних заказов и статусы
🔍 /order &lt;номер&gt; — Подробная карточка заказа
🚚 /status &lt;номер&gt; &lt;статус&gt; — Изменить статус заказа
📊 /stats — Статистика выручки и заказов
ℹ️ /help — Справка по работе с ботом`;

      const buttons = [
        [
          { text: '📦 Последние заказы', callback_data: 'cmd_orders' },
          { text: '📊 Статистика магазина', callback_data: 'cmd_stats' },
        ],
        [
          { text: '🌐 Открыть сайт бутика', url: 'https://maisonarome.ru' },
        ],
      ];

      await sendTelegramMessage(welcome, buttons, String(chatId));
      return;
    }

    // Команда /orders
    if (text === '/orders' || text.startsWith('/orders ')) {
      await handleOrdersCommand(chatId);
      return;
    }

    // Команда /order <номер> или /order_<номер>
    if (text.startsWith('/order')) {
      const parts = text.split(/\s+/);
      let orderNum = '';
      if (parts[0].startsWith('/order_')) {
        orderNum = parts[0].replace('/order_', '').replace(/_/g, '-');
      } else if (parts[1]) {
        orderNum = parts[1].trim();
      }

      if (!orderNum) {
        await sendTelegramMessage(
          '⚠️ Укажите номер заказа, например:\n<code>/order 2026-0001</code>',
          undefined,
          String(chatId)
        );
        return;
      }

      await handleSingleOrderCommand(chatId, orderNum);
      return;
    }

    // Команда /status <номер> <новый_статус> [трек]
    if (text.startsWith('/status')) {
      const parts = text.split(/\s+/);
      if (parts.length < 3) {
        await sendTelegramMessage(
          '⚠️ Формат команды: <code>/status &lt;номер&gt; &lt;статус&gt; [трек]</code>\n\n' +
          'Допустимые статусы:\n' +
          '• <code>assembling</code> — В сборке\n' +
          '• <code>sent</code> — Отправлен в доставку\n' +
          '• <code>delivered</code> — Доставлен клиенту\n' +
          '• <code>cancelled</code> — Отменен\n\n' +
          'Пример:\n<code>/status 2026-0001 sent 1234567890</code>',
          undefined,
          String(chatId)
        );
        return;
      }

      const orderNum = parts[1].trim();
      const status = parts[2].trim().toLowerCase();
      const tracking = parts[3]?.trim();

      await handleStatusUpdate(chatId, orderNum, status, tracking);
      return;
    }

    // Команда /stats
    if (text === '/stats') {
      await handleStatsCommand(chatId);
      return;
    }

    // Команда /help
    if (text === '/help') {
      const helpText =
`ℹ️ <b>СПРАВОЧНИК КОМАНД БОТА MAISON ARÔME</b>
━━━━━━━━━━━━━━━━━━━━
• <b>/orders</b> — Показать 10 последних заказов с суммами и статусами.
• <b>/order &lt;номер&gt;</b> — Полная карточка заказа: товары, адреса, клиент, телефон.
• <b>/status &lt;номер&gt; &lt;статус&gt; [трек]</b> — Сменить статус заказа.
  Статусы: <code>assembling</code>, <code>sent</code>, <code>delivered</code>, <code>cancelled</code>.
• <b>/stats</b> — Выручка, количество заказов и клиенты.
• <b>/start</b> — Авторизовать этот чат для получения новых заказов.`;

      await sendTelegramMessage(helpText, undefined, String(chatId));
      return;
    }

    // Если написали текст, похожий на номер заказа
    if (/^\d{4}[-_]\d+$/i.test(text)) {
      await handleSingleOrderCommand(chatId, text.replace('_', '-'));
      return;
    }

    // Ответ по умолчанию
    await sendTelegramMessage(
      `👋 Команда не распознана. Используйте <b>/orders</b> для просмотра заказов или <b>/help</b> для справки.`,
      [[{ text: '📦 Показать заказы', callback_data: 'cmd_orders' }]],
      String(chatId)
    );
  }

  // 2. Обработка нажатий на инлайн-кнопки (callback_query)
  if (update.callback_query) {
    const cb = update.callback_query;
    const chatId = cb.message?.chat.id;
    const data = cb.data || '';

    // Подтверждаем получение колбэка Telegram
    try {
      const cfg = getTelegramConfig();
      await fetch(`https://api.telegram.org/bot${cfg.botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: cb.id }),
      });
    } catch {}

    if (!chatId) return;

    if (data === 'cmd_orders') {
      await handleOrdersCommand(chatId);
      return;
    }
    if (data === 'cmd_stats') {
      await handleStatsCommand(chatId);
      return;
    }
    if (data.startsWith('view_')) {
      const orderNum = data.replace('view_', '');
      await handleSingleOrderCommand(chatId, orderNum);
      return;
    }
    if (data.startsWith('status_')) {
      const [, orderId, newStatus] = data.split('_');
      if (orderId && newStatus) {
        await handleStatusUpdate(chatId, orderId, newStatus);
      }
      return;
    }
  }
}

async function handleOrdersCommand(chatId: number) {
  const all = getAllOrdersFromDb();
  if (!all || all.length === 0) {
    await sendTelegramMessage('📦 В базе пока нет ни одного заказа.', undefined, String(chatId));
    return;
  }

  const latest = all.slice(0, 10);
  const statusEmoji: Record<string, string> = {
    assembling: '🧪 В сборке',
    paid: '💳 Оплачен',
    sent: '🚚 Отправлен',
    delivered: '✅ Доставлен',
    cancelled: '❌ Отменен',
  };

  const listText = latest
    .map((o, idx) => {
      const emoji = statusEmoji[o.status] || o.statusLabel || o.status;
      const clientName = o.recipient?.fullName || o.customer_name || 'Клиент';
      const phone = o.recipient?.phone || o.customer_phone || '';
      const orderNum = o.orderNumber || o.order_number;
      return (
        `<b>${idx + 1}. №${escapeHtml(orderNum)}</b> | <b>${Number(o.totalAmount).toLocaleString('ru-RU')} ₽</b>\n` +
        `   └ Статус: <i>${escapeHtml(emoji)}</i>\n` +
        `   └ Клиент: ${escapeHtml(clientName)} (<code>${escapeHtml(phone)}</code>)\n` +
        `   └ Детали: /order_${orderNum.replace(/-/g, '_')}`
      );
    })
    .join('\n\n');

  const text =
`📦 <b>ПОСЛЕДНИЕ ЗАКАЗЫ БУТИКА (всего ${all.length}):</b>
━━━━━━━━━━━━━━━━━━━━
${listText}

━━━━━━━━━━━━━━━━━━━━
💡 <i>Нажмите на команду вида <code>/order_...</code> для открытия полного состава заказа.</i>`;

  const buttons = [
    [
      { text: '🔄 Обновить список', callback_data: 'cmd_orders' },
      { text: '📊 Статистика', callback_data: 'cmd_stats' },
    ],
  ];

  await sendTelegramMessage(text, buttons, String(chatId));
}

async function handleSingleOrderCommand(chatId: number, orderNum: string) {
  const all = getAllOrdersFromDb();
  const clean = orderNum.trim().toLowerCase();
  const order = all.find(
    o =>
      (o.orderNumber && o.orderNumber.toLowerCase() === clean) ||
      (o.order_number && o.order_number.toLowerCase() === clean) ||
      o.id === clean
  );

  if (!order) {
    await sendTelegramMessage(
      `❌ Заказ №<code>${escapeHtml(orderNum)}</code> не найден в базе данных.\n` +
      `Проверьте номер или запросите общий список по команде <b>/orders</b>.`,
      undefined,
      String(chatId)
    );
    return;
  }

  const items = (order.items || [])
    .map(
      (it: any, i: number) =>
        `  ${i + 1}. <b>${escapeHtml(it.brand || '')} ${escapeHtml(it.name || '')}</b>\n` +
        `     └ ${escapeHtml(it.volumeLabel || '')} × ${it.quantity} шт. = <b>${Number(it.price * it.quantity).toLocaleString('ru-RU')} ₽</b>`
    )
    .join('\n');

  const recipient = order.recipient || {};
  const statusEmoji: Record<string, string> = {
    assembling: '🧪 В сборке',
    paid: '💳 Оплачен',
    sent: '🚚 Отправлен в доставку',
    delivered: '✅ Доставлен',
    cancelled: '❌ Отменен',
  };
  const statusStr = statusEmoji[order.status] || order.statusLabel || order.status;

  const text =
`📋 <b>КАРТОЧКА ЗАКАЗА №${escapeHtml(order.orderNumber)}</b>
━━━━━━━━━━━━━━━━━━━━
🏷 <b>Текущий статус:</b> <b>${escapeHtml(statusStr)}</b>
${order.trackingNumber ? `📍 <b>Трек-номер:</b> <code>${escapeHtml(order.trackingNumber)}</code>\n` : ''}📅 <b>Дата:</b> ${new Date(order.createdAt).toLocaleString('ru-RU')}

👤 <b>Получатель:</b> ${escapeHtml(recipient.fullName || order.customer_name || 'Не указано')}
📱 <b>Телефон:</b> <code>${escapeHtml(recipient.phone || order.customer_phone || 'Не указан')}</code>
💬 <b>Telegram:</b> ${escapeHtml(recipient.telegram || 'Не указан')}
${recipient.email ? `✉️ <b>Email:</b> ${escapeHtml(recipient.email)}\n` : ''}📍 <b>Город:</b> ${escapeHtml(recipient.city || 'Не указан')}
🚚 <b>Способ доставки:</b> ${escapeHtml(order.deliveryMethod || 'СДЭК')}
🏠 <b>Адрес / ПВЗ:</b> <code>${escapeHtml(recipient.address || 'Не указан')}</code>
${recipient.comment ? `📝 <b>Комментарий:</b> <i>${escapeHtml(recipient.comment)}</i>\n` : ''}
📦 <b>СОСТАВ ЗАКАЗА:</b>
${items || '—'}

━━━━━━━━━━━━━━━━━━━━
💵 <b>Сумма товаров:</b> ${Number(order.totalAmount - (order.deliveryPrice || 0) + (order.discount || 0)).toLocaleString('ru-RU')} ₽
${order.discount ? `🏷 <b>Скидка:</b> -${Number(order.discount).toLocaleString('ru-RU')} ₽\n` : ''}🚚 <b>Доставка:</b> ${order.deliveryPrice ? `${Number(order.deliveryPrice).toLocaleString('ru-RU')} ₽` : 'По тарифам ТК (от 50 ₽)'}
💰 <b>ИТОГО К ОПЛАТЕ:</b> <b>${Number(order.totalAmount).toLocaleString('ru-RU')} ₽</b>`;

  const clientTg = (recipient.telegram || '').replace('@', '').trim();
  const phone = (recipient.phone || order.customer_phone || '').replace(/\D/g, '');

  const buttons: { text: string; url?: string; callback_data?: string }[][] = [];
  const contactRow: { text: string; url?: string }[] = [];
  if (clientTg) {
    contactRow.push({ text: `💬 Написать @${clientTg}`, url: `https://t.me/${clientTg}` });
  }
  if (contactRow.length) {
    buttons.push(contactRow);
  }

  // Row with status update quick buttons
  buttons.push([
    { text: '🧪 В сборку', callback_data: `status_${order.id}_assembling` },
    { text: '🚚 Отправлен', callback_data: `status_${order.id}_sent` },
    { text: '✅ Доставлен', callback_data: `status_${order.id}_delivered` },
  ]);

  buttons.push([
    { text: '📦 К списку заказов', callback_data: 'cmd_orders' },
  ]);

  await sendTelegramMessage(text, buttons, String(chatId));
}

async function handleStatusUpdate(chatId: number, orderIdOrNum: string, newStatus: string, tracking?: string) {
  const allowed = ['assembling', 'paid', 'sent', 'delivered', 'cancelled'];
  if (!allowed.includes(newStatus)) {
    await sendTelegramMessage(
      `❌ Неизвестный статус: «${escapeHtml(newStatus)}».\nДопустимые: ${allowed.join(', ')}`,
      undefined,
      String(chatId)
    );
    return;
  }

  try {
    const updated = updateOrderStatusInDb(orderIdOrNum, newStatus, tracking);
    if (!updated) {
      await sendTelegramMessage(
        `❌ Заказ «${escapeHtml(orderIdOrNum)}» не найден для обновления статуса.`,
        undefined,
        String(chatId)
      );
      return;
    }

    const text =
`✅ <b>Статус заказа №${escapeHtml(updated.orderNumber)} успешно обновлен!</b>
━━━━━━━━━━━━━━━━━━━━
🏷 <b>Новый статус:</b> ${escapeHtml(updated.statusLabel)} (${updated.status})
${updated.trackingNumber ? `📍 <b>Трек-номер:</b> <code>${escapeHtml(updated.trackingNumber)}</code>\n` : ''}👤 <b>Клиент:</b> ${escapeHtml(updated.recipient?.fullName || '')}
💰 <b>Сумма:</b> ${Number(updated.totalAmount).toLocaleString('ru-RU')} ₽`;

    const buttons = [
      [
        { text: '🔍 Посмотреть заказ', callback_data: `view_${updated.orderNumber}` },
        { text: '📦 Все заказы', callback_data: 'cmd_orders' },
      ],
    ];

    await sendTelegramMessage(text, buttons, String(chatId));
  } catch (err: any) {
    await sendTelegramMessage(`❌ Ошибка обновления: ${err.message}`, undefined, String(chatId));
  }
}

async function handleStatsCommand(chatId: number) {
  const stats = getAdminStats();
  const text =
`📊 <b>СТАТИСТИКА БУТИКА MAISON ARÔME</b>
━━━━━━━━━━━━━━━━━━━━
💰 <b>Общая выручка:</b> <b>${Number(stats.totalRevenue || 0).toLocaleString('ru-RU')} ₽</b>
📦 <b>Всего оформлено заказов:</b> <b>${stats.totalOrders || 0}</b>
⏳ <b>Активных заказов в работе:</b> <b>${stats.activeOrders || 0}</b>
👥 <b>Зарегистрированных клиентов:</b> <b>${stats.totalUsers || 0}</b>

🔒 База данных защищена шифрованием SQLite WAL.`;

  const buttons = [
    [
      { text: '📦 Посмотреть заказы', callback_data: 'cmd_orders' },
      { text: '🔄 Обновить', callback_data: 'cmd_stats' },
    ],
  ];

  await sendTelegramMessage(text, buttons, String(chatId));
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
