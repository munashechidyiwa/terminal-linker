
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

// Dummy data for terminals
const dummyTerminals: Terminal[] = [
  {
    id: "7f8d5e2c-9a3b-4f1d-8c7e-6b5a4f3d2e1c",
    branch: "Masvingo Branch",
    type: "iPOS",
    name: "OK Supermarket",
    terminalId: "TID12345",
    serialNumber: "SN123456789",
    lineSerialNumber: "LN123456789",
    dispatchDate: "2023-10-15T12:00:00.000Z",
    fedexTrackingNumber: "FDX123456789",
    isReturned: false
  },
  {
    id: "6e7d4c3b-2a1b-9e8d-7f6e-5d4c3b2a1d9e",
    branch: "Mutare Branch",
    type: "Aisini A75",
    name: "TM Pick n Pay",
    terminalId: "TID67890",
    serialNumber: "SN987654321",
    lineSerialNumber: "LN987654321",
    dispatchDate: "2023-11-05T14:30:00.000Z",
    fedexTrackingNumber: "FDX987654321",
    isReturned: false
  },
  {
    id: "5d4c3b2a-1e9f-8d7c-6b5a-4e3d2c1b9a8d",
    branch: "Chiredzi Branch",
    type: "Verifone X990",
    name: "Spar Supermarket",
    terminalId: "TID13579",
    serialNumber: "SN13579246",
    lineSerialNumber: "LN13579246",
    dispatchDate: "2023-09-20T10:15:00.000Z",
    fedexTrackingNumber: "FDX13579246",
    isReturned: true,
    returnDate: "2023-12-10T09:45:00.000Z"
  },
  {
    id: "4c3b2a1d-9e8f-7d6c-5b4a-3e2d1c9b8a7f",
    branch: "JMN Bulawayo",
    type: "PAX S20",
    name: "Food Lovers Market",
    terminalId: "TID24680",
    serialNumber: "SN24680135",
    lineSerialNumber: "LN24680135",
    dispatchDate: "2023-12-01T16:20:00.000Z",
    fedexTrackingNumber: "FDX24680135",
    isReturned: false
  },
  {
    id: "3b2a1d9c-8e7f-6d5c-4b3a-2d1c9b8a7f6e",
    branch: "Bindura Branch",
    type: "iPOS",
    name: "Bon Marche",
    terminalId: "TID97531",
    serialNumber: "SN97531864",
    lineSerialNumber: "LN97531864",
    dispatchDate: "2023-08-25T11:30:00.000Z",
    fedexTrackingNumber: "FDX97531864",
    isReturned: true,
    returnDate: "2024-01-15T14:20:00.000Z"
  }
];

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
      terminals: dummyTerminals, // Initialize with dummy data
      
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
