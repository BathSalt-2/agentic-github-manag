import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { WorkflowConfig, WorkflowCommand } from '@/lib/types'
import { Plus, Trash } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useState } from 'react'
import { toast } from 'sonner'

interface WorkflowSettingsProps {
  config: WorkflowConfig
  onConfigChange: (updater: (prev: WorkflowConfig) => WorkflowConfig) => void
}

export function WorkflowSettings({ config, onConfigChange }: WorkflowSettingsProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newCommand, setNewCommand] = useState<Omit<WorkflowCommand, 'id'>>({
    name: '',
    command: '',
    description: '',
    requiresApproval: false,
    enabled: true
  })

  const handleAddCommand = () => {
    if (!newCommand.name || !newCommand.command) {
      toast.error('Missing fields', {
        description: 'Please fill in command name and command'
      })
      return
    }

    onConfigChange((prev) => ({
      ...prev,
      commands: [
        ...prev.commands,
        {
          ...newCommand,
          id: Date.now().toString()
        }
      ]
    }))

    setNewCommand({
      name: '',
      command: '',
      description: '',
      requiresApproval: false,
      enabled: true
    })
    setIsAddDialogOpen(false)
    toast.success('Command added', {
      description: `${newCommand.name} has been added to your workflows`
    })
  }

  const handleDeleteCommand = (id: string) => {
    onConfigChange((prev) => ({
      ...prev,
      commands: prev.commands.filter((cmd) => cmd.id !== id)
    }))
    toast.info('Command removed', {
      description: 'The workflow command has been deleted'
    })
  }

  const handleToggleCommand = (id: string) => {
    onConfigChange((prev) => ({
      ...prev,
      commands: prev.commands.map((cmd) =>
        cmd.id === id ? { ...cmd, enabled: !cmd.enabled } : cmd
      )
    }))
  }

  const handleToggleApproval = (id: string) => {
    onConfigChange((prev) => ({
      ...prev,
      commands: prev.commands.map((cmd) =>
        cmd.id === id ? { ...cmd, requiresApproval: !cmd.requiresApproval } : cmd
      )
    }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Custom Workflow Commands</CardTitle>
              <CardDescription>
                Define slash commands that trigger GitHub Actions workflows
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} weight="bold" className="mr-2" />
                  Add Command
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Workflow Command</DialogTitle>
                  <DialogDescription>
                    Create a new slash command to trigger GitHub workflows
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="command-name">Command Name</Label>
                    <Input
                      id="command-name"
                      placeholder="e.g., Deploy to Dev"
                      value={newCommand.name}
                      onChange={(e) => setNewCommand({ ...newCommand, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="command-slash">Slash Command</Label>
                    <Input
                      id="command-slash"
                      placeholder="e.g., /deploy dev"
                      value={newCommand.command}
                      onChange={(e) => setNewCommand({ ...newCommand, command: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="command-description">Description</Label>
                    <Textarea
                      id="command-description"
                      placeholder="What does this command do?"
                      value={newCommand.description}
                      onChange={(e) => setNewCommand({ ...newCommand, description: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="command-approval">Requires Approval</Label>
                    <Switch
                      id="command-approval"
                      checked={newCommand.requiresApproval}
                      onCheckedChange={(checked) => setNewCommand({ ...newCommand, requiresApproval: checked })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCommand}>Add Command</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {config.commands.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No workflow commands configured</p>
              <p className="text-sm mt-2">Add your first command to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {config.commands.map((cmd) => (
                <Card key={cmd.id} className={!cmd.enabled ? 'opacity-60' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{cmd.name}</h4>
                          <Badge variant="outline" className="font-mono text-xs">
                            {cmd.command}
                          </Badge>
                          {cmd.requiresApproval && (
                            <Badge variant="secondary" className="text-xs">
                              Requires Approval
                            </Badge>
                          )}
                        </div>
                        {cmd.description && (
                          <p className="text-sm text-muted-foreground">{cmd.description}</p>
                        )}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`enabled-${cmd.id}`} className="text-sm font-normal">
                              Enabled
                            </Label>
                            <Switch
                              id={`enabled-${cmd.id}`}
                              checked={cmd.enabled}
                              onCheckedChange={() => handleToggleCommand(cmd.id)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`approval-${cmd.id}`} className="text-sm font-normal">
                              Requires Approval
                            </Label>
                            <Switch
                              id={`approval-${cmd.id}`}
                              checked={cmd.requiresApproval}
                              onCheckedChange={() => handleToggleApproval(cmd.id)}
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCommand(cmd.id)}
                      >
                        <Trash size={18} className="text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Integration</CardTitle>
          <CardDescription>
            Commands trigger GitHub Actions workflows via workflow_dispatch events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">How it works:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>Users comment slash commands on issues or pull requests</li>
              <li>The bot validates the command and checks if approval is required</li>
              <li>For approved commands, the bot triggers the corresponding workflow</li>
              <li>Workflow execution results are posted back to the issue/PR</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
