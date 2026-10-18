import os
import json
import sqlite3
from datetime import datetime
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
EXCEL_PATH = os.path.join(ROOT, 'Таблица_Заказов_Maison_Arome.xlsx')
DB_PATH = os.path.join(ROOT, 'data', 'maison.db')
if not os.path.exists(DB_PATH):
    DB_PATH = os.path.join(ROOT, 'data', 'maison_arome.db')

# 1. Fetch current orders and users from SQLite DB
orders = []
if os.path.exists(DB_PATH):
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM orders ORDER BY created_at DESC")
        for row in cur.fetchall():
            o = dict(row)
            try:
                raw_items = o.get('items_json') or o.get('items')
                o['items'] = json.loads(raw_items) if isinstance(raw_items, str) else (raw_items or [])
            except:
                o['items'] = []
            try:
                raw_rec = o.get('recipient_json') or o.get('recipient')
                o['recipient'] = json.loads(raw_rec) if isinstance(raw_rec, str) else (raw_rec or {})
            except:
                o['recipient'] = {}
            orders.append(o)
        conn.close()
    except Exception as e:
        print(f"Error reading DB: {e}")

# If DB had fewer than a few demo orders, add realistic template entries
if len(orders) < 5:
    demo_samples = [
        {
            'order_number': 'PD-94102',
            'created_at': '2026-10-15T14:30:00.000Z',
            'recipient': {
                'fullName': 'Александра Воронова',
                'phone': '+7 (916) 432-88-19',
                'telegram': '@alex_voronova',
                'email': 'alex.v@yandex.ru',
                'city': 'Москва (1–2 дня)',
                'address': 'ПВЗ СДЭК: ул. Тверская, д. 9, стр. 1',
                'comment': 'Положите, пожалуйста, пробник Ganymede'
            },
            'items': [
                {'name': 'Byredo Bal d\'Afrique', 'volumeLabel': '10 мл (отливант)', 'quantity': 1, 'price': 2490},
                {'name': 'Kilian Angels\' Share', 'volumeLabel': '5 мл (отливант)', 'quantity': 1, 'price': 2890}
            ],
            'total_amount': 5380,
            'discount': 500,
            'delivery_price': 0,
            'delivery_method': 'СДЭК ПВЗ (Бесплатно от 5000 ₽)',
            'status': 'shipped',
            'status_label': 'Отправлен СДЭК',
            'tracking_number': '1589304120',
            'is_paid': 1
        },
        {
            'order_number': 'PD-93881',
            'created_at': '2026-10-15T11:15:00.000Z',
            'recipient': {
                'fullName': 'Дмитрий Соколов',
                'phone': '+7 (921) 890-11-22',
                'telegram': '@sokolov_d',
                'email': 'sokolov.spb@mail.ru',
                'city': 'Санкт-Петербург (2–3 дня)',
                'address': 'ПВЗ Яндекс Маркет: Невский пр-т, 54',
                'comment': 'Срочная доставка к субботе'
            },
            'items': [
                {'name': 'Marc-Antoine Barrois Ganymede', 'volumeLabel': '30 мл (отливант)', 'quantity': 1, 'price': 6950},
                {'name': 'Xerjoff Erba Pura', 'volumeLabel': '5 мл (отливант)', 'quantity': 1, 'price': 1790}
            ],
            'total_amount': 8740,
            'discount': 0,
            'delivery_price': 0,
            'delivery_method': 'Яндекс Доставка ПВЗ',
            'status': 'in_transit',
            'status_label': 'В пути',
            'tracking_number': 'YD-98310024',
            'is_paid': 0
        },
        {
            'order_number': 'PD-92714',
            'created_at': '2026-10-14T09:45:00.000Z',
            'recipient': {
                'fullName': 'Екатерина Мельникова',
                'phone': '+7 (903) 771-44-55',
                'telegram': '@katya_mel',
                'email': 'katya@gmail.com',
                'city': 'Казань (2–4 дня)',
                'address': 'ПВЗ Ozon: ул. Баумана, 28',
                'comment': 'Подарочная упаковка с лентой'
            },
            'items': [
                {'name': 'Parfums de Marly Delina', 'volumeLabel': '10 мл (отливант)', 'quantity': 1, 'price': 3150},
                {'name': 'Initio Oud for Greatness', 'volumeLabel': '3 мл (отливант)', 'quantity': 1, 'price': 1450}
            ],
            'total_amount': 4600,
            'discount': 0,
            'delivery_price': 350,
            'delivery_method': 'Ozon ПВЗ',
            'status': 'delivered',
            'status_label': 'Доставлен и вручен',
            'tracking_number': 'OZ-4409124',
            'is_paid': 1
        }
    ]
    for sample in demo_samples:
        orders.append(sample)

