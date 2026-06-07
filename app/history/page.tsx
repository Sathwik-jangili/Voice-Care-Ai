"use client"

import { useState, useEffect } from "react"
import { HistoryCard } from "@/components/history-card"
import { Button } from "@/components/ui/button"
import { getConversations, deleteConversation, type Conversation } from "@/utils/storage"
import { playAudioFromBase64 } from "@/utils/audio"
import { useAccessibility } from "@/context/accessibility-context"
import { History, Trash2, MessageSquare } from "lucide-react"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChatBubble } from "@/components/chat-bubble"
import { AudioPlayer } from "@/components/audio-player"

export default function HistoryPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const { settings } = useAccessibility()

  useEffect(() => {
    setConversations(getConversations())
  }, [])

  const handleDelete = (id: string) => {
    deleteConversation(id)
    setConversations(getConversations())
  }

  const handleClearAll = () => {
    conversations.forEach((c) => deleteConversation(c.id))
    setConversations([])
  }

  const handlePlay = (conversation: Conversation) => {
    if (conversation.audioBase64) {
      playAudioFromBase64(conversation.audioBase64, settings.slowPlayback ? 0.75 : 1)
    }
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">History</h1>
              <p className="text-sm text-muted-foreground">
                {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {conversations.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 text-destructive bg-transparent">
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your saved conversations. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground">
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Conversation List */}
        {conversations.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-medium text-foreground mb-2">No conversations yet</h2>
            <p className="text-muted-foreground">Your saved conversations will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <HistoryCard
                key={conversation.id}
                conversation={conversation}
                onPlay={() => handlePlay(conversation)}
                onDelete={() => handleDelete(conversation.id)}
                onClick={() => setSelectedConversation(conversation)}
              />
            ))}
          </div>
        )}

        {/* Conversation Detail Dialog */}
        <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Conversation</DialogTitle>
            </DialogHeader>
            {selectedConversation && (
              <div className="space-y-4 pt-4">
                <ChatBubble message={selectedConversation.transcript} isAI={false} />
                <ChatBubble message={selectedConversation.aiResponse} isAI={true} />

                {selectedConversation.audioBase64 && (
                  <div className="pt-4">
                    <AudioPlayer audioBase64={selectedConversation.audioBase64} label="Play response" />
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}
