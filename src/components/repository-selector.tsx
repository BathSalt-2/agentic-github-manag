import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useGitHub } from '@/lib/github-context'
import { useKV } from '@github/spark/hooks'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info, GithubLogo } from '@phosphor-icons/react'
import { Skeleton } from '@/components/ui/skeleton'

export function RepositorySelector() {
  const { repositories, isConnected, isLoading } = useGitHub()
  const [selectedRepos, setSelectedRepos] = useKV<string[]>('selected-repositories', [])

  const currentSelected = selectedRepos || []

  const toggleRepository = (repoId: string) => {
    if (currentSelected.includes(repoId)) {
      setSelectedRepos(currentSelected.filter(id => id !== repoId))
    } else {
      setSelectedRepos([...currentSelected, repoId])
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connected Repositories</CardTitle>
          <CardDescription>
            Select which repositories to monitor and manage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <GithubLogo size={16} weight="fill" />
            <AlertDescription>
              Connect your GitHub account to select repositories
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connected Repositories</CardTitle>
          <CardDescription>
            Select which repositories to monitor and manage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (repositories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connected Repositories</CardTitle>
          <CardDescription>
            Select which repositories to monitor and manage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info size={16} weight="fill" />
            <AlertDescription>No repositories found in your account</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Repositories</CardTitle>
        <CardDescription>
          Select which repositories to monitor and manage ({currentSelected.length} selected)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3 pr-4">
            {repositories.map((repo) => (
              <div 
                key={repo.id} 
                className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={`repo-${repo.id}`}
                  checked={currentSelected.includes(repo.id)}
                  onCheckedChange={() => toggleRepository(repo.id)}
                />
                <Label
                  htmlFor={`repo-${repo.id}`}
                  className="flex-1 cursor-pointer font-mono text-sm"
                >
                  {repo.fullName}
                </Label>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{repo.openIssues} issues</span>
                  <span>{repo.openPRs} PRs</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
