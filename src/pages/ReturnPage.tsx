
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTerminals, markTerminalAsReturned } from '@/services/terminalService';
import { Terminal } from '@/store/terminalStore';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  terminalId: z.string({ required_error: "Please select a terminal" }),
  returnReason: z.string().min(3, { message: "Return reason must be at least 3 characters" }).max(255, { message: "Return reason must be less than 255 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ReturnPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: terminals = [], isLoading, error } = useQuery({
    queryKey: ['terminals'],
    queryFn: fetchTerminals,
  });
  
  const activeTerminals = terminals.filter(terminal => !terminal.isReturned);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      terminalId: '',
      returnReason: '',
    },
  });
  
  const returnMutation = useMutation({
    mutationFn: ({ terminalId, returnReason }: FormValues) => {
      return markTerminalAsReturned(terminalId, returnReason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terminals'] });
      form.reset();
      setIsSubmitting(false);
      toast({
        title: 'Terminal Returned',
        description: 'The terminal has been marked as returned successfully.',
      });
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to return terminal: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    },
  });
  
  function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    returnMutation.mutate(values);
  }
  
  if (error) {
    return (
      <div className="container max-w-4xl py-12">
        <Card className="bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-500">Error loading terminals: {error instanceof Error ? error.message : 'Unknown error'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Returned Terminals</CardTitle>
          <CardDescription className="text-center">Process returned terminals easily</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="terminalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Terminal</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a terminal to mark as returned" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading terminals...
                          </SelectItem>
                        ) : activeTerminals.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No active terminals to return
                          </SelectItem>
                        ) : (
                          activeTerminals.map((terminal) => (
                            <SelectItem key={terminal.id} value={terminal.id}>
                              {terminal.name} - {terminal.terminalId}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="returnReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return Reason</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please provide a reason for returning this terminal" 
                        {...field} 
                        className="resize-none" 
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || isLoading || activeTerminals.length === 0}
              >
                {isSubmitting ? "Processing..." : "Mark as Returned"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
