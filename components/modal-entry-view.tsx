"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AudioPlayer } from "@/components/audio-player"
import type { TimelineEntry } from "@/utils/storage"

interface ModalEntryViewProps {
  entry: TimelineEntry | null
  isOpen: boolean
  onClose: () => void
}

const moodEmojis = {
  good: "😊",
  okay: "😐",
  bad: "😔",
}

export function ModalEntryView({ entry, isOpen, onClose }: ModalEntryViewProps) {
  if (!isOpen || !entry) return null

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{entry.title}</h2>
          <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">{formatDate(entry.timestamp)}</p>

          {entry.mood && (
            <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
              <span className="text-2xl">{moodEmojis[entry.mood]}</span>
              <span className="font-medium capitalize">Feeling {entry.mood}</span>
            </div>
          )}

          {entry.symptoms && entry.symptoms.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Symptoms</h3>
              <div className="flex flex-wrap gap-2">
                {entry.symptoms.map((symptom) => (
                  <span key={symptom} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          )}

          {entry.audioBase64 && <AudioPlayer audioBase64={entry.audioBase64} label="Play response" />}

          <div className="prose prose-sm max-w-none">
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">{entry.content}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
