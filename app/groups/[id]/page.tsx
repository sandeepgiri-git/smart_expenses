'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, UserPlus, Users, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import type { IGroup, IExpense, INetBalance, ISettlement, IGroupMember } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { AddMemberModal } from '@/components/groups/AddMemberModal';
import { AddExpenseModal } from '@/components/expenses/AddExpenseModal';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { BalanceTable } from '@/components/balances/BalanceTable';
import { SettlementList } from '@/components/balances/SettlementList';
import { FullPageSpinner } from '@/components/ui/Spinner';

type Tab = 'expenses' | 'balances' | 'members';

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [group, setGroup] = useState<IGroup | null>(null);
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [netBalances, setNetBalances] = useState<INetBalance[]>([]);
  const [settlements, setSettlements] = useState<ISettlement[]>([]);
  const [tab, setTab] = useState<Tab>('expenses');

  const [loadingGroup, setLoadingGroup] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [loadingBalances, setLoadingBalances] = useState(true);

  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const fetchGroup = useCallback(async () => {
    try {
      const res = await fetch(`/api/groups/${id}`);
      if (!res.ok) { router.push('/'); return; }
      const data = await res.json();
      setGroup(data.group);
    } catch {
      toast.error('Failed to load group');
    } finally {
      setLoadingGroup(false);
    }
  }, [id, router]);

  const fetchExpenses = useCallback(async () => {
    setLoadingExpenses(true);
    try {
      const res = await fetch(`/api/groups/${id}/expenses`);
      const data = await res.json();
      setExpenses(data.expenses ?? []);
    } catch {
      toast.error('Failed to load expenses');
    } finally {
      setLoadingExpenses(false);
    }
  }, [id]);

  const fetchBalances = useCallback(async () => {
    setLoadingBalances(true);
    try {
      const res = await fetch(`/api/groups/${id}/balances`);
      const data = await res.json();
      setNetBalances(data.netBalances ?? []);
      setSettlements(data.settlements ?? []);
    } catch {
      toast.error('Failed to load balances');
    } finally {
      setLoadingBalances(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGroup();
    fetchExpenses();
    fetchBalances();
  }, [fetchGroup, fetchExpenses, fetchBalances]);

  const handleDeleteMember = async (userId: string) => {
    if (!confirm('Remove this member?')) return;
    try {
      const res = await fetch(`/api/groups/${id}/members?userId=${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) { setGroup(data.group); toast.success('Member removed'); }
      else toast.error(data.error ?? 'Failed to remove member');
    } catch {
      toast.error('Something went wrong');
    }
  };

  const refreshAll = () => { fetchExpenses(); fetchBalances(); };

  if (loadingGroup) return <FullPageSpinner />;
  if (!group) return null;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'expenses', label: 'Expenses', count: expenses.length },
    { key: 'balances', label: 'Balances', count: netBalances.length },
    { key: 'members', label: 'Members', count: group.members.length },
  ];

  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeft size={15} />
          All Groups
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-2xl shrink-0">
              {group.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{group.name}</h1>
              {group.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{group.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              id="add-member-btn"
              variant="outline"
              size="sm"
              onClick={() => setShowAddMember(true)}
            >
              <UserPlus size={14} />
              Add Member
            </Button>
            <Button
              id="add-expense-btn"
              size="sm"
              onClick={() => setShowAddExpense(true)}
              disabled={group.members.length === 0}
            >
              <Plus size={14} />
              Add Expense
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Spent', value: `₹${totalSpend.toFixed(2)}`, color: 'text-indigo-600 dark:text-indigo-400' },
          { label: 'Expenses', value: expenses.length, color: 'text-gray-900 dark:text-white' },
          { label: 'Members', value: group.members.length, color: 'text-gray-900 dark:text-white' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-center">
            <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl">
        {tabs.map((t) => (
          <button
            key={t.key}
            id={`tab-${t.key}`}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-semibold cursor-pointer ${
              tab === t.key
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                tab === t.key ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'expenses' && (
        <Card>
          <CardHeader>
            <h2 className="font-bold text-gray-900 dark:text-white">Expenses</h2>
          </CardHeader>
          <CardBody>
            <ExpenseList
              expenses={expenses}
              members={group.members}
              groupId={id}
              loading={loadingExpenses}
              onDeleted={(expId) => {
                setExpenses((prev) => prev.filter((e) => e._id !== expId));
                fetchBalances();
              }}
            />
          </CardBody>
        </Card>
      )}

      {tab === 'balances' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader>
              <h2 className="font-bold text-gray-900 dark:text-white">Net Balances</h2>
            </CardHeader>
            <CardBody>
              <BalanceTable balances={netBalances} loading={loadingBalances} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900 dark:text-white">Settle Up</h2>
              </div>
            </CardHeader>
            <CardBody>
              <SettlementList
                settlements={settlements}
                groupId={id}
                loading={loadingBalances}
                onSettled={refreshAll}
              />
            </CardBody>
          </Card>
        </div>
      )}

      {tab === 'members' && (
        <Card>
          <CardHeader>
            <h2 className="font-bold text-gray-900 dark:text-white">Members</h2>
          </CardHeader>
          <CardBody className="p-0">
            {group.members.length === 0 ? (
              <div className="px-6 py-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center mb-3">
                    <Users size={22} className="text-indigo-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No members yet</p>
                  <p className="text-xs text-gray-400 mt-1">Add members to start splitting expenses.</p>
                  <Button size="sm" className="mt-4" onClick={() => setShowAddMember(true)}>
                    <UserPlus size={14} /> Add Member
                  </Button>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {group.members.map((m: IGroupMember) => (
                  <li key={m.userId} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{m.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{m.email}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteMember(m.userId)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer"
                      aria-label="Remove member"
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      )}

      {/* Modals */}
      <AddMemberModal
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        groupId={id}
        onAdded={(updated) => setGroup(updated)}
      />
      <AddExpenseModal
        open={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        groupId={id}
        members={group.members}
        onAdded={(expense) => {
          setExpenses((prev) => [expense, ...prev]);
          fetchBalances();
          toast.success('Expense added!');
        }}
      />
    </div>
  );
}
