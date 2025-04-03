
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { read, utils } from 'xlsx';
import { Terminal } from '@/store/terminalStore';
import { Loader2, FileSpreadsheet, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

interface ExcelUploaderProps {
  onDataExtracted: (data: Omit<Terminal, "id" | "isReturned" | "returnDate" | "returnReason">[]) => void;
  isProcessing: boolean;
}

export function ExcelUploader({ onDataExtracted, isProcessing }: ExcelUploaderProps) {
  const { toast } = useToast();
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          toast({
            variant: "destructive",
            title: "File Error",
            description: "Could not read the file",
          });
          return;
        }
        
        const workbook = read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = utils.sheet_to_json(sheet);
        
        if (jsonData.length === 0) {
          toast({
            variant: "destructive",
            title: "Empty File",
            description: "The Excel file does not contain any data",
          });
          return;
        }
        
        // Map Excel columns to our Terminal type
        const terminals = jsonData.map((row: any) => {
          // Check for required fields
          if (!row.name || !row.terminal_id || !row.serial_number || 
              !row.line_serial_number || !row.type || !row.branch) {
            throw new Error("Missing required fields in Excel file");
          }
          
          // Validate terminal type
          const validTypes = ['iPOS', 'Aisini A75', 'Verifone X990', 'PAX S20'];
          if (!validTypes.includes(row.type)) {
            throw new Error(`Invalid terminal type: ${row.type}`);
          }
          
          let dispatchDate = new Date();
          if (row.dispatch_date) {
            // Try to parse the date if provided
            try {
              dispatchDate = new Date(row.dispatch_date);
            } catch (e) {
              console.error("Invalid date format, using current date", e);
            }
          }
          
          return {
            name: String(row.name).slice(0, 25), // Limit to 25 chars
            terminalId: String(row.terminal_id).slice(0, 8), // Limit to 8 chars
            serialNumber: String(row.serial_number).slice(0, 11), // Limit to 11 chars
            lineSerialNumber: String(row.line_serial_number).slice(0, 18), // Limit to 18 chars
            type: row.type,
            branch: row.branch,
            dispatchDate: dispatchDate.toISOString(),
            fedexTrackingNumber: row.fedex_tracking_number || undefined,
          };
        });
        
        onDataExtracted(terminals);
        toast({
          title: "File Processed",
          description: `Successfully extracted ${terminals.length} terminal(s) from the Excel file`,
        });
      } catch (error: any) {
        console.error("Error processing Excel file:", error);
        toast({
          variant: "destructive",
          title: "Processing Error",
          description: error.message || "Failed to process the Excel file",
        });
      }
    };
    
    reader.readAsArrayBuffer(file);
  }, [onDataExtracted, toast]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    disabled: isProcessing
  });
  
  return (
    <div 
      {...getRootProps()} 
      className={`border-2 border-dashed rounded-lg p-6 cursor-pointer text-center transition-colors ${
        isDragActive ? 'border-nbsGreen bg-nbsGreen/10' : 'border-gray-300 hover:border-nbsGreen'
      } ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center space-y-3">
        {isProcessing ? (
          <Loader2 className="h-10 w-10 text-nbsGreen animate-spin" />
        ) : (
          <FileSpreadsheet className="h-10 w-10 text-nbsGreen" />
        )}
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Upload Excel File</h3>
          <p className="text-sm text-gray-500">
            {isDragActive ? "Drop the file here" : "Drag and drop or click to browse"}
          </p>
        </div>
        <Button 
          type="button"
          variant="outline" 
          className="flex items-center space-x-2"
          disabled={isProcessing}
        >
          <Upload className="h-4 w-4" />
          <span>Select File</span>
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          Excel file should have columns: name, terminal_id, serial_number, line_serial_number, type, branch, dispatch_date (optional), fedex_tracking_number (optional)
        </p>
      </div>
    </div>
  );
}
