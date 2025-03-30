
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TerminalType = 'iPOS' | 'Aisini A75' | 'Verifone X990' | 'PAX S20';

export type Branch = 
  | 'Masvingo Branch' 
  | 'Mutare Branch' 
  | 'Chiredzi Branch' 
  | 'Gweru Branch' 
  | 'Chinhoyi Branch' 
  | 'Private Banking' 
  | 'Bindura Branch' 
  | 'Samora Branch' 
  | 'JMN Bulawayo' 
  | 'SSC Branch' 
  | 'Business Banking' 
  | 'Digital Services' 
  | 'CIB';

export interface Terminal {
  id: string;
  branch: Branch;
  type: TerminalType;
  name: string;
  terminalId: string;
  serialNumber: string;
  lineSerialNumber: string;
  dispatchDate: string;
  fedexTrackingNumber?: string;
  isReturned: boolean;
  returnDate?: string;
}

interface TerminalState {
  terminals: Terminal[];
  addTerminal: (terminal: Omit<Terminal, 'id' | 'isReturned'>) => void;
  markAsReturned: (id: string) => void;
  getTerminalById: (id: string) => Terminal | undefined;
  getDispatchedTerminals: () => Terminal[];
  getReturnedTerminals: () => Terminal[];
  filterTerminals: (filters: {
    branch?: Branch;
    startDate?: string;
    endDate?: string;
    searchTerm?: string;
  }) => Terminal[];
}

export const useTerminalStore = create<TerminalState>()(
  persist(
    (set, get) => ({
      terminals: [],
      
      addTerminal: (terminalData) => {
        const terminal: Terminal = {
          ...terminalData,
          id: crypto.randomUUID(),
          isReturned: false,
        };
        
        set((state) => ({
          terminals: [...state.terminals, terminal],
        }));
      },
      
      markAsReturned: (id) => {
        set((state) => ({
          terminals: state.terminals.map((terminal) =>
            terminal.id === id
              ? { ...terminal, isReturned: true, returnDate: new Date().toISOString() }
              : terminal
          ),
        }));
      },
      
      getTerminalById: (id) => {
        return get().terminals.find((terminal) => terminal.id === id);
      },
      
      getDispatchedTerminals: () => {
        return get().terminals.filter((terminal) => !terminal.isReturned);
      },
      
      getReturnedTerminals: () => {
        return get().terminals.filter((terminal) => terminal.isReturned);
      },
      
      filterTerminals: ({ branch, startDate, endDate, searchTerm }) => {
        let filtered = get().terminals;
        
        if (branch) {
          filtered = filtered.filter((terminal) => terminal.branch === branch);
        }
        
        if (startDate) {
          filtered = filtered.filter(
            (terminal) => new Date(terminal.dispatchDate) >= new Date(startDate)
          );
        }
        
        if (endDate) {
          filtered = filtered.filter(
            (terminal) => new Date(terminal.dispatchDate) <= new Date(endDate)
          );
        }
        
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter(
            (terminal) =>
              terminal.name.toLowerCase().includes(term) ||
              terminal.terminalId.toLowerCase().includes(term) ||
              terminal.serialNumber.toLowerCase().includes(term)
          );
        }
        
        return filtered;
      },
    }),
    {
      name: 'nbs-terminal-storage',
    }
  )
);
