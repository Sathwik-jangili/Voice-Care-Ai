"use client"

import { Button } from "@/components/ui/button"
import { Play, Trash2, MessageSquare } from "lucide-react"
import type { Conversation } from "@/utils/storage"

interface HistoryCardProps {
  conversation: Conversation
  onPlay?: () => void
  onDelete?: () => void
  onClick?: () => void
}

export function HistoryCard({ conversation, onPlay, onDelete, onClick }: HistoryCardProps) {
  const date = new Date(conversation.timestamp)
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

  return (
    <div
      className="glass rounded-xl cursor-pointer hover:bg-white/20 dark:hover:bg-white/10 transition-all"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full glass-subtle flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground line-clamp-1">{conversation.transcript}</p>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {conversation.aiResponse.slice(0, 100)}...
            </p>
            <p className="text-xs text-muted-foreground mt-2">{formattedDate}</p>
          </div>

          <div className="flex gap-1 shrink-0">
            {conversation.audioBase64 && onPlay && (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onPlay()
                }}
                aria-label="Play audio"
                className="hover:bg-white/20"
              >
                <Play className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                aria-label="Delete conversation"
                className="text-destructive hover:text-destructive hover:bg-white/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
