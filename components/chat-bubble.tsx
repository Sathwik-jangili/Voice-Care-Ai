"use client"

import { cn } from "@/lib/utils"
import { Volume2, User } from "lucide-react"

interface ChatBubbleProps {
  message: string
  isAI?: boolean
  timestamp?: string
  className?: string
}

export function ChatBubble({ message, isAI = false, timestamp, className }: ChatBubbleProps) {
  return (
    <div className={cn("flex gap-3 max-w-[85%]", isAI ? "self-start" : "self-end flex-row-reverse", className)}>
      <div
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center shrink-0 glass",
          isAI ? "text-foreground" : "text-foreground",
        )}
      >
        {isAI ? <Volume2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
      </div>

      <div className="space-y-1">
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-base leading-relaxed",
            isAI ? "glass rounded-tl-sm text-foreground" : "glass-heavy rounded-tr-sm text-foreground",
          )}
        >
          <p className="whitespace-pre-wrap">{message}</p>
        </div>
        {timestamp && (
          <p className={cn("text-xs text-muted-foreground", isAI ? "text-left" : "text-right")}>{timestamp}</p>
        )}
      </div>
    </div>
  )
}
