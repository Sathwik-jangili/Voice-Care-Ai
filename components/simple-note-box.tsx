"use client"

import { StickyNote } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimpleNoteBoxProps {
  note: string
  title?: string
  className?: string
}

export function SimpleNoteBox({ note, title = "Important Note", className }: SimpleNoteBoxProps) {
  return (
    <div className={cn("glass rounded-xl p-4", className)}>
      <div className="flex items-center gap-2 mb-2">
        <StickyNote className="w-5 h-5 text-foreground" />
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-foreground leading-relaxed">{note}</p>
    </div>
  )
}
