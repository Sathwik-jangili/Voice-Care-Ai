"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Smile, Meh, Frown } from "lucide-react"
import type { JournalEntry } from "@/utils/storage"

interface JournalCardProps {
  entry: JournalEntry
  onDelete?: () => void
}

const moodIcons = {
  good: { icon: Smile },
  okay: { icon: Meh },
  bad: { icon: Frown },
}

export function JournalCard({ entry, onDelete }: JournalCardProps) {
  const mood = moodIcons[entry.mood]
  const MoodIcon = mood.icon

  const formattedDate = new Date(entry.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="glass rounded-xl">
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-foreground">{formattedDate}</h3>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full glass-subtle flex items-center justify-center">
              <MoodIcon className="w-5 h-5 text-foreground" />
            </div>
            {onDelete && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onDelete}
                aria-label="Delete entry"
                className="text-muted-foreground hover:text-destructive hover:bg-white/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 space-y-3">
        <p className="text-foreground leading-relaxed">{entry.content}</p>

        {entry.symptoms.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {entry.symptoms.map((symptom) => (
              <Badge key={symptom} variant="secondary" className="glass-subtle border-white/20">
                {symptom}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
