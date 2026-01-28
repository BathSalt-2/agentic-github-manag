import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mockAuditEvents } from '@/lib/mock-data'
import { Input } from '@/components/ui/input'
import { MagnifyingGlass, CheckCircle, XCircle } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

export function AuditTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Audit Log</h2>
        <div className="relative w-80">
          <MagnifyingGlass 
            size={18} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
          />
          <Input 
            placeholder="Search events..." 
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-16rem)] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Repository</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAuditEvents.map((event) => (
              <TableRow key={event.id} className="hover:bg-muted/50">
                <TableCell className="font-mono text-xs whitespace-nowrap">
                  {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono text-xs">
                    {event.action}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">@{event.actor}</TableCell>
                <TableCell className="font-mono text-xs">{event.repo}</TableCell>
                <TableCell className="text-sm">{event.target || '-'}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-md truncate">
                  {event.details}
                </TableCell>
                <TableCell>
                  {event.result === 'success' ? (
                    <CheckCircle size={20} weight="fill" className="text-success" />
                  ) : (
                    <XCircle size={20} weight="fill" className="text-destructive" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
