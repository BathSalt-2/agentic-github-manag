import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Robot, FileText, Sparkle, Copy, CheckCircle, ArrowSquareOut } from '@phosphor-icons/react'
import { generateIssueTemplate } from '@/lib/issue-template-ai'
import { useGitHub } from '@/lib/github-context'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface IssueTemplate {
  title: string
  body: string
  labels: string[]
  assignees: string[]
  reasoning: string
}

interface Props {
  repoFullName?: string
  trigger?: React.ReactNode
}

export function IssueTemplateGenerator({ repoFullName, trigger }: Props) {
  const { repositories, isConnected } = useGitHub()
  const [open, setOpen] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState<string>(repoFullName || '')
  const [issueType, setIssueType] = useState<string>('bug')
  const [userInput, setUserInput] = useState('')
  const [context, setContext] = useState('')
  const [generating, setGenerating] = useState(false)
  const [template, setTemplate] = useState<IssueTemplate | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const issueTypes = [
    { value: 'bug', label: 'Bug Report', description: 'Report a problem or unexpected behavior' },
    { value: 'feature', label: 'Feature Request', description: 'Suggest a new feature or enhancement' },
    { value: 'documentation', label: 'Documentation', description: 'Improve or add documentation' },
    { value: 'performance', label: 'Performance Issue', description: 'Report slow or inefficient behavior' },
    { value: 'security', label: 'Security Concern', description: 'Report a security vulnerability' },
    { value: 'question', label: 'Question', description: 'Ask for help or clarification' },
  ]

  async function generateTemplate() {
    if (!userInput.trim()) {
      toast.error('Please provide a description')
      return
    }

    const targetRepo = selectedRepo || repoFullName

    setGenerating(true)
    try {
      const result = await generateIssueTemplate({
        type: issueType,
        description: userInput,
        context: context || undefined,
        repoName: targetRepo,
      })
      setTemplate(result)
      toast.success('Template generated successfully')
    } catch (error) {
      toast.error('Failed to generate template')
      console.error(error)
    } finally {
      setGenerating(false)
    }
  }

  function copyToClipboard(content: string, label: string) {
    navigator.clipboard.writeText(content)
    setCopied(label)
    toast.success(`${label} copied to clipboard`)
    setTimeout(() => setCopied(null), 2000)
  }

  function copyFullIssue() {
    if (!template) return
    const fullIssue = `${template.title}\n\n${template.body}\n\nLabels: ${template.labels.join(', ')}`
    copyToClipboard(fullIssue, 'Full issue')
  }

  function openInGitHub() {
    if (!template) return
    const targetRepo = selectedRepo || repoFullName
    if (!targetRepo) return
    
    const [owner, repo] = targetRepo.split('/')
    const params = new URLSearchParams({
      title: template.title,
      body: template.body,
      labels: template.labels.join(','),
    })
    const url = `https://github.com/${owner}/${repo}/issues/new?${params.toString()}`
    window.open(url, '_blank')
  }

  function resetForm() {
    setUserInput('')
    setContext('')
    setIssueType('bug')
    setTemplate(null)
    setCopied(null)
    if (!repoFullName) {
      setSelectedRepo('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) {
        setTimeout(resetForm, 300)
      }
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Sparkle size={18} weight="duotone" />
            Generate Issue Template
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Robot size={24} weight="duotone" className="text-primary" />
            Smart Issue Template Generator
          </DialogTitle>
          <DialogDescription>
            Describe your issue and let AI generate a comprehensive, well-structured template
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {!template ? (
              <>
                {!repoFullName && isConnected && repositories.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="repository">Repository</Label>
                    <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                      <SelectTrigger id="repository">
                        <SelectValue placeholder="Select a repository" />
                      </SelectTrigger>
                      <SelectContent>
                        {repositories.map((repo) => (
                          <SelectItem key={repo.id} value={repo.fullName}>
                            {repo.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="issue-type">Issue Type</Label>
                  <Select value={issueType} onValueChange={setIssueType}>
                    <SelectTrigger id="issue-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {issueTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex flex-col items-start gap-1">
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-input">
                    Describe the Issue <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="user-input"
                    placeholder="E.g., 'The login button doesn't work on mobile devices' or 'We need a dark mode toggle'"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide a brief description of what you want to report or request
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="context">Additional Context (Optional)</Label>
                  <Textarea
                    id="context"
                    placeholder="E.g., 'This happens on iOS Safari' or 'Related to authentication flow'"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Add any extra details that might help generate a better template
                  </p>
                </div>

                {(repoFullName || selectedRepo) && (
                  <Alert>
                    <FileText size={16} weight="duotone" />
                    <AlertDescription>
                      Template will be generated for <span className="font-mono font-medium">{repoFullName || selectedRepo}</span>
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={generateTemplate} 
                  disabled={generating || !userInput.trim()}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Robot size={20} weight="duotone" />
                  {generating ? 'Generating Template...' : 'Generate Smart Template'}
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-4 bg-accent/10 p-4 rounded-lg border border-accent/30">
                  <div className="flex items-center gap-2">
                    <Sparkle size={20} weight="duotone" className="text-primary" />
                    <span className="font-semibold">AI-Generated Template</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-muted-foreground">TITLE</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1"
                          onClick={() => copyToClipboard(template.title, 'Title')}
                        >
                          {copied === 'Title' ? (
                            <>
                              <CheckCircle size={14} weight="fill" />
                              <span className="text-xs">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span className="text-xs">Copy</span>
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="p-3 bg-background rounded border font-medium">
                        {template.title}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-muted-foreground">BODY</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1"
                          onClick={() => copyToClipboard(template.body, 'Body')}
                        >
                          {copied === 'Body' ? (
                            <>
                              <CheckCircle size={14} weight="fill" />
                              <span className="text-xs">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span className="text-xs">Copy</span>
                            </>
                          )}
                        </Button>
                      </div>
                      <ScrollArea className="h-[300px]">
                        <div className="p-3 bg-background rounded border text-sm whitespace-pre-wrap font-mono leading-relaxed">
                          {template.body}
                        </div>
                      </ScrollArea>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">SUGGESTED LABELS</Label>
                        <div className="flex flex-wrap gap-2">
                          {template.labels.map((label) => (
                            <Badge key={label} variant="secondary" className="text-xs">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {template.assignees.length > 0 && (
                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 block">SUGGESTED ASSIGNEES</Label>
                          <div className="flex flex-wrap gap-2">
                            {template.assignees.map((assignee) => (
                              <Badge key={assignee} variant="outline" className="text-xs">
                                @{assignee}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">AI REASONING</Label>
                      <div className="text-sm text-muted-foreground italic">
                        {template.reasoning}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={copyFullIssue} variant="outline" className="flex-1 gap-2">
                    <Copy size={18} />
                    Copy Full Issue
                  </Button>
                  {(repoFullName || selectedRepo) && (
                    <Button onClick={openInGitHub} className="flex-1 gap-2">
                      <ArrowSquareOut size={18} />
                      Open in GitHub
                    </Button>
                  )}
                </div>

                <Button 
                  onClick={resetForm} 
                  variant="ghost" 
                  className="w-full"
                >
                  Generate Another Template
                </Button>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
