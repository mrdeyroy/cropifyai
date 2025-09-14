'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/use-language';
import type { Transaction, ExpenseCategory } from '@/lib/types';
import { ExpenseCategorySchema } from '@/lib/types';

const formSchema = z.object({
  type: z.enum(['income', 'expense']),
  date: z.date({
    required_error: 'A date is required.',
  }),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
  description: z.string().min(2, 'Description is too short.'),
  category: z.string().min(1, 'Category is required.'),
});

type AddTransactionFormProps = {
  onSubmit: (data: Omit<Transaction, 'id'>) => void;
};

const expenseCategories = ExpenseCategorySchema.options;

export function AddTransactionForm({ onSubmit }: AddTransactionFormProps) {
  const { t } = useLanguage();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'expense',
      date: new Date(),
      amount: 0,
      description: '',
      category: '',
    },
  });

  const transactionType = form.watch('type');

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    onSubmit({
        ...values,
        date: format(values.date, 'yyyy-MM-dd'),
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t('addTransactionForm.typeLabel')}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="income" />
                    </FormControl>
                    <FormLabel className="font-normal">{t('addTransactionForm.incomeLabel')}</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="expense" />
                    </FormControl>
                    <FormLabel className="font-normal">{t('addTransactionForm.expenseLabel')}</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>{t('addTransactionForm.dateLabel')}</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={'outline'}
                        className={cn(
                            'pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                        )}
                        >
                        {field.value ? (
                            format(field.value, 'PPP')
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
                            date > new Date() || date < new Date('1900-01-01')
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
            name="category"
            render={({ field }) => (
                <FormItem>
                <FormLabel>{t('addTransactionForm.categoryLabel')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder={t('addTransactionForm.categoryPlaceholder')} />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {transactionType === 'income' ? (
                        <SelectItem value="sales">{t('expenseCategories.sales')}</SelectItem>
                    ) : (
                        expenseCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                            {t(`expenseCategories.${cat}`)}
                        </SelectItem>
                        ))
                    )}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>


        <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('addTransactionForm.descriptionLabel')}</FormLabel>
                    <FormControl>
                        <Input placeholder={t('addTransactionForm.descriptionPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        
        <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{t('addTransactionForm.amountLabel')}</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="number" {...field} className="pl-8" />
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />


        <Button type="submit" className="w-full">
          {t('addTransactionForm.addButton')}
        </Button>
      </form>
    </Form>
  );
}
