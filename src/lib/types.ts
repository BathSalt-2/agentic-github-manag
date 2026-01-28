export type ActivityStatus = 'success' | 'pending' | 'failed' | 'info'

export interface Activity {
  id: string
  type: 'triage' | 'deploy' | 'workflow' | 'comment' | 'merge'
  repo: string
  title: string
  description: string
  reasoning?: string
  status: ActivityStatus
  timestamp: Date
  user?: string
  url?: string
}

export type DeploymentStatus = 'deploying' | 'success' | 'failed' | 'pending_approval'
export type Environment = 'production' | 'staging' | 'development'

export interface Deployment {
  id: string
  repo: string
  environment: Environment
  status: DeploymentStatus
  ref: string
  triggeredBy: string
  timestamp: Date
  duration?: number
  url?: string
}

export interface Repository {
  id: string
  name: string
  fullName: string
  openIssues: number
  openPRs: number
  lastActivity: Date
  status: 'healthy' | 'warning' | 'error'
  activeDeployments: number
}

export interface AuditEvent {
  id: string
  timestamp: Date
  action: string
  actor: string
  repo: string
  target?: string
  details: string
  result: 'success' | 'failed'
}

export type MergeStrategy = 'merge' | 'squash' | 'rebase'

export interface UserPreferences {
  autoTriage: boolean
  requireTemplates: boolean
  autoRollback: boolean
  autoMerge: boolean
  mergeStrategy: MergeStrategy
  minApprovals: number
  prodApprovals: number
  notifications: {
    deployments: boolean
    failures: boolean
    approvals: boolean
  }
}

export interface WorkflowCommand {
  id: string
  name: string
  command: string
  description: string
  requiresApproval: boolean
  enabled: boolean
}

export interface WorkflowConfig {
  commands: WorkflowCommand[]
}
