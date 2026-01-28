import { DeploymentCard } from './deployment-card'
import { mockDeployments } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Rocket } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function DeploymentsTab() {
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

  const activeDeployments = mockDeployments.filter(
    d => d.status === 'deploying' || d.status === 'pending_approval'
  )
  const completedDeployments = mockDeployments.filter(
    d => d.status === 'success' || d.status === 'failed'
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Deployments</h2>
        <Button>
          <Rocket size={16} weight="bold" className="mr-2" />
          New Deployment
        </Button>
      </div>

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
    </div>
  )
}
