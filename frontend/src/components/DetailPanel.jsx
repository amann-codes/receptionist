import React, { useState, useEffect, useRef } from 'react'
import IntentBadge from './IntentBadge'
import { initials, formatDateTime } from '../utils'
import { STATUS_META } from '../data'

const AVATAR_COLORS = {
  urgent:   'bg-brand-red-dim text-brand-red',
  work:     'bg-brand-blue-dim text-brand-blue',
  personal: 'bg-brand-green-dim text-brand-green',
  spam:     'bg-white/[0.05] text-tx-3',
  other:    'bg-accent-dim text-accent',
}

export default function DetailPanel({ call, onClose, onAction, onNotes, onDelete }) {
  const [notesVal,   setNotesVal]   = useState(call.notes || '')
  const [notesDirty, setNotesDirty] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const textareaRef = useRef(null)

  // Sync notes when call prop changes (fixes stale state bug)
  useEffect(() => {
    setNotesVal(call.notes || '')
    setNotesDirty(false)
    setNotesSaved(false)
  }, [call.call_id, call.notes])

  const avatarColor = AVATAR_COLORS[call.intent] || AVATAR_COLORS.other
  const statusMeta  = STATUS_META[call.status]   || STATUS_META.read

  const handleSaveNotes = () => {
    onNotes(call.call_id, notesVal)
    setNotesDirty(false)
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2000)
  }

  const handleNotesChange = (e) => {
    setNotesVal(e.target.value)
    setNotesDirty(true)
    setNotesSaved(false)
  }

  const durationStr = call.duration_seconds
    ? `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s`
    : null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <aside className="fixed right-0 top-0 bottom-0 w-[440px] max-w-full bg-surface border-l border-border
        flex flex-col z-50 animate-slideIn">

        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="min-w-0">
            <div className="text-[14px] font-semibold truncate">{call.caller_name || 'Unknown'}</div>
            <div className="text-[11px] text-tx-3 mt-0.5 flex items-center gap-1.5">
              <span>{formatDateTime(call.received_at)}</span>
              {durationStr && (
                <>
                  <span className="text-tx-3/40">·</span>
                  <span>{durationStr}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <button
              onClick={() => setConfirmDel(true)}
              className="w-7 h-7 bg-brand-red-dim hover:bg-brand-red/20 rounded-sm text-brand-red
                flex items-center justify-center transition-colors"
              title="Delete call"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 bg-white/[0.06] hover:bg-white/10 rounded-sm text-tx-2 hover:text-tx
                flex items-center justify-center transition-colors text-base leading-none"
              title="Close (Esc)"
            >✕</button>
          </div>
        </div>

        {/* Delete confirm */}
        {confirmDel && (
          <div className="mx-5 mt-4 p-3.5 bg-brand-red-dim border border-brand-red/25 rounded-[8px]
            flex items-center justify-between gap-3 animate-fadeIn">
            <p className="text-[12.5px] text-brand-red font-medium">Delete this call record?</p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => { onDelete(call.call_id) }}
                className="text-[11.5px] font-semibold bg-brand-red text-white px-3 py-1 rounded-sm
                  hover:opacity-85 transition-opacity"
              >Delete</button>
              <button
                onClick={() => setConfirmDel(false)}
                className="text-[11.5px] text-tx-2 border border-border-2 px-3 py-1 rounded-sm
                  hover:text-tx transition-colors"
              >Cancel</button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Caller row */}
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center
              text-[13px] font-semibold shrink-0 ${avatarColor}`}>
              {initials(call.caller_name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[16px] font-semibold leading-tight">{call.caller_name || 'Unknown'}</div>
              <div className="text-[11.5px] text-tx-3 mt-0.5">{formatDateTime(call.received_at)}</div>
            </div>
            <IntentBadge intent={call.intent} />
          </div>

          {/* Status row */}
          <div className="flex items-center gap-2 py-2.5 px-3.5 bg-surface-2 rounded-[8px]">
            <span className={`w-2 h-2 rounded-full shrink-0 ${statusMeta.dot}`} />
            <span className="text-[13px] text-tx-2 capitalize font-medium">{call.status}</span>
            {durationStr && (
              <span className="ml-auto text-[11.5px] text-tx-3 font-mono">{durationStr}</span>
            )}
          </div>

          {/* Message */}
          {call.message && (
            <Section label="Message">
              <p className="text-[13.5px] text-tx-2 leading-relaxed">{call.message}</p>
            </Section>
          )}

          {/* Summary */}
          {call.summary && (
            <Section label="AI Summary">
              <p className="text-[13.5px] text-tx-2 leading-relaxed italic">{call.summary}</p>
            </Section>
          )}

          {/* Transcript */}
          {call.transcript?.length > 0 && (
            <Section label={`Transcript · ${call.transcript.length} turns`}>
              <div className="divide-y divide-border rounded-[8px] overflow-hidden border border-border">
                {call.transcript.map((t, i) => (
                  <div key={i} className="flex gap-3 px-3.5 py-2.5 bg-surface-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider pt-0.5 w-7 shrink-0
                      ${t.role === 'bot' ? 'text-accent' : 'text-brand-green'}`}>
                      {t.role === 'bot' ? 'bot' : 'you'}
                    </span>
                    <p className="text-[12.5px] text-tx-2 leading-snug">{t.text}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Notes */}
          <Section label="Your Notes">
            <textarea
              ref={textareaRef}
              value={notesVal}
              onChange={handleNotesChange}
              rows={3}
              placeholder="Add a note…"
              className="w-full bg-surface-2 border border-border focus:border-accent rounded-[8px]
                text-[13px] text-tx-2 placeholder:text-tx-3 px-3 py-2.5 resize-none
                focus:outline-none transition-colors"
            />
            <button
              onClick={handleSaveNotes}
              disabled={!notesDirty && !notesSaved}
              className={`mt-2 text-[12px] font-medium px-3 py-1.5 rounded-sm border transition-all
                ${notesSaved
                  ? 'border-brand-green text-brand-green'
                  : notesDirty
                    ? 'border-accent text-accent hover:bg-accent-dim'
                    : 'border-border text-tx-3 cursor-default'
                }`}
            >
              {notesSaved ? '✓ Saved' : 'Save note'}
            </button>
          </Section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-2 shrink-0">
          {call.status !== 'actioned' ? (
            <>
              <button
                onClick={() => { onAction(call.call_id, 'actioned'); onClose() }}
                className="flex-1 bg-accent hover:opacity-85 text-white text-[13px] font-semibold
                  py-2 rounded-sm transition-opacity"
              >Mark as actioned</button>
              <button
                onClick={onClose}
                className="px-4 border border-border-2 text-tx-2 hover:text-tx
                  text-[13px] rounded-sm transition-colors"
              >Close</button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 border border-border-2 text-tx-2 hover:text-tx
                text-[13px] font-medium py-2 rounded-sm transition-colors"
            >Close</button>
          )}
        </div>
      </aside>
    </>
  )
}

function Section({ label, children }) {
  return (
    <div>
      <p className="text-[10.5px] uppercase tracking-widest text-tx-3 font-semibold mb-2.5">{label}</p>
      {children}
    </div>
  )
}
