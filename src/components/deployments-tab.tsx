import { useState, useEffect } from 'react'
import { DeploymentCard } from './deployment-card'
import { mockDeployments } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Rocket, ArrowsClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useGitHub } from '@/lib/github-context'
import { fetchRepositoryDeployments } from '@/lib/github'
import { Deployment } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function DeploymentsTab() {
  const { repositories, isConnected } = useGitHub()
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadDeployments = async () => {
    if (!isConnected || repositories.length === 0) return

    setIsLoading(true)
    const allDeployments: Deployment[] = []

    for (const repo of repositories.slice(0, 10)) {
      const [owner, name] = repo.fullName.split('/')
      try {
        const repoDeployments = await fetchRepositoryDeployments(owner, name)
        allDeployments.push(...repoDeployments)
      } catch (error) {
        console.error(`Error fetching deployments for ${repo.fullName}:`, error)
      }
    }

    setDeployments(allDeployments.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()))
    setIsLoading(false)
  }

  useEffect(() => {
    loadDeployments()
  }, [isConnected, repositories])

  const handleApprove = (id: string) => {
    toast.success('Deployment approved', {
      description: 'Deployment is now in progress'
    })
  }

  const handleRollback = (id: string) => {
    toast.info('Rollback initiated', {
      description: 'Rolling back to previous version'
    })
  }

  const displayDeployments = isConnected ? deployments : mockDeployments

  const activeDeployments = displayDeployments.filter(
    d => d.status === 'deploying' || d.status === 'pending_approval'
  )
  const completedDeployments = displayDeployments.filter(
    d => d.status === 'success' || d.status === 'failed'
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Deployments</h2>
        <div className="flex gap-2">
          {isConnected && (
            <Button variant="outline" size="sm" onClick={loadDeployments} disabled={isLoading}>
              <ArrowsClockwise size={16} weight="bold" className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          <Button>
            <Rocket size={16} weight="bold" className="mr-2" />
            New Deployment
          </Button>
        </div>
      </div>

      {isLoading && deployments.length === 0 ? (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
        </div>
      ) : displayDeployments.length === 0 ? (
        <Alert>
          <AlertDescription>
            No deployments found. {!isConnected && 'Connect to GitHub to view real deployments.'}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {activeDeployments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Active</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeDeployments.map((deployment) => (
                  <DeploymentCard 
                    key={deployment.id} 
                    deployment={deployment}
                    onApprove={handleApprove}
                  />
                ))}
              </div>
            </div>
          )}

          {completedDeployments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Recent</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedDeployments.map((deployment) => (
                  <DeploymentCard 
                    key={deployment.id} 
                    deployment={deployment}
                    onRollback={handleRollback}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
