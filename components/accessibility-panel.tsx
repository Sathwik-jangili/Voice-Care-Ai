"use client"

import { useAccessibility, type Language } from "@/context/accessibility-context"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Settings, Eye, Type, Globe, Volume2 } from "lucide-react"

const languages: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ur", label: "اردو (Urdu)" },
  { value: "ar", label: "العربية (Arabic)" },
]

export function AccessibilityPanel() {
  const { settings, toggleHighContrast, toggleLargeText, setLanguage, toggleSlowPlayback } = useAccessibility()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-12 h-12 glass border-white/20 hover:bg-white/20 bg-transparent"
          aria-label="Open accessibility settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md glass-heavy border-l-white/10">
        <SheetHeader>
          <SheetTitle className="text-2xl">Accessibility</SheetTitle>
          <SheetDescription>Customize the app to make it easier to use</SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          {/* High Contrast - Glass card */}
          <div className="flex items-center justify-between gap-4 p-4 glass rounded-xl">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-foreground" />
              <div>
                <Label htmlFor="high-contrast" className="text-base font-medium">
                  High Contrast
                </Label>
                <p className="text-sm text-muted-foreground">Make text easier to see</p>
              </div>
            </div>
            <Switch id="high-contrast" checked={settings.highContrast} onCheckedChange={toggleHighContrast} />
          </div>

          {/* Large Text - Glass card */}
          <div className="flex items-center justify-between gap-4 p-4 glass rounded-xl">
            <div className="flex items-center gap-3">
              <Type className="w-5 h-5 text-foreground" />
              <div>
                <Label htmlFor="large-text" className="text-base font-medium">
                  Large Text
                </Label>
                <p className="text-sm text-muted-foreground">Increase text size</p>
              </div>
            </div>
            <Switch id="large-text" checked={settings.largeText} onCheckedChange={toggleLargeText} />
          </div>

          {/* Slow Playback - Glass card */}
          <div className="flex items-center justify-between gap-4 p-4 glass rounded-xl">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-foreground" />
              <div>
                <Label htmlFor="slow-playback" className="text-base font-medium">
                  Slow Playback
                </Label>
                <p className="text-sm text-muted-foreground">Play audio more slowly</p>
              </div>
            </div>
            <Switch id="slow-playback" checked={settings.slowPlayback} onCheckedChange={toggleSlowPlayback} />
          </div>

          {/* Language - Glass card */}
          <div className="p-4 glass rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-foreground" />
              <Label className="text-base font-medium">Language</Label>
            </div>
            <Select value={settings.language} onValueChange={(v) => setLanguage(v as Language)}>
              <SelectTrigger className="w-full glass-subtle border-white/20">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent className="glass-heavy border-white/20">
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
