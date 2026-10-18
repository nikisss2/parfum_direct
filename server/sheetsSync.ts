import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const EXCEL_SCRIPT = path.join(ROOT, 'scripts', 'generate_orders_excel.py');

// Google Spreadsheet provided by the user
export const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1vXuMV4APjZ3k78eq4Y6DwBMoEYeFFIokZdVS_iwAFTo/edit?gid=943365437#gid=943365437';
export const GOOGLE_SHEET_ID = '1vXuMV4APjZ3k78eq4Y6DwBMoEYeFFIokZdVS_iwAFTo';

let isUpdatingExcel = false;
let pendingExcelUpdate = false;

/**
 * Re-generates Таблица_Заказов_Maison_Arome.xlsx with full formatting and latest orders
 */
export function triggerExcelUpdate(): void {
  if (isUpdatingExcel) {
    pendingExcelUpdate = true;
    return;
  }

  isUpdatingExcel = true;
  const child = spawn('python3', [EXCEL_SCRIPT], { cwd: ROOT, stdio: 'ignore' });

  child.on('close', () => {
    isUpdatingExcel = false;
    if (pendingExcelUpdate) {
      pendingExcelUpdate = false;
      triggerExcelUpdate();
    }
  });

  child.on('error', (err) => {
    console.warn('[EXCEL SYNC] Python script execution error:', err.message);
    isUpdatingExcel = false;
  });
}

/**
 * Sends order data to Google Apps Script Webhook if configured,
 * and updates the local Excel workbook automatically.
 */
export async function syncOrderToSpreadsheets(order: any): Promise<void> {
  // 1. Update local Excel file
  triggerExcelUpdate();

  // 2. If user configured a Google Apps Script Webhook URL in environment, post row directly
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId: GOOGLE_SHEET_ID,
          sheetGid: '943365437',
          orderNumber: order.orderNumber,
          date: order.createdAt || new Date().toISOString(),
          customerName: order.recipient?.fullName || order.customer_name || 'Покупатель',
          phone: order.recipient?.phone || order.customer_phone || '',
          telegram: order.recipient?.telegram || '',
          email: order.recipient?.email || order.customer_email || '',
          city: order.recipient?.city || '',
          deliveryMethod: order.deliveryMethod || '',
          address: order.recipient?.address || '',
          itemsSummary: (order.items || [])
            .map((i: any) => `${i.brand || ''} ${i.name || ''} (${i.volumeLabel || ''}) × ${i.quantity || 1}`)
            .join('; '),
          totalAmount: order.totalAmount || 0,
          discount: order.discount || 0,
          deliveryPrice: order.deliveryPrice || 0,
          isPaid: order.isPaid ? 'Да' : 'Нет',
          status: order.statusLabel || order.status || 'В сборке',
          comment: order.recipient?.comment || '',
        }),
      });
      if (!response.ok) {
        console.warn('[SHEETS SYNC] Webhook responded with status:', response.status);
      }
    } catch (err: any) {
      console.warn('[SHEETS SYNC] Could not push to Google Sheets Webhook:', err.message);
    }
  }
}
