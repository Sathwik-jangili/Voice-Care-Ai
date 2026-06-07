"use client"

import { useState, useMemo } from "react"
import { SummaryCard } from "@/components/summary-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getConversations, getJournalEntries } from "@/utils/storage"
import { Stethoscope, RefreshCw, AlertCircle, Calendar } from "lucide-react"

export default function DoctorPrepPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)

  const conversations = useMemo(() => getConversations(), [])
  const journalEntries = useMemo(() => getJournalEntries(), [])

  const generateSummary = () => {
    setIsGenerating(true)

    // Simulate AI summary generation
    setTimeout(() => {
      const recentConversations = conversations.slice(0, 5)
      const recentJournal = journalEntries.slice(0, 7)

      // Count symptoms
      const symptomCounts: Record<string, number> = {}
      recentJournal.forEach((entry) => {
        entry.symptoms.forEach((s) => {
          symptomCounts[s] = (symptomCounts[s] || 0) + 1
        })
      })
      const topSymptoms = Object.entries(symptomCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([symptom]) => symptom)

      // Calculate mood trend
      const moodValues = { good: 3, okay: 2, bad: 1 }
      const avgMood = recentJournal.reduce((sum, e) => sum + moodValues[e.mood], 0) / (recentJournal.length || 1)
      const moodTrend = avgMood >= 2.5 ? "generally positive" : avgMood >= 1.5 ? "mixed" : "concerning"

      // Get questions asked
      const questions = recentConversations.map((c) => `- ${c.transcript}`).join("\n")

      const generatedSummary = `
DOCTOR VISIT PREPARATION SUMMARY
Generated: ${new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HEALTH QUESTIONS I'VE HAD:
${questions || "No recent questions recorded."}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SYMPTOMS TRACKED (Last 7 days):
${topSymptoms.length > 0 ? topSymptoms.map((s) => `• ${s}`).join("\n") : "No symptoms recorded."}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OVERALL MOOD TREND: ${moodTrend.toUpperCase()}
Journal entries: ${recentJournal.length}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUGGESTED QUESTIONS FOR YOUR DOCTOR:
• Can you explain my symptoms in more detail?
• What tests might help understand my condition?
• Are there lifestyle changes I should consider?
• When should I be concerned about these symptoms?
• What treatment options are available?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NOTE: This summary was generated based on your 
VoiceCare AI conversations and journal entries.
Please share any relevant information with your 
healthcare provider.
      `.trim()

      setSummary(generatedSummary)
      setIsGenerating(false)
    }, 1500)
  }

  const hasData = conversations.length > 0 || journalEntries.length > 0

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Doctor Visit Prep</h1>
            <p className="text-sm text-muted-foreground">Generate a summary for your appointment</p>
          </div>
        </div>

        {/* Data overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{conversations.length}</p>
                <p className="text-sm text-muted-foreground">Conversations</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{journalEntries.length}</p>
                <p className="text-sm text-muted-foreground">Journal Entries</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* No data state */}
        {!hasData && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-medium mb-2">Not enough data yet</h2>
              <p className="text-muted-foreground">
                Start asking health questions and tracking your symptoms in the journal to generate a comprehensive
                summary for your doctor.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Generate button */}
        {hasData && !summary && (
          <Button onClick={generateSummary} size="lg" className="w-full gap-2" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating Summary...
              </>
            ) : (
              <>
                <Stethoscope className="w-5 h-5" />
                Generate Visit Summary
              </>
            )}
          </Button>
        )}

        {/* Summary display */}
        {summary && (
          <>
            <SummaryCard title="Visit Summary" content={summary} date={new Date().toISOString().split("T")[0]} />
            <Button onClick={() => setSummary(null)} variant="outline" className="w-full gap-2">
              <RefreshCw className="w-5 h-5" />
              Generate New Summary
            </Button>
          </>
        )}

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tips for Your Visit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Bring a list of all medications you take</p>
            <p>• Write down your questions before the visit</p>
            <p>• Ask a family member to join if needed</p>
            <p>• Take notes during your appointment</p>
            <p>• Don't hesitate to ask for clarification</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
