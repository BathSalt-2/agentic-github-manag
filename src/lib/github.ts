import { Octokit } from '@octokit/core'
import { Activity, Deployment, Repository, AuditEvent } from './types'

let octokitInstance: Octokit | null = null

export function initializeGitHub(token: string) {
  octokitInstance = new Octokit({ auth: token })
}

export function getOctokit(): Octokit {
  if (!octokitInstance) {
    throw new Error('GitHub client not initialized. Please provide a personal access token.')
  }
  return octokitInstance
}

export function isGitHubConnected(): boolean {
  return octokitInstance !== null
}

export async function fetchUserRepositories(): Promise<Repository[]> {
  const octokit = getOctokit()
  
  const { data } = await octokit.request('GET /user/repos', {
    sort: 'updated',
    per_page: 100
  })

  return data.map(repo => ({
    id: repo.id.toString(),
    name: repo.name || '',
    fullName: repo.full_name || '',
    openIssues: repo.open_issues_count || 0,
    openPRs: 0,
    lastActivity: new Date(repo.updated_at || Date.now()),
    status: 'healthy' as const,
    activeDeployments: 0
  }))
}

export async function fetchRepositoryDetails(owner: string, repo: string): Promise<Repository> {
  const octokit = getOctokit()
  
  const [repoData, prsData] = await Promise.all([
    octokit.request('GET /repos/{owner}/{repo}', { owner, repo }),
    octokit.request('GET /repos/{owner}/{repo}/pulls', { 
      owner, 
      repo, 
      state: 'open',
      per_page: 100 
    })
  ])

  return {
    id: repoData.data.id.toString(),
    name: repoData.data.name,
    fullName: repoData.data.full_name,
    openIssues: repoData.data.open_issues_count,
    openPRs: prsData.data.length,
    lastActivity: new Date(repoData.data.updated_at),
    status: 'healthy',
    activeDeployments: 0
  }
}

export async function fetchRepositoryIssues(owner: string, repo: string): Promise<Activity[]> {
  const octokit = getOctokit()
  
  const { data } = await octokit.request('GET /repos/{owner}/{repo}/issues', {
    owner,
    repo,
    state: 'all',
    per_page: 50,
    sort: 'updated',
    direction: 'desc'
  })

  return data
    .filter(issue => !issue.pull_request)
    .map(issue => ({
      id: issue.id.toString(),
      type: 'triage' as const,
      repo: `${owner}/${repo}`,
      title: issue.title,
      description: `Issue #${issue.number}: ${issue.state}`,
      status: issue.state === 'open' ? 'pending' as const : 'success' as const,
      timestamp: new Date(issue.updated_at),
      url: issue.html_url
    }))
}

export async function fetchRepositoryPullRequests(owner: string, repo: string): Promise<Activity[]> {
  const octokit = getOctokit()
  
  const { data } = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
    owner,
    repo,
    state: 'all',
    per_page: 50,
    sort: 'updated',
    direction: 'desc'
  })

  return data.map(pr => ({
    id: pr.id.toString(),
    type: 'merge' as const,
    repo: `${owner}/${repo}`,
    title: pr.title,
    description: `PR #${pr.number}: ${pr.state}`,
    status: pr.merged_at 
      ? 'success' as const 
      : pr.state === 'open' 
        ? 'pending' as const 
        : 'info' as const,
    timestamp: new Date(pr.updated_at),
    user: pr.user?.login,
    url: pr.html_url
  }))
}

export async function fetchRepositoryWorkflows(owner: string, repo: string): Promise<Activity[]> {
  const octokit = getOctokit()
  
  try {
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/actions/runs', {
      owner,
      repo,
      per_page: 30
    })

    return data.workflow_runs.map(run => ({
      id: run.id.toString(),
      type: 'workflow' as const,
      repo: `${owner}/${repo}`,
      title: run.name || 'Workflow Run',
      description: `${run.event} on ${run.head_branch || 'unknown'}`,
      status: run.status === 'completed'
        ? run.conclusion === 'success' 
          ? 'success' as const
          : 'failed' as const
        : 'pending' as const,
      timestamp: new Date(run.updated_at),
      user: run.actor?.login,
      url: run.html_url
    }))
  } catch (error) {
    return []
  }
}