# 2. Create Workbook
wb = openpyxl.Workbook()

# Style definitions
font_title = Font(name='Arial', size=14, bold=True, color='FFFFFF')
font_subtitle = Font(name='Arial', size=9, italic=True, color='D4D4D8')
font_header = Font(name='Arial', size=10, bold=True, color='FFFFFF')
font_data = Font(name='Arial', size=9, color='18181B')
font_bold = Font(name='Arial', size=9, bold=True, color='18181B')
font_summary_val = Font(name='Arial', size=16, bold=True, color='18181B')
font_summary_lbl = Font(name='Arial', size=9, bold=True, color='71717A')

fill_banner = PatternFill(start_color='18181B', end_color='18181B', fill_type='solid') # Luxury Dark
fill_header = PatternFill(start_color='27272A', end_color='27272A', fill_type='solid')
fill_accent = PatternFill(start_color='D97706', end_color='D97706', fill_type='solid') # Gold Amber
fill_zebra = PatternFill(start_color='F8FAFC', end_color='F8FAFC', fill_type='solid')
fill_white = PatternFill(start_color='FFFFFF', end_color='FFFFFF', fill_type='solid')
fill_kpi = PatternFill(start_color='F4F4F5', end_color='F4F4F5', fill_type='solid')
fill_paid = PatternFill(start_color='DCFCE7', end_color='DCFCE7', fill_type='solid')
fill_prepaid = PatternFill(start_color='FEF3C7', end_color='FEF3C7', fill_type='solid')
fill_wait = PatternFill(start_color='FEE2E2', end_color='FEE2E2', fill_type='solid')

thin_gray = Side(style='thin', color='E4E4E7')
border_cell = Border(left=thin_gray, right=thin_gray, top=thin_gray, bottom=thin_gray)
border_bottom_double = Border(bottom=Side(style='double', color='18181B'), top=thin_gray, left=thin_gray, right=thin_gray)

align_center = Alignment(horizontal='center', vertical='center')
align_left = Alignment(horizontal='left', vertical='center')
align_right = Alignment(horizontal='right', vertical='center')
align_wrap = Alignment(horizontal='left', vertical='center', wrap_text=True)

# ==============================================================
# SHEET 1: ЗАКАЗЫ (Orders log)
# ==============================================================
ws_orders = wb.active
ws_orders.title = "Журнал заказов"
ws_orders.views.sheetView[0].showGridLines = True

# Title banner
ws_orders.merge_cells('A1:T1')
ws_orders['A1'] = "MAISON D'ARÔME — СИСТЕМА УПРАВЛЕНИЯ ЗАКАЗАМИ ПАРФЮМЕРИИ И РАСПИВОВ"
ws_orders['A1'].font = font_title
ws_orders['A1'].fill = fill_banner
ws_orders['A1'].alignment = Alignment(horizontal='left', vertical='center', indent=1)
ws_orders.row_dimensions[1].height = 36

ws_orders.merge_cells('A2:T2')
ws_orders['A2'] = "Автоматизированная таблица заказов: расчет предоплаты 30%, контроль статусов СДЭК/Яндекс, состав позиций и данные клиентов"
ws_orders['A2'].font = font_subtitle
ws_orders['A2'].fill = fill_header
ws_orders['A2'].alignment = Alignment(horizontal='left', vertical='center', indent=1)
ws_orders.row_dimensions[2].height = 20

# Column headers
headers_orders = [
    ("№ Заказа", 12),
    ("Дата и время", 16),
    ("ФИО Клиента", 24),
    ("Телефон", 18),
    ("Telegram / Мессенджер", 20),
    ("Город доставки", 20),
    ("Служба доставки", 22),
    ("Адрес ПВЗ / доставки", 32),
    ("Состав заказа (аромат, объем, шт)", 38),
    ("Сумма товаров, ₽", 16),
    ("Скидка / Баллы, ₽", 16),
    ("Доставка, ₽", 14),
    ("ИТОГО к оплате, ₽", 18),
    ("Предоплата 30%, ₽", 18),
    ("Остаток при вручении, ₽", 22),
    ("Статус оплаты", 18),
    ("Статус заказа", 20),
    ("Трек-номер", 18),
    ("Источник", 14),
    ("Комментарий / Примечание", 28)
]

