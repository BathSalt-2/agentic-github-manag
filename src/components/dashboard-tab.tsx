import { RepositoryCard } from './repository-card'
import { ActivityItem } from './activity-item'
import { mockRepositories, mockActivities } from '@/lib/mock-data'
import { ScrollArea } from '@/components/ui/scroll-area'

export function DashboardTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Repositories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockRepositories.map((repo) => (
            <RepositoryCard key={repo.id} repository={repo} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-3">
            {mockActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
