import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '..', 'data', 'telegram.config.json');

export interface TelegramConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
  managerUsername: string;
}

const DEFAULT_CONFIG: TelegramConfig = {
  enabled: false,
  botToken: '',
  chatId: '',
  managerUsername: 'nikisss2',
};

export function getTelegramConfig(): TelegramConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (err) {
    console.error('Error reading telegram config:', err);
  }
  return { ...DEFAULT_CONFIG };
}

export function saveTelegramConfig(config: Partial<TelegramConfig>): TelegramConfig {
  const current = getTelegramConfig();
  const updated: TelegramConfig = {
    ...current,
    ...config,
    botToken: (config.botToken ?? current.botToken).trim(),
    chatId: (config.chatId ?? current.chatId).trim(),
    managerUsername: (config.managerUsername ?? current.managerUsername).trim() || 'nikisss2',
    enabled: config.enabled ?? current.enabled,
  };

  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

export async function sendTelegramMessage(
  text: string,
  inlineButtons?: { text: string; url: string }[][]
): Promise<{ ok: boolean; error?: string }> {
  const config = getTelegramConfig();

  if (!config.botToken) {
    return { ok: false, error: 'Не указан Bot Token' };
  }
  if (!config.chatId) {
    return { ok: false, error: 'Не указан Chat ID' };
  }

  const payload: Record<string, unknown> = {
    chat_id: config.chatId,
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
    if (!data.ok) {
      return { ok: false, error: data.description || 'Ошибка Telegram API' };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Сетевая ошибка' };
  }
}

export function formatOrderHtml(order: any): { text: string; buttons: { text: string; url: string }[][] } {
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
💬 <b>Telegram клиента:</b> ${escapeHtml(order.recipient?.telegram || 'Не указан')}
${order.recipient?.email ? `✉️ <b>Email:</b> ${escapeHtml(order.recipient.email)}\n` : ''}📍 <b>Город:</b> ${escapeHtml(order.recipient?.city || 'Не указан')}
🚚 <b>Доставка:</b> ${escapeHtml(order.deliveryMethod || 'СДЭК')}
🏠 <b>Адрес / ПВЗ:</b> <code>${escapeHtml(order.recipient?.address || '')}</code>
${order.recipient?.comment ? `📝 <b>Комментарий:</b> <i>${escapeHtml(order.recipient.comment)}</i>\n` : ''}
📦 <b>СОСТАВ ЗАКАЗА:</b>
${items || '—'}

━━━━━━━━━━━━━━━━━━━━
💵 <b>Товары:</b> ${Number(order.totalAmount - (order.deliveryPrice || 0) + (order.discount || 0)).toLocaleString('ru-RU')} ₽
${order.discount ? `🏷 <b>Скидка:</b> -${Number(order.discount).toLocaleString('ru-RU')} ₽\n` : ''}🚚 <b>Доставка:</b> ${order.deliveryPrice ? `${Number(order.deliveryPrice).toLocaleString('ru-RU')} ₽` : '0 ₽ (Бесплатно)'}
💰 <b>ИТОГО К ОПЛАТЕ:</b> <b>${Number(order.totalAmount).toLocaleString('ru-RU')} ₽</b>
💳 <b>Способ оплаты:</b> СБП / Онлайн`;

  const buttons: { text: string; url: string }[][] = [];
  const clientTg = (order.recipient?.telegram || '').replace('@', '').trim();
  const phone = (order.recipient?.phone || '').replace(/\D/g, '');

  const row1: { text: string; url: string }[] = [];
  if (clientTg) {
    row1.push({ text: `💬 Написать @${clientTg}`, url: `https://t.me/${clientTg}` });
  }
  if (phone) {
    row1.push({ text: '📱 WhatsApp', url: `https://wa.me/${phone}` });
  }
  if (row1.length) {
    buttons.push(row1);
  }

  return { text, buttons };
}

export async function sendOrderNotification(order: any): Promise<{ ok: boolean; error?: string }> {
  const config = getTelegramConfig();
  if (!config.enabled || !config.botToken || !config.chatId) {
    return { ok: false, error: 'Telegram-уведомления отключены или не настроены' };
  }

  const { text, buttons } = formatOrderHtml(order);
  return sendTelegramMessage(text, buttons);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
