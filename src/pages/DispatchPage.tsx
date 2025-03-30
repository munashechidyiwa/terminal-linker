
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Calendar } from 'lucide-react';
import { useTerminalStore, Branch, TerminalType } from '@/store/terminalStore';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  branch: z.string({ required_error: 'Branch is required' }).min(1),
  type: z.string({ required_error: 'Terminal type is required' }).min(1),
  name: z.string({ required_error: 'Terminal name is required' }).min(1),
  terminalId: z
    .string({ required_error: 'Terminal ID is required' })
    .min(1)
    .max(8)
    .regex(/^NBS/, { message: 'Terminal ID must start with "NBS"' }),
  serialNumber: z
    .string({ required_error: 'Serial number is required' })
    .min(6, { message: 'Serial number must be 6-8 characters' })
    .max(8, { message: 'Serial number must be 6-8 characters' }),
  lineSerialNumber: z
    .string({ required_error: 'Line serial number is required' })
    .max(18, { message: 'Line serial number must be maximum 18 digits' })
    .regex(/^\d+$/, { message: 'Line serial number must contain only digits' }),
  dispatchDate: z.date({ required_error: 'Dispatch date is required' }),
  fedexTrackingNumber: z.string().optional(),
});

const DispatchPage = () => {
  const { addTerminal } = useTerminalStore();
  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [formData, setFormData] = useState<z.infer<typeof formSchema> | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      branch: '',
      type: '',
      name: '',
      terminalId: 'NBS',
      serialNumber: '',
      lineSerialNumber: '',
      fedexTrackingNumber: '',
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setFormData(data);
    setOpenConfirmation(true);
  };

  const handleConfirm = () => {
    if (formData) {
      addTerminal({
        ...formData,
        dispatchDate: formData.dispatchDate.toISOString(),
      });
      
      toast({
        title: 'Terminal Dispatched',
        description: `${formData.name} has been successfully dispatched to ${formData.branch}`,
      });
      
      setOpenConfirmation(false);
      setFormData(null);
      form.reset();
      navigate('/dashboard');
    }
  };

  const branches: Branch[] = [
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
  ];

  const terminalTypes: TerminalType[] = [
    'iPOS', 
    'Aisini A75', 
    'Verifone X990', 
    'PAX S20'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-nbsGreen">Dispatch Terminal</h1>
          <p className="text-gray-600">Record a new terminal dispatch</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="nbs-input-focus">
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch} value={branch}>
                              {branch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="nbs-input-focus">
                            <SelectValue placeholder="Select terminal type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {terminalTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terminal Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter terminal name" {...field} className="nbs-input-focus" />
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
                      <FormLabel>Terminal ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="NBS12345" 
                          maxLength={8} 
                          {...field} 
                          className="nbs-input-focus" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terminal Serial Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter serial number" 
                          minLength={6}
                          maxLength={8}
                          {...field} 
                          className="nbs-input-focus" 
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
                      <FormLabel>Line Serial Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter line serial number" 
                          maxLength={18}
                          pattern="[0-9]*"
                          {...field} 
                          className="nbs-input-focus" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dispatchDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Dispatch</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal nbs-input-focus",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                            className="p-3 pointer-events-auto"
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
                        <Input 
                          placeholder="Enter tracking number" 
                          {...field} 
                          className="nbs-input-focus" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => form.reset()}
                >
                  Reset
                </Button>
                <Button 
                  type="submit" 
                  className="bg-nbsGreen hover:bg-nbsGreen-dark text-white"
                >
                  Dispatch Terminal
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={openConfirmation} onOpenChange={setOpenConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Terminal Dispatch</DialogTitle>
            <DialogDescription>
              Please review the terminal details before confirming.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Terminal Name</p>
              <p className="text-sm">{formData?.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Terminal ID</p>
              <p className="text-sm">{formData?.terminalId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Branch</p>
              <p className="text-sm">{formData?.branch}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Terminal Type</p>
              <p className="text-sm">{formData?.type}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Serial Number</p>
              <p className="text-sm">{formData?.serialNumber}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Line Serial Number</p>
              <p className="text-sm">{formData?.lineSerialNumber}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Dispatch Date</p>
              <p className="text-sm">{formData?.dispatchDate ? format(formData.dispatchDate, "PPP") : ''}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">FedEx Tracking</p>
              <p className="text-sm">{formData?.fedexTrackingNumber || 'N/A'}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenConfirmation(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              className="bg-nbsGreen hover:bg-nbsGreen-dark text-white"
            >
              Confirm Dispatch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DispatchPage;
