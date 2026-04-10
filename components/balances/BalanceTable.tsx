'use client';

import type { INetBalance } from '@/lib/types';
import { SkeletonRow } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Scale } from 'lucide-react';

interface BalanceTableProps {
  balances: INetBalance[];
  loading: boolean;
}

export function BalanceTable({ balances, loading }: BalanceTableProps) {
  if (loading) {
    return <div>{Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}</div>;
  }

  if (balances.length === 0) {
    return (
      <EmptyState
        icon={Scale}
        title="All settled up!"
        description="No outstanding balances in this group."
      />
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {balances.map((b) => {
        const isPositive = b.netAmount > 0;
        return (
          <div key={b.userId} className="flex items-center justify-between py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                {b.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{b.name}</span>
            </div>
            <div className={`text-sm font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {isPositive ? '+' : ''}₹{Math.abs(b.netAmount).toFixed(2)}
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                {isPositive ? 'gets back' : 'owes'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
