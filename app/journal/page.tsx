"use client"

import { useState, useEffect } from "react"
import { JournalCard } from "@/components/journal-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getJournalEntries as getJournalEntriesAPI, saveJournalEntry as saveJournalEntryAPI, deleteJournalEntry as deleteJournalEntryAPI } from "@/utils/api"
import type { JournalEntry } from "@/utils/storage"
import { BookOpen, Plus, Smile, Meh, Frown, X } from "lucide-react"
import { cn } from "@/lib/utils"

const commonSymptoms = [
  "Headache",
  "Fatigue",
  "Nausea",
  "Dizziness",
  "Back pain",
  "Cough",
  "Fever",
  "Anxiety",
  "Sleep issues",
  "Joint pain",
]

type Mood = "good" | "okay" | "bad"

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [content, setContent] = useState("")
  const [mood, setMood] = useState<Mood>("okay")
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [customSymptom, setCustomSymptom] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const patientId = "general" // TODO: Get from context or user settings

  useEffect(() => {
    loadEntries()

    // Check for draft from response page
    const draft = sessionStorage.getItem("voicecare-journal-draft")
    if (draft) {
      setContent(draft)
      setIsDialogOpen(true)
      sessionStorage.removeItem("voicecare-journal-draft")
    }
  }, [])

  const loadEntries = async () => {
    setIsLoading(true)
    try {
      const dbEntries = await getJournalEntriesAPI(patientId)
      // Transform database format to frontend format
      const transformedEntries: JournalEntry[] = dbEntries.map((entry: any) => ({
        id: String(entry.id),
        date: entry.createdDate,
        content: entry.content,
        mood: (entry.mood || "okay") as Mood,
        symptoms: entry.tags ? entry.tags.split(",").map((s: string) => s.trim()).filter((s: string) => s) : [],
      }))
      setEntries(transformedEntries)
    } catch (error) {
      console.error("Failed to load journal entries:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!content.trim()) return

    setIsSaving(true)
    try {
      // Convert symptoms array to tags string
      const tags = symptoms.join(", ")
      const title = `Journal Entry - ${new Date().toLocaleDateString()}`
      
      await saveJournalEntryAPI(
        {
          title,
          content: content.trim(),
          mood,
          tags: tags || undefined,
        },
        patientId
      )

      // Reload entries
      await loadEntries()
      
      setContent("")
      setMood("okay")
      setSymptoms([])
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Failed to save journal entry:", error)
      alert("Failed to save journal entry. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteJournalEntryAPI(Number(id))
      await loadEntries()
    } catch (error) {
      console.error("Failed to delete journal entry:", error)
      alert("Failed to delete journal entry. Please try again.")
    }
  }

  const toggleSymptom = (symptom: string) => {
    setSymptoms((prev) => (prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]))
  }

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !symptoms.includes(customSymptom.trim())) {
      setSymptoms((prev) => [...prev, customSymptom.trim()])
      setCustomSymptom("")
    }
  }

  // Calculate mood stats
  const moodCounts = entries.reduce(
    (acc, entry) => {
      acc[entry.mood]++
      return acc
    },
    { good: 0, okay: 0, bad: 0 },
  )

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Symptom Journal</h1>
              <p className="text-sm text-muted-foreground">Track your daily health</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Journal Entry</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {/* Mood selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">How are you feeling?</label>
                  <div className="flex gap-3">
                    {[
                      { value: "good" as Mood, icon: Smile, label: "Good", color: "text-green-500 bg-green-500/10" },
                      { value: "okay" as Mood, icon: Meh, label: "Okay", color: "text-yellow-500 bg-yellow-500/10" },
                      { value: "bad" as Mood, icon: Frown, label: "Not great", color: "text-red-500 bg-red-500/10" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setMood(option.value)}
                        className={cn(
                          "flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                          mood === option.value
                            ? `border-current ${option.color}`
                            : "border-border hover:border-muted-foreground",
                        )}
                      >
                        <option.icon className={cn("w-8 h-8", mood === option.value && option.color.split(" ")[0])} />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Symptoms */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Any symptoms?</label>
                  <div className="flex flex-wrap gap-2">
                    {commonSymptoms.map((symptom) => (
                      <Badge
                        key={symptom}
                        variant={symptoms.includes(symptom) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleSymptom(symptom)}
                      >
                        {symptom}
                        {symptoms.includes(symptom) && <X className="w-3 h-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Add custom symptom"
                      value={customSymptom}
                      onChange={(e) => setCustomSymptom(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCustomSymptom()}
                    />
                    <Button type="button" variant="outline" onClick={addCustomSymptom}>
                      Add
                    </Button>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    placeholder="How are you feeling today? Any symptoms or concerns?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button onClick={handleSave} className="w-full" size="lg" disabled={!content.trim() || isSaving}>
                  {isSaving ? "Saving..." : "Save Entry"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Mood Summary */}
        {entries.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Your Mood This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Smile className="w-5 h-5 text-green-500" />
                  <span className="font-medium">{moodCounts.good}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Meh className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">{moodCounts.okay}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Frown className="w-5 h-5 text-red-500" />
                  <span className="font-medium">{moodCounts.bad}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Entries List */}
        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading entries...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium text-foreground mb-2">No entries yet</h2>
            <p className="text-muted-foreground mb-4">Start tracking your symptoms and mood</p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="w-5 h-5" />
              Create First Entry
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <JournalCard key={entry.id} entry={entry} onDelete={() => handleDelete(entry.id)} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
