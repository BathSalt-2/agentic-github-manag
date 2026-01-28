import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { Robot, Sparkle, Copy, CheckCircle, ArrowSquareOut, Trash, Plus, X, Info } from '@phosphor-icons/react'
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

interface IssueInput {
  id: string
  type: string
  description: string
  status: 'pending' | 'generating' | 'complete' | 'error'
  template?: IssueTemplate
  error?: string
}

interface Props {
  repoFullName?: string
  trigger?: React.ReactNode
}

export function BatchTemplateGenerator({ repoFullName, trigger }: Props) {
  const { repositories, isConnected } = useGitHub()
  const [open, setOpen] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState<string>(repoFullName || '')
  const [issueInputs, setIssueInputs] = useState<IssueInput[]>([
    { id: '1', type: 'bug', description: '', status: 'pending' }
  ])
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [copied, setCopied] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'input' | 'results'>('input')

  const issueTypes = [
    { value: 'bug', label: 'Bug' },
    { value: 'feature', label: 'Feature' },
    { value: 'documentation', label: 'Docs' },
    { value: 'performance', label: 'Performance' },
    { value: 'security', label: 'Security' },
    { value: 'question', label: 'Question' },
  ]

  function addIssueInput() {
    const newId = (Math.max(...issueInputs.map(i => parseInt(i.id))) + 1).toString()
    setIssueInputs([...issueInputs, { id: newId, type: 'bug', description: '', status: 'pending' }])
  }

  function removeIssueInput(id: string) {
    if (issueInputs.length === 1) {
      toast.error('At least one issue is required')
      return
    }
    setIssueInputs(issueInputs.filter(input => input.id !== id))
  }

  function updateIssueInput(id: string, field: keyof IssueInput, value: string) {
    setIssueInputs(issueInputs.map(input => 
      input.id === id ? { ...input, [field]: value } : input
    ))
  }

  function parseQuickInput(text: string) {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length === 0) return

    const newInputs: IssueInput[] = lines.map((line, index) => {
      let type = 'bug'
      let description = line.trim()
      
      const typeMatch = line.match(/^\[(\w+)\]\s*(.+)/)
      if (typeMatch) {
        const detectedType = typeMatch[1].toLowerCase()
        if (['bug', 'feature', 'documentation', 'performance', 'security', 'question'].includes(detectedType)) {
          type = detectedType
          description = typeMatch[2]
        }
      }

      return {
        id: (index + 1).toString(),
        type,
        description,
        status: 'pending' as const
      }
    })

    setIssueInputs(newInputs)
    toast.success(`Parsed ${newInputs.length} issue${newInputs.length !== 1 ? 's' : ''}`)
  }

  async function generateAllTemplates() {
    const validInputs = issueInputs.filter(input => input.description.trim())
    
    if (validInputs.length === 0) {
      toast.error('Please provide at least one issue description')
      return
    }

    const targetRepo = selectedRepo || repoFullName

    setGenerating(true)
    setProgress(0)

    const updatedInputs = [...issueInputs]

    try {
      const total = validInputs.length
      let completed = 0

      for (let i = 0; i < updatedInputs.length; i++) {
        const input = updatedInputs[i]
        
        if (!input.description.trim()) {
          updatedInputs[i] = { ...input, status: 'error', error: 'No description provided' }
          continue
        }

        updatedInputs[i] = { ...input, status: 'generating' }
        setIssueInputs([...updatedInputs])

        try {
          const template = await generateIssueTemplate({
            type: input.type,
            description: input.description,
            repoName: targetRepo,
          })

          updatedInputs[i] = { ...input, status: 'complete', template }
          completed++
        } catch (error) {
          updatedInputs[i] = { ...input, status: 'error', error: 'Generation failed' }
          console.error(`Failed to generate template for issue ${input.id}:`, error)
        }

        setIssueInputs([...updatedInputs])
        setProgress((completed / total) * 100)
      }

      toast.success(`Generated ${completed} of ${total} templates`)
      setActiveView('results')
    } catch (error) {
      toast.error('Batch generation failed')
      console.error(error)
    } finally {
      setGenerating(false)
      setProgress(0)
    }
  }

  function copyToClipboard(content: string, label: string) {
    navigator.clipboard.writeText(content)
    setCopied(label)
    toast.success(`${label} copied`)
    setTimeout(() => setCopied(null), 2000)
  }

  function copyAllAsMarkdown() {
    const completeInputs = issueInputs.filter(input => input.status === 'complete' && input.template)
    
    const markdown = completeInputs.map((input, index) => {
      const template = input.template!
      return `## Issue ${index + 1}: ${template.title}

${template.body}

**Labels**: ${template.labels.join(', ')}
${template.assignees.length > 0 ? `**Assignees**: ${template.assignees.map(a => `@${a}`).join(', ')}` : ''}

---
`
    }).join('\n\n')

    copyToClipboard(markdown, 'All templates')
  }

  function openInGitHub(template: IssueTemplate) {
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
    setIssueInputs([{ id: '1', type: 'bug', description: '', status: 'pending' }])
    setProgress(0)
    setActiveView('input')
    setCopied(null)
    if (!repoFullName) {
      setSelectedRepo('')
    }
  }

  const completedCount = issueInputs.filter(i => i.status === 'complete').length
  const errorCount = issueInputs.filter(i => i.status === 'error').length

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) {
        setTimeout(resetForm, 300)
      }
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Sparkle size={18} weight="duotone" />
            Batch Generate Templates
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Robot size={24} weight="duotone" className="text-primary" />
            Batch Issue Template Generator
          </DialogTitle>
          <DialogDescription>
            Generate multiple issue templates at once using AI
          </DialogDescription>
        </DialogHeader>

        {activeView === 'input' ? (
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
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

              <Alert className="bg-accent/10 border-accent/30">
                <Info size={16} weight="duotone" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-medium">Quick Entry Format</div>
                    <div className="text-xs text-muted-foreground">
                      Paste multiple issues (one per line). Optional: Prefix with type in brackets.
                      <br />
                      Example: <code className="text-xs">[bug] Login fails on Safari</code>
                    </div>
                    <Textarea
                      placeholder="[bug] Login button doesn't work on mobile&#10;[feature] Add dark mode toggle&#10;User profile images not loading"
                      rows={4}
                      className="text-xs font-mono mt-2"
                      onBlur={(e) => {
                        if (e.target.value.trim()) {
                          parseQuickInput(e.target.value)
                          e.target.value = ''
                        }
                      }}
                    />
                  </div>
                </AlertDescription>
              </Alert>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Issues ({issueInputs.length})</Label>
                  <Button onClick={addIssueInput} variant="outline" size="sm" className="gap-2">
                    <Plus size={16} />
                    Add Issue
                  </Button>
                </div>

                {issueInputs.map((input, index) => (
                  <Card key={input.id} className="p-4 relative">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Badge variant="secondary" className="mt-1 shrink-0">
                          #{index + 1}
                        </Badge>
                        <div className="flex-1 space-y-3">
                          <Select 
                            value={input.type} 
                            onValueChange={(value) => updateIssueInput(input.id, 'type', value)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {issueTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Textarea
                            placeholder="Brief description of the issue..."
                            value={input.description}
                            onChange={(e) => updateIssueInput(input.id, 'description', e.target.value)}
                            rows={2}
                            className="resize-none text-sm"
                          />
                        </div>
                        {issueInputs.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="shrink-0"
                            onClick={() => removeIssueInput(input.id)}
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Button 
                onClick={generateAllTemplates} 
                disabled={generating || issueInputs.every(i => !i.description.trim())}
                className="w-full gap-2"
                size="lg"
              >
                <Robot size={20} weight="duotone" />
                {generating ? `Generating... (${Math.round(progress)}%)` : `Generate ${issueInputs.filter(i => i.description.trim()).length} Template${issueInputs.filter(i => i.description.trim()).length !== 1 ? 's' : ''}`}
              </Button>

              {generating && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <div className="text-sm text-muted-foreground text-center">
                    Processing templates...
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={20} weight="duotone" className="text-success" />
                    <span className="font-semibold">{completedCount} generated</span>
                  </div>
                  {errorCount > 0 && (
                    <>
                      <Separator orientation="vertical" className="h-5" />
                      <span className="text-sm text-muted-foreground">
                        {errorCount} failed
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={copyAllAsMarkdown}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={completedCount === 0}
                  >
                    <Copy size={16} />
                    Copy All
                  </Button>
                  <Button
                    onClick={() => setActiveView('input')}
                    variant="ghost"
                    size="sm"
                  >
                    Back to Edit
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-6">
                {issueInputs.map((input, index) => {
                  if (input.status === 'pending' || input.status === 'generating') return null
                  if (input.status === 'error') {
                    return (
                      <Card key={input.id} className="p-4 border-destructive/50 bg-destructive/5">
                        <div className="flex items-center gap-2 text-destructive">
                          <X size={18} weight="bold" />
                          <span className="font-medium">Issue #{index + 1} failed</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{input.error}</p>
                      </Card>
                    )
                  }

                  const template = input.template!

                  return (
                    <Card key={input.id} className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">#{index + 1}</Badge>
                          <Badge variant="outline" className="capitalize">{input.type}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={() => copyToClipboard(`${template.title}\n\n${template.body}`, `Issue #${index + 1}`)}
                          >
                            {copied === `Issue #${index + 1}` ? (
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
                          {(repoFullName || selectedRepo) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-1"
                              onClick={() => openInGitHub(template)}
                            >
                              <ArrowSquareOut size={14} />
                              <span className="text-xs">Open</span>
                            </Button>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">TITLE</Label>
                        <div className="mt-1 font-semibold text-base">
                          {template.title}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label className="text-xs text-muted-foreground">BODY</Label>
                        <ScrollArea className="h-[200px] mt-1">
                          <div className="text-sm whitespace-pre-wrap font-mono text-muted-foreground bg-muted/30 p-3 rounded border">
                            {template.body}
                          </div>
                        </ScrollArea>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 block">LABELS</Label>
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
                            <Label className="text-xs text-muted-foreground mb-2 block">ASSIGNEES</Label>
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
                    </Card>
                  )
                })}
              </div>

              <Button 
                onClick={resetForm} 
                variant="outline" 
                className="w-full gap-2"
              >
                <Plus size={18} />
                Generate New Batch
              </Button>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