for col_idx, (h_name, width) in enumerate(headers_orders, start=1):
    cell = ws_orders.cell(row=3, column=col_idx, value=h_name)
    cell.font = font_header
    cell.fill = fill_header
    cell.alignment = align_center
    cell.border = border_cell
    col_letter = get_column_letter(col_idx)
    ws_orders.column_dimensions[col_letter].width = width

ws_orders.row_dimensions[3].height = 28

# Populate orders data
start_row = 4
for i, o in enumerate(orders):
    curr_row = start_row + i
    rec = o.get('recipient') or {}
    items = o.get('items') or []
    
    # Items string
    items_desc = []
    for it in items:
        name = it.get('name') or it.get('brand') or 'Парфюм'
        vol = it.get('volumeLabel') or f"{it.get('volumeMl', '')} мл"
        qty = it.get('quantity') or 1
        items_desc.append(f"{name} ({vol}) × {qty}")
    items_str = "; ".join(items_desc) if items_desc else "Парфюмерия"

    # Dates
    dt_str = o.get('created_at') or o.get('createdAt') or o.get('date') or ''
    if dt_str:
        try:
            dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
            dt_display = dt.strftime('%d.%m.%Y %H:%M')
        except:
            dt_display = dt_str[:16]
    else:
        dt_display = datetime.now().strftime('%d.%m.%Y %H:%M')

    tot = o.get('total_amount') or o.get('totalAmount') or 0
    disc = o.get('discount') or 0
    deliv = o.get('delivery_price') or o.get('deliveryPrice') or 0
    subtot = tot - deliv + disc

    # Payment status
    is_p = o.get('is_paid') or o.get('isPaid')
    pay_status = "Оплачен 100%" if is_p else "Предоплата 30% внесена"

    # Write cells
    ws_orders.cell(row=curr_row, column=1, value=o.get('order_number') or o.get('orderNumber') or f"PD-{curr_row}").alignment = align_center
    ws_orders.cell(row=curr_row, column=2, value=dt_display).alignment = align_center
    ws_orders.cell(row=curr_row, column=3, value=rec.get('fullName') or 'Клиент').alignment = align_left
    ws_orders.cell(row=curr_row, column=4, value=rec.get('phone') or '').alignment = align_center
    ws_orders.cell(row=curr_row, column=5, value=rec.get('telegram') or '').alignment = align_left
    ws_orders.cell(row=curr_row, column=6, value=rec.get('city') or 'Москва').alignment = align_left
    ws_orders.cell(row=curr_row, column=7, value=o.get('delivery_method') or o.get('deliveryMethod') or 'СДЭК ПВЗ').alignment = align_left
    ws_orders.cell(row=curr_row, column=8, value=rec.get('address') or '').alignment = align_wrap
    ws_orders.cell(row=curr_row, column=9, value=items_str).alignment = align_wrap
    
    # Financials (with formulas)
    cell_sub = ws_orders.cell(row=curr_row, column=10, value=subtot)
    cell_sub.number_format = '#,##0 "₽"'
    cell_sub.alignment = align_right

    cell_disc = ws_orders.cell(row=curr_row, column=11, value=disc)
    cell_disc.number_format = '#,##0 "₽"'
    cell_disc.alignment = align_right

    cell_del = ws_orders.cell(row=curr_row, column=12, value=deliv)
    cell_del.number_format = '#,##0 "₽"'
    cell_del.alignment = align_right

    # Formula for Total: =J{row} - K{row} + L{row}
    cell_tot = ws_orders.cell(row=curr_row, column=13, value=f"=J{curr_row}-K{curr_row}+L{curr_row}")
    cell_tot.number_format = '#,##0 "₽"'
    cell_tot.font = font_bold
    cell_tot.alignment = align_right

    # Formula for 30% prepayment: =ROUND(M{row}*0.3, 0)
    cell_prep = ws_orders.cell(row=curr_row, column=14, value=f"=ROUND(M{curr_row}*0.3, 0)")
    cell_prep.number_format = '#,##0 "₽"'
    cell_prep.alignment = align_right

    # Formula for remaining: =M{row} - N{row}
    cell_rem = ws_orders.cell(row=curr_row, column=15, value=f"=M{curr_row}-N{curr_row}")
    cell_rem.number_format = '#,##0 "₽"'
    cell_rem.alignment = align_right

    cell_pay = ws_orders.cell(row=curr_row, column=16, value=pay_status)
    cell_pay.alignment = align_center
    if is_p:
        cell_pay.fill = fill_paid
    else:
        cell_pay.fill = fill_prepaid

    status_name = o.get('status_label') or o.get('statusLabel') or o.get('status') or 'В сборке'
    ws_orders.cell(row=curr_row, column=17, value=status_name).alignment = align_center
    ws_orders.cell(row=curr_row, column=18, value=o.get('tracking_number') or o.get('trackingNumber') or '—').alignment = align_center
    ws_orders.cell(row=curr_row, column=19, value="Сайт").alignment = align_center
    ws_orders.cell(row=curr_row, column=20, value=rec.get('comment') or '').alignment = align_wrap

    # Apply zebra row background and borders
    fill_row = fill_zebra if i % 2 == 1 else fill_white
    for col_c in range(1, 21):
        c = ws_orders.cell(row=curr_row, column=col_c)
        c.font = font_bold if col_c in [1, 13] else font_data
        c.border = border_cell
        if col_c != 16: # preserve payment status color
            c.fill = fill_row

    ws_orders.row_dimensions[curr_row].height = 24

