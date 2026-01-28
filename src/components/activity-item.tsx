import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from './status-badge'
import { Activity } from '@/lib/types'
import { 
  GitBranch, 
  GitPullRequest, 
  Rocket, 
  Robot, 
  GitMerge,
  Info,
  CaretDown
} from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ActivityItemProps {
  activity: Activity
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  const icons = {
    triage: <Robot size={20} weight="duotone" />,
    deploy: <Rocket size={20} weight="duotone" />,
    workflow: <GitBranch size={20} weight="duotone" />,
    comment: <Info size={20} weight="duotone" />,
    merge: <GitMerge size={20} weight="duotone" />
  }

  const Icon = icons[activity.type]

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="hover:border-primary/50 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="text-primary mt-1">
              {Icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-medium text-foreground">
                    {activity.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs text-muted-foreground">
                      {activity.repo}
                    </span>
                    {activity.user && (
                      <>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          by @{activity.user}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={activity.status} />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">{activity.description}</p>
          
          {activity.reasoning && (
            <>
              <CollapsibleTrigger className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 mt-2">
                <CaretDown 
                  size={16} 
                  className={cn(
                    "transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
                <span>{isOpen ? 'Hide' : 'Show'} AI reasoning</span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 p-3 bg-muted/50 rounded-md border border-border/50">
                  <p className="text-xs text-foreground/90 leading-relaxed">
                    {activity.reasoning}
                  </p>
                </div>
              </CollapsibleContent>
            </>
          )}
        </CardContent>
      </Card>
    </Collapsible>
  )
}
