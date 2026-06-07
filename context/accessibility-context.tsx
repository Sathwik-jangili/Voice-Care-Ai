"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Language = "en" | "ur" | "ar"

interface AccessibilitySettings {
  highContrast: boolean
  largeText: boolean
  language: Language
  slowPlayback: boolean
}

interface AccessibilityContextType {
  settings: AccessibilitySettings
  toggleHighContrast: () => void
  toggleLargeText: () => void
  setLanguage: (lang: Language) => void
  toggleSlowPlayback: () => void
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  language: "en",
  slowPlayback: false,
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings)

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("voicecare-accessibility")
    if (stored) {
      try {
        setSettings(JSON.parse(stored))
      } catch {
        // Invalid JSON, use defaults
      }
    }
  }, [])

  // Save settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem("voicecare-accessibility", JSON.stringify(settings))

    // Apply high contrast class to document
    if (settings.highContrast) {
      document.documentElement.classList.add("high-contrast")
    } else {
      document.documentElement.classList.remove("high-contrast")
    }

    // Apply large text class
    if (settings.largeText) {
      document.documentElement.classList.add("large-text")
    } else {
      document.documentElement.classList.remove("large-text")
    }
  }, [settings])

  const toggleHighContrast = () => {
    setSettings((prev) => ({ ...prev, highContrast: !prev.highContrast }))
  }

  const toggleLargeText = () => {
    setSettings((prev) => ({ ...prev, largeText: !prev.largeText }))
  }

  const setLanguage = (language: Language) => {
    setSettings((prev) => ({ ...prev, language }))
  }

  const toggleSlowPlayback = () => {
    setSettings((prev) => ({ ...prev, slowPlayback: !prev.slowPlayback }))
  }

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        toggleHighContrast,
        toggleLargeText,
        setLanguage,
        toggleSlowPlayback,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider")
  }
  return context
}
