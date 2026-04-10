'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Users, TrendingUp, Wallet } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { IGroup } from '@/lib/types';
import { GroupCard } from '@/components/groups/GroupCard';
import { CreateGroupModal } from '@/components/groups/CreateGroupModal';
import { Button } from '@/components/ui/Button';
import { SkeletonGrid } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/ui/EmptyState';

export default function DashboardPage() {
  const [groups, setGroups] = useState<IGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      setGroups(data.groups ?? []);
    } catch {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this group and all its expenses?')) return;
    try {
      const res = await fetch(`/api/groups/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGroups((prev) => prev.filter((g) => g._id !== id));
        toast.success('Group deleted');
      } else {
        toast.error('Failed to delete group');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const totalMembers = groups.reduce((s, g) => s + g.members.length, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Your Groups
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Manage shared expenses and settle up with your groups.
          </p>
        </div>
        <Button
          id="create-group-btn"
          onClick={() => setShowCreate(true)}
          size="md"
          className="self-start sm:self-auto"
        >
          <Plus size={16} />
          New Group
        </Button>
      </div>

      {/* Stats */}
      {!loading && groups.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: 'Total Groups',
              value: groups.length,
              icon: Users,
              color: 'text-indigo-500',
              bg: 'bg-indigo-50 dark:bg-indigo-900/20',
            },
            {
              label: 'Total Members',
              value: totalMembers,
              icon: TrendingUp,
              color: 'text-purple-500',
              bg: 'bg-purple-50 dark:bg-purple-900/20',
            },
            {
              label: 'Active Groups',
              value: groups.length,
              icon: Wallet,
              color: 'text-emerald-500',
              bg: 'bg-emerald-50 dark:bg-emerald-900/20',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 py-4 flex items-center gap-4"
            >
              <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Group Grid */}
      {loading ? (
        <SkeletonGrid count={3} />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No groups yet"
          description="Create your first group to start splitting expenses with friends, family, or teammates."
          action={
            <Button onClick={() => setShowCreate(true)} id="create-first-group-btn">
              <Plus size={16} />
              Create your first group
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group) => (
            <GroupCard
              key={group._id}
              group={group}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CreateGroupModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(group) => setGroups((prev) => [group, ...prev])}
      />
    </div>
  );
}
