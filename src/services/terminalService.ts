
import { supabase } from "@/integrations/supabase/client";
import { Branch, Terminal, TerminalType } from "@/store/terminalStore";

export interface SupabaseTerminal {
  id: string;
  branch: Branch;
  type: TerminalType;
  name: string;
  terminal_id: string;
  serial_number: string;
  line_serial_number: string;
  dispatch_date: string;
  fedex_tracking_number?: string;
  is_returned: boolean;
  return_date?: string;
}

// Convert from Supabase format to our app format
export const mapToAppTerminal = (terminal: SupabaseTerminal): Terminal => {
  return {
    id: terminal.id,
    branch: terminal.branch,
    type: terminal.type,
    name: terminal.name,
    terminalId: terminal.terminal_id,
    serialNumber: terminal.serial_number,
    lineSerialNumber: terminal.line_serial_number,
    dispatchDate: terminal.dispatch_date,
    fedexTrackingNumber: terminal.fedex_tracking_number,
    isReturned: terminal.is_returned,
    returnDate: terminal.return_date,
  };
};

// Convert from our app format to Supabase format
export const mapToSupabaseTerminal = (terminal: Omit<Terminal, "id" | "isReturned">): Omit<SupabaseTerminal, "id" | "is_returned"> => {
  return {
    branch: terminal.branch,
    type: terminal.type,
    name: terminal.name,
    terminal_id: terminal.terminalId,
    serial_number: terminal.serialNumber,
    line_serial_number: terminal.lineSerialNumber,
    dispatch_date: terminal.dispatchDate,
    fedex_tracking_number: terminal.fedexTrackingNumber,
  };
};

// Fetch all terminals from Supabase
export const fetchTerminals = async (): Promise<Terminal[]> => {
  const { data, error } = await supabase
    .from('terminals')
    .select('*');

  if (error) {
    console.error('Error fetching terminals:', error);
    throw error;
  }

  return (data as SupabaseTerminal[]).map(mapToAppTerminal);
};

// Add a new terminal to Supabase
export const addTerminal = async (terminalData: Omit<Terminal, "id" | "isReturned">): Promise<Terminal> => {
  const supabaseTerminal = mapToSupabaseTerminal(terminalData);
  
  const { data, error } = await supabase
    .from('terminals')
    .insert([supabaseTerminal])
    .select()
    .single();

  if (error) {
    console.error('Error adding terminal:', error);
    throw error;
  }

  return mapToAppTerminal(data as SupabaseTerminal);
};

// Mark a terminal as returned in Supabase
export const markTerminalAsReturned = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('terminals')
    .update({ 
      is_returned: true, 
      return_date: new Date().toISOString() 
    })
    .eq('id', id);

  if (error) {
    console.error('Error marking terminal as returned:', error);
    throw error;
  }
};

// Fetch filtered terminals from Supabase
export const fetchFilteredTerminals = async (filters: {
  branch?: Branch;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}): Promise<Terminal[]> => {
  let query = supabase.from('terminals').select('*');

  if (filters.branch) {
    query = query.eq('branch', filters.branch);
  }

  if (filters.startDate) {
    query = query.gte('dispatch_date', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('dispatch_date', filters.endDate);
  }

  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    query = query.or(`name.ilike.%${term}%,terminal_id.ilike.%${term}%,serial_number.ilike.%${term}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching filtered terminals:', error);
    throw error;
  }

  return (data as SupabaseTerminal[]).map(mapToAppTerminal);
};

// Get terminal by ID
export const getTerminalById = async (id: string): Promise<Terminal | null> => {
  const { data, error } = await supabase
    .from('terminals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching terminal by id:', error);
    throw error;
  }

  return mapToAppTerminal(data as SupabaseTerminal);
};
