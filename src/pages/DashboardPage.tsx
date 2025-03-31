
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  Building, 
  Box, 
  RefreshCw,
  ArrowUpDown, 
  Plus,
  Loader2
} from 'lucide-react';
import { Branch, Terminal } from '@/store/terminalStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { fetchFilteredTerminals } from '@/services/terminalService';
import { useToast } from '@/hooks/use-toast';

const DashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState<Branch | 'all'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [filteredTerminals, setFilteredTerminals] = useState<Terminal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Fetch terminals when the component mounts
    loadTerminals();
  }, []);

  const loadTerminals = async () => {
    try {
      setIsLoading(true);
      const filters = {
        branch: branchFilter !== 'all' ? branchFilter as Branch : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        searchTerm
      };
      const data = await fetchFilteredTerminals(filters);
      setTerminals(data);
      setFilteredTerminals(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch terminals:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load terminals. Please try again.",
      });
      setIsLoading(false);
    }
  };
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await loadTerminals();
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setBranchFilter('all');
    setStartDate('');
    setEndDate('');
    loadTerminals();
  };
  
  const branches: Branch[] = [
    'Masvingo Branch', 
    'Mutare Branch', 
    'Chiredzi Branch', 
    'Gweru Branch', 
    'Chinhoyi Branch', 
    'Private Banking', 
    'Bindura Branch', 
    'Samora Branch', 
    'JMN Bulawayo', 
    'SSC Branch', 
    'Business Banking', 
    'Digital Services', 
    'CIB'
  ];

  const dispatchedTerminals = terminals.filter(terminal => !terminal.isReturned);
  const returnedTerminals = terminals.filter(terminal => terminal.isReturned);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-nbsGreen">Terminal Dashboard</h1>
          <p className="text-gray-600">Manage and monitor all your payment terminals</p>
        </div>
        
        <div className="flex gap-3">
          <Button asChild className="bg-nbsGreen hover:bg-nbsGreen-dark">
            <Link to="/dispatch">
              <Plus className="mr-2 h-4 w-4" /> Dispatch Terminal
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/return">
              <RefreshCw className="mr-2 h-4 w-4" /> Return Terminal
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="nbs-card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-600 text-sm font-normal">Total Terminals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Box className="h-8 w-8 text-nbsGreen mr-3" />
              <span className="text-3xl font-bold">{terminals.length}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="nbs-card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-600 text-sm font-normal">Dispatched Terminals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Box className="h-8 w-8 text-nbsLime mr-3" />
              <span className="text-3xl font-bold">{dispatchedTerminals.length}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="nbs-card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-600 text-sm font-normal">Returned Terminals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <RefreshCw className="h-8 w-8 text-gray-500 mr-3" />
              <span className="text-3xl font-bold">{returnedTerminals.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Search and Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter Terminals</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search terminals..."
                  className="pl-10 nbs-input-focus"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Start date"
                  className="nbs-input-focus"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="End date"
                  className="nbs-input-focus"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <Select value={branchFilter} onValueChange={(value) => setBranchFilter(value as Branch | 'all')}>
                  <SelectTrigger className="nbs-input-focus">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
              <Button type="submit" className="bg-nbsGreen hover:bg-nbsGreen-dark">
                Apply Filters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Terminals Table */}
      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Terminals</TabsTrigger>
          <TabsTrigger value="dispatched">Dispatched</TabsTrigger>
          <TabsTrigger value="returned">Returned</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {isLoading ? <LoadingState /> : <TerminalTable terminals={filteredTerminals} />}
        </TabsContent>
        
        <TabsContent value="dispatched">
          {isLoading ? <LoadingState /> : <TerminalTable terminals={filteredTerminals.filter(t => !t.isReturned)} />}
        </TabsContent>
        
        <TabsContent value="returned">
          {isLoading ? <LoadingState /> : <TerminalTable terminals={filteredTerminals.filter(t => t.isReturned)} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const LoadingState = () => {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="h-8 w-8 text-nbsGreen animate-spin" />
      <span className="ml-2 text-lg text-gray-600">Loading terminals...</span>
    </div>
  );
};

interface TerminalTableProps {
  terminals: Terminal[];
}

const TerminalTable = ({ terminals }: TerminalTableProps) => {
  if (terminals.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No terminals found</p>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full bg-white">
          <thead>
            <tr className="bg-nbsGreen text-white">
              <th className="py-3 px-4 text-left font-medium">
                <div className="flex items-center">
                  Merchant Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </th>
              <th className="py-3 px-4 text-left font-medium">
                <div className="flex items-center">
                  Terminal ID
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </th>
              <th className="py-3 px-4 text-left font-medium">
                <div className="flex items-center">
                  Branch
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </th>
              <th className="py-3 px-4 text-left font-medium">
                <div className="flex items-center">
                  Type
                </div>
              </th>
              <th className="py-3 px-4 text-left font-medium">
                <div className="flex items-center">
                  Serial Number
                </div>
              </th>
              <th className="py-3 px-4 text-left font-medium">
                <div className="flex items-center">
                  Dispatch Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </th>
              <th className="py-3 px-4 text-left font-medium">
                <div className="flex items-center">
                  Status
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {terminals.map((terminal, index) => (
              <tr 
                key={terminal.id} 
                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                <td className="py-3 px-4">{terminal.name}</td>
                <td className="py-3 px-4">{terminal.terminalId}</td>
                <td className="py-3 px-4">{terminal.branch}</td>
                <td className="py-3 px-4">{terminal.type}</td>
                <td className="py-3 px-4">{terminal.serialNumber}</td>
                <td className="py-3 px-4">
                  {format(new Date(terminal.dispatchDate), 'MMM dd, yyyy')}
                </td>
                <td className="py-3 px-4">
                  {terminal.isReturned ? (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800">
                      Returned
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                      Dispatched
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardPage;
