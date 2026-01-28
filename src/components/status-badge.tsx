import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'success' | 'pending' | 'failed' | 'warning' | 'info' | 'healthy' | 'error' | 'deploying' | 'pending_approval'
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants: Record<string, { label: string; className: string }> = {
    success: {
      label: 'Success',
      className: 'bg-success/20 text-success border-success/30'
    },
    pending: {
      label: 'Pending',
      className: 'bg-warning/20 text-warning border-warning/30 animate-pulse'
    },
    failed: {
      label: 'Failed',
      className: 'bg-destructive/20 text-destructive border-destructive/30'
    },
    warning: {
      label: 'Warning',
      className: 'bg-warning/20 text-warning border-warning/30'
    },
    info: {
      label: 'Info',
      className: 'bg-primary/20 text-primary border-primary/30'
    },
    healthy: {
      label: 'Healthy',
      className: 'bg-success/20 text-success border-success/30'
    },
    error: {
      label: 'Error',
      className: 'bg-destructive/20 text-destructive border-destructive/30'
    },
    deploying: {
      label: 'Deploying',
      className: 'bg-primary/20 text-primary border-primary/30 animate-pulse'
    },
    pending_approval: {
      label: 'Pending Approval',
      className: 'bg-warning/20 text-warning border-warning/30'
    }
  }

  const variant = variants[status] || variants.info

  return (
    <Badge variant="outline" className={cn(variant.className, className)}>
      {variant.label}
    </Badge>
  )
}
