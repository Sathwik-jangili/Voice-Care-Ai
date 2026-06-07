"use client"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface TopicTileProps {
  label: string
  icon: LucideIcon
  onClick: () => void
  className?: string
}

export function TopicTile({ label, icon: Icon, onClick, className }: TopicTileProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4 glass rounded-xl",
        "hover:bg-white/25 dark:hover:bg-white/15 hover:shadow-lg transition-all",
        "focus:outline-none focus:ring-2 focus:ring-white/30",
        className,
      )}
    >
      <div className="w-12 h-12 rounded-full glass-subtle flex items-center justify-center">
        <Icon className="w-6 h-6 text-foreground" />
      </div>
      <span className="text-sm font-medium text-foreground text-center">{label}</span>
    </button>
  )
}
