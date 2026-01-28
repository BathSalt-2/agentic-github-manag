import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar } from '@/components/ui/avatar'
import { Robot, User, PaperPlaneRight, Sparkle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isLoading?: boolean
}

interface ChatInterfaceProps {
  repoName: string
  messages: ChatMessage[]
  onSendMessage: (message: string) => Promise<void>
  isProcessing: boolean
}

export function ChatInterface({ repoName, messages, onSendMessage, isProcessing }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    const message = input.trim()
    setInput('')
    await onSendMessage(message)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <Card className="flex flex-col h-full">
      <div className="border-b border-border p-4 bg-card/50">
        <div className="flex items-center gap-2">
          <Robot size={24} weight="duotone" className="text-primary" />
          <div>
            <h3 className="font-semibold">AI Repository Assistant</h3>
            <p className="text-xs text-muted-foreground">
              Chat about {repoName}
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <Sparkle size={48} weight="duotone" className="text-primary/40 mb-4" />
              <h4 className="font-semibold text-lg mb-2">Start a conversation</h4>
              <p className="text-sm text-muted-foreground max-w-md">
                Ask me to analyze issues, suggest improvements, deploy changes, or help with repository management.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 max-w-2xl">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendMessage("What issues need attention?")}
                  disabled={isProcessing}
                >
                  What issues need attention?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendMessage("Show me recent deployments")}
                  disabled={isProcessing}
                >
                  Show recent deployments
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendMessage("Analyze repository health")}
                  disabled={isProcessing}
                >
                  Analyze repository health
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendMessage("Help me with CI/CD setup")}
                  disabled={isProcessing}
                >
                  Help with CI/CD setup
                </Button>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-in fade-in slide-in-from-bottom-2",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 bg-primary/10 flex items-center justify-center shrink-0">
                  <Robot size={20} weight="duotone" className="text-primary" />
                </Avatar>
              )}
              
              <div
                className={cn(
                  "rounded-lg px-4 py-3 max-w-[80%]",
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {message.isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0ms]" />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:150ms]" />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                )}
                <div className="text-xs opacity-60 mt-2">
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>

              {message.role === 'user' && (
                <Avatar className="h-8 w-8 bg-accent/10 flex items-center justify-center shrink-0">
                  <User size={20} weight="duotone" className="text-accent" />
                </Avatar>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4 bg-card/50">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about issues, deployments, workflows..."
            className="min-h-[60px] max-h-[120px] resize-none"
            disabled={isProcessing}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isProcessing}
            className="shrink-0 h-[60px] w-[60px]"
          >
            <PaperPlaneRight size={20} weight="fill" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </Card>
  )
}
