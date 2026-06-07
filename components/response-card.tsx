"use client"

import { useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2 } from "lucide-react"

interface ResponseCardProps {
  transcript: string
  aiText: string
  audioBase64?: string
}

export function ResponseCard({ transcript, aiText, audioBase64 }: ResponseCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayAudio = () => {
    if (!audioBase64) return

    if (!audioRef.current) {
      // Create audio element from base64
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`)
      audioRef.current = audio

      audio.onended = () => setIsPlaying(false)
      audio.onpause = () => setIsPlaying(false)
      audio.onplay = () => setIsPlaying(true)
    }

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      {/* User's transcript */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            You asked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground text-lg leading-relaxed">{transcript}</p>
        </CardContent>
      </Card>

      {/* AI Response */}
      <Card className="border-primary/20 bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            VoiceCare AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-foreground leading-relaxed whitespace-pre-wrap">{aiText}</div>

          {audioBase64 && (
            <Button onClick={handlePlayAudio} variant="secondary" className="gap-2">
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause Audio
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Play Response
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
