"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { WaveVisualizer } from "@/components/wave-visualizer"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { processVoiceQuery } from "@/utils/api"
import { formatDuration } from "@/utils/audio"

type PageState = "processing" | "error"

export default function ListeningPage() {
  const router = useRouter()
  const [state, setState] = useState<PageState>("processing")
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const audioData = sessionStorage.getItem("voicecare-audio")
    const transcript = sessionStorage.getItem("voicecare-transcript")

    if (!audioData && !transcript) {
      router.replace("/")
      return
    }

    // Process the audio/transcript
    const processAudio = async () => {
      try {
        // Convert data URL back to Blob
        const response = await fetch(audioData)
        const blob = await response.blob()

        const patientId = sessionStorage.getItem("voicecare-patient-id") || "unknown"
        const result = await processVoiceQuery(blob, transcript || undefined, patientId)

        // Store result and navigate to response page
        sessionStorage.setItem("voicecare-response", JSON.stringify(result))
        sessionStorage.removeItem("voicecare-audio")
        sessionStorage.removeItem("voicecare-transcript")
        router.push("/response")
      } catch (err) {
        console.error("Error processing audio:", err)
        setError("Something went wrong. Please try again.")
        setState("error")
      }
    }

    processAudio()
  }, [router])

  // Timer for processing indication
  useEffect(() => {
    if (state !== "processing") return

    const interval = setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [state])

  const handleRetry = () => {
    router.push("/")
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg flex flex-col items-center gap-8">
        {state === "processing" && (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Processing</h1>
              <p className="text-muted-foreground text-lg">Understanding your question...</p>
            </div>

            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
            </div>

            <WaveVisualizer isActive={true} barCount={16} />

            <p className="text-2xl font-mono text-primary">{formatDuration(seconds)}</p>

            <p className="text-muted-foreground text-center">This may take a few moments</p>
          </>
        )}

        {state === "error" && (
          <>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-destructive">Oops!</h1>
              <p className="text-foreground text-lg">{error}</p>
            </div>

            <Button onClick={handleRetry} size="lg" className="mt-4">
              Try Again
            </Button>
          </>
        )}
      </div>
    </main>
  )
}
