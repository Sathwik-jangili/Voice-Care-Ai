"use client"

import { useState, useEffect, useMemo } from "react"
import { Clock, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TimelineGroup } from "@/components/timeline-group"
import { ModalEntryView } from "@/components/modal-entry-view"
import { getUnifiedTimeline, type TimelineEntry } from "@/utils/storage"

type FilterType = "all" | "conversation" | "journal" | "guide" | "navigator"

export default function TimelinePage() {
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<TimelineEntry | null>(null)
  const [filter, setFilter] = useState<FilterType>("all")

  useEffect(() => {
    setEntries(getUnifiedTimeline())
  }, [])

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const filtered = filter === "all" ? entries : entries.filter((e) => e.type === filter)

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const yesterday = today - 86400000
    const lastWeek = today - 7 * 86400000

    const groups: Record<string, TimelineEntry[]> = {
      Today: [],
      Yesterday: [],
      "Last Week": [],
      Older: [],
    }

    filtered.forEach((entry) => {
      if (entry.timestamp >= today) {
        groups.Today.push(entry)
      } else if (entry.timestamp >= yesterday) {
        groups.Yesterday.push(entry)
      } else if (entry.timestamp >= lastWeek) {
        groups["Last Week"].push(entry)
      } else {
        groups.Older.push(entry)
      }
    })

    return groups
  }, [entries, filter])

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "conversation", label: "Conversations" },
    { value: "journal", label: "Journal" },
    { value: "guide", label: "Guide" },
    { value: "navigator", label: "Navigator" },
  ]

  return (
    <main className="min-h-screen pb-24 bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-40">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Health Timeline</h1>
              <p className="text-sm text-muted-foreground">Your care journey</p>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="sticky top-[73px] bg-background/95 backdrop-blur border-b border-border z-30">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                size="sm"
                variant={filter === option.value ? "default" : "outline"}
                onClick={() => setFilter(option.value)}
                className="shrink-0"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">No entries yet</h2>
            <p className="text-muted-foreground">Your health journey will appear here as you use VoiceCare</p>
          </div>
        ) : (
          <>
            <TimelineGroup label="Today" entries={groupedEntries.Today} onEntryClick={setSelectedEntry} />
            <TimelineGroup label="Yesterday" entries={groupedEntries.Yesterday} onEntryClick={setSelectedEntry} />
            <TimelineGroup label="Last Week" entries={groupedEntries["Last Week"]} onEntryClick={setSelectedEntry} />
            <TimelineGroup label="Older" entries={groupedEntries.Older} onEntryClick={setSelectedEntry} />
          </>
        )}
      </div>

      {/* Entry Modal */}
      <ModalEntryView entry={selectedEntry} isOpen={!!selectedEntry} onClose={() => setSelectedEntry(null)} />
    </main>
  )
}
