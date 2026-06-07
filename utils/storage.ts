export interface Conversation {
  id: string
  timestamp: number
  transcript: string
  aiResponse: string
  audioBase64?: string
}

export interface JournalEntry {
  id: string
  date: string
  content: string
  mood: "good" | "okay" | "bad"
  symptoms: string[]
}

export interface TimelineEntry {
  id: string
  type: "conversation" | "journal" | "guide" | "navigator"
  timestamp: number
  title: string
  content: string
  audioBase64?: string
  mood?: "good" | "okay" | "bad"
  symptoms?: string[]
  metadata?: Record<string, string>
}

const CONVERSATIONS_KEY = "voicecare-conversations"
const JOURNAL_KEY = "voicecare-journal"
const TIMELINE_KEY = "voicecare-timeline"

// Conversations
export function saveConversation(conversation: Omit<Conversation, "id" | "timestamp">): Conversation {
  const conversations = getConversations()
  const newConversation: Conversation = {
    ...conversation,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  }
  conversations.unshift(newConversation)
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations.slice(0, 50))) // Keep last 50
  saveTimelineEntry({
    type: "conversation",
    title: newConversation.transcript.slice(0, 50) + (newConversation.transcript.length > 50 ? "..." : ""),
    content: newConversation.aiResponse,
    audioBase64: newConversation.audioBase64,
  })
  return newConversation
}

export function getConversations(): Conversation[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(CONVERSATIONS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function deleteConversation(id: string): void {
  const conversations = getConversations().filter((c) => c.id !== id)
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations))
}

// Journal entries
export function saveJournalEntry(entry: Omit<JournalEntry, "id">): JournalEntry {
  const entries = getJournalEntries()
  const newEntry: JournalEntry = {
    ...entry,
    id: crypto.randomUUID(),
  }
  entries.unshift(newEntry)
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries))
  saveTimelineEntry({
    type: "journal",
    title: `Journal Entry - ${newEntry.mood}`,
    content: newEntry.content,
    mood: newEntry.mood,
    symptoms: newEntry.symptoms,
  })
  return newEntry
}

export function getJournalEntries(): JournalEntry[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(JOURNAL_KEY)
  return stored ? JSON.parse(stored) : []
}

export function deleteJournalEntry(id: string): void {
  const entries = getJournalEntries().filter((e) => e.id !== id)
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries))
}

// Timeline entries
export function saveTimelineEntry(entry: Omit<TimelineEntry, "id" | "timestamp">): TimelineEntry {
  const entries = getTimelineEntries()
  const newEntry: TimelineEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  }
  entries.unshift(newEntry)
  localStorage.setItem(TIMELINE_KEY, JSON.stringify(entries.slice(0, 100)))
  return newEntry
}

export function getTimelineEntries(): TimelineEntry[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(TIMELINE_KEY)
  return stored ? JSON.parse(stored) : []
}

export function deleteTimelineEntry(id: string): void {
  const entries = getTimelineEntries().filter((e) => e.id !== id)
  localStorage.setItem(TIMELINE_KEY, JSON.stringify(entries))
}

// Build unified timeline from all sources
export function getUnifiedTimeline(): TimelineEntry[] {
  const timeline = getTimelineEntries()
  const conversations = getConversations()
  const journal = getJournalEntries()

  // Convert conversations to timeline entries
  const conversationEntries: TimelineEntry[] = conversations.map((c) => ({
    id: `conv-${c.id}`,
    type: "conversation" as const,
    timestamp: c.timestamp,
    title: c.transcript.slice(0, 50) + (c.transcript.length > 50 ? "..." : ""),
    content: c.aiResponse,
    audioBase64: c.audioBase64,
  }))

  // Convert journal entries to timeline entries
  const journalEntries: TimelineEntry[] = journal.map((j) => ({
    id: `journal-${j.id}`,
    type: "journal" as const,
    timestamp: new Date(j.date).getTime(),
    title: `Journal Entry - ${j.mood}`,
    content: j.content,
    mood: j.mood,
    symptoms: j.symptoms,
  }))

  // Combine and sort by timestamp (newest first)
  return [...timeline, ...conversationEntries, ...journalEntries].sort((a, b) => b.timestamp - a.timestamp)
}
