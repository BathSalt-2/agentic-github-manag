import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar } from '@/components/ui/avatar'
import { Robot, User, PaperPlaneRight, Sparkle, Bug } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

function formatMessageContent(content: string) {
  const issuePattern = /#(\d+)/g
  const urlPattern = /(https?:\/\/github\.com\/[^\s]+)/g
  
  const parts: Array<{ type: 'text' | 'issue' | 'url', content: string, number?: number }> = []
  let lastIndex = 0
  
  const allMatches: Array<{ index: number, length: number, type: 'issue' | 'url', content: string, number?: number }> = []
  
  let match
  while ((match = issuePattern.exec(content)) !== null) {
    allMatches.push({
      index: match.index,
      length: match[0].length,
      type: 'issue',
      content: match[0],
      number: parseInt(match[1])
    })
  }
  
  while ((match = urlPattern.exec(content)) !== null) {
    allMatches.push({
      index: match.index,
      length: match[0].length,
      type: 'url',
      content: match[0]
    })
  }
  
  allMatches.sort((a, b) => a.index - b.index)
  
  allMatches.forEach((match) => {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.substring(lastIndex, match.index) })
    }
    parts.push({ type: match.type, content: match.content, number: match.number })
    lastIndex = match.index + match.length
  })
  
  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.substring(lastIndex) })
  }
  
  return parts.length > 0 ? parts : [{ type: 'text' as const, content }]
}

function MessageContent({ content, isUserMessage }: { content: string, isUserMessage: boolean }) {
  const parts = formatMessageContent(content)
  
  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed">
      {parts.map((part, idx) => {
        if (part.type === 'issue') {
          return (
            <span
              key={idx}
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-xs",
                isUserMessage 
                  ? "bg-primary-foreground/20" 
                  : "bg-primary/20 text-primary"
              )}
            >
              <Bug size={12} weight="fill" />
              {part.content}
            </span>
          )
        }
        if (part.type === 'url') {
          return (
            <a
              key={idx}
              href={part.content}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "underline hover:no-underline",
                isUserMessage ? "text-primary-foreground" : "text-primary"
              )}
            >
              {part.content}
            </a>
          )
        }
        return <span key={idx}>{part.content}</span>
      })}
    </div>
  )
}

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
  issueDataAvailable?: boolean
  issueCount?: number
}

export function ChatInterface({ 
  repoName, 
  messages, 
  onSendMessage, 
  isProcessing,
  issueDataAvailable = false,
  issueCount = 0
}: ChatInterfaceProps) {
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
          <div className="flex-1">
            <h3 className="font-semibold">AI Repository Assistant</h3>
            <p className="text-xs text-muted-foreground">
              Chat about {repoName}
              {issueDataAvailable && issueCount > 0 && (
                <span className="ml-2 text-success">
                  • {issueCount} issues loaded
                </span>
              )}
            </p>
          </div>
          {issueDataAvailable && (
            <div className="h-2 w-2 bg-success rounded-full animate-pulse" title="Real-time issue data available" />
          )}
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
                  onClick={() => onSendMessage("Which issues are missing labels?")}
                  disabled={isProcessing}
                >
                  Which issues lack labels?
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendMessage("Show me the oldest open issues")}
                  disabled={isProcessing}
                >
                  Show oldest issues
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendMessage("Analyze repository health")}
                  disabled={isProcessing}
                >
                  Analyze repo health
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendMessage("What issues have the most comments?")}
                  disabled={isProcessing}
                >
                  Issues with most activity
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendMessage("Help me prioritize issue triage")}
                  disabled={isProcessing}
                >
                  Help prioritize triage
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
                  <MessageContent 
                    content={message.content} 
                    isUserMessage={message.role === 'user'} 
                  />
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
