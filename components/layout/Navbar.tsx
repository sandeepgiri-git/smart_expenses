'use client';

import Link from 'next/link';
import { SplitSquareHorizontal, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

export function Navbar() {
  const { isDark, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <SplitSquareHorizontal size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            Split<span className="text-indigo-500">Wise</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            id="theme-toggle"
            onClick={toggle}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
