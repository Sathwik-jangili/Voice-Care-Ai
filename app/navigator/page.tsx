"use client"

import type React from "react"
import { useState } from "react"
import { Search, Compass, Loader2, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchResult {
  plan: string;
}

export default function NavigatorPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null)

  const handleSearch = async (term: string) => {
    if (!term.trim()) return

    setIsLoading(true)
    setSearchResult(null)

    try {
      const response = await fetch(`/api/navigator?situation=${encodeURIComponent(term)}`)
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

  return (
    <main className="min-h-screen pb-24 relative overflow-hidden">
      {/* Liquid Background */}
      <div className="liquid-bg" />

      {/* Header */}
      <header className="sticky top-0 z-40 glass-subtle border-b-0">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">
                Next-Step Navigator
              </h1>
              <p className="text-sm text-muted-foreground font-medium">Your roadmap to better health</p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl transition-opacity opacity-0 group-hover:opacity-100" />
            <div className="relative flex gap-2 glass rounded-2xl p-1.5 shadow-sm transition-shadow hover:shadow-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for your health situation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-0 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/70 h-11"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !searchTerm.trim()}
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md transition-all hover:scale-105 active:scale-95"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              </Button>
            </div>
          </form>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 relative z-10">
        {/* Initial State Message */}
        {!searchResult && !isLoading && (
            <div className="text-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Compass className="w-16 h-16 text-emerald-500/30 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-foreground">Find Your Way</h2>
                <p className="text-muted-foreground mt-2">Describe your health situation to get a clear action plan.</p>
            </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin relative z-10" />
            </div>
            <p className="mt-6 text-lg font-medium text-muted-foreground animate-pulse">Searching AI Knowledge Base...</p>
          </div>
        )}

        {/* Action Plan */}
        {searchResult && !isLoading && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">Your Action Plan</h2>
            <div className="glass p-4 rounded-2xl border border-transparent hover:border-emerald-500/20">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{searchResult.plan}</p>
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