# Total summary row at bottom
last_order_row = start_row + len(orders) - 1
sum_row = last_order_row + 1

ws_orders.cell(row=sum_row, column=1, value="ИТОГО:").font = Font(name='Arial', size=10, bold=True, color='18181B')
ws_orders.cell(row=sum_row, column=1).alignment = align_center

for c_idx in range(1, 21):
    c = ws_orders.cell(row=sum_row, column=c_idx)
    c.border = border_bottom_double
    c.fill = PatternFill(start_color='E4E4E7', end_color='E4E4E7', fill_type='solid')

# Formulas for totals
ws_orders.cell(row=sum_row, column=10, value=f"=SUM(J{start_row}:J{last_order_row})").number_format = '#,##0 "₽"'
ws_orders.cell(row=sum_row, column=10).font = font_bold
ws_orders.cell(row=sum_row, column=11, value=f"=SUM(K{start_row}:K{last_order_row})").number_format = '#,##0 "₽"'
ws_orders.cell(row=sum_row, column=11).font = font_bold
ws_orders.cell(row=sum_row, column=12, value=f"=SUM(L{start_row}:L{last_order_row})").number_format = '#,##0 "₽"'
ws_orders.cell(row=sum_row, column=12).font = font_bold
ws_orders.cell(row=sum_row, column=13, value=f"=SUM(M{start_row}:M{last_order_row})").number_format = '#,##0 "₽"'
ws_orders.cell(row=sum_row, column=13).font = font_bold
ws_orders.cell(row=sum_row, column=14, value=f"=SUM(N{start_row}:N{last_order_row})").number_format = '#,##0 "₽"'
ws_orders.cell(row=sum_row, column=14).font = font_bold
ws_orders.cell(row=sum_row, column=15, value=f"=SUM(O{start_row}:O{last_order_row})").number_format = '#,##0 "₽"'
ws_orders.cell(row=sum_row, column=15).font = font_bold
ws_orders.row_dimensions[sum_row].height = 26

# Enable auto-filter on table headers
ws_orders.auto_filter.ref = f"A3:T{last_order_row}"
ws_orders.freeze_panes = 'C4'


# ==============================================================
# SHEET 2: КЛИЕНТСКАЯ БАЗА (LTV & Loyalty)
# ==============================================================
ws_clients = wb.create_sheet(title="Клиентская база")
ws_clients.views.sheetView[0].showGridLines = True

ws_clients.merge_cells('A1:I1')
ws_clients['A1'] = "БАЗА КЛИЕНТОВ И СИСТЕМА ЛОЯЛЬНОСТИ MAISON D'ARÔME"
ws_clients['A1'].font = font_title
ws_clients['A1'].fill = fill_banner
ws_clients['A1'].alignment = Alignment(horizontal='left', vertical='center', indent=1)
ws_clients.row_dimensions[1].height = 36

