
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchTerminalStats, fetchFilteredTerminals } from '@/services/terminalService';
import { LayoutDashboard, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { downloadTerminalsReport } from '@/utils/excelUtils';

export function DashboardStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['terminalStats'],
    queryFn: fetchTerminalStats,
  });

  const { toast } = useToast();

  const handleDownloadReport = async (type: 'total' | 'active' | 'returned') => {
    try {
      // Fetch data based on report type
      const filters: Record<string, any> = {};
      if (type === 'returned') {
        filters.isReturned = true;
      } else if (type === 'active') {
        filters.isReturned = false;
      }
      
      const terminals = await fetchFilteredTerminals(filters);
      
      // Generate and download Excel file
      await downloadTerminalsReport(terminals, type);
      
      toast({
        title: "Report Generated",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} terminals report downloaded successfully`,
      });
    } catch (error) {
      console.error(`Error generating ${type} report:`, error);
      toast({
        variant: "destructive",
        title: "Report Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate report",
      });
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Terminals</CardTitle>
          <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : stats?.total || 0}</div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              Total terminals in the system
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs"
              onClick={() => handleDownloadReport('total')}
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Terminals</CardTitle>
          <ArrowUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : stats?.active || 0}</div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              Currently dispatched terminals
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs"
              onClick={() => handleDownloadReport('active')}
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Returned Terminals</CardTitle>
          <ArrowDown className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '...' : stats?.returned || 0}</div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              Terminals that have been returned
            </p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs"
              onClick={() => handleDownloadReport('returned')}
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
