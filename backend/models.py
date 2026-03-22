from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TranscriptMessage(BaseModel):
    role: str
    text: str


class CallRecord(BaseModel):
    call_id:     Optional[str] = None
    received_at: str
    caller_name: str  = "Unknown"
    intent:      str  = "other"   # work | personal | urgent | spam | other
    message:     str  = ""
    summary:     str  = ""
    transcript:  List[TranscriptMessage] = []
    status:      str  = "unread"  # unread | read | actioned
    duration_seconds: Optional[int] = None
    notes:       Optional[str] = None


class StatusUpdate(BaseModel):
    status: str  # unread | read | actioned


class NotesUpdate(BaseModel):
    notes: str


class CallsResponse(BaseModel):
    calls: List[dict]
    total: int
    page:  int
    limit: int


class StatsResponse(BaseModel):
    total:     int
    unread:    int
    urgent:    int
    by_intent: dict
    by_status: dict
