"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getConversations, getJournalEntries } from "@/utils/storage"
import { BarChart3, MessageSquare, BookOpen, TrendingUp, Calendar } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function AnalyticsPage() {
  const conversations = useMemo(() => getConversations(), [])
  const journalEntries = useMemo(() => getJournalEntries(), [])

  // Calculate stats
  const totalConversations = conversations.length
  const totalJournalEntries = journalEntries.length

  // Get conversations by day of week
  const conversationsByDay = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const counts = Array(7).fill(0)

    conversations.forEach((c) => {
      const day = new Date(c.timestamp).getDay()
      counts[day]++
    })

    return days.map((day, i) => ({
      day,
      count: counts[i],
    }))
  }, [conversations])

  // Get most common symptoms
  const symptomCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    journalEntries.forEach((entry) => {
      entry.symptoms.forEach((s) => {
        counts[s] = (counts[s] || 0) + 1
      })
    })

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([symptom, count]) => ({ symptom, count }))
  }, [journalEntries])

  // Mood distribution
  const moodDistribution = useMemo(() => {
    const counts = { good: 0, okay: 0, bad: 0 }
    journalEntries.forEach((e) => counts[e.mood]++)

    return [
      { name: "Good", value: counts.good, color: "#22c55e" },
      { name: "Okay", value: counts.okay, color: "#eab308" },
      { name: "Not Great", value: counts.bad, color: "#ef4444" },
    ].filter((d) => d.value > 0)
  }, [journalEntries])

  // Recent activity
  const recentActivity = useMemo(() => {
    const last7Days: { date: string; conversations: number; journal: number }[] = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const dayConversations = conversations.filter(
        (c) => new Date(c.timestamp).toISOString().split("T")[0] === dateStr,
      ).length

      const dayJournal = journalEntries.filter((e) => e.date.split("T")[0] === dateStr).length

      last7Days.push({
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        conversations: dayConversations,
        journal: dayJournal,
      })
    }

    return last7Days
  }, [conversations, journalEntries])

  const chartConfig = {
    conversations: {
      label: "Conversations",
      color: "var(--chart-1)",
    },
    journal: {
      label: "Journal",
      color: "var(--chart-2)",
    },
    count: {
      label: "Count",
      color: "var(--chart-1)",
    },
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">Your health tracking overview</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{totalConversations}</p>
                <p className="text-sm text-muted-foreground">Questions Asked</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{totalJournalEntries}</p>
                <p className="text-sm text-muted-foreground">Journal Entries</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Last 7 Days Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recentActivity}>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={30} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="conversations" fill="var(--color-conversations)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="journal" fill="var(--color-journal)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Mood Distribution */}
        {moodDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Mood Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={moodDistribution} innerRadius={30} outerRadius={50} paddingAngle={2} dataKey="value">
                        {moodDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {moodDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm text-muted-foreground">({item.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Symptoms */}
        {symptomCounts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Most Tracked Symptoms</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={symptomCounts} layout="vertical">
                    <XAxis type="number" tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="symptom" tickLine={false} axisLine={false} width={100} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* No data state */}
        {totalConversations === 0 && totalJournalEntries === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-medium mb-2">No data yet</h2>
              <p className="text-muted-foreground">
                Start asking health questions and tracking your symptoms to see analytics here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
