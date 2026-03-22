from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI       = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME         = os.getenv("DB_NAME", "voiceagent")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "calls")

_client = None
calls   = None


async def get_calls_collection():
    """
    Lazy connection — initialises on first call, reuses after.
    Works in both serverless (Vercel) and long-running (Railway/Render) environments.
    """
    global _client, calls

    if calls is not None:
        return calls

    _client = AsyncIOMotorClient(
        MONGO_URI,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000,
    )
    _db   = _client[DB_NAME]
    calls = _db[COLLECTION_NAME]

    await calls.create_index("call_id",     unique=True, sparse=True)
    await calls.create_index("received_at")
    await calls.create_index("status")
    await calls.create_index("intent")

    print(f"[DB] Connected → {DB_NAME}.{COLLECTION_NAME}")
    return calls


# Keep these for backward compat with lifespan — they become no-ops on Vercel
async def connect():
    await get_calls_collection()

async def disconnect():
    global _client, calls
    if _client:
        _client.close()
        _client = None
        calls   = None
        print("[DB] Disconnected")