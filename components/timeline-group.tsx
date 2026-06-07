"use client"

import type { TimelineEntry } from "@/utils/storage"
import { TimelineCard } from "./timeline-card"

interface TimelineGroupProps {
  label: string
  entries: TimelineEntry[]
  onEntryClick: (entry: TimelineEntry) => void
}

export function TimelineGroup({ label, entries, onEntryClick }: TimelineGroupProps) {
  if (entries.length === 0) return null

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">{label}</h2>
      <div className="space-y-2">
        {entries.map((entry) => (
          <TimelineCard key={entry.id} entry={entry} onClick={() => onEntryClick(entry)} />
        ))}
      </div>
    </div>
  )
}
