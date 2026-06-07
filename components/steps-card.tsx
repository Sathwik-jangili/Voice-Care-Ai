"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface StepsCardProps {
  title: string
  steps: string[]
  icon?: React.ReactNode
  className?: string
}

export function StepsCard({ title, steps, icon, className }: StepsCardProps) {
  return (
    <div className={cn("glass rounded-xl p-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 rounded-full glass-subtle text-foreground text-sm font-medium shrink-0">
              {index + 1}
            </span>
            <span className="text-foreground leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
