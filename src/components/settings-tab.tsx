import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

export function SettingsTab() {
  const handleSave = () => {
    toast.success('Settings saved', {
      description: 'Your changes have been applied successfully'
    })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">
          Configure bot behavior and automation preferences
        </p>
      </div>

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
            <Switch id="auto-triage" defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="require-templates">Require issue templates</Label>
              <p className="text-sm text-muted-foreground">
                Request missing information when issues don't follow templates
              </p>
            </div>
            <Switch id="require-templates" defaultChecked />
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
            <Select defaultValue="2">
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
            <Switch id="auto-rollback" defaultChecked />
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
            <Switch id="auto-merge" defaultChecked />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="merge-strategy">Merge strategy</Label>
            <Select defaultValue="squash">
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
              defaultValue="2"
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
            <Switch id="notify-deployments" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify-failures">Failure notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when CI or deployments fail
              </p>
            </div>
            <Switch id="notify-failures" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify-approvals">Approval requests</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when deployments need approval
              </p>
            </div>
            <Switch id="notify-approvals" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  )
}