export async function fetchRepositoryDeployments(owner: string, repo: string): Promise<Deployment[]> {
  const octokit = getOctokit()
  
  try {
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/deployments', {
      owner,
      repo,
      per_page: 30
    })

    const deploymentsWithStatus = await Promise.all(
      data.map(async (deployment) => {
        try {
          const statusData = await octokit.request('GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses', {
            owner,
            repo,
            deployment_id: deployment.id
          })

          const latestStatus = statusData.data[0]

          return {
            id: deployment.id.toString(),
            repo: `${owner}/${repo}`,
            environment: deployment.environment as any,
            status: latestStatus?.state === 'success' 
              ? 'success' as const
              : latestStatus?.state === 'pending' || latestStatus?.state === 'in_progress'
                ? 'deploying' as const
                : latestStatus?.state === 'failure'
                  ? 'failed' as const
                  : 'pending_approval' as const,
            ref: deployment.ref,
            triggeredBy: deployment.creator?.login || 'system',
            timestamp: new Date(deployment.created_at),
            url: latestStatus?.target_url || undefined
          }
        } catch {
          return {
            id: deployment.id.toString(),
            repo: `${owner}/${repo}`,
            environment: deployment.environment as any,
            status: 'pending_approval' as const,
            ref: deployment.ref,
            triggeredBy: deployment.creator?.login || 'system',
            timestamp: new Date(deployment.created_at)
          }
        }
      })
    )

    return deploymentsWithStatus
  } catch (error) {
    return []
  }
}

export async function fetchAllActivities(repos: Repository[]): Promise<Activity[]> {
  const activities: Activity[] = []
  
  for (const repo of repos.slice(0, 5)) {
    const [owner, name] = repo.fullName.split('/')
    try {
      const [issues, prs, workflows] = await Promise.all([
        fetchRepositoryIssues(owner, name),
        fetchRepositoryPullRequests(owner, name),
        fetchRepositoryWorkflows(owner, name)
      ])
      activities.push(...issues.slice(0, 5), ...prs.slice(0, 5), ...workflows.slice(0, 5))
    } catch (error) {
      console.error(`Error fetching activities for ${repo.fullName}:`, error)
    }
  }

  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 50)
}

export async function createIssueComment(owner: string, repo: string, issueNumber: number, body: string) {
  const octokit = getOctokit()
  
  await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
    owner,
    repo,
    issue_number: issueNumber,
    body
  })
}

export async function addLabelsToIssue(owner: string, repo: string, issueNumber: number, labels: string[]) {
  const octokit = getOctokit()
  
  await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/labels', {
    owner,
    repo,
    issue_number: issueNumber,
    labels
  })
}

export async function triggerWorkflow(owner: string, repo: string, workflowId: string, ref: string = 'main', inputs: Record<string, any> = {}) {
  const octokit = getOctokit()
  
  await octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
    owner,
    repo,
    workflow_id: workflowId,
    ref,
    inputs
  })
}

export async function fetchRepositoryIssuesForTriage(owner: string, repo: string) {
  const octokit = getOctokit()
  
  const { data } = await octokit.request('GET /repos/{owner}/{repo}/issues', {
    owner,
    repo,
    state: 'open',
    per_page: 50,
    sort: 'created',
    direction: 'desc'
  })

  return data
    .filter(issue => !issue.pull_request)
    .map(issue => ({
      id: issue.id.toString(),
      number: issue.number,
      title: issue.title,
      body: issue.body || '',
      state: issue.state,
      user: {
        login: issue.user?.login || 'unknown',
        avatar_url: issue.user?.avatar_url || ''
      },
      labels: issue.labels.map((label: any) => ({
        name: typeof label === 'string' ? label : label.name,
        color: typeof label === 'string' ? '000000' : label.color
      })),
      html_url: issue.html_url,
      created_at: issue.created_at
    }))
}
