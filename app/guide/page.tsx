"use client"

import type React from "react"

import { useState } from "react"
import { Search, Heart, Activity, Pill, Scan, Bone, Plus, Loader2, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatBubble } from "@/components/chat-bubble"
import { AudioPlayer } from "@/components/audio-player"

const quickTopics = [
  { label: "Blood Pressure", icon: Activity, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-200/20" },
  { label: "Cholesterol", icon: Heart, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-200/20" },
  { label: "Diabetes", icon: Pill, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-200/20" },
  { label: "CT Scan", icon: Scan, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-200/20" },
  { label: "X-Ray", icon: Bone, color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-200/20" },
  { label: "Medications", icon: Pill, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-200/20" },
]

interface SearchResult {
  answer: string;
}

export default function GuidePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)

  const handleSearch = async (term: string) => {
    if (!term.trim()) return

    setIsLoading(true)
    setSearchResult(null)

    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(term)}`)
      if (!response.ok) {
        throw new Error('Search request failed')
      }
      const result = await response.json()
      setSearchResult(result)
    } catch (error) {
      console.error("Failed to perform search:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(searchTerm)
  }

  const handleTopicClick = (topic: string) => {
    setSearchTerm(topic)
    handleSearch(topic)
  }

  return (
    <main className="min-h-screen pb-24 relative overflow-hidden">
      {/* Liquid Background */}
      <div className="liquid-bg" />

      {/* Header */}
      <header className="sticky top-0 z-40 glass-subtle border-b-0">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                AI Health Guide
              </h1>
              <p className="text-sm text-muted-foreground font-medium">Your personal medical encyclopedia</p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl transition-opacity opacity-0 group-hover:opacity-100" />
            <div className="relative flex gap-2 glass rounded-2xl p-1.5 shadow-sm transition-shadow hover:shadow-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search any health topic..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-0 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/70 h-11"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !searchTerm.trim()}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md transition-all hover:scale-105 active:scale-95"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              </Button>
            </div>
          </form>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 relative z-10">
        {/* Quick Topics */}
        {!searchResult && !isLoading && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">Popular Topics</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickTopics.map((topic) => (
                <button
                  key={topic.label}
                  onClick={() => handleTopicClick(topic.label)}
                  className={`group relative overflow-hidden glass hover:bg-white/40 dark:hover:bg-black/40 p-4 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] border ${topic.border}`}
                >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${topic.bg}`} />
                  <div className="relative flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${topic.bg} flex items-center justify-center`}>
                      <topic.icon className={`w-5 h-5 ${topic.color}`} />
                    </div>
                    <span className="font-medium text-foreground">{topic.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin relative z-10" />
            </div>
            <p className="mt-6 text-lg font-medium text-muted-foreground animate-pulse">Searching AI Knowledge Base...</p>
          </div>
        )}

        {/* Search Result */}
        {searchResult && !isLoading && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">AI Answer</h2>
            <div className="glass p-4 rounded-2xl border border-transparent hover:border-blue-500/20">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{searchResult.answer}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchResult(null)
                setSearchTerm("")
              }}
              className="h-12 px-6 rounded-xl glass hover:bg-white/50 dark:hover:bg-black/50 border-border/50 w-full mt-4"
            >
              New Search
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
