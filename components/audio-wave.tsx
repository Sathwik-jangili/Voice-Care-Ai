"use client"

export function AudioWave() {
  return (
    <div className="flex items-center justify-center gap-1 h-12" role="status" aria-label="Recording audio">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1.5 h-8 bg-primary rounded-full animate-wave"
          style={{
            animationDelay: `${i * 0.15}s`,
            height: `${16 + Math.random() * 16}px`,
          }}
        />
      ))}
    </div>
  )
}
