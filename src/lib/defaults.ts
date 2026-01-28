import { UserPreferences, WorkflowConfig } from './types'

export const defaultPreferences: UserPreferences = {
  autoTriage: true,
  requireTemplates: true,
  autoRollback: true,
  autoMerge: true,
  mergeStrategy: 'squash',
  minApprovals: 2,
  prodApprovals: 2,
  notifications: {
    deployments: true,
    failures: true,
    approvals: true
  }
}

export const defaultWorkflowConfig: WorkflowConfig = {
  commands: [
    {
      id: '1',
      name: 'Rebuild CI',
      command: '/rebuild',
      description: 'Trigger a rebuild of the CI pipeline',
      requiresApproval: false,
      enabled: true
    },
    {
      id: '2',
      name: 'Deploy Staging',
      command: '/deploy staging',
      description: 'Deploy to the staging environment',
      requiresApproval: false,
      enabled: true
    },
    {
      id: '3',
      name: 'Deploy Production',
      command: '/deploy production',
      description: 'Deploy to the production environment',
      requiresApproval: true,
      enabled: true
    },
    {
      id: '4',
      name: 'Rollback',
      command: '/rollback',
      description: 'Rollback to the previous deployment',
      requiresApproval: true,
      enabled: true
    },
    {
      id: '5',
      name: 'Run Tests',
      command: '/test',
      description: 'Run the full test suite',
      requiresApproval: false,
      enabled: true
    }
  ]
}
