import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from './status-badge'
import { Button } from '@/components/ui/button'
import { Repository } from '@/lib/types'
import { GitBranch, Warning } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'

interface RepositoryCardProps {
  repository: Repository
}

export function RepositoryCard({ repository }: RepositoryCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <GitBranch size={24} weight="duotone" className="text-primary mt-1" />
            <div>
              <CardTitle className="text-lg">{repository.name}</CardTitle>
              <p className="font-mono text-xs text-muted-foreground mt-1">
                {repository.fullName}
              </p>
            </div>
          </div>
          <StatusBadge status={repository.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-2xl font-bold text-foreground">{repository.openIssues}</p>
            <p className="text-xs text-muted-foreground">Open Issues</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{repository.openPRs}</p>
            <p className="text-xs text-muted-foreground">Open PRs</p>
          </div>
        </div>
        
        {repository.activeDeployments > 0 && (
          <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-md border border-primary/20 mb-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs text-primary font-medium">
              {repository.activeDeployments} active deployment{repository.activeDeployments > 1 ? 's' : ''}
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Last activity {formatDistanceToNow(repository.lastActivity, { addSuffix: true })}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
