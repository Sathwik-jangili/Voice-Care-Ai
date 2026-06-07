"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw } from "lucide-react"
import { useAccessibility } from "@/context/accessibility-context"
import { formatDuration } from "@/utils/audio"

interface AudioPlayerProps {
  audioBase64?: string
  audioUrl?: string
  label?: string
}

export function AudioPlayer({ audioBase64, audioUrl, label = "Play audio" }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const { settings } = useAccessibility()

  const src = audioBase64 ? `data:audio/mp3;base64,${audioBase64}` : audioUrl

  useEffect(() => {
    if (!src) return

    const audio = new Audio(src)
    audioRef.current = audio

    audio.playbackRate = settings.slowPlayback ? 0.75 : 1

    audio.onloadedmetadata = () => setDuration(audio.duration)
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime)
    audio.onended = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }
    audio.onpause = () => setIsPlaying(false)
    audio.onplay = () => setIsPlaying(true)

    return () => {
      audio.pause()
      audio.src = ""
    }
  }, [src, settings.slowPlayback])

  const togglePlayback = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = value[0]
    setCurrentTime(value[0])
  }

  const restart = () => {
    if (!audioRef.current) return
    audioRef.current.currentTime = 0
    setCurrentTime(0)
    audioRef.current.play()
  }

  if (!src) return null

  return (
    <div className="flex items-center gap-3 p-3 glass rounded-xl">
      <Button
        size="icon"
        variant="ghost"
        onClick={togglePlayback}
        aria-label={isPlaying ? "Pause" : label}
        className="shrink-0 hover:bg-white/20"
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </Button>

      <div className="flex-1 space-y-1">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full"
          aria-label="Audio progress"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      <Button size="icon" variant="ghost" onClick={restart} aria-label="Restart" className="shrink-0 hover:bg-white/20">
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  )
}
