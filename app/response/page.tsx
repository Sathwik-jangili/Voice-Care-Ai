"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChatBubble } from "@/components/chat-bubble"
import { AudioPlayer } from "@/components/audio-player"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw, BookmarkPlus, Share2, Stethoscope } from "lucide-react"
import { saveConversation } from "@/utils/storage"
import type { VoiceResponse } from "@/utils/api"

export default function ResponsePage() {
  const router = useRouter()
  const [response, setResponse] = useState<VoiceResponse | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const data = sessionStorage.getItem("voicecare-response")
    if (data) {
      const parsed = JSON.parse(data) as VoiceResponse
      setResponse(parsed)

      // Browser TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(parsed.ai_text);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      router.replace("/")
    }
  }, [router])

  const handleSave = () => {
    if (!response) return

    saveConversation({
      transcript: response.transcript,
      aiResponse: response.ai_text,
      audioBase64: response.audio_base64,
    })
    setSaved(true)
  }

  const handleShare = async () => {
    if (!response) return

    try {
      await navigator.share({
        title: "VoiceCare AI Response",
        text: `Q: ${response.transcript}\n\nA: ${response.ai_text}`,
      })
    } catch {
      // User cancelled or share not supported
      await navigator.clipboard.writeText(`Q: ${response.transcript}\n\nA: ${response.ai_text}`)
    }
  }

  const handleAskAnother = () => {
    sessionStorage.removeItem("voicecare-response")
    router.push("/")
  }

  const handleAddToJournal = () => {
    if (!response) return
    sessionStorage.setItem("voicecare-journal-draft", response.ai_text)
    router.push("/journal")
  }

  if (!response) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground sr-only">AI Response</h1>

        {/* Conversation */}
        <div className="space-y-4">
          <ChatBubble message={response.transcript} isAI={false} />
          <ChatBubble message={response.ai_text} isAI={true} />
        </div>

        {/* Audio Player */}
        {response.audio_base64 && (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-2">Listen to the response</p>
              <AudioPlayer audioBase64={response.audio_base64} label="Play AI response" />
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={saved ? "secondary" : "outline"}
            size="lg"
            onClick={handleSave}
            disabled={saved}
            className="gap-2"
          >
            <BookmarkPlus className="w-5 h-5" />
            {saved ? "Saved!" : "Save"}
          </Button>

          <Button variant="outline" size="lg" onClick={handleShare} className="gap-2 bg-transparent">
            <Share2 className="w-5 h-5" />
            Share
          </Button>

          <Button variant="outline" size="lg" onClick={handleAddToJournal} className="gap-2 bg-transparent">
            <Stethoscope className="w-5 h-5" />
            Add to Journal
          </Button>

          <Button variant="default" size="lg" onClick={handleAskAnother} className="gap-2">
            <RefreshCw className="w-5 h-5" />
            Ask Another
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center pt-4">
          This is general health information, not medical advice. Please consult a healthcare professional for your
          specific situation.
        </p>
      </div>
    </main>
  )
}