headers_clients = [
    ("ID Клиента", 16),
    ("ФИО Клиента", 26),
    ("Телефон", 18),
    ("Telegram", 18),
    ("Основной город", 20),
    ("Всего заказов", 16),
    ("Общий оборот LTV, ₽", 22),
    ("Уровень программы лояльности", 26),
    ("Бонусный баланс, ₽", 20)
]

for col_idx, (h_name, width) in enumerate(headers_clients, start=1):
    c = ws_clients.cell(row=2, column=col_idx, value=h_name)
    c.font = font_header
    c.fill = fill_header
    c.alignment = align_center
    c.border = border_cell
    col_letter = get_column_letter(col_idx)
    ws_clients.column_dimensions[col_letter].width = width

ws_clients.row_dimensions[2].height = 26

# Aggregate clients from orders
clients_map = {}
for o in orders:
    rec = o.get('recipient') or {}
    phone = rec.get('phone') or 'Не указан'
    if phone not in clients_map:
        clients_map[phone] = {
            'id': o.get('user_id') or o.get('userId') or f"USR-{len(clients_map)+1:03d}",
            'name': rec.get('fullName') or 'Покупатель',
            'phone': phone,
            'telegram': rec.get('telegram') or '—',
            'city': rec.get('city') or 'Москва',
            'orders_count': 0,
            'total_spent': 0,
            'balance': 500
        }
    clients_map[phone]['orders_count'] += 1
    clients_map[phone]['total_spent'] += (o.get('total_amount') or o.get('totalAmount') or 0)

for idx, (phone, cl) in enumerate(clients_map.items(), start=3):
    cnt = cl['orders_count']
    if cnt >= 15:
        tier_label = "VIP Privilège (10% кэшбэк)"
        tier_fill = PatternFill(start_color='FEF3C7', end_color='FEF3C7', fill_type='solid') # Gold VIP
    elif cnt >= 5:
        tier_label = "Постоянный клиент (7% кэшбэк)"
        tier_fill = PatternFill(start_color='E0E7FF', end_color='E0E7FF', fill_type='solid') # Blue
    else:
        tier_label = "Базовый уровень (5% кэшбэк)"
        tier_fill = fill_white

    ws_clients.cell(row=idx, column=1, value=cl['id']).alignment = align_center
    ws_clients.cell(row=idx, column=2, value=cl['name']).alignment = align_left
    ws_clients.cell(row=idx, column=3, value=cl['phone']).alignment = align_center
    ws_clients.cell(row=idx, column=4, value=cl['telegram']).alignment = align_left
    ws_clients.cell(row=idx, column=5, value=cl['city']).alignment = align_left
    ws_clients.cell(row=idx, column=6, value=cnt).alignment = align_center

    c_ltv = ws_clients.cell(row=idx, column=7, value=cl['total_spent'])
    c_ltv.number_format = '#,##0 "₽"'
    c_ltv.font = font_bold
    c_ltv.alignment = align_right

    c_tier = ws_clients.cell(row=idx, column=8, value=tier_label)
    c_tier.alignment = align_center
    c_tier.fill = tier_fill

    c_bon = ws_clients.cell(row=idx, column=9, value=cl['balance'])
    c_bon.number_format = '#,##0 "₽"'
    c_bon.alignment = align_right

    for c_i in range(1, 10):
        ws_clients.cell(row=idx, column=c_i).border = border_cell
        if c_i != 8 and idx % 2 == 0:
            ws_clients.cell(row=idx, column=c_i).fill = fill_zebra

    ws_clients.row_dimensions[idx].height = 22

ws_clients.freeze_panes = 'A3'


# ==============================================================
# SHEET 3: СВОДКА И KPI (Analytics)
# ==============================================================
ws_kpi = wb.create_sheet(title="Сводка и Аналитика")
ws_kpi.views.sheetView[0].showGridLines = True

ws_kpi.merge_cells('A1:F1')
ws_kpi['A1'] = "ФИНАНСОВО-ОПЕРАЦИОННЫЙ ДАШБОРД MAISON D'ARÔME"
ws_kpi['A1'].font = font_title
ws_kpi['A1'].fill = fill_banner
ws_kpi['A1'].alignment = Alignment(horizontal='left', vertical='center', indent=1)
ws_kpi.row_dimensions[1].height = 36

