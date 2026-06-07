"use client"

import { cn } from "@/lib/utils"
import { MessageSquare, BookOpen, Compass, HelpCircle, Volume2 } from "lucide-react"
import type { TimelineEntry } from "@/utils/storage"

interface TimelineCardProps {
  entry: TimelineEntry
  onClick?: () => void
  className?: string
}

const typeIcons = {
  conversation: MessageSquare,
  journal: BookOpen,
  guide: HelpCircle,
  navigator: Compass,
}

const typeLabels = {
  conversation: "Conversation",
  journal: "Journal",
  guide: "Health Guide",
  navigator: "Next Steps",
}

export function TimelineCard({ entry, onClick, className }: TimelineCardProps) {
  const Icon = typeIcons[entry.type]

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 glass rounded-xl transition-all",
        "hover:bg-white/25 dark:hover:bg-white/15 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/30",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg glass-subtle">
          <Icon className="w-5 h-5 text-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full glass-subtle text-foreground">
              {typeLabels[entry.type]}
            </span>
            <span className="text-xs text-muted-foreground">{formatDate(entry.timestamp)}</span>
          </div>

          <h3 className="font-medium text-foreground truncate mb-1">{entry.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{entry.content}</p>

          {entry.audioBase64 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-foreground/70">
              <Volume2 className="w-3 h-3" />
              <span>Audio available</span>
            </div>
          )}

          {entry.mood && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full glass-subtle text-foreground">Mood: {entry.mood}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
