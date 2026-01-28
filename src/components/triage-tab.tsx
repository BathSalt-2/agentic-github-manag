import { useState, useEffect } from 'react'
import { useGitHub } from '@/lib/github-context'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Robot, Tag, ChatCircle, ArrowSquareOut, CheckCircle, Info } from '@phosphor-icons/react'
import { fetchRepositoryIssuesForTriage, addLabelsToIssue, createIssueComment } from '@/lib/github'
import { analyzeIssueWithAI } from '@/lib/ai-triage'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Issue {
  id: string
  number: number
  title: string
  body: string
  state: string
  user: {
    login: string
    avatar_url: string
  }
  labels: Array<{ name: string; color: string }>
  html_url: string
  created_at: string
  repo: {
    owner: string
    name: string
    fullName: string
  }
}

interface TriageAnalysis {
  suggestedLabels: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
  comment: string
  reasoning: string
}

export function TriageTab() {
  const { repositories, isConnected } = useGitHub()
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [analyses, setAnalyses] = useState<Record<string, TriageAnalysis>>({})
  const [appliedTriage, setAppliedTriage] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isConnected && repositories.length > 0) {
      loadIssues()
    }
  }, [isConnected, repositories])

  async function loadIssues() {
    setLoading(true)
    try {
      const allIssues: Issue[] = []
      for (const repo of repositories.slice(0, 5)) {
        const [owner, name] = repo.fullName.split('/')
        const repoIssues = await fetchRepositoryIssuesForTriage(owner, name)
        allIssues.push(...repoIssues.map(issue => ({
          ...issue,
          repo: { owner, name, fullName: repo.fullName }
        })))
      }
      setIssues(allIssues.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ))
    } catch (error) {
      toast.error('Failed to load issues')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function analyzeIssue(issue: Issue) {
    setAnalyzing(issue.id)
    try {
      const analysis = await analyzeIssueWithAI(issue.title, issue.body || '', issue.repo.fullName)
      setAnalyses(prev => ({ ...prev, [issue.id]: analysis }))
      toast.success('AI analysis complete')
    } catch (error) {
      toast.error('Analysis failed')
      console.error(error)
    } finally {
      setAnalyzing(null)
    }
  }

  async function applyTriage(issue: Issue, analysis: TriageAnalysis) {
    try {
      const { owner, name } = issue.repo
      
      await addLabelsToIssue(owner, name, issue.number, analysis.suggestedLabels)
      
      await createIssueComment(owner, name, issue.number, analysis.comment)
      
      setAppliedTriage(prev => new Set([...prev, issue.id]))
      toast.success('Triage applied successfully')
    } catch (error) {
      toast.error('Failed to apply triage')
      console.error(error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive text-destructive-foreground'
      case 'high': return 'bg-warning text-warning-foreground'
      case 'medium': return 'bg-accent text-accent-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <Alert>
          <Info size={16} weight="fill" />
          <AlertDescription>
            Connect your GitHub account to use AI-powered issue triage
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI-Powered Issue Triage</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Automatically analyze and label new issues across your repositories
          </p>
        </div>
        <Button onClick={loadIssues} disabled={loading} variant="outline">
          {loading ? 'Loading...' : 'Refresh Issues'}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : issues.length === 0 ? (
        <Alert>
          <AlertDescription>No open issues found in your repositories</AlertDescription>
        </Alert>
      ) : (
        <ScrollArea className="h-[700px] pr-4">
          <div className="space-y-4">
            {issues.map((issue) => {
              const analysis = analyses[issue.id]
              const isApplied = appliedTriage.has(issue.id)

              return (
                <Card key={issue.id} className="p-6 hover:border-accent/50 transition-colors">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {issue.repo.fullName}
                          </Badge>
                          <span className="text-muted-foreground text-sm">#{issue.number}</span>
                        </div>
                        <h3 className="text-lg font-semibold leading-tight">{issue.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <img 
                              src={issue.user.avatar_url} 
                              alt={issue.user.login}
                              className="w-5 h-5 rounded-full"
                            />
                            <span>{issue.user.login}</span>
                          </div>
                          <span>•</span>
                          <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                        </div>
                        {issue.labels.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {issue.labels.map((label) => (
                              <Badge 
                                key={label.name} 
                                variant="secondary"
                                className="text-xs"
                                style={{ 
                                  backgroundColor: `#${label.color}20`,
                                  borderColor: `#${label.color}`,
                                }}
                              >
                                {label.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(issue.html_url, '_blank')}
                        >
                          <ArrowSquareOut size={18} />
                        </Button>
                      </div>
                    </div>

                    {issue.body && (
                      <>
                        <Separator />
                        <div className="text-sm text-muted-foreground line-clamp-3">
                          {issue.body}
                        </div>
                      </>
                    )}

                    {!analysis && !isApplied && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => analyzeIssue(issue)}
                          disabled={analyzing === issue.id}
                          className="gap-2"
                        >
                          <Robot size={18} weight="duotone" />
                          {analyzing === issue.id ? 'Analyzing...' : 'Analyze with AI'}
                        </Button>
                      </div>
                    )}

                    {analysis && !isApplied && (
                      <>
                        <Separator />
                        <div className="space-y-4 bg-card/50 p-4 rounded-lg border">
                          <div className="flex items-center gap-2">
                            <Robot size={20} weight="duotone" className="text-primary" />
                            <span className="font-semibold">AI Analysis</span>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-2">Priority</div>
                              <Badge className={cn('capitalize', getPriorityColor(analysis.priority))}>
                                {analysis.priority}
                              </Badge>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-2">Category</div>
                              <Badge variant="secondary">{analysis.category}</Badge>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Tag size={16} weight="duotone" />
                              <span className="text-sm font-medium">Suggested Labels</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {analysis.suggestedLabels.map((label) => (
                                <Badge key={label} variant="outline" className="text-xs">
                                  {label}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <ChatCircle size={16} weight="duotone" />
                              <span className="text-sm font-medium">Suggested Comment</span>
                            </div>
                            <div className="text-sm bg-muted/50 p-3 rounded border">
                              {analysis.comment}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-2">AI Reasoning</div>
                            <div className="text-sm text-muted-foreground italic">
                              {analysis.reasoning}
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => applyTriage(issue, analysis)}
                              className="gap-2"
                            >
                              <CheckCircle size={18} weight="duotone" />
                              Apply Triage
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => setAnalyses(prev => {
                                const updated = { ...prev }
                                delete updated[issue.id]
                                return updated
                              })}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </>
                    )}

                    {isApplied && (
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle size={18} weight="fill" />
                        <span className="text-sm font-medium">Triage applied</span>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
