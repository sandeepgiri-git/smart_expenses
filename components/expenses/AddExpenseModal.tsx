'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { IGroupMember, IExpense } from '@/lib/types';

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  members: IGroupMember[];
  onAdded: (expense: IExpense) => void;
}

export function AddExpenseModal({ open, onClose, groupId, members, onAdded }: AddExpenseModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [participants, setParticipants] = useState<string[]>([]);
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setTitle(''); setAmount(''); setPaidBy(members[0]?.userId ?? '');
      setSplitType('equal');
      setParticipants(members.map((m) => m.userId));
      setCustomAmounts({});
      setError('');
    }
  }, [open, members]);

  const toggleParticipant = (userId: string) => {
    setParticipants((prev) =>
      prev.includes(userId) ? prev.filter((p) => p !== userId) : [...prev, userId]
    );
  };

  const customTotal = Object.values(customAmounts).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const amountNum = parseFloat(amount) || 0;
  const remaining = Math.round((amountNum - customTotal) * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) return setError('Title is required');
    if (!amountNum || amountNum <= 0) return setError('Enter a valid amount');
    if (!paidBy) return setError('Select who paid');
    if (participants.length === 0) return setError('Select at least one participant');

    if (splitType === 'custom') {
      if (Math.abs(remaining) > 0.01) {
        return setError(`Custom amounts must equal ₹${amountNum.toFixed(2)}. Remaining: ₹${remaining.toFixed(2)}`);
      }
    }

    const parsedCustom: Record<string, number> = {};
    if (splitType === 'custom') {
      for (const pid of participants) {
        parsedCustom[pid] = parseFloat(customAmounts[pid] ?? '0');
      }
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, amount: amountNum, paidBy, splitType, participants,
          ...(splitType === 'custom' && { customAmounts: parsedCustom }),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to add expense'); return; }
      onAdded(data.expense);
      toast.success('Expense added!');
      onClose();
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <Modal open={open} onClose={onClose} title="Add Expense" size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl px-4 py-2.5 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="expense-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dinner at Spice Garden"
              className={inputClass}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              id="expense-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Paid by <span className="text-red-500">*</span>
            </label>
            <select
              id="expense-paid-by"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className={inputClass}
            >
              <option value="">Select member</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Split type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Split Type</label>
          <div className="flex gap-2">
            {(['equal', 'custom'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSplitType(type)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold border cursor-pointer ${
                  splitType === type
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {type === 'equal' ? '⚖️ Equal' : '✏️ Custom'}
              </button>
            ))}
          </div>
        </div>

        {/* Participants */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Participants <span className="text-gray-400 font-normal">({participants.length} selected)</span>
          </label>
          <div className="space-y-2">
            {members.map((m) => {
              const isSelected = participants.includes(m.userId);
              const equalShare = participants.length > 0 ? amountNum / participants.length : 0;
              return (
                <div
                  key={m.userId}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${
                    isSelected
                      ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => toggleParticipant(m.userId)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleParticipant(m.userId)}
                    className="rounded accent-indigo-600"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">{m.name}</span>
                  {isSelected && splitType === 'equal' && amountNum > 0 && (
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      ₹{equalShare.toFixed(2)}
                    </span>
                  )}
                  {isSelected && splitType === 'custom' && (
                    <input
                      type="number"
                      value={customAmounts[m.userId] ?? ''}
                      onChange={(e) => setCustomAmounts((prev) => ({ ...prev, [m.userId]: e.target.value }))}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-24 px-2 py-1 text-xs rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {splitType === 'custom' && amountNum > 0 && (
            <div className={`mt-2 text-xs px-3 py-2 rounded-lg ${Math.abs(remaining) < 0.01 ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'}`}>
              {Math.abs(remaining) < 0.01
                ? '✓ Amounts balanced'
                : `Remaining to allocate: ₹${remaining.toFixed(2)}`}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Add Expense</Button>
        </div>
      </form>
    </Modal>
  );
}
