import { Card } from '@/components/ui/card'
import { IssueTemplateGenerator } from './issue-template-generator'
import { BatchTemplateGenerator } from './batch-template-generator'
import { Sparkle, ListChecks, FileText, Robot, Stack } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface Props {
  repoFullName?: string
}

export function IssueTemplateCard({ repoFullName }: Props) {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border-primary/20 hover:border-primary/40 transition-colors">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/20 rounded-lg">
            <Sparkle size={24} weight="duotone" className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Smart Issue Templates</h3>
            <p className="text-sm text-muted-foreground">
              Generate comprehensive, well-structured issue templates using AI
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="flex items-start gap-2">
            <Robot size={16} weight="duotone" className="text-primary mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <div className="font-medium">AI-Powered</div>
              <div className="text-muted-foreground">Smart context analysis</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FileText size={16} weight="duotone" className="text-primary mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <div className="font-medium">Pre-filled</div>
              <div className="text-muted-foreground">Ready to use</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ListChecks size={16} weight="duotone" className="text-primary mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <div className="font-medium">Structured</div>
              <div className="text-muted-foreground">Consistent format</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <IssueTemplateGenerator 
            repoFullName={repoFullName}
            trigger={
              <Button className="gap-2 w-full">
                <Sparkle size={18} weight="duotone" />
                Single Template
              </Button>
            }
          />
          <BatchTemplateGenerator 
            repoFullName={repoFullName}
            trigger={
              <Button variant="outline" className="gap-2 w-full">
                <Stack size={18} weight="duotone" />
                Batch Generate
              </Button>
            }
          />
        </div>
      </div>
    </Card>
  )
}
