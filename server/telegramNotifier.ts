import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '..', 'data', 'telegram.config.json');

export interface TelegramConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
  chatIds: string[];
  managerUsername: string;
}

const DEFAULT_CONFIG: TelegramConfig = {
  enabled: true,
  botToken: '8913044342:AAEgWMP0LqUUIjRVj6C6S9q4MBrqarPOebg',
  chatId: '',
  chatIds: [],
  managerUsername: 'nikisss2',
};

export function getTelegramConfig(): TelegramConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      const chatIds: string[] = Array.isArray(parsed.chatIds)
        ? parsed.chatIds.map(String)
        : (parsed.chatId ? [String(parsed.chatId)] : []);
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        chatIds,
        chatId: parsed.chatId || chatIds[0] || '',
      };
    }
  } catch (err) {
    console.error('Error reading telegram config:', err);
  }
  return { ...DEFAULT_CONFIG };
}

export function saveTelegramConfig(config: Partial<TelegramConfig>): TelegramConfig {
  const current = getTelegramConfig();
  const rawChatIds = config.chatIds || (config.chatId ? [config.chatId] : current.chatIds);
  const chatIds = Array.from(new Set(rawChatIds.map(s => String(s).trim()).filter(Boolean)));
  const primaryChatId = (config.chatId ?? chatIds[0] ?? current.chatId ?? '').trim();

  const updated: TelegramConfig = {
    ...current,
    ...config,
    botToken: (config.botToken ?? current.botToken).trim(),
    chatId: primaryChatId,
    chatIds,
    managerUsername: (config.managerUsername ?? current.managerUsername).trim() || 'nikisss2',
    enabled: config.enabled ?? current.enabled,
  };

  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

export function registerSubscriberChat(chatId: string | number): void {
  const idStr = String(chatId).trim();
  if (!idStr) return;
  const cfg = getTelegramConfig();
  const set = new Set(cfg.chatIds);
  set.add(idStr);
  saveTelegramConfig({
    enabled: true,
    chatId: cfg.chatId || idStr,
    chatIds: Array.from(set),
  });
}

export async function sendTelegramMessage(
  text: string,
  inlineButtons?: { text: string; url?: string; callback_data?: string }[][],
  targetChatId?: string
): Promise<{ ok: boolean; error?: string }> {
  const config = getTelegramConfig();

  if (!config.botToken) {
    return { ok: false, error: 'Не указан Bot Token' };
  }

  const recipients = targetChatId
    ? [String(targetChatId)]
    : (config.chatIds.length ? config.chatIds : (config.chatId ? [config.chatId] : []));

  if (!recipients.length) {
    return { ok: false, error: 'Нет зарегистрированных получателей (отправьте /start в боте)' };
  }

  let lastError: string | undefined;
  let sentAtLeastOne = false;

  for (const cid of recipients) {
    const payload: Record<string, unknown> = {
      chat_id: cid,
      text,
      parse_mode: 'HTML',
    };

    if (inlineButtons && inlineButtons.length > 0) {
      payload.reply_markup = {
        inline_keyboard: inlineButtons,
      };
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { ok: boolean; description?: string };
      if (data.ok) {
        sentAtLeastOne = true;
      } else {
        lastError = data.description;
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Сетевая ошибка';
    }
  }

  return { ok: sentAtLeastOne, error: sentAtLeastOne ? undefined : lastError };
}

export function formatOrderHtml(order: any): { text: string; buttons: { text: string; url?: string; callback_data?: string }[][] } {
  const items = (order.items || [])
    .map(
      (it: any, i: number) =>
        `<b>${i + 1}.</b> ${escapeHtml(it.brand || '')} — ${escapeHtml(it.name || '')}\n` +
        `   └ <i>${escapeHtml(it.volumeLabel || '')}</i> × ${it.quantity} шт. = <b>${Number(it.price * it.quantity).toLocaleString('ru-RU')} ₽</b>`
    )
    .join('\n');

  const text =
`🛍 <b>НОВЫЙ ЗАКАЗ №${escapeHtml(order.orderNumber || '')}</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Покупатель:</b> ${escapeHtml(order.recipient?.fullName || 'Не указано')}
📱 <b>Телефон:</b> <code>${escapeHtml(order.recipient?.phone || 'Не указан')}</code>
💬 <b>Telegram:</b> ${escapeHtml(order.recipient?.telegram || 'Не указан')}
${order.recipient?.email ? `✉️ <b>Email:</b> ${escapeHtml(order.recipient.email)}\n` : ''}📍 <b>Город:</b> ${escapeHtml(order.recipient?.city || 'Не указан')}
🚚 <b>Доставка:</b> ${escapeHtml(order.deliveryMethod || 'СДЭК')}
🏠 <b>Адрес / ПВЗ:</b> <code>${escapeHtml(order.recipient?.address || '')}</code>
${order.recipient?.comment ? `📝 <b>Комментарий:</b> <i>${escapeHtml(order.recipient.comment)}</i>\n` : ''}
📦 <b>СОСТАВ ЗАКАЗА:</b>
${items || '—'}

━━━━━━━━━━━━━━━━━━━━
💵 <b>Товары:</b> ${Number(order.totalAmount - (order.deliveryPrice || 0) + (order.discount || 0)).toLocaleString('ru-RU')} ₽
${order.discount ? `🏷 <b>Скидка:</b> -${Number(order.discount).toLocaleString('ru-RU')} ₽\n` : ''}🚚 <b>Доставка:</b> ${order.deliveryPrice ? `${Number(order.deliveryPrice).toLocaleString('ru-RU')} ₽` : 'По тарифам ТК (от 50 ₽)'}
💰 <b>ИТОГО К ОПЛАТЕ:</b> <b>${Number(order.totalAmount).toLocaleString('ru-RU')} ₽</b>
💳 <b>Предоплата:</b> 30% согласовывается менеджером`;

  const buttons: { text: string; url?: string; callback_data?: string }[][] = [];
  const clientTg = (order.recipient?.telegram || '').replace('@', '').trim();
  const phone = (order.recipient?.phone || '').replace(/\D/g, '');

  const row1: { text: string; url: string }[] = [];
  if (clientTg) {
    row1.push({ text: `💬 Клиент @${clientTg}`, url: `https://t.me/${clientTg}` });
  }
  if (row1.length) {
    buttons.push(row1);
  }

  // Row 2: Status controls
  buttons.push([
    { text: '🔍 Подробнее', callback_data: `view_${order.orderNumber}` },
    { text: '🚚 В сборку', callback_data: `status_${order.id}_assembling` },
  ]);

  return { text, buttons };
}

export async function sendOrderNotification(order: any): Promise<{ ok: boolean; error?: string }> {
  const config = getTelegramConfig();
  if (!config.enabled || !config.botToken) {
    return { ok: false, error: 'Telegram-уведомления отключены' };
  }

  const { text, buttons } = formatOrderHtml(order);
  return sendTelegramMessage(text, buttons);
}

export function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
