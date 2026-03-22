from fastapi import FastAPI, Request, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
from typing import Optional
import os, json

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from database import get_calls_collection, run_sync
from models import StatusUpdate, NotesUpdate
from auth import auth_router, require_auth

limiter = Limiter(key_func=get_remote_address)
RATE_WEBHOOK = os.getenv("RATE_LIMIT_WEBHOOK", "30/minute")
RATE_API     = os.getenv("RATE_LIMIT_API",     "120/minute")

app = FastAPI(title="Receptionist API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.include_router(auth_router)


def parse_args(raw) -> dict:
    if isinstance(raw, str):
        try:    return json.loads(raw)
        except: return {}
    return raw or {}


def extract_transcript(message: dict) -> list:
    turns = []
    for m in message.get("artifact", {}).get("messages", []):
        role = m.get("role")
        text = m.get("message", "").strip()
        if role in ("user", "bot") and text:
            turns.append({"role": role, "text": text, "time": m.get("secondsFromStart")})
    return turns


# ══════════════════════════════════════════════════════════════════════════════
#  VAPI WEBHOOK
# ══════════════════════════════════════════════════════════════════════════════
@app.post("/webhook")
@limiter.limit(RATE_WEBHOOK)
async def vapi_webhook(request: Request):
    try:
        body = await request.body()
        if not body:
            return {"status": "empty_body"}

        data     = json.loads(body)
        message  = data.get("message", {})
        msg_type = message.get("type")
        print(f"[Webhook] type={msg_type}")

        if msg_type == "tool-calls":
            call_id = (
                message.get("chat", {}).get("id")
                or message.get("call", {}).get("id")
                or data.get("chat", {}).get("id")
                or data.get("call", {}).get("id")
            )
            assistant_name = message.get("assistant", {}).get("name")
            caller_number  = (
                message.get("call", {}).get("customer", {}).get("number")
                if message.get("call") else None
            )

            for tool_call in message.get("toolCalls", []):
                fn   = tool_call.get("function", {})
                args = parse_args(fn.get("arguments", {}))
                if fn.get("name") != "record_call_details":
                    continue

                resolved_id = (
                    call_id
                    or tool_call.get("id")
                    or f"call_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')}"
                )

                doc = {
                    "call_id":          resolved_id,
                    "received_at":      datetime.now(timezone.utc).isoformat(),
                    "caller_name":      args.get("caller_name") or "Unknown",
                    "intent":           args.get("intent") or args.get("intend") or "other",
                    "message":          args.get("message", ""),
                    "summary":          args.get("summary", ""),
                    "agent_name":       assistant_name,
                    "caller_number":    caller_number,
                    "transcript":       extract_transcript(message),
                    "status":           "unread",
                    "notes":            None,
                    "duration_seconds": None,
                }

                col    = await get_calls_collection()
                result = await run_sync(
                    col.update_one,
                    {"call_id": resolved_id},
                    {"$setOnInsert": doc},
                    upsert=True,
                )

                label = "NEW" if result.upserted_id else "DUPE"
                print(f"[Webhook] {label} → {doc['caller_name']} / {doc['intent']} / {resolved_id}")

                return {"results": [{"toolCallId": tool_call.get("id"), "result": "Information saved."}]}

        elif msg_type == "end-of-call-report":
            call_id = (
                message.get("chat", {}).get("id")
                or message.get("call", {}).get("id")
                or data.get("chat", {}).get("id")
                or data.get("call", {}).get("id")
            )
            duration = message.get("durationSeconds")
            if call_id and duration is not None:
                col = await get_calls_collection()
                await run_sync(col.update_one, {"call_id": call_id}, {"$set": {"duration_seconds": int(duration)}})
                print(f"[Webhook] duration={duration}s → {call_id}")

        return {"status": "ok"}

    except Exception as e:
        import traceback; traceback.print_exc()
        return {"status": "error", "message": str(e)}


# ══════════════════════════════════════════════════════════════════════════════
#  CALLS
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/api/calls")
@limiter.limit(RATE_API)
async def get_calls(
    request: Request,
    intent: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page:   int           = Query(1, ge=1),
    limit:  int           = Query(50, ge=1, le=200),
    _user:  str           = Depends(require_auth),
):
    query: dict = {}
    if intent and intent != "all":
        query["status" if intent in ("unread","actioned","read") else "intent"] = intent
    if status:
        query["status"] = status
    if search:
        query["$or"] = [
            {"caller_name":   {"$regex": search, "$options": "i"}},
            {"message":       {"$regex": search, "$options": "i"}},
            {"summary":       {"$regex": search, "$options": "i"}},
            {"caller_number": {"$regex": search, "$options": "i"}},
        ]

    col   = await get_calls_collection()
    total = await run_sync(col.count_documents, query)

    def _fetch():
        return list(
            col.find(query, {"_id": 0})
               .sort("received_at", -1)
               .skip((page - 1) * limit)
               .limit(limit)
        )

    import asyncio
    docs = await asyncio.get_event_loop().run_in_executor(None, _fetch)
    return {"calls": docs, "total": total, "page": page, "limit": limit}


@app.get("/api/calls/{call_id}")
@limiter.limit(RATE_API)
async def get_call(request: Request, call_id: str, _user: str = Depends(require_auth)):
    col = await get_calls_collection()
    doc = await run_sync(col.find_one, {"call_id": call_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Call not found")
    return doc


@app.patch("/api/calls/{call_id}/status")
@limiter.limit(RATE_API)
async def update_status(
    request: Request, call_id: str, body: StatusUpdate, _user: str = Depends(require_auth)
):
    if body.status not in ("unread", "read", "actioned"):
        raise HTTPException(400, "status must be unread | read | actioned")
    col = await get_calls_collection()
    res = await run_sync(col.update_one, {"call_id": call_id}, {"$set": {"status": body.status}})
    if res.matched_count == 0:
        raise HTTPException(404, "Call not found")
    return {"ok": True, "call_id": call_id, "status": body.status}


@app.patch("/api/calls/{call_id}/notes")
@limiter.limit(RATE_API)
async def update_notes(
    request: Request, call_id: str, body: NotesUpdate, _user: str = Depends(require_auth)
):
    col = await get_calls_collection()
    res = await run_sync(col.update_one, {"call_id": call_id}, {"$set": {"notes": body.notes}})
    if res.matched_count == 0:
        raise HTTPException(404, "Call not found")
    return {"ok": True, "call_id": call_id}


@app.delete("/api/calls/{call_id}")
@limiter.limit(RATE_API)
async def delete_call(request: Request, call_id: str, _user: str = Depends(require_auth)):
    col = await get_calls_collection()
    res = await run_sync(col.delete_one, {"call_id": call_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Call not found")
    return {"ok": True, "call_id": call_id}


# ══════════════════════════════════════════════════════════════════════════════
#  STATS
# ══════════════════════════════════════════════════════════════════════════════
@app.get("/api/stats")
@limiter.limit(RATE_API)
async def get_stats(request: Request, _user: str = Depends(require_auth)):
    col    = await get_calls_collection()
    total  = await run_sync(col.count_documents, {})
    unread = await run_sync(col.count_documents, {"status": "unread"})
    urgent = await run_sync(col.count_documents, {"intent": "urgent"})
    by_intent = {i: await run_sync(col.count_documents, {"intent": i}) for i in ("work","personal","urgent","spam","other")}
    by_status = {s: await run_sync(col.count_documents, {"status": s}) for s in ("unread","read","actioned")}
    return {"total": total, "unread": unread, "urgent": urgent, "by_intent": by_intent, "by_status": by_status}


@app.get("/health")
async def health():
    return {"status": "ok", "time": datetime.now(timezone.utc).isoformat()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)