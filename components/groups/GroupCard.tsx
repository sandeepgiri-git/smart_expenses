'use client';

import Link from 'next/link';
import { Users, Trash2, ArrowRight } from 'lucide-react';
import type { IGroup } from '@/lib/types';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface GroupCardProps {
  group: IGroup;
  totalExpenses?: number;
  onDelete: (id: string) => void;
}

export function GroupCard({ group, totalExpenses = 0, onDelete }: GroupCardProps) {
  return (
    <Card hoverable className="flex flex-col">
      <CardBody className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
            {group.name.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); onDelete(group._id); }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer"
            aria-label="Delete group"
          >
            <Trash2 size={15} />
          </button>
        </div>

        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">{group.name}</h3>
          {group.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{group.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <Users size={14} />
            {group.members.length} member{group.members.length !== 1 ? 's' : ''}
          </span>
          <span className="text-xs">
            {totalExpenses} expense{totalExpenses !== 1 ? 's' : ''}
          </span>
        </div>

        <Link href={`/groups/${group._id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full justify-between">
            View Group <ArrowRight size={14} />
          </Button>
        </Link>
      </CardBody>
    </Card>
  );
}
