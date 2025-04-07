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
  return_reason?: string;
}

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
    returnReason: terminal.return_reason,
  };
};

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
    return_date: terminal.returnDate,
    return_reason: terminal.returnReason,
  };
};

export interface TerminalStats {
  total: number;
  active: number;
  returned: number;
}

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

export const addTerminal = async (terminalData: Omit<Terminal, "id" | "isReturned" | "returnDate" | "returnReason">): Promise<Terminal> => {
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

export const addTerminals = async (terminalsData: Omit<Terminal, "id" | "isReturned">[]): Promise<Terminal[]> => {
  const supabaseTerminals = terminalsData.map(mapToSupabaseTerminal);
  
  const { data, error } = await supabase
    .from('terminals')
    .insert(supabaseTerminals)
    .select();

  if (error) {
    console.error('Error adding terminals:', error);
    throw error;
  }

  return (data as SupabaseTerminal[]).map(mapToAppTerminal);
};

export const fetchTerminalStats = async (): Promise<TerminalStats> => {
  const { count: total, error: totalError } = await supabase
    .from('terminals')
    .select('*', { count: 'exact', head: true });

  if (totalError) {
    console.error('Error fetching total terminals:', totalError);
    throw totalError;
  }

  const { count: returned, error: returnedError } = await supabase
    .from('terminals')
    .select('*', { count: 'exact', head: true })
    .eq('is_returned', true);

  if (returnedError) {
    console.error('Error fetching returned terminals:', returnedError);
    throw returnedError;
  }

  const active = (total || 0) - (returned || 0);

  return {
    total: total || 0,
    active: active,
    returned: returned || 0
  };
};

export const markTerminalAsReturned = async (id: string, returnReason: string): Promise<void> => {
  const { error } = await supabase
    .from('terminals')
    .update({ 
      is_returned: true, 
      return_date: new Date().toISOString(),
      return_reason: returnReason
    })
    .eq('id', id);

  if (error) {
    console.error('Error marking terminal as returned:', error);
    throw error;
  }
};

export const reactivateTerminal = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('terminals')
    .update({ 
      is_returned: false,
      return_date: null,
      return_reason: null
    })
    .eq('id', id);

  if (error) {
    console.error('Error reactivating terminal:', error);
    throw error;
  }
};

export const fetchFilteredTerminals = async (filters: {
  branch?: Branch;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
  isReturned?: boolean;
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

  if (filters.isReturned !== undefined) {
    query = query.eq('is_returned', filters.isReturned);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching filtered terminals:', error);
    throw error;
  }

  return (data as SupabaseTerminal[]).map(mapToAppTerminal);
};

export const getTerminalById = async (id: string): Promise<Terminal | null> => {
  const { data, error } = await supabase
    .from('terminals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching terminal by id:', error);
    throw error;
  }

  return mapToAppTerminal(data as SupabaseTerminal);
};

export const deleteTerminal = async (terminalId: string) => {
  const { error } = await supabase
    .from('terminals')
    .delete()
    .eq('id', terminalId);

  if (error) {
    console.error("Error deleting terminal:", error);
    throw error;
  }
  
  return true;
};

export const deleteAllTerminals = async (): Promise<void> => {
  const { error } = await supabase
    .from('terminals')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.error('Error deleting all terminals:', error);
    throw error;
  }
};
