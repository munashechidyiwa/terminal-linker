
import { useState } from 'react';
import { useTerminalStore } from '@/store/terminalStore';
import { Search, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const ReturnPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTerminal, setSelectedTerminal] = useState<string | null>(null);
  const [confirmReturn, setConfirmReturn] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { 
    getDispatchedTerminals,
    getTerminalById,
    markAsReturned
  } = useTerminalStore();
  
  const dispatchedTerminals = getDispatchedTerminals();
  
  const filteredTerminals = searchTerm
    ? dispatchedTerminals.filter(
        (terminal) =>
          terminal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          terminal.terminalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          terminal.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : dispatchedTerminals;
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already reactive
  };
  
  const handleSelectTerminal = (id: string) => {
    setSelectedTerminal(id);
  };
  
  const handleReturn = () => {
    if (selectedTerminal) {
      const terminal = getTerminalById(selectedTerminal);
      markAsReturned(selectedTerminal);
      
      toast({
        title: 'Terminal Returned',
        description: `${terminal?.name} has been successfully marked as returned`,
      });
      
      setConfirmReturn(false);
      setSelectedTerminal(null);
      setSearchTerm('');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-nbsGreen">Return Terminal</h1>
          <p className="text-gray-600">Process a terminal return</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-3 nbs-card-hover animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Search for Terminal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by Terminal ID, Name or Serial Number..."
                    className="pl-10 nbs-input-focus"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-nbsGreen hover:bg-nbsGreen-dark text-white"
                >
                  Search Terminals
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {filteredTerminals.length > 0 ? (
            filteredTerminals.map((terminal) => (
              <Card 
                key={terminal.id} 
                className={`cursor-pointer transition-all duration-300 ${
                  selectedTerminal === terminal.id 
                    ? 'border-nbsGreen ring-1 ring-nbsGreen' 
                    : 'hover:border-nbsGreen/50'
                } animate-slide-in`}
                onClick={() => handleSelectTerminal(terminal.id)}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{terminal.name}</h3>
                      <p className="text-sm text-gray-500">{terminal.terminalId}</p>
                    </div>
                    {selectedTerminal === terminal.id && (
                      <div className="bg-nbsGreen rounded-full p-1">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-gray-500">Branch:</span>
                      <span>{terminal.branch}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-gray-500">Type:</span>
                      <span>{terminal.type}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-gray-500">Serial:</span>
                      <span>{terminal.serialNumber}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                      <span className="text-gray-500">Dispatched:</span>
                      <span>{format(new Date(terminal.dispatchDate), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : searchTerm ? (
            <Card className="md:col-span-3 p-8 text-center animate-fade-in">
              <p className="text-gray-500">No terminals found matching "{searchTerm}"</p>
              <Button 
                variant="link" 
                onClick={() => setSearchTerm('')}
                className="mt-2 text-nbsGreen"
              >
                Clear search
              </Button>
            </Card>
          ) : (
            <Card className="md:col-span-3 p-8 text-center animate-fade-in">
              <p className="text-gray-500">No terminals currently dispatched</p>
            </Card>
          )}
        </div>
        
        {selectedTerminal && (
          <div className="flex justify-center animate-fade-in">
            <Button 
              onClick={() => setConfirmReturn(true)}
              className="bg-nbsGreen hover:bg-nbsGreen-dark text-white"
            >
              Process Return <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmReturn} onOpenChange={setConfirmReturn}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Terminal Return</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this terminal as returned?
            </DialogDescription>
          </DialogHeader>
          
          {selectedTerminal && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4">
                {(() => {
                  const terminal = getTerminalById(selectedTerminal);
                  if (!terminal) return null;
                  
                  return (
                    <>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Terminal Name</p>
                        <p className="text-sm">{terminal.name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Terminal ID</p>
                        <p className="text-sm">{terminal.terminalId}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Branch</p>
                        <p className="text-sm">{terminal.branch}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Serial Number</p>
                        <p className="text-sm">{terminal.serialNumber}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Return Date: <span className="font-medium">{format(new Date(), 'PPP')}</span>
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReturn(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleReturn}
              className="bg-nbsGreen hover:bg-nbsGreen-dark text-white"
            >
              Confirm Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReturnPage;
