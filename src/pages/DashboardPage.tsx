
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fetchFilteredTerminals, deleteTerminal, deleteAllTerminals, reactivateTerminal } from '@/services/terminalService';
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
import { Trash2, Search, Calendar, Filter, AlertTriangle, Download, RefreshCcw } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardStats } from '@/components/DashboardStats';
import { downloadFilteredTerminalsReport } from '@/utils/excelUtils';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [branch, setBranch] = useState<Branch | ''>('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [terminalStatus, setTerminalStatus] = useState<'all' | 'active' | 'returned'>('all');
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);
  const [isReturnDetailsOpen, setIsReturnDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [isReactivateDialogOpen, setIsReactivateDialogOpen] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: terminals = [], isLoading, error } = useQuery({
    queryKey: ['terminals', branch, startDate, endDate, searchTerm, terminalStatus],
    queryFn: () => fetchFilteredTerminals({
      branch: branch || undefined,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      searchTerm,
      isReturned: terminalStatus === 'all' ? undefined : terminalStatus === 'returned'
    }),
  });

  // Calculate pagination values
  const totalTerminals = terminals.length;
  const totalPages = Math.ceil(totalTerminals / pageSize);
  const paginatedTerminals = terminals.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTerminal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terminals'] });
      queryClient.invalidateQueries({ queryKey: ['terminalStats'] });
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

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => reactivateTerminal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terminals'] });
      queryClient.invalidateQueries({ queryKey: ['terminalStats'] });
      toast({
        title: "Terminal Reactivated",
        description: "The terminal has been successfully reactivated",
      });
      setIsReactivateDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to reactivate terminal: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  });

  const deleteAllMutation = useMutation({
    mutationFn: deleteAllTerminals,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terminals'] });
      queryClient.invalidateQueries({ queryKey: ['terminalStats'] });
      toast({
        title: "All Terminals Deleted",
        description: "All terminals have been successfully deleted from the database",
      });
      setIsDeleteAllDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete all terminals: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  });

  const handleDeleteConfirm = () => {
    if (selectedTerminal) {
      deleteMutation.mutate(selectedTerminal.id);
    }
  };

  const handleReactivateConfirm = () => {
    if (selectedTerminal) {
      reactivateMutation.mutate(selectedTerminal.id);
    }
  };

  const handleDeleteAllConfirm = () => {
    deleteAllMutation.mutate();
  };

  const handleDelete = (terminal: Terminal) => {
    setSelectedTerminal(terminal);
    setIsDeleteDialogOpen(true);
  };

  const handleReactivate = (terminal: Terminal) => {
    setSelectedTerminal(terminal);
    setIsReactivateDialogOpen(true);
  };

  const handleShowReturnDetails = (terminal: Terminal) => {
    setSelectedTerminal(terminal);
    setIsReturnDetailsOpen(true);
  };

  const handleDownloadFiltered = async () => {
    try {
      await downloadFilteredTerminalsReport(terminals, 'filtered');
      toast({
        title: "Report Generated",
        description: "Filtered terminals report downloaded successfully",
      });
    } catch (error) {
      console.error("Error generating filtered report:", error);
      toast({
        variant: "destructive",
        title: "Report Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate report",
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const resetFilters = () => {
    setBranch('');
    setStartDate(undefined);
    setEndDate(undefined);
    setSearchTerm('');
    setTerminalStatus('all');
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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
          <DashboardStats />
          
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
              <Button 
                variant="outline" 
                onClick={resetFilters} 
                className="w-full md:w-auto"
              >
                Reset Filters
              </Button>
            </div>
            <div className="w-full md:w-auto">
              <Button 
                variant="outline"
                onClick={handleDownloadFiltered} 
                className="w-full md:w-auto"
                disabled={terminals.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Results
              </Button>
            </div>
            <div className="w-full md:w-auto ml-auto">
              <Button 
                variant="destructive" 
                onClick={() => setIsDeleteAllDialogOpen(true)}
                className="w-full md:w-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All Terminals
              </Button>
            </div>
          </div>
          
          <div className="mb-4">
            <Tabs 
              value={terminalStatus} 
              onValueChange={(value) => {
                setTerminalStatus(value as 'all' | 'active' | 'returned');
                setCurrentPage(1);
              }}
              className="w-auto"
            >
              <TabsList>
                <TabsTrigger value="all" className="px-4">All Terminals</TabsTrigger>
                <TabsTrigger value="active" className="px-4">Active Only</TabsTrigger>
                <TabsTrigger value="returned" className="px-4">Returned Only</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              Showing {paginatedTerminals.length} of {totalTerminals} terminals
            </div>
            <Select 
              value={pageSize.toString()} 
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Rows per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      Loading terminals...
                    </TableCell>
                  </TableRow>
                ) : paginatedTerminals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      No terminals found. Try adjusting your filters or add new terminals.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTerminals.map((terminal) => (
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
                        <div className="flex space-x-1">
                          {terminal.isReturned && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleReactivate(terminal)}
                              className="h-8 w-8 text-green-500 hover:text-green-700"
                              title="Reactivate Terminal"
                            >
                              <RefreshCcw className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(terminal)}
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            title="Delete Terminal"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => goToPage(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {/* Generate page number links */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Calculate visible page numbers
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (currentPage > 3) {
                        pageNum = currentPage - 3 + i;
                      }
                      if (pageNum > totalPages - 4 && currentPage > totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      }
                    }
                    
                    if (pageNum <= totalPages) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink 
                            isActive={currentPage === pageNum}
                            onClick={() => goToPage(pageNum)}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => goToPage(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
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
      
      {/* Reactivate Confirmation Dialog */}
      <Dialog open={isReactivateDialogOpen} onOpenChange={setIsReactivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reactivate Terminal</DialogTitle>
            <DialogDescription>
              Are you sure you want to reactivate the terminal {selectedTerminal?.name} ({selectedTerminal?.terminalId})? 
              This will mark the terminal as active again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleReactivateConfirm}>Reactivate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete All Confirmation Dialog */}
      <Dialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" /> Delete All Terminals
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete ALL terminals from the database? 
              This action cannot be undone and will permanently remove all terminal records.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 p-4 rounded-md border border-red-200 my-2">
            <p className="text-sm text-red-800 font-medium">Warning: This will delete {terminals.length} terminals from the database.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteAllConfirm}>
              Delete All Terminals
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
