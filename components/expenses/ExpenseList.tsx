'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { IExpense, IGroupMember } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { SkeletonRow } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { categoryColors, categoryEmojis } from '@/lib/expenseCategories';
import { Receipt } from 'lucide-react';

interface ExpenseListProps {
  expenses: IExpense[];
  members: IGroupMember[];
  groupId: string;
  loading: boolean;
  onDeleted: (id: string) => void;
}

export function ExpenseList({ expenses, members, groupId, loading, onDeleted }: ExpenseListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getMemberName = (userId: string) =>
    members.find((m) => m.userId === userId)?.name ?? 'Unknown';

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Delete this expense?')) return;
    setDeletingId(expenseId);
    try {
      const res = await fetch(`/api/groups/${groupId}/expenses/${expenseId}`, { method: 'DELETE' });
      if (res.ok) {
        onDeleted(expenseId);
        toast.success('Expense deleted');
      } else {
        toast.error('Failed to delete expense');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div>
        {Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No expenses yet"
        description="Add your first expense to start tracking shared costs."
      />
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {expenses.map((expense) => (
        <div key={expense._id} className="flex items-center gap-4 py-4">
          <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xl shrink-0">
            {categoryEmojis[expense.category]}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{expense.title}</p>
            <div className="flex items-center flex-wrap gap-1.5 mt-0.5">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Paid by <span className="font-medium text-gray-700 dark:text-gray-300">{getMemberName(expense.paidBy)}</span>
              </span>
              <span className="text-gray-300 dark:text-gray-700">·</span>
              <Badge className={categoryColors[expense.category]}>
                {expense.category}
              </Badge>
              <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                {expense.splitType}
              </Badge>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="font-bold text-gray-900 dark:text-white">₹{expense.amount.toFixed(2)}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(expense.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
          </div>

          <button
            onClick={() => handleDelete(expense._id)}
            disabled={deletingId === expense._id}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer disabled:opacity-40 shrink-0"
            aria-label="Delete expense"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
