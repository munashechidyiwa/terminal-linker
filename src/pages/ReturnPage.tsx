
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFilteredTerminals, markTerminalAsReturned } from '@/services/terminalService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Search } from 'lucide-react';

export default function ReturnPage() {
  const [returnReason, setReturnReason] = useState('');
  const [selectedTerminalId, setSelectedTerminalId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch only active terminals
  const { data: terminals = [], isLoading } = useQuery({
    queryKey: ['activeTerminals', searchTerm],
    queryFn: () => fetchFilteredTerminals({ 
      isReturned: false,
      searchTerm: searchTerm
    }),
  });

  const returnMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      markTerminalAsReturned(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeTerminals'] });
      queryClient.invalidateQueries({ queryKey: ['terminals'] });
      queryClient.invalidateQueries({ queryKey: ['terminalStats'] });
      toast({
        title: "Terminal Returned",
        description: "The terminal has been marked as returned",
      });
      setReturnReason('');
      setSelectedTerminalId(null);
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to mark terminal as returned: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  });

  const handleOpenDialog = (terminalId: string) => {
    setSelectedTerminalId(terminalId);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTerminalId) {
      returnMutation.mutate({ 
        id: selectedTerminalId, 
        reason: returnReason 
      });
    }
  };

  const selectedTerminal = terminals.find(terminal => terminal.id === selectedTerminalId);

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Return Terminal</CardTitle>
          <CardDescription>Mark a terminal as returned</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative w-full md:w-1/2 mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name, terminal ID, or serial number"
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <p className="text-sm text-muted-foreground">Select a terminal to mark as returned</p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Merchant Name</TableHead>
                  <TableHead>Terminal ID</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      Loading terminals...
                    </TableCell>
                  </TableRow>
                ) : terminals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      No active terminals found. All terminals may have been returned.
                    </TableCell>
                  </TableRow>
                ) : (
                  terminals.map((terminal) => (
                    <TableRow key={terminal.id}>
                      <TableCell>{terminal.name}</TableCell>
                      <TableCell>{terminal.terminalId}</TableCell>
                      <TableCell>{terminal.serialNumber}</TableCell>
                      <TableCell>{terminal.type}</TableCell>
                      <TableCell>{terminal.branch}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          onClick={() => handleOpenDialog(terminal.id)}
                          variant="outline"
                          size="sm"
                        >
                          Return
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Terminal</DialogTitle>
            <DialogDescription>
              You are about to mark {selectedTerminal?.name} ({selectedTerminal?.terminalId}) as returned.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Return Reason</h4>
                <Textarea
                  placeholder="Specify the reason for returning this terminal"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={returnMutation.isPending}
              >
                {returnMutation.isPending ? 'Processing...' : 'Confirm Return'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
