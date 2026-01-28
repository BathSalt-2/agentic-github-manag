import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardTab } from './components/dashboard-tab'
import { DeploymentsTab } from './components/deployments-tab'
import { AuditTab } from './components/audit-tab'
import { SettingsTab } from './components/settings-tab'
import { TriageTab } from './components/triage-tab'
import { GitHubConnectionDialog } from './components/github-connection-dialog'
import { Robot, Rocket, Clock, Gear, House, GithubLogo, SignOut, ListChecks } from '@phosphor-icons/react'
import { Toaster } from '@/components/ui/sonner'
import { GitHubProvider, useGitHub } from './lib/github-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function AppContent() {
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false)
  const { isConnected, disconnect, repositories } = useGitHub()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Robot size={32} weight="duotone" className="text-primary" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Agentic GitHub Manager</h1>
                <p className="text-sm text-muted-foreground">AI-powered repository automation</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isConnected ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
                    <span className="text-sm text-muted-foreground">
                      {repositories.length} {repositories.length === 1 ? 'repository' : 'repositories'}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={disconnect}>
                    <SignOut size={18} className="mr-2" />
                    Disconnect
                  </Button>
                </>
              ) : (
                <>
                  <Badge variant="outline" className="text-muted-foreground">
                    Not connected
                  </Badge>
                  <Button size="sm" onClick={() => setConnectionDialogOpen(true)}>
                    <GithubLogo size={18} weight="fill" className="mr-2" />
                    Connect GitHub
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-5 mx-auto">
            <TabsTrigger value="dashboard" className="gap-2">
              <House size={18} weight="duotone" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="triage" className="gap-2">
              <ListChecks size={18} weight="duotone" />
              <span className="hidden sm:inline">Triage</span>
            </TabsTrigger>
            <TabsTrigger value="deployments" className="gap-2">
              <Rocket size={18} weight="duotone" />
              <span className="hidden sm:inline">Deploys</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <Clock size={18} weight="duotone" />
              <span className="hidden sm:inline">Audit</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Gear size={18} weight="duotone" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="triage">
            <TriageTab />
          </TabsContent>

          <TabsContent value="deployments">
            <DeploymentsTab />
          </TabsContent>

          <TabsContent value="audit">
            <AuditTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>

      <GitHubConnectionDialog 
        open={connectionDialogOpen} 
        onOpenChange={setConnectionDialogOpen}
      />
      <Toaster />
    </div>
  )
}

function App() {
  return (
    <GitHubProvider>
      <AppContent />
    </GitHubProvider>
  )
}

export default App