from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI       = os.getenv("MONGO_URI")
DB_NAME         = os.getenv("DB_NAME", "voiceagent")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "calls")

client = None
db     = None
calls  = None


async def connect():
    global client, db, calls
    client = AsyncIOMotorClient(
        MONGO_URI,
        serverSelectionTimeoutMS=5000,   # fail fast instead of 30s hang
        connectTimeoutMS=5000,
    )

    # Verify connection before proceeding (raises immediately if unreachable)
    await client.admin.command("ping")

    db    = client[DB_NAME]
    calls = db[COLLECTION_NAME]

    # motor's create_index IS async-safe — must be awaited
    await calls.create_index("call_id",    unique=True, sparse=True)
    await calls.create_index("received_at")
    await calls.create_index("status")
    await calls.create_index("intent")

    print(f"[DB] Connected → {DB_NAME}.{COLLECTION_NAME}")


async def disconnect():
    global client
    if client:
        client.close()
        print("[DB] Disconnected")
