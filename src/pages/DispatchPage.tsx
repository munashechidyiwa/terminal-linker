
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, Info, PlusCircle } from 'lucide-react';
import { Branch, TerminalType } from '@/store/terminalStore';
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
import { addTerminal } from '@/services/terminalService';

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
      
      <Card>
        <CardHeader>
          <CardTitle>Terminal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Merchant Name */}
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
                
                {/* Terminal ID */}
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
                {/* Serial Number */}
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

                 {/* Line Serial Number */}
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
                {/* Terminal Type */}
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
                
                {/* Branch */}
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
                {/* Dispatch Date */}
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
                
                {/* FedEx Tracking Number */}
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
    </div>
  );
};

export default DispatchPage;
