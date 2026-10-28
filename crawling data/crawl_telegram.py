import csv
import asyncio
from telethon import TelegramClient
from telethon.errors import FloodWaitError

# ====== ISI BAGIAN INI ======
API_ID = 36732928                  # angka api_id dari my.telegram.org (tanpa tanda kutip)
API_HASH = 'b4bef4eac74871ec0b62aa0ee57ff928'       # api_hash (string)
GROUP_TARGET = -1001748982141  # ID grup (integer), bukan username
LIMIT = 500                     # uji coba 50 dulu, lalu naikkan (mis. 500)
OUTPUT_FILE = 'telegramchatdiscuss.csv'
# =============================

client = TelegramClient('sesi_grup_crawling', API_ID, API_HASH)


def get_username(sender):
    return getattr(sender, 'username', None) or 'Anonymous'


async def main():
    print("Memulai proses crawling...")

    with open(OUTPUT_FILE, mode='w', encoding='utf-8-sig', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['Message_ID', 'Type', 'Reply_To_Msg_ID',
                         'Sender_ID', 'Username', 'Date', 'Text'])

        async for message in client.iter_messages(GROUP_TARGET, limit=LIMIT):
            sender = await message.get_sender()

            msg_type = 'Main_Post' if not message.reply_to else 'Reply_To_Thread'
            reply_to_id = message.reply_to.reply_to_msg_id if message.reply_to else 'None'

            writer.writerow([
                message.id, msg_type, reply_to_id,
                message.sender_id, get_username(sender),
                message.date, message.text
            ])

            # Komentar (hanya ada di channel yang punya grup diskusi)
            if message.replies and message.replies.replies > 0:
                print(f"Mengambil {message.replies.replies} komentar dari Message ID: {message.id}...")
                try:
                    async for reply in client.iter_messages(GROUP_TARGET, reply_to=message.id):
                        reply_sender = await reply.get_sender()
                        writer.writerow([
                            reply.id, 'Comment', message.id,
                            reply.sender_id, get_username(reply_sender),
                            reply.date, reply.text
                        ])
                except FloodWaitError as e:
                    print(f"Kena limit Telegram, menunggu {e.seconds} detik...")
                    await asyncio.sleep(e.seconds)
                except Exception as e:
                    print(f"Gagal mengambil komentar untuk pesan {message.id}: {e}")

    print(f"Selesai! Data disimpan ke '{OUTPUT_FILE}'")


with client:
    client.loop.run_until_complete(main())