# KPI Card metrics
kpis = [
    ("Всего оформлено заказов", "=COUNTA('Журнал заказов'!A4:A100)", "шт", "A3", "B4"),
    ("Общий оборот заказов (Gross)", "=SUM('Журнал заказов'!M4:M100)", "₽", "C3", "D4"),
    ("Получено предоплат (30%)", "=SUM('Журнал заказов'!N4:N100)", "₽", "E3", "F4"),
    ("Остаток к получению в ПВЗ", "=SUM('Журнал заказов'!O4:O100)", "₽", "A6", "B7"),
    ("Средний чек заказа", "=AVERAGE('Журнал заказов'!M4:M100)", "₽", "C6", "D7"),
    ("Клиентов в базе", "=COUNTA('Клиентская база'!A3:A100)", "чел", "E6", "F7"),
]

for title, formula, unit, top_left, bottom_right in kpis:
    col_start = ord(top_left[0]) - ord('A') + 1
    row_start = int(top_left[1])
    col_end = ord(bottom_right[0]) - ord('A') + 1
    row_end = int(bottom_right[1])

    ws_kpi.merge_cells(f"{top_left}:{chr(ord('A') + col_end - 1)}{row_start}")
    cell_lbl = ws_kpi.cell(row=row_start, column=col_start, value=title.upper())
    cell_lbl.font = font_summary_lbl
    cell_lbl.fill = fill_kpi
    cell_lbl.alignment = align_center

    ws_kpi.merge_cells(f"{chr(ord('A') + col_start - 1)}{row_end}:{bottom_right}")
    cell_val = ws_kpi.cell(row=row_end, column=col_start, value=formula)
    cell_val.font = font_summary_val
    cell_val.fill = fill_kpi
    cell_val.alignment = align_center
    if unit == '₽':
        cell_val.number_format = '#,##0 "₽"'
    else:
        cell_val.number_format = '#,##0'

    for r in range(row_start, row_end + 1):
        for c in range(col_start, col_end + 1):
            ws_kpi.cell(row=r, column=c).border = border_cell

for col_l in ['A', 'B', 'C', 'D', 'E', 'F']:
    ws_kpi.column_dimensions[col_l].width = 16


# ==============================================================
# SHEET 4: СПРАВОЧНИКИ (Settings & Lookups)
# ==============================================================
ws_ref = wb.create_sheet(title="Справочники")
ws_ref.views.sheetView[0].showGridLines = True

ws_ref.cell(row=1, column=1, value="Статусы заказов").font = font_header
ws_ref.cell(row=1, column=1).fill = fill_header
ws_ref.column_dimensions['A'].width = 24

statuses = [
    "Новый (ожидает сборки)",
    "В сборке на складе",
    "Передан курьеру / в СДЭК",
    "В пути в город назначения",
    "Доставлен в ПВЗ",
    "Вручен клиенту",
    "Отменен"
]
for i, s in enumerate(statuses, start=2):
    c = ws_ref.cell(row=i, column=1, value=s)
    c.border = border_cell
    c.font = font_data

ws_ref.cell(row=1, column=3, value="Службы доставки").font = font_header
ws_ref.cell(row=1, column=3).fill = fill_header
ws_ref.column_dimensions['C'].width = 28

deliveries = [
    "СДЭК Доставка (ПВЗ)",
    "Яндекс Доставка (ПВЗ)",
    "Ozon Доставка (ПВЗ)",
    "Курьер СДЭК до двери",
    "Курьер Яндекс Доставка"
]
for i, d in enumerate(deliveries, start=2):
    c = ws_ref.cell(row=i, column=3, value=d)
    c.border = border_cell
    c.font = font_data

ws_ref.cell(row=1, column=5, value="Объемы распивов").font = font_header
ws_ref.cell(row=1, column=5).fill = fill_header
ws_ref.column_dimensions['E'].width = 24

volumes = [
    "1 мл (пробник)",
    "2 мл (отливант)",
    "3 мл (отливант)",
    "5 мл (отливант)",
    "10 мл (отливант)",
    "15 мл (отливант)",
    "20 мл (отливант)",
    "30 мл (отливант)",
    "50 мл (полный флакон)",
    "100 мл (полный флакон)"
]
for i, v in enumerate(volumes, start=2):
    c = ws_ref.cell(row=i, column=5, value=v)
    c.border = border_cell
    c.font = font_data

# Save file
wb.save(EXCEL_PATH)
print(f"Excel workbook successfully created at: {EXCEL_PATH}")
