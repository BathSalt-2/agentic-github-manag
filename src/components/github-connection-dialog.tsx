import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useGitHub } from '@/lib/github-context'
import { GithubLogo, Info } from '@phosphor-icons/react'

interface GitHubConnectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GitHubConnectionDialog({ open, onOpenChange }: GitHubConnectionDialogProps) {
  const [tokenInput, setTokenInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setToken } = useGitHub()

  const handleConnect = async () => {
    if (!tokenInput.trim()) {
      setError('Please enter a token')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      setToken(tokenInput.trim())
      setTokenInput('')
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'Failed to connect to GitHub')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GithubLogo size={24} weight="fill" />
            Connect to GitHub
          </DialogTitle>
          <DialogDescription>
            Enter your GitHub Personal Access Token to connect your repositories
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <Info size={16} weight="fill" className="text-muted-foreground" />
            <AlertDescription className="text-xs">
              Create a token at{' '}
              <a 
                href="https://github.com/settings/tokens/new?scopes=repo,workflow,read:user" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline text-primary hover:text-primary/80"
              >
                github.com/settings/tokens
              </a>
              {' '}with <code className="text-xs bg-muted px-1 rounded">repo</code> and{' '}
              <code className="text-xs bg-muted px-1 rounded">workflow</code> scopes
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="token">Personal Access Token</Label>
            <Input
              id="token"
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={isSubmitting}>
            {isSubmitting ? 'Connecting...' : 'Connect'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
