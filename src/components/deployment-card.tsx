import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from './status-badge'
import { Button } from '@/components/ui/button'
import { Deployment } from '@/lib/types'
import { Rocket, Clock, CheckCircle, XCircle, Warning } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface DeploymentCardProps {
  deployment: Deployment
  onApprove?: (id: string) => void
  onRollback?: (id: string) => void
}

export function DeploymentCard({ deployment, onApprove, onRollback }: DeploymentCardProps) {
  const envColors = {
    production: 'bg-destructive/20 text-destructive border-destructive/30',
    staging: 'bg-warning/20 text-warning border-warning/30',
    development: 'bg-success/20 text-success border-success/30'
  }

  return (
    <Card className="hover:border-primary/50 transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Rocket size={24} weight="duotone" className="text-primary mt-1" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-base">{deployment.repo}</CardTitle>
                <Badge variant="outline" className={envColors[deployment.environment]}>
                  {deployment.environment}
                </Badge>
              </div>
              <p className="font-mono text-xs text-muted-foreground">
                {deployment.ref}
              </p>
            </div>
          </div>
          <StatusBadge status={deployment.status} />
        </div>
      </CardHeader>
      <CardContent>
        {deployment.status === 'deploying' && (
          <div className="mb-4">
            <Progress value={65} className="h-1.5" />
            <p className="text-xs text-muted-foreground mt-2">
              Building and deploying...
            </p>
          </div>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Triggered by</span>
            <span className="font-medium">@{deployment.triggeredBy}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Started</span>
            <span className="font-medium">
              {formatDistanceToNow(deployment.timestamp, { addSuffix: true })}
            </span>
          </div>
          {deployment.duration && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">{deployment.duration}s</span>
            </div>
          )}
        </div>

        {deployment.status === 'pending_approval' && onApprove && (
          <div className="mt-4 pt-4 border-t border-border flex gap-2">
            <Button 
              size="sm" 
              onClick={() => onApprove(deployment.id)}
              className="flex-1"
            >
              <CheckCircle size={16} weight="bold" className="mr-2" />
              Approve Deploy
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {}}
              className="flex-1"
            >
              <XCircle size={16} weight="bold" className="mr-2" />
              Reject
            </Button>
          </div>
        )}

        {deployment.status === 'success' && deployment.environment === 'production' && onRollback && (
          <div className="mt-4 pt-4 border-t border-border">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onRollback(deployment.id)}
              className="w-full"
            >
              Rollback
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
