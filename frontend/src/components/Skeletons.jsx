import React from 'react'

export function StatCardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-[10px] px-5 py-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton w-7 h-7 rounded-sm" />
      </div>
      <div className="skeleton h-8 w-12 rounded" />
      <div className="skeleton h-2.5 w-16 rounded" />
    </div>
  )
}

export function CallCardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-[10px] px-5 py-4
      grid grid-cols-[auto_1fr_auto] gap-4 items-start">
      {/* Avatar */}
      <div className="skeleton w-[38px] h-[38px] rounded-full shrink-0" />
      {/* Body */}
      <div className="space-y-2 py-0.5">
        <div className="flex items-center gap-2">
          <div className="skeleton h-3.5 w-28 rounded" />
          <div className="skeleton h-4 w-12 rounded-full" />
        </div>
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
      </div>
      {/* Meta */}
      <div className="flex flex-col items-end gap-2 py-0.5">
        <div className="skeleton h-3 w-14 rounded" />
        <div className="skeleton h-6 w-20 rounded-sm" />
      </div>
    </div>
  )
}
