"use client"

import { HelpCircle, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface QuestionsListProps {
  questions: string[]
  title?: string
  className?: string
}

export function QuestionsList({ questions, title = "Questions to Ask", className }: QuestionsListProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyQuestion = async (question: string, index: number) => {
    await navigator.clipboard.writeText(question)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className={cn("glass rounded-xl p-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="w-5 h-5 text-foreground" />
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <ul className="space-y-2">
        {questions.map((question, index) => (
          <li key={index} className="flex items-start justify-between gap-2 p-3 glass-subtle rounded-lg group">
            <span className="text-foreground leading-relaxed">{question}</span>
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
              onClick={() => copyQuestion(question, index)}
              aria-label="Copy question"
            >
              {copiedIndex === index ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
