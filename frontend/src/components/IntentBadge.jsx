import React from 'react'
import { INTENT_META } from '../data'

export default function IntentBadge({ intent }) {
  const m = INTENT_META[intent] || INTENT_META.other
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${m.color} ${m.bg}`}>
      {m.label}
    </span>
  )
}
