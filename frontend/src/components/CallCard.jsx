import React from 'react'
import IntentBadge from './IntentBadge'
import { initials, timeAgo } from '../utils'
import { STATUS_META } from '../data'

const AVATAR_COLORS = {
  urgent:   'bg-brand-red-dim text-brand-red',
  work:     'bg-brand-blue-dim text-brand-blue',
  personal: 'bg-brand-green-dim text-brand-green',
  spam:     'bg-white/[0.05] text-tx-3',
  other:    'bg-accent-dim text-accent',
}

export default function CallCard({ call, onClick, onAction }) {
  const statusMeta = STATUS_META[call.status] || STATUS_META.read
  const avatarColor = AVATAR_COLORS[call.intent] || AVATAR_COLORS.other

  return (
    <div
      onClick={() => onClick(call)}
      className={`bg-surface border rounded-[10px] px-5 py-4 grid grid-cols-[auto_1fr_auto] gap-4 items-start
        cursor-pointer transition-all duration-150
        hover:bg-surface-2 hover:border-border-2
        ${call.status === 'unread' ? 'border-l-2 border-l-accent border-border' : 'border-border'}
      `}
    >
      {/* Avatar */}
      <div className={`w-[38px] h-[38px] rounded-full flex items-center justify-center shrink-0 text-[13px] font-semibold tracking-wide ${avatarColor}`}>
        {initials(call.caller_name)}
      </div>

      {/* Body */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-[14px] font-semibold text-tx">{call.caller_name || 'Unknown'}</span>
          <IntentBadge intent={call.intent} />
        </div>
        <p className="text-[13px] text-tx-2 leading-snug line-clamp-2">
          {call.message || call.summary || 'No message recorded.'}
        </p>
        {call.summary && call.message && (
          <p className="text-[12px] text-tx-3 mt-1 italic line-clamp-1">{call.summary}</p>
        )}
      </div>

      {/* Meta */}
      <div className="text-right shrink-0 flex flex-col items-end gap-2">
        <div className="flex items-center gap-1.5 text-[11.5px] text-tx-3 whitespace-nowrap">
          {timeAgo(call.received_at)}
          <span className={`w-1.5 h-1.5 rounded-full inline-block ${statusMeta.dot}`} />
        </div>
        {call.status !== 'actioned' ? (
          <button
            onClick={e => { e.stopPropagation(); onAction(call.call_id, 'actioned') }}
            className="text-[11px] font-medium px-2.5 py-1 rounded-sm border border-accent text-accent
              hover:bg-accent-dim transition-colors"
          >
            Mark done
          </button>
        ) : (
          <span className="text-[11px] text-brand-green">✓ Actioned</span>
        )}
      </div>
    </div>
  )
}
