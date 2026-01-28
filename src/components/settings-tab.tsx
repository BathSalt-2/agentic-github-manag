import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { defaultPreferences, defaultWorkflowConfig } from '@/lib/defaults'
import { UserPreferences, WorkflowConfig, MergeStrategy } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WorkflowSettings } from './workflow-settings'
import { RepositorySelector } from './repository-selector'
import { Gear, Wrench, GithubLogo } from '@phosphor-icons/react'

export function SettingsTab() {
  const [preferences, setPreferences] = useKV<UserPreferences>('user-preferences', defaultPreferences)
  const [workflowConfig, setWorkflowConfig] = useKV<WorkflowConfig>('workflow-config', defaultWorkflowConfig)

  const currentPrefs = preferences || defaultPreferences
  const currentWorkflow = workflowConfig || defaultWorkflowConfig

  const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferences((current) => ({ ...(current || defaultPreferences), [key]: value }))
  }

  const updateNotification = (key: keyof UserPreferences['notifications'], value: boolean) => {
    setPreferences((current) => {
      const base = current || defaultPreferences
      return {
        ...base,
        notifications: { ...base.notifications, [key]: value }
      }
    })
  }

  const handleSave = () => {
    toast.success('Settings saved', {
      description: 'Your changes have been applied successfully'
    })
  }

  const handleReset = () => {
    setPreferences(defaultPreferences)
    setWorkflowConfig(defaultWorkflowConfig)
    toast.info('Settings reset', {
      description: 'All settings restored to defaults'
    })
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Settings</h2>
          <p className="text-muted-foreground">
            Configure bot behavior and automation preferences
          </p>
        </div>
        <Button variant="outline" onClick={handleReset}>
          Reset to Defaults
        </Button>
      </div>

      <Tabs defaultValue="repositories" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="repositories" className="gap-2">
            <GithubLogo size={16} weight="duotone" />
            Repositories
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Gear size={16} weight="duotone" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="workflows" className="gap-2">
            <Wrench size={16} weight="duotone" />
            Workflows
          </TabsTrigger>
        </TabsList>

        <TabsContent value="repositories" className="mt-6">
          <RepositorySelector />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Triage</CardTitle>
              <CardDescription>
                Automatically label and organize new issues and pull requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-triage">Enable auto-triage</Label>
                  <p className="text-sm text-muted-foreground">
                    Bot will automatically label and comment on new issues
                  </p>
                </div>
                <Switch 
                  id="auto-triage" 
                  checked={currentPrefs.autoTriage}
                  onCheckedChange={(checked) => updatePreference('autoTriage', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="require-templates">Require issue templates</Label>
                  <p className="text-sm text-muted-foreground">
                    Request missing information when issues don't follow templates
                  </p>
                </div>
                <Switch 
                  id="require-templates" 
                  checked={currentPrefs.requireTemplates}
                  onCheckedChange={(checked) => updatePreference('requireTemplates', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deployment Rules</CardTitle>
              <CardDescription>
                Configure approval requirements and safety checks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prod-approvals">Production deployment approvals</Label>
                <Select 
                  value={currentPrefs.prodApprovals.toString()}
                  onValueChange={(value) => updatePreference('prodApprovals', parseInt(value))}
                >
                  <SelectTrigger id="prod-approvals">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 approval required</SelectItem>
                    <SelectItem value="2">2 approvals required</SelectItem>
                    <SelectItem value="3">3 approvals required</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Number of approvals needed before deploying to production
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-rollback">Auto-rollback on failure</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically rollback deployments if health checks fail
                  </p>
                </div>
                <Switch 
                  id="auto-rollback" 
                  checked={currentPrefs.autoRollback}
                  onCheckedChange={(checked) => updatePreference('autoRollback', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Auto-Merge</CardTitle>
              <CardDescription>
                Automatically merge pull requests that meet criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-merge">Enable auto-merge</Label>
                  <p className="text-sm text-muted-foreground">
                    Merge approved PRs automatically when CI passes
                  </p>
                </div>
                <Switch 
                  id="auto-merge" 
                  checked={currentPrefs.autoMerge}
                  onCheckedChange={(checked) => updatePreference('autoMerge', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="merge-strategy">Merge strategy</Label>
                <Select 
                  value={currentPrefs.mergeStrategy}
                  onValueChange={(value) => updatePreference('mergeStrategy', value as MergeStrategy)}
                >
                  <SelectTrigger id="merge-strategy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="merge">Create merge commit</SelectItem>
                    <SelectItem value="squash">Squash and merge</SelectItem>
                    <SelectItem value="rebase">Rebase and merge</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min-approvals">Minimum approvals</Label>
                <Input 
                  id="min-approvals" 
                  type="number" 
                  value={currentPrefs.minApprovals}
                  onChange={(e) => updatePreference('minApprovals', parseInt(e.target.value) || 1)}
                  min="1"
                  max="10"
                />
                <p className="text-sm text-muted-foreground">
                  Required approvals before auto-merge
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure when and how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-deployments">Deployment notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about deployment status changes
                  </p>
                </div>
                <Switch 
                  id="notify-deployments" 
                  checked={currentPrefs.notifications.deployments}
                  onCheckedChange={(checked) => updateNotification('deployments', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-failures">Failure notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when CI or deployments fail
                  </p>
                </div>
                <Switch 
                  id="notify-failures" 
                  checked={currentPrefs.notifications.failures}
                  onCheckedChange={(checked) => updateNotification('failures', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-approvals">Approval requests</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when deployments need approval
                  </p>
                </div>
                <Switch 
                  id="notify-approvals" 
                  checked={currentPrefs.notifications.approvals}
                  onCheckedChange={(checked) => updateNotification('approvals', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="mt-6">
          <WorkflowSettings 
            config={currentWorkflow} 
            onConfigChange={(updater) => {
              const newConfig = typeof updater === 'function' ? updater(currentWorkflow) : updater
              setWorkflowConfig(newConfig)
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
