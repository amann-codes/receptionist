from pymongo import MongoClient, ASCENDING
from pymongo.collection import Collection
from dotenv import load_dotenv
from functools import partial
import asyncio, os

load_dotenv()

MONGO_URI       = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME         = os.getenv("DB_NAME", "voiceagent")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "calls")

_client: MongoClient = None
_calls:  Collection  = None


def _get_collection_sync() -> Collection:
    """Sync init — called once, result cached globally."""
    global _client, _calls
    if _calls is not None:
        return _calls
    _client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000)
    db     = _client[DB_NAME]
    _calls = db[COLLECTION_NAME]
    # Indexes are idempotent — safe to call every cold start
    _calls.create_index("call_id",     unique=True, sparse=True)
    _calls.create_index("received_at")
    _calls.create_index("status")
    _calls.create_index("intent")
    print(f"[DB] Connected → {DB_NAME}.{COLLECTION_NAME}")
    return _calls


async def get_calls_collection() -> Collection:
    """
    Returns the collection, initialising on first call.
    Runs sync pymongo init in a thread so it doesn't block the event loop.
    """
    global _calls
    if _calls is not None:
        return _calls
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _get_collection_sync)
    return _calls


def run_sync(fn, *args, **kwargs):
    """
    Helper: run a sync pymongo call in a thread pool from async context.
    Usage:  result = await run_sync(collection.find_one, {"call_id": x})
    """
    loop = asyncio.get_event_loop()
    return loop.run_in_executor(None, partial(fn, *args, **kwargs))


# No-ops kept for compatibility if anything still imports them
async def connect():    await get_calls_collection()
async def disconnect(): pass