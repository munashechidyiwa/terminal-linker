import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addTerminal, addTerminals } from '@/services/terminalService';
import { Terminal, TerminalType, Branch } from '@/store/terminalStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExcelUploader } from '@/components/ExcelUploader';

const formSchema = z.object({
  name: z.string()
    .min(1, { message: 'Merchant name is required' })
    .max(25, { message: 'Merchant name must be 25 characters or less' }),
  terminalId: z.string()
    .min(1, { message: 'Terminal ID is required' })
    .max(8, { message: 'Terminal ID must be 8 characters or less' }),
  serialNumber: z.string()
    .min(1, { message: 'Serial number is required' })
    .max(11, { message: 'Serial number must be 11 characters or less' }),
  lineSerialNumber: z.string()
    .min(1, { message: 'Line serial number is required' })
    .min(16, { message: 'Line serial number must be at least 16 characters' })
    .max(18, { message: 'Line serial number must be 18 characters or less' }),
  type: z.enum(['iPOS', 'Aisino A75', 'Verifone X990', 'PAX S20'], { 
    required_error: 'Terminal type is required' 
  }),
  branch: z.string({ required_error: 'Branch is required' }),
  dispatchDate: z.date({ required_error: 'Dispatch date is required' }),
  fedexTrackingNumber: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DispatchPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("single");
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchData, setBatchData] = useState<Omit<Terminal, "id" | "isReturned" | "returnDate" | "returnReason">[]>([]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      terminalId: '',
      serialNumber: '',
      lineSerialNumber: '',
      dispatchDate: new Date(),
      fedexTrackingNumber: '',
    },
  });
  
  const singleMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const terminalData: Omit<Terminal, "id" | "isReturned" | "returnDate" | "returnReason"> = {
        ...values,
        dispatchDate: values.dispatchDate.toISOString(),
        branch: values.branch as Branch,
        type: values.type,
      };
      return addTerminal(terminalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terminals'] });
      form.reset({
        name: '',
        terminalId: '',
        serialNumber: '',
        lineSerialNumber: '',
        dispatchDate: new Date(),
        fedexTrackingNumber: '',
      });
      toast({
        title: 'Terminal Added',
        description: 'The terminal has been added successfully.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to add terminal: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    },
  });
  
  const batchMutation = useMutation({
    mutationFn: (data: Omit<Terminal, "id" | "isReturned" | "returnDate" | "returnReason">[]) => {
      return addTerminals(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['terminals'] });
      setBatchData([]);
      setIsBatchProcessing(false);
      toast({
        title: 'Terminals Added',
        description: `Successfully added ${data.length} terminals.`,
      });
    },
    onError: (error) => {
      setIsBatchProcessing(false);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to add terminals: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  });
  
  const onSubmit = (values: FormValues) => {
    singleMutation.mutate(values);
  };
  
  const handleBatchUpload = (data: Omit<Terminal, "id" | "isReturned" | "returnDate" | "returnReason">[]) => {
    setBatchData(data);
  };
  
  const processBatchUpload = () => {
    if (batchData.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Data',
        description: 'Please upload an Excel file with terminal data first.',
      });
      return;
    }
    
    setIsBatchProcessing(true);
    batchMutation.mutate(batchData);
  };

  return (
    <div className="container max-w-4xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Dispatched Terminals</CardTitle>
          <CardDescription className="text-center">
            Dispatch POS Terminals to different Business Units
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="single" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Entry</TabsTrigger>
              <TabsTrigger value="batch">Batch Upload</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="single">
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Merchant Name (25)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., OK Supermarket" {...field} maxLength={25} />
                          </FormControl>
                          <FormDescription>e.g., OK Supermarket</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="terminalId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Terminal ID (8)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., NBSP0998" {...field} maxLength={8} />
                          </FormControl>
                          <FormDescription>e.g., NBSP0998</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="serialNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serial Number (11)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 00052023987" {...field} maxLength={11} />
                          </FormControl>
                          <FormDescription>e.g., 00052023987</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lineSerialNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Line Serial Number (16-18)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 89263011909116734" {...field} maxLength={18} />
                          </FormControl>
                          <FormDescription>e.g., 89263011909116734</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Terminal Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="iPOS">iPOS</SelectItem>
                              <SelectItem value="Aisino A75">Aisino A75</SelectItem>
                              <SelectItem value="Verifone X990">Verifone X990</SelectItem>
                              <SelectItem value="PAX S20">PAX S20</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="branch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Branch</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a branch" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dispatchDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Dispatch Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date > new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="fedexTrackingNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>FedEx Tracking Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter tracking number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Terminal
                  </Button>
                </form>
              </Form>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="batch">
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Upload Excel File</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Upload an Excel file with terminal data to add multiple terminals at once. 
                  The file should have the following columns: name, terminal_id, serial_number, 
                  line_serial_number, type, branch, dispatch_date, and fedex_tracking_number (optional).
                </p>
                
                <ExcelUploader 
                  onDataExtracted={handleBatchUpload}
                  isProcessing={isBatchProcessing}
                />
              </div>
              
              {batchData.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Preview</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {batchData.length} terminals ready to be processed.
                  </p>
                  
                  <div className="border rounded-md p-4 bg-gray-50">
                    <div className="text-sm">
                      <strong>First Terminal:</strong> {batchData[0].name} ({batchData[0].terminalId})
                    </div>
                    {batchData.length > 1 && (
                      <div className="text-sm mt-1">
                        <strong>Last Terminal:</strong> {batchData[batchData.length-1].name} ({batchData[batchData.length-1].terminalId})
                      </div>
                    )}
                    <div className="text-sm mt-2">
                      <strong>Terminal Types:</strong> {[...new Set(batchData.map(t => t.type))].join(', ')}
                    </div>
                    <div className="text-sm mt-1">
                      <strong>Branches:</strong> {[...new Set(batchData.map(t => t.branch))].join(', ')}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={processBatchUpload} 
                disabled={batchData.length === 0 || isBatchProcessing}
                className="w-full"
              >
                {isBatchProcessing ? 'Processing...' : `Process ${batchData.length} Terminals`}
              </Button>
            </CardFooter>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
