
import { utils, write } from 'xlsx';
import { saveAs } from 'file-saver';
import { Terminal } from '@/store/terminalStore';
import { format } from 'date-fns';

/**
 * Generate and download an Excel report of terminals
 * @param terminals List of terminals to include in the report
 * @param reportType Type of report being generated
 */
export const downloadTerminalsReport = async (
  terminals: Terminal[],
  reportType: 'total' | 'active' | 'returned'
): Promise<void> => {
  // Format data for Excel
  const data = terminals.map(terminal => ({
    'Merchant Name': terminal.name,
    'Terminal ID': terminal.terminalId,
    'Serial Number': terminal.serialNumber,
    'Line Serial Number': terminal.lineSerialNumber,
    'Type': terminal.type,
    'Branch': terminal.branch,
    'Dispatch Date': terminal.dispatchDate ? format(new Date(terminal.dispatchDate), 'MMM d, yyyy') : '',
    'Status': terminal.isReturned ? 'Returned' : 'Active',
    'Return Date': terminal.returnDate ? format(new Date(terminal.returnDate), 'MMM d, yyyy') : '',
    'Return Reason': terminal.returnReason || '',
    'FedEx Tracking': terminal.fedexTrackingNumber || ''
  }));

  // Create workbook and worksheet
  const worksheet = utils.json_to_sheet(data);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, 'Terminals');

  // Auto-size columns
  const colWidths = [
    { wch: 20 }, // Merchant Name
    { wch: 10 }, // Terminal ID
    { wch: 15 }, // Serial Number
    { wch: 20 }, // Line Serial Number
    { wch: 10 }, // Type
    { wch: 20 }, // Branch
    { wch: 12 }, // Dispatch Date
    { wch: 8 },  // Status
    { wch: 12 }, // Return Date
    { wch: 30 }, // Return Reason
    { wch: 20 }, // FedEx Tracking
  ];
  worksheet['!cols'] = colWidths;

  // Generate buffer
  const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Convert to Blob and save
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Generate filename with date
  const now = new Date();
  const dateStr = format(now, 'yyyy-MM-dd');
  const reportTypeCapitalized = reportType.charAt(0).toUpperCase() + reportType.slice(1);
  const fileName = `${reportTypeCapitalized}_Terminals_Report_${dateStr}.xlsx`;
  
  saveAs(blob, fileName);
};
