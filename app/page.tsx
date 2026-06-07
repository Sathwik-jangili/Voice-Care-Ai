"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MicButton } from "@/components/mic-button"
import { AccessibilityPanel } from "@/components/accessibility-panel"
import { Heart } from "lucide-react"
import { fetchPatients, importPatients } from "@/utils/api"

export default function Home() {
  const router = useRouter()
  const [isRecording, setIsRecording] = useState(false)
  const [patients, setPatients] = useState<any[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPatients = async () => {
      try {
        let data = await fetchPatients();
        if (data.length === 0) {
          // Auto import if empty
          await importPatients();
          data = await fetchPatients();
        }
        setPatients(data);
        if (data.length > 0) {
          setSelectedPatientId(data[0].id);
          sessionStorage.setItem("voicecare-patient-id", data[0].id);
        }
      } catch (e) {
        console.error("Failed to load patients", e);
      } finally {
        setLoading(false);
      }
    }
    loadPatients();
  }, [])

  const handleStartRecording = useCallback(() => {
    setIsRecording(true)
  }, [])

  const handleStopRecording = useCallback(
    async (audioBlob: Blob, transcript?: string) => {
      setIsRecording(false)
      const reader = new FileReader()
      reader.onload = () => {
        sessionStorage.setItem("voicecare-audio", reader.result as string)
        if (transcript) {
          sessionStorage.setItem("voicecare-transcript", transcript)
        }
        router.push("/listening")
      }
      reader.readAsDataURL(audioBlob)
    },
    [router],
  )

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 py-8">
      {/* Accessibility toggle in top right with safe area */}
      <div className="fixed top-4 right-4 pt-[env(safe-area-inset-top)] z-40">
        <AccessibilityPanel />
      </div>

      <div className="w-full max-w-md flex flex-col items-center gap-10 text-center">
        {/* Header */}
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-full glass flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10 text-foreground" fill="currentColor" />
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">VoiceCare AI</h1>
          <p className="text-muted-foreground text-lg">
            {loading ? "Loading patients..." : `Helping ${patients.find(p => p.id === selectedPatientId)?.name || 'Patient'}`}
          </p>

          {!loading && patients.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Select Patient:</label>
              <select
                className="w-full p-3 rounded-lg border bg-background glass"
                value={selectedPatientId}
                onChange={(e) => {
                  setSelectedPatientId(e.target.value);
                  sessionStorage.setItem("voicecare-patient-id", e.target.value);
                }}
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (ID: {p.id})
                  </option>
                ))}
              </select>
              <div className="text-xs text-muted-foreground p-2 glass rounded">
                {(() => {
                  const patient = patients.find(p => p.id === selectedPatientId);
                  if (!patient) return '';
                  return `Age: ${patient.birth_date ? new Date().getFullYear() - new Date(patient.birth_date).getFullYear() : 'Unknown'} | Gender: ${patient.gender || 'Unknown'} | Risk Factors: ${patient.risk_factors || 'None'}`;
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Main CTA - larger and more prominent */}
        <div className="flex flex-col items-center gap-8">
          <p className="text-xl text-foreground font-medium">{isRecording ? "Listening to you..." : "Tap to speak"}</p>

          <MicButton
            isRecording={isRecording}
            isDisabled={loading}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
          />

          <p className="text-muted-foreground max-w-xs leading-relaxed">
            {isRecording ? "Tap again when you're done speaking" : "Ask any health question in your own words"}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const input = form.elements.namedItem("query") as HTMLInputElement
              if (input.value.trim()) {
                sessionStorage.setItem("voicecare-transcript", input.value.trim())
                const dummyBlob = new Blob([], { type: "audio/webm" })
                const reader = new FileReader()
                reader.onload = () => {
                  sessionStorage.setItem("voicecare-audio", reader.result as string)
                  router.push("/listening")
                }
                reader.readAsDataURL(dummyBlob)
              }
            }}
            className="w-full max-w-xs flex gap-2"
          >
            <input
              name="query"
              type="text"
              placeholder="Or type your question..."
              className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="submit"
              className="h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              Ask
            </button>
          </form>
        </div>

        {/* Footer disclaimer */}
        <footer className="mt-auto">
          <div className="glass-subtle rounded-2xl p-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              VoiceCare AI provides general health information only. Always consult a healthcare professional for
              medical advice.
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}
