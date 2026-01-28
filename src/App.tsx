import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardTab } from './components/dashboard-tab'
import { DeploymentsTab } from './components/deployments-tab'
import { AuditTab } from './components/audit-tab'
import { SettingsTab } from './components/settings-tab'
import { Robot, Rocket, Clock, Gear, House } from '@phosphor-icons/react'
import { Toaster } from '@/components/ui/sonner'

function App() {
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
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">System Active</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 mx-auto">
            <TabsTrigger value="dashboard" className="gap-2">
              <House size={18} weight="duotone" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="deployments" className="gap-2">
              <Rocket size={18} weight="duotone" />
              <span className="hidden sm:inline">Deployments</span>
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

      <Toaster />
    </div>
  )
}

export default App