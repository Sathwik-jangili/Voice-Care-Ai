"use client"

import { useAccessibility, type Language } from "@/context/accessibility-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Settings, Eye, Type, Globe, Volume2, Trash2, BarChart3 } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const languages: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ur", label: "اردو (Urdu)" },
  { value: "ar", label: "العربية (Arabic)" },
]

export default function SettingsPage() {
  const { settings, toggleHighContrast, toggleLargeText, setLanguage, toggleSlowPlayback } = useAccessibility()

  const handleClearAllData = () => {
    localStorage.removeItem("voicecare-conversations")
    localStorage.removeItem("voicecare-journal")
    window.location.reload()
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Customize your experience</p>
          </div>
        </div>

        {/* Accessibility Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Accessibility</CardTitle>
            <CardDescription>Make the app easier to use</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* High Contrast */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="high-contrast" className="text-base font-medium">
                    High Contrast
                  </Label>
                  <p className="text-sm text-muted-foreground">Increase color contrast for better visibility</p>
                </div>
              </div>
              <Switch id="high-contrast" checked={settings.highContrast} onCheckedChange={toggleHighContrast} />
            </div>

            {/* Large Text */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Type className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="large-text" className="text-base font-medium">
                    Large Text
                  </Label>
                  <p className="text-sm text-muted-foreground">Increase text size throughout the app</p>
                </div>
              </div>
              <Switch id="large-text" checked={settings.largeText} onCheckedChange={toggleLargeText} />
            </div>

            {/* Slow Playback */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="slow-playback" className="text-base font-medium">
                    Slow Playback
                  </Label>
                  <p className="text-sm text-muted-foreground">Play audio responses at 75% speed</p>
                </div>
              </div>
              <Switch id="slow-playback" checked={settings.slowPlayback} onCheckedChange={toggleSlowPlayback} />
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Language</CardTitle>
            <CardDescription>Choose your preferred language</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <Select value={settings.language} onValueChange={(v) => setLanguage(v as Language)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Note: Language support is coming soon</p>
          </CardContent>
        </Card>

        {/* Analytics Link */}
        <Card>
          <CardHeader>
            <CardTitle>Your Data</CardTitle>
            <CardDescription>View your usage statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/analytics">
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                <BarChart3 className="w-5 h-5" />
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full gap-2">
                  <Trash2 className="w-5 h-5" />
                  Clear All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your conversations, journal entries, and settings. This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearAllData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>VoiceCare AI v1.0.0</p>
          <p>Made with care for accessible healthcare</p>
        </div>
      </div>
    </main>
  )
}
