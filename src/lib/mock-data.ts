import { Activity, Deployment, Repository, AuditEvent } from './types'

export const mockRepositories: Repository[] = [
  {
    id: '1',
    name: 'web-platform',
    fullName: 'acme/web-platform',
    openIssues: 23,
    openPRs: 8,
    lastActivity: new Date(Date.now() - 1000 * 60 * 5),
    status: 'healthy',
    activeDeployments: 1
  },
  {
    id: '2',
    name: 'api-gateway',
    fullName: 'acme/api-gateway',
    openIssues: 12,
    openPRs: 4,
    lastActivity: new Date(Date.now() - 1000 * 60 * 15),
    status: 'healthy',
    activeDeployments: 0
  },
  {
    id: '3',
    name: 'mobile-app',
    fullName: 'acme/mobile-app',
    openIssues: 45,
    openPRs: 12,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60),
    status: 'warning',
    activeDeployments: 2
  }
]

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'triage',
    repo: 'acme/web-platform',
    title: 'Auto-triaged issue #456',
    description: 'Added "bug" and "needs-reproduction" labels',
    reasoning: 'Issue description contains error stack trace and mentions unexpected behavior. Missing reproduction steps.',
    status: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    url: 'https://github.com/acme/web-platform/issues/456'
  },
  {
    id: '2',
    type: 'deploy',
    repo: 'acme/web-platform',
    title: 'Deployed to staging',
    description: 'Branch: feature/new-ui (abc1234)',
    reasoning: 'User @alice requested deployment via /deploy staging command',
    status: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
    user: 'alice',
    url: 'https://github.com/acme/web-platform/actions/runs/123'
  },
  {
    id: '3',
    type: 'workflow',
    repo: 'acme/api-gateway',
    title: 'Rebuild requested by @bob',
    description: 'Workflow: CI/CD Pipeline',
    reasoning: 'Flaky test detected in previous run. User requested manual rebuild.',
    status: 'pending',
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    user: 'bob'
  },
  {
    id: '4',
    type: 'comment',
    repo: 'acme/mobile-app',
    title: 'Requested missing information on PR #234',
    description: 'Asked for test coverage and breaking changes documentation',
    reasoning: 'PR changes public API but lacks migration guide and test coverage is below 80% threshold',
    status: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
    url: 'https://github.com/acme/mobile-app/pull/234'
  },
  {
    id: '5',
    type: 'merge',
    repo: 'acme/api-gateway',
    title: 'Auto-merged PR #89',
    description: 'Dependency update: lodash 4.17.20 → 4.17.21',
    reasoning: 'All checks passed, 2 approvals received, no merge conflicts, automated security patch',
    status: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    url: 'https://github.com/acme/api-gateway/pull/89'
  }
]

export const mockDeployments: Deployment[] = [
  {
    id: '1',
    repo: 'acme/web-platform',
    environment: 'staging',
    status: 'deploying',
    ref: 'feature/new-ui',
    triggeredBy: 'alice',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    url: 'https://staging.acme.com'
  },
  {
    id: '2',
    repo: 'acme/mobile-app',
    environment: 'production',
    status: 'pending_approval',
    ref: 'v2.4.0',
    triggeredBy: 'bob',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    url: 'https://app.acme.com'
  },
  {
    id: '3',
    repo: 'acme/api-gateway',
    environment: 'production',
    status: 'success',
    ref: 'main',
    triggeredBy: 'alice',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    duration: 240,
    url: 'https://api.acme.com'
  },
  {
    id: '4',
    repo: 'acme/web-platform',
    environment: 'production',
    status: 'success',
    ref: 'v3.2.1',
    triggeredBy: 'system',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    duration: 320,
    url: 'https://acme.com'
  }
]

export const mockAuditEvents: AuditEvent[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    action: 'workflow.dispatch',
    actor: 'bot',
    repo: 'acme/api-gateway',
    target: 'CI/CD Pipeline',
    details: 'Triggered rebuild workflow for PR #123',
    result: 'success'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    action: 'deployment.approve',
    actor: 'alice',
    repo: 'acme/web-platform',
    target: 'production',
    details: 'Approved deployment of v3.2.1 to production',
    result: 'success'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    action: 'issue.triage',
    actor: 'bot',
    repo: 'acme/mobile-app',
    target: 'issue #789',
    details: 'Added labels: bug, needs-triage, priority-high',
    result: 'success'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    action: 'pr.auto_merge',
    actor: 'bot',
    repo: 'acme/api-gateway',
    target: 'PR #89',
    details: 'Automatically merged approved dependency update',
    result: 'success'
  }
]
