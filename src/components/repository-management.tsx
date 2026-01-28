import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ChatInterface, ChatMessage } from './chat-interface'
import { Repository } from '@/lib/types'
import { 
  ArrowLeft, 
  GitBranch, 
  Bug, 
  GitPullRequest, 
  Rocket,
  Clock,
  Gear,
  ChatCircle,
  ListChecks
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface RepositoryManagementProps {
  repository: Repository
  onBack: () => void
}

export function RepositoryManagement({ repository, onBack }: RepositoryManagementProps) {
  const [chatMessages, setChatMessages] = useKV<ChatMessage[]>(
    `chat-${repository.id}`,
    []
  )
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content,
      timestamp: new Date()
    }

    const loadingMessage: ChatMessage = {
      id: `msg-${Date.now()}-assistant`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    }

    setChatMessages((current) => [...(current || []), userMessage, loadingMessage])
    setIsProcessing(true)

    try {
      const prompt = `You are an AI GitHub repository assistant helping manage the repository "${repository.fullName}".

The repository currently has:
- ${repository.openIssues} open issues
- ${repository.openPRs} open pull requests  
- ${repository.activeDeployments} active deployment(s)
- Status: ${repository.status}

User question: ${content}

Provide a helpful, actionable response about repository management, issue triage, deployments, or workflows. Be specific and concise. If the user asks you to perform an action, explain what you would do and ask for confirmation.`

      const response = await window.spark.llm(prompt, 'gpt-4o')

      setChatMessages((current) =>
        (current || []).map((msg) =>
          msg.id === loadingMessage.id
            ? { ...msg, content: response, isLoading: false }
            : msg
        )
      )
    } catch (error) {
      console.error('Chat error:', error)
      setChatMessages((current) =>
        (current || []).map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: 'Sorry, I encountered an error processing your request. Please try again.',
                isLoading: false
              }
            : msg
        )
      )
      toast.error('Failed to get AI response')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClearChat = () => {
    setChatMessages([])
    toast.success('Chat history cleared')
  }

  const currentMessages = chatMessages || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-3">
            <GitBranch size={32} weight="duotone" className="text-primary" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{repository.name}</h1>
              <p className="text-sm text-muted-foreground font-mono">{repository.fullName}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={repository.status === 'healthy' ? 'default' : 'destructive'}>
            {repository.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Bug size={20} className="text-destructive" />
              <span className="text-2xl font-bold">{repository.openIssues}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pull Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <GitPullRequest size={20} className="text-primary" />
              <span className="text-2xl font-bold">{repository.openPRs}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Deploys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Rocket size={20} className="text-success" />
              <span className="text-2xl font-bold">{repository.activeDeployments}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-muted-foreground" />
              <span className="text-sm">
                {new Date(repository.lastActivity).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="chat" className="gap-2">
            <ChatCircle size={18} weight="duotone" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="issues" className="gap-2">
            <Bug size={18} weight="duotone" />
            <span className="hidden sm:inline">Issues</span>
          </TabsTrigger>
          <TabsTrigger value="actions" className="gap-2">
            <ListChecks size={18} weight="duotone" />
            <span className="hidden sm:inline">Actions</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Gear size={18} weight="duotone" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">AI Assistant</h2>
              <p className="text-sm text-muted-foreground">
                Ask questions and get help managing this repository
              </p>
            </div>
            {currentMessages.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearChat}>
                Clear History
              </Button>
            )}
          </div>
          <div className="h-[600px]">
            <ChatInterface
              repoName={repository.name}
              messages={currentMessages}
              onSendMessage={handleSendMessage}
              isProcessing={isProcessing}
            />
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Issue Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                View and manage issues for {repository.name}
              </p>
              <Separator />
              <div className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Bug size={18} className="mr-2" />
                  View All Issues ({repository.openIssues})
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <ListChecks size={18} className="mr-2" />
                  Triage Issues
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Execute common repository management tasks
              </p>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button variant="outline" className="justify-start">
                  <Rocket size={18} className="mr-2" />
                  Deploy to Staging
                </Button>
                <Button variant="outline" className="justify-start">
                  <GitPullRequest size={18} className="mr-2" />
                  Review PRs
                </Button>
                <Button variant="outline" className="justify-start">
                  <ListChecks size={18} className="mr-2" />
                  Run Triage
                </Button>
                <Button variant="outline" className="justify-start">
                  <Bug size={18} className="mr-2" />
                  Create Issue
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Repository Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Configure automation and preferences for {repository.name}
              </p>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto Triage</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically label and assign new issues
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Deployment Rules</p>
                    <p className="text-sm text-muted-foreground">
                      Set approval requirements for deployments
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
