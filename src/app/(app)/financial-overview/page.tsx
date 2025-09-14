'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  IndianRupee,
  Plus,
  TrendingUp,
  TrendingDown,
  CirclePlus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { ExpenseChart } from '@/components/expense-chart';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { Transaction } from '@/lib/types';
import { AddTransactionForm } from '@/components/add-transaction-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const initialTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024-05-01',
    type: 'expense',
    category: 'seeds',
    description: 'Wheat seeds for 5 acres',
    amount: 12000,
  },
  {
    id: '2',
    date: '2024-05-15',
    type: 'expense',
    category: 'fertilizer',
    description: 'NPK Fertilizer',
    amount: 7500,
  },
  {
    id: '3',
    date: '2024-06-10',
    type: 'expense',
    category: 'labor',
    description: 'Sowing labor',
    amount: 8000,
  },
  {
    id: '4',
    date: '2024-09-20',
    type: 'income',
    category: 'sales',
    description: 'Sale of Wheat - 50 quintals',
    amount: 110000,
  },
  {
    id: '5',
    date: '2024-09-25',
    type: 'expense',
    category: 'transport',
    description: 'Transport to market',
    amount: 3500,
  },
];

export default function FinancialOverviewPage() {
  const { t } = useLanguage();
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const calculations = transactions.reduce(
    (acc, t) => {
      if (t.type === 'income') {
        acc.totalRevenue += t.amount;
      } else {
        acc.totalExpenses += t.amount;
        acc.expenseByCategory[t.category] =
          (acc.expenseByCategory[t.category] || 0) + t.amount;
      }
      return acc;
    },
    {
      totalRevenue: 0,
      totalExpenses: 0,
      expenseByCategory: {} as Record<string, number>,
    }
  );

  const netProfit = calculations.totalRevenue - calculations.totalExpenses;
  const profitMargin =
    calculations.totalRevenue > 0
      ? (netProfit / calculations.totalRevenue) * 100
      : 0;

  const expenseChartData = Object.entries(
    calculations.expenseByCategory
  ).map(([name, value]) => ({ name, value, label: t(`expenseCategories.${name}`) }));

  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [
      ...prev,
      { ...newTransaction, id: crypto.randomUUID() },
    ]);
    setIsFormOpen(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          {t('financialOverviewPage.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('financialOverviewPage.description')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t('financialOverviewPage.totalRevenue')}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/50">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-3xl font-bold flex items-center">
              <IndianRupee className="h-7 w-7" />
              {calculations.totalRevenue.toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('financialOverviewPage.totalExpenses')}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/50">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-3xl font-bold flex items-center">
              <IndianRupee className="h-7 w-7" />
              {calculations.totalExpenses.toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>
        <Card
          className={
            netProfit >= 0
              ? 'bg-primary/10 border-primary/30'
              : 'bg-destructive/10 border-destructive/30'
          }
        >
          <CardHeader>
            <CardTitle>{t('financialOverviewPage.netProfit')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`flex items-center text-3xl font-bold ${
                netProfit >= 0 ? 'text-primary' : 'text-destructive'
              }`}
            >
              <IndianRupee className="h-7 w-7" />
              {netProfit.toLocaleString('en-IN')}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {t('financialOverviewPage.profitMargin')}: {profitMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>{t('financialOverviewPage.transactionHistory')}</CardTitle>
                <CardDescription>
                  {t('financialOverviewPage.transactionHistoryDescription')}
                </CardDescription>
              </div>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('financialOverviewPage.addTransaction')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('financialOverviewPage.addTransaction')}</DialogTitle>
                  </DialogHeader>
                  <AddTransactionForm onSubmit={handleAddTransaction} />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('financialOverviewPage.dateHeader')}</TableHead>
                    <TableHead>{t('financialOverviewPage.descriptionHeader')}</TableHead>
                    <TableHead>{t('financialOverviewPage.categoryHeader')}</TableHead>
                    <TableHead className="text-right">
                      {t('financialOverviewPage.amountHeader')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(t.date), 'dd MMM, yyyy')}
                        </TableCell>
                        <TableCell className="font-medium">{t.description}</TableCell>
                        <TableCell>
                           <Badge
                            variant={
                              t.type === 'income' ? 'default' : 'secondary'
                            }
                            className={
                                t.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : ''
                            }
                          >
                            {t(`expenseCategories.${t.category}`)}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono font-semibold flex items-center justify-end gap-1 ${
                            t.type === 'income'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                           {t.type === 'income' ? (
                                <ArrowUpRight className="h-4 w-4" />
                            ) : (
                                <ArrowDownRight className="h-4 w-4" />
                            )}
                          <IndianRupee className="h-4 w-4" />
                          {t.amount.toLocaleString('en-IN')}
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{t('financialOverviewPage.expenseBreakdown')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseChart data={expenseChartData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
