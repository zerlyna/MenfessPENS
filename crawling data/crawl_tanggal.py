import csv
import asyncio
from datetime import datetime, timedelta, timezone
from telethon import TelegramClient
from telethon.errors import FloodWaitError

# ====== ISI BAGIAN INI ======
API_ID = 32812582           # angka api_id (tanpa tanda kutip)
API_HASH = '170c5de61b0316f237ff51fb2c87add8'
GROUP_TARGET = -1001647181983  # PENS MENFESS

# Rentang tanggal (format: 'TAHUN-BULAN-TANGGAL'), dihitung dalam WIB.
# Tanggal akhir ikut diambil (inklusif sampai pukul 23:59 WIB).
TANGGAL_MULAI = '2026-08-01'
TANGGAL_AKHIR = '2026-08-31'

OUTPUT_FILE = 'telegram_menfess_agustus.csv'
# =============================

WIB = timezone(timedelta(hours=7))

# Batas waktu dalam WIB, lalu diubah ke UTC (Telegram menyimpan waktu UTC)
mulai = datetime.strptime(TANGGAL_MULAI, '%Y-%m-%d').replace(tzinfo=WIB)
akhir = (datetime.strptime(TANGGAL_AKHIR, '%Y-%m-%d') + timedelta(days=1)).replace(tzinfo=WIB)
mulai_utc = mulai.astimezone(timezone.utc)
akhir_utc = akhir.astimezone(timezone.utc)

client = TelegramClient('sesi_grup_crawling', API_ID, API_HASH)


def get_username(sender):
    return getattr(sender, 'username', None) or 'Anonymous'


def ke_wib(dt):
    return dt.astimezone(WIB).strftime('%Y-%m-%d %H:%M:%S')

async def main():
    print(f"Mengambil Main_Post dari {TANGGAL_MULAI} sampai {TANGGAL_AKHIR} (WIB)...")
    jumlah = 0
    dilewati = 0

    with open(OUTPUT_FILE, mode='w', encoding='utf-8-sig', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['Message_ID', 'Type', 'Sender_ID',
                         'Username', 'Date_WIB', 'Text'])

        async for message in client.iter_messages(GROUP_TARGET, offset_date=akhir_utc):
            if message.date < mulai_utc:
                break

            # Lewati semua balasan, ambil hanya postingan utama
            if message.reply_to:
                dilewati += 1
                continue

            sender = await message.get_sender()

            writer.writerow([
                message.id, 'Main_Post',
                message.sender_id, get_username(sender),
                ke_wib(message.date), message.text
            ])
            jumlah += 1

    print(f"Selesai! {jumlah} Main_Post disimpan ke '{OUTPUT_FILE}' ({dilewati} balasan dilewati)")

with client:
    client.loop.run_until_complete(main())