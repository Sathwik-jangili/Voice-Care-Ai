const API_BASE_URL = "http://127.0.0.1:8000"

/* -----------------------------
 *  TYPES
 * -----------------------------*/

export interface VoiceResponse {
  transcript: string
  ai_text: string
  audio_base64?: string
}

export interface GuideResponse {
  explanation: string
  nextSteps: string[]
  audioBase64?: string
}

export interface NavigatorResponse {
  whatToExpect: string[]
  thingsToBring: string[]
  questionsToAsk: string[]
  notes: string
  audioBase64?: string
}

export interface JournalEntryData {
  title: string
  content: string
  mood?: string
  tags?: string
}

/* -----------------------------
 *  AI QUERY (TEXT → AI)
 * -----------------------------*/

export async function getAIResponse(text: string, patientId: string): Promise<{ response: string }> {
  try {
    const response = await fetch('/api/chat', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: text,
        patientId: patientId
      }),
    });

    if (!response.ok) {
      const msg = await response.text();
      throw new Error(`AI Response Failed: ${msg}`);
    }

    const data = await response.json();
    return { response: data.ai_text };
  } catch (error) {
    console.error('AI Response error:', error);
    // Fallback response
    return { response: "I'm having trouble processing your request right now. Please try again or consult a healthcare professional for immediate concerns." };
  }
}

/* -----------------------------
 *  PROCESS VOICE QUERY
 * -----------------------------*/

export async function processVoiceQuery(
  blob: Blob,
  transcript: string | undefined,
  patientId: string
): Promise<VoiceResponse> {

  if (!transcript) {
    return {
      transcript: "Error",
      ai_text: "I couldn't hear you. Please check your microphone and try again.",
      audio_base64: undefined
    }
  }

  const aiRes = await getAIResponse(transcript, patientId);

  return {
    transcript,
    ai_text: aiRes.response,
    audio_base64: undefined // Browser TTS only
  }
}

/* -----------------------------
 *  PATIENTS
 * -----------------------------*/

export async function fetchPatients() {
  try {
    const response = await fetch(`/api/patients`);
    if (!response.ok) {
      throw new Error(`Failed to fetch patients: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching patients:', error);
    // Return empty array on error to prevent app from breaking
    return [];
  }
}

export async function importPatients() {
  const response = await fetch(`${API_BASE_URL}/patients/fetch`, { method: "POST" })
  if (!response.ok) throw new Error("Failed to import patients")
  return response.json()
}

/* -----------------------------
 *  GUIDE EXPLANATION (EDUCATION)
 * -----------------------------*/

export async function getGuideExplanation(topic: string, patientId: string = "general"): Promise<GuideResponse> {
  const formData = new FormData()
  formData.append("topic", topic)
  formData.append("patient_id", patientId)

  const response = await fetch(`${API_BASE_URL}/guide/search`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const msg = await response.text()
    throw new Error(`Guide Failed: ${msg}`)
  }

  const data = await response.json()

  return {
    explanation: data.explanation || "",
    nextSteps: data.nextSteps || [],
    audioBase64: undefined
  }
}

/* -----------------------------
 *  CARE NAVIGATOR
 * -----------------------------*/

export async function getNextSteps(concern: string, patientId: string = "general"): Promise<NavigatorResponse> {
  const formData = new FormData()
  formData.append("query", concern)
  formData.append("patient_id", patientId)

  const response = await fetch(`${API_BASE_URL}/navigator/query`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const msg = await response.text()
    throw new Error(`Navigator Failed: ${msg}`)
  }

  const data = await response.json()

  return {
    whatToExpect: data.whatToExpect || [],
    thingsToBring: data.thingsToBring || [],
    questionsToAsk: data.questionsToAsk || [],
    notes: data.notes || "",
    audioBase64: undefined
  }
}

/* -----------------------------
 *  JOURNAL
 * -----------------------------*/

export async function saveJournalEntry(entry: JournalEntryData, patientId: string = "general") {
  const formData = new FormData()
  formData.append("title", entry.title)
  formData.append("content", entry.content)
  if (entry.mood) formData.append("mood", entry.mood)
  if (entry.tags) formData.append("tags", entry.tags)
  formData.append("patient_id", patientId)

  const response = await fetch(`${API_BASE_URL}/journal/entry`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) throw new Error("Failed to save journal entry")

  return response.json()
}

export async function getJournalEntries(patientId: string = "general") {
  const response = await fetch(`${API_BASE_URL}/journal/entries/${patientId}`)
  if (!response.ok) throw new Error("Failed to fetch journal entries")
  return response.json()
}

export async function deleteJournalEntry(entryId: number) {
  const response = await fetch(`${API_BASE_URL}/journal/entry/${entryId}`, { method: "DELETE" })

  if (!response.ok) throw new Error("Failed to delete journal entry")
}
