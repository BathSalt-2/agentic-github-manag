import { useState, useEffect } from 'react'
import { RepositoryCard } from './repository-card'
import { ActivityItem } from './activity-item'
import { IssueTemplateCard } from './issue-template-card'
import { mockRepositories, mockActivities } from '@/lib/mock-data'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useGitHub } from '@/lib/github-context'
import { fetchAllActivities } from '@/lib/github'
import { Activity, Repository } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from '@phosphor-icons/react'

interface DashboardTabProps {
  onRepositoryClick: (repository: Repository) => void
}

export function DashboardTab({ onRepositoryClick }: DashboardTabProps) {
  const { repositories, isConnected, isLoading } = useGitHub()
  const [activities, setActivities] = useState<Activity[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(false)

  useEffect(() => {
    if (isConnected && repositories.length > 0) {
      setActivitiesLoading(true)
      fetchAllActivities(repositories)
        .then(setActivities)
        .catch(() => setActivities([]))
        .finally(() => setActivitiesLoading(false))
    }
  }, [isConnected, repositories])

  const displayRepos = isConnected ? repositories : mockRepositories
  const displayActivities = isConnected ? activities : mockActivities

  return (
    <div className="space-y-6">
      {(isConnected && repositories.length > 0) && (
        <IssueTemplateCard repoFullName={repositories[0]?.fullName} />
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">Repositories</h2>
        
        {!isConnected && (
          <Alert className="mb-4">
            <Info size={16} weight="fill" />
            <AlertDescription>
              Connect your GitHub account to manage real repositories
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : displayRepos.length === 0 ? (
          <Alert>
            <AlertDescription>No repositories found</AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayRepos.map((repo) => (
              <div key={repo.id} onClick={() => onRepositoryClick(repo)} className="cursor-pointer">
                <RepositoryCard repository={repo} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <ScrollArea className="h-[600px] pr-4">
          {activitiesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : displayActivities.length === 0 ? (
            <Alert>
              <AlertDescription>No recent activity</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {displayActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
