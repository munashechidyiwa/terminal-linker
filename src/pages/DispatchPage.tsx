import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, Info, PlusCircle, Upload } from 'lucide-react';
import { Branch, Terminal, TerminalType } from '@/store/terminalStore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { addTerminal, addTerminals } from '@/services/terminalService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExcelUploader } from '@/components/ExcelUploader';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Merchant name must be at least 2 characters.",
  }).max(25, {
    message: "Merchant name cannot exceed 25 characters."
  }),
  terminalId: z.string().min(5, {
    message: "Terminal ID must be at least 5 characters.",
  }).max(8, {
    message: "Terminal ID cannot exceed 8 characters."
  }),
  serialNumber: z.string().min(5, {
    message: "Serial number must be at least 5 characters.",
  }).max(11, {
    message: "Serial number cannot exceed 11 characters."
  }),
  lineSerialNumber: z.string().min(5, {
    message: "Line Serial number must be at least 5 characters.",
  }).min(16, {
    message: "Line Serial number must be at least 16 characters."
  }).max(18, {
    message: "Line Serial number cannot exceed 18 characters."
  }),
  type: z.enum(['iPOS', 'Aisini A75', 'Verifone X990', 'PAX S20'], {
    required_error: "Please select a terminal type.",
  }),
  branch: z.enum([
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
  ], {
    required_error: "Please select a branch.",
  }),
  dispatchDate: z.date({
    required_error: "Please select a dispatch date.",
  }),
  fedexTrackingNumber: z.string().optional(),
});

const DispatchPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [excelData, setExcelData] = useState<Omit<Terminal, "id" | "isReturned" | "returnDate" | "returnReason">[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      terminalId: "",
      serialNumber: "",
      lineSerialNumber: "",
      type: undefined,
      branch: undefined,
      dispatchDate: new Date(),
      fedexTrackingNumber: "",
    },
  });
  
  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Make sure all required fields are present
      const terminalData = {
        name: formData.name,
        terminalId: formData.terminalId,
        serialNumber: formData.serialNumber,
        lineSerialNumber: formData.lineSerialNumber,
        type: formData.type as TerminalType,
        branch: formData.branch as Branch,
        dispatchDate: formData.dispatchDate.toISOString(),
        fedexTrackingNumber: formData.fedexTrackingNumber,
      };
      
      await addTerminal(terminalData);
      
      toast({
        title: "Terminal Dispatched",
        description: `Terminal ${formData.name} has been successfully dispatched.`,
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Failed to dispatch terminal",
        description: "An error occurred while dispatching the terminal. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExcelDataExtracted = (data: Omit<Terminal, "id" | "isReturned" | "returnDate" | "returnReason">[]) => {
    setExcelData(data);
  };

  const handleBatchUpload = async () => {
    if (excelData.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "Please upload an Excel file first",
      });
      return;
    }

    setIsBatchUploading(true);
    try {
      await addTerminals(excelData);
      toast({
        title: "Batch Upload Complete",
        description: `Successfully added ${excelData.length} terminal(s).`,
      });
      navigate('/dashboard');
    } catch (error) {
      console.error("Error in batch upload:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "An error occurred during batch upload. Please try again.",
      });
    } finally {
      setIsBatchUploading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nbsGreen">Dispatched Terminals</h1>
          <p className="text-gray-600">Dispatch a new POS terminal to a business unit</p>
        </div>
        <Button asChild variant="outline">
          <a href="/dashboard">
            Back to Dashboard
          </a>
        </Button>
      </div>

      <Tabs defaultValue="single">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="single">Single Terminal</TabsTrigger>
          <TabsTrigger value="batch">Batch Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>Terminal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Merchant Name (25)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., OK Supermarket" 
                              {...field} 
                              className="nbs-input-focus"
                              maxLength={25}
                            />
                          </FormControl>
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
                            <Input 
                              placeholder="e.g., NBSP0998" 
                              {...field} 
                              className="nbs-input-focus"
                              maxLength={8}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="serialNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serial Number (11)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 00052023987" 
                              {...field} 
                              className="nbs-input-focus"
                              maxLength={11}
                            />
                          </FormControl>
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
                            <Input 
                              placeholder="e.g., 89263011909116734" 
                              {...field} 
                              className="nbs-input-focus"
                              maxLength={18}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Terminal Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="nbs-input-focus">
                                <SelectValue placeholder="Select a type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="iPOS">iPOS</SelectItem>
                              <SelectItem value="Aisini A75">Aisini A75</SelectItem>
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
                              <SelectTrigger className="nbs-input-focus">
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
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    "w-[240px] pl-3 text-left font-normal nbs-input-focus",
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
                                disabled={(date) =>
                                  date > new Date()
                                }
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
                          <FormLabel>
                            FedEx Tracking Number
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" className="ml-2 h-4 w-4 p-0">
                                  <Info className="h-4 w-4 text-gray-500" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80">
                                <p className="text-sm text-muted-foreground">
                                  Optional. Add the FedEx tracking number if available.
                                </p>
                              </PopoverContent>
                            </Popover>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 123456789012" 
                              {...field} 
                              className="nbs-input-focus"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="bg-nbsGreen hover:bg-nbsGreen-dark w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <PlusCircle className="mr-2 h-4 w-4 animate-spin" />
                        Dispatching...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Dispatch Terminal
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle>Batch Terminal Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ExcelUploader 
                onDataExtracted={handleExcelDataExtracted}
                isProcessing={isBatchUploading}
              />
              
              {excelData.length > 0 && (
                <div className="space-y-4">
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">{excelData.length} Terminal{excelData.length !== 1 ? 's' : ''} Ready to Upload</h3>
                      <p className="text-sm text-gray-500">Review the data before uploading</p>
                    </div>
                    <Button 
                      className="bg-nbsGreen hover:bg-nbsGreen-dark"
                      onClick={handleBatchUpload}
                      disabled={isBatchUploading}
                    >
                      {isBatchUploading ? (
                        <>
                          <Upload className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Terminals
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terminal ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {excelData.slice(0, 5).map((terminal, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{terminal.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{terminal.terminalId}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{terminal.serialNumber}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{terminal.type}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{terminal.branch}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {excelData.length > 5 && (
                      <div className="px-6 py-3 bg-gray-50 text-center text-sm text-gray-500">
                        ... and {excelData.length - 5} more terminal{excelData.length - 5 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DispatchPage;
