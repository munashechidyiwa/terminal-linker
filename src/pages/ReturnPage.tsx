
import { useState, useEffect } from 'react';
import { Search, ArrowRight, Check, Loader2, Trash2 } from 'lucide-react';
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
import { fetchFilteredTerminals, getTerminalById, markTerminalAsReturned, deleteTerminal } from '@/services/terminalService';
import { Terminal } from '@/store/terminalStore';

const ReturnPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTerminal, setSelectedTerminal] = useState<string | null>(null);
  const [confirmReturn, setConfirmReturn] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [dispatchedTerminals, setDispatchedTerminals] = useState<Terminal[]>([]);
  const [filteredTerminals, setFilteredTerminals] = useState<Terminal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    loadDispatchedTerminals();
  }, []);
  
  const loadDispatchedTerminals = async () => {
    try {
      setIsLoading(true);
      const terminals = await fetchFilteredTerminals({});
      const dispatched = terminals.filter(t => !t.isReturned);
      setDispatchedTerminals(dispatched);
      setFilteredTerminals(dispatched);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading dispatched terminals:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load terminals. Please try again.",
      });
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    // Filter terminals based on search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = dispatchedTerminals.filter(
        (terminal) =>
          terminal.name.toLowerCase().includes(term) ||
          terminal.terminalId.toLowerCase().includes(term) ||
          terminal.serialNumber.toLowerCase().includes(term)
      );
      setFilteredTerminals(filtered);
    } else {
      setFilteredTerminals(dispatchedTerminals);
    }
  }, [searchTerm, dispatchedTerminals]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already reactive through the useEffect
  };
  
  const handleSelectTerminal = (id: string) => {
    setSelectedTerminal(id);
  };
  
  const handleReturn = async () => {
    if (!selectedTerminal) return;
    
    try {
      setIsProcessing(true);
      await markTerminalAsReturned(selectedTerminal);
      
      const terminal = await getTerminalById(selectedTerminal);
      
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
    } catch (error) {
      console.error("Error returning terminal:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process return. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteConfirmation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click from selecting the terminal
    setConfirmDelete(id);
  };

  const handleDeleteTerminal = async () => {
    if (!confirmDelete) return;
    
    try {
      setIsProcessing(true);
      await deleteTerminal(confirmDelete);
      
      toast({
        title: 'Terminal Deleted',
        description: 'Terminal has been successfully deleted',
      });
      
      // Refresh the terminals list
      loadDispatchedTerminals();
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting terminal:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete terminal. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-nbsGreen">Returned Terminals</h1>
          <p className="text-gray-600">Process a terminal returned</p>
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
          
          {isLoading ? (
            <Card className="md:col-span-3 p-8 text-center animate-fade-in">
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 text-nbsGreen animate-spin mb-4" />
                <p className="text-gray-500">Loading terminals...</p>
              </div>
            </Card>
          ) : filteredTerminals.length > 0 ? (
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
                    <div className="flex items-center">
                      {selectedTerminal === terminal.id && (
                        <div className="bg-nbsGreen rounded-full p-1 mr-2">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={(e) => handleDeleteConfirmation(terminal.id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
      
      {/* Confirmation Dialog for Return */}
      <Dialog open={confirmReturn} onOpenChange={setConfirmReturn}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Terminal Return</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this terminal as returned?
            </DialogDescription>
          </DialogHeader>
          
          {selectedTerminal && (() => {
            const terminal = filteredTerminals.find(t => t.id === selectedTerminal);
            if (!terminal) return null;
            
            return (
              <div className="py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Merchant Name</p>
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
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Return Date: <span className="font-medium">{format(new Date(), 'PPP')}</span>
                  </p>
                </div>
              </div>
            );
          })()}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReturn(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleReturn}
              className="bg-nbsGreen hover:bg-nbsGreen-dark text-white"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Return"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={(isOpen) => !isOpen && setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Terminal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this terminal? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteTerminal}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Terminal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReturnPage;
