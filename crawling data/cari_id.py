from telethon import TelegramClient

API_ID = 32812582           # isi api_id
API_HASH = '170c5de61b0316f237ff51fb2c87add8'

client = TelegramClient('sesi_grup_crawling', API_ID, API_HASH)

async def main():
    async for dialog in client.iter_dialogs():
        print(dialog.id, '|', dialog.name)

with client:
    client.loop.run_until_complete(main())