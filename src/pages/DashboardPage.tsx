
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchFilteredTerminals, deleteTerminal } from '@/services/terminalService';
import { Branch, Terminal } from '@/store/terminalStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter, 
  DialogClose 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Search, Calendar, Filter } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [branch, setBranch] = useState<Branch | ''>('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);
  const [isReturnDetailsOpen, setIsReturnDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: terminals = [], isLoading, error } = useQuery({
    queryKey: ['terminals', branch, startDate, endDate, searchTerm],
    queryFn: () => fetchFilteredTerminals({
      branch: branch || undefined,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      searchTerm,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTerminal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terminals'] });
      toast({
        title: "Terminal Deleted",
        description: "The terminal has been successfully deleted",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete terminal: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  });

  const handleDeleteConfirm = () => {
    if (selectedTerminal) {
      deleteMutation.mutate(selectedTerminal.id);
    }
  };

  const handleDelete = (terminal: Terminal) => {
    setSelectedTerminal(terminal);
    setIsDeleteDialogOpen(true);
  };

  const handleShowReturnDetails = (terminal: Terminal) => {
    setSelectedTerminal(terminal);
    setIsReturnDetailsOpen(true);
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const resetFilters = () => {
    setBranch('');
    setStartDate(undefined);
    setEndDate(undefined);
    setSearchTerm('');
  };

  if (error) {
    return (
      <div className="container py-10">
        <Card className="bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-500">Error loading terminals: {error instanceof Error ? error.message : 'Unknown error'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Terminal Dashboard</CardTitle>
          <CardDescription>Manage and monitor POS terminals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name, terminal ID, or serial number"
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select value={branch} onValueChange={(value: Branch | '') => setBranch(value)}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    {branch || 'Filter by branch'}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-branches">All Branches</SelectItem>
                  <SelectItem value="Masvingo Branch">Masvingo Branch</SelectItem>
                  <SelectItem value="Mutare Branch">Mutare Branch</SelectItem>
                  <SelectItem value="Chiredzi Branch">Chiredzi Branch</SelectItem>
                  <SelectItem value="Gweru Branch">Gweru Branch</SelectItem>
                  <SelectItem value="Chinhoyi Branch">Chinhoyi Branch</SelectItem>
                  <SelectItem value="Private Banking">Private Banking</SelectItem>
                  <SelectItem value="Bindura Branch">Bindura Branch</SelectItem>
                  <SelectItem value="Samora Branch">Samora Branch</SelectItem>
                  <SelectItem value="JMN Bulawayo">JMN Bulawayo</SelectItem>
                  <SelectItem value="SSC Branch">SSC Branch</SelectItem>
                  <SelectItem value="Business Banking">Business Banking</SelectItem>
                  <SelectItem value="Digital Services">Digital Services</SelectItem>
                  <SelectItem value="CIB">CIB</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto">
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate && endDate 
                      ? `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`
                      : startDate
                      ? `Since ${format(startDate, 'MMM d')}`
                      : endDate
                      ? `Until ${format(endDate, 'MMM d')}`
                      : 'Date Range'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3">
                    <h4 className="mb-2 font-medium">Start Date</h4>
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                    <h4 className="mt-4 mb-2 font-medium">End Date</h4>
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="w-full md:w-auto">
              <Button variant="outline" onClick={resetFilters} className="w-full md:w-auto">
                Reset Filters
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Merchant Name</TableHead>
                  <TableHead>Terminal ID</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Dispatch Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      Loading terminals...
                    </TableCell>
                  </TableRow>
                ) : terminals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      No terminals found. Try adjusting your filters or add new terminals.
                    </TableCell>
                  </TableRow>
                ) : (
                  terminals.map((terminal) => (
                    <TableRow key={terminal.id}>
                      <TableCell>
                        {terminal.isReturned ? (
                          <Badge 
                            variant="outline" 
                            className="bg-amber-100 text-amber-800 hover:bg-amber-100 cursor-pointer"
                            onClick={() => handleShowReturnDetails(terminal)}
                          >
                            Returned
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>{terminal.name}</TableCell>
                      <TableCell>{terminal.terminalId}</TableCell>
                      <TableCell>{terminal.serialNumber}</TableCell>
                      <TableCell>{terminal.type}</TableCell>
                      <TableCell>{terminal.branch}</TableCell>
                      <TableCell>{formatDate(terminal.dispatchDate)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(terminal)}
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
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
      
      {/* Return Details Dialog */}
      <Dialog open={isReturnDetailsOpen} onOpenChange={setIsReturnDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Details</DialogTitle>
            <DialogDescription>
              Terminal returned on {formatDate(selectedTerminal?.returnDate)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <h4 className="text-sm font-medium">Terminal</h4>
              <p>{selectedTerminal?.name} ({selectedTerminal?.terminalId})</p>
            </div>
            <div>
              <h4 className="text-sm font-medium">Return Reason</h4>
              <p className="text-sm text-gray-700">{selectedTerminal?.returnReason || 'No reason provided'}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReturnDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the terminal {selectedTerminal?.name} ({selectedTerminal?.terminalId})? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
