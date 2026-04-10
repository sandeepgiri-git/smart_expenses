'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { ISettlement } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

interface SettlementListProps {
  settlements: ISettlement[];
  groupId: string;
  onSettled: () => void;
  loading: boolean;
}

export function SettlementList({ settlements, groupId, onSettled, loading }: SettlementListProps) {
  const [settling, setSettling] = useState<string | null>(null);

  const handleSettle = async (s: ISettlement) => {
    const key = `${s.from}-${s.to}`;
    setSettling(key);
    try {
      const res = await fetch(`/api/groups/${groupId}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId: s.from, toUserId: s.to }),
      });
      if (res.ok) {
        toast.success(`Settled: ${s.fromName} → ${s.toName}`);
        onSettled();
      } else {
        toast.error('Failed to settle');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSettling(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (settlements.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="All settled up!"
        description="No payments needed."
      />
    );
  }

  return (
    <div className="space-y-3">
      {settlements.map((s) => {
        const key = `${s.from}-${s.to}`;
        return (
          <div
            key={key}
            className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
              <span className="text-sm font-semibold text-red-500">{s.fromName}</span>
              <ArrowRight size={14} className="text-gray-400 shrink-0" />
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{s.toName}</span>
              <span className="text-sm font-bold text-gray-800 dark:text-white ml-1">₹{s.amount.toFixed(2)}</span>
            </div>
            <Button
              variant="primary"
              size="sm"
              loading={settling === key}
              onClick={() => handleSettle(s)}
              className="shrink-0"
            >
              Settle
            </Button>
          </div>
        );
      })}
    </div>
  );
}
