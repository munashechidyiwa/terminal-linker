
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchTerminalStats } from '@/services/terminalService';
import { LayoutDashboard, ArrowUp, ArrowDown } from 'lucide-react';

export function DashboardStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['terminalStats'],
    queryFn: fetchTerminalStats,
  });

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Terminals</CardTitle>
          <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : stats?.total || 0}</div>
          <p className="text-xs text-muted-foreground">
            Total terminals in the system
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Terminals</CardTitle>
          <ArrowUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : stats?.active || 0}</div>
          <p className="text-xs text-muted-foreground">
            Currently dispatched terminals
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Returned Terminals</CardTitle>
          <ArrowDown className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : stats?.returned || 0}</div>
          <p className="text-xs text-muted-foreground">
            Terminals that have been returned
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
