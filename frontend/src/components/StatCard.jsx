import React from 'react'

export default function StatCard({ label, value, meta, icon: Icon, iconClass }) {
  return (
    <div className="bg-surface border border-border rounded-[10px] px-5 py-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-tx-3">{label}</span>
        <div className={`w-7 h-7 rounded-sm flex items-center justify-center ${iconClass}`}>
          <Icon />
        </div>
      </div>
      <div className="text-[28px] font-semibold tracking-tight leading-none">
        {value ?? '—'}
      </div>
      <div className="text-[11px] text-tx-3">{meta}</div>
    </div>
  )
}
