import type { ExpenseCategory } from './types';

const categoryKeywords: Record<ExpenseCategory, string[]> = {
  food: ['food', 'lunch', 'dinner', 'breakfast', 'restaurant', 'pizza', 'burger', 'meal', 'snack', 'coffee', 'cafe', 'eat', 'drink', 'grocery', 'groceries', 'biryani', 'chai'],
  travel: ['travel', 'taxi', 'uber', 'ola', 'cab', 'flight', 'train', 'bus', 'petrol', 'fuel', 'toll', 'trip', 'hotel', 'airbnb', 'ticket'],
  rent: ['rent', 'house', 'apartment', 'flat', 'room', 'pg', 'deposit', 'lease', 'accommodation'],
  utilities: ['electricity', 'water', 'gas', 'wifi', 'internet', 'bill', 'maintenance', 'utility', 'phone', 'mobile', 'recharge'],
  entertainment: ['movie', 'cinema', 'concert', 'show', 'game', 'sport', 'netflix', 'spotify', 'subscription', 'party', 'club', 'bar', 'beer', 'outing'],
  shopping: ['shopping', 'clothes', 'shoes', 'amazon', 'flipkart', 'market', 'mall', 'purchase', 'buy', 'order'],
  health: ['doctor', 'medicine', 'pharmacy', 'hospital', 'gym', 'health', 'medical', 'dental', 'clinic', 'fitness'],
  other: [],
};

export function categorizeExpense(title: string): ExpenseCategory {
  const lowerTitle = title.toLowerCase();

  for (const [category, keywords] of Object.entries(categoryKeywords) as [ExpenseCategory, string[]][]) {
    if (category === 'other') continue;
    for (const keyword of keywords) {
      if (lowerTitle.includes(keyword)) {
        return category;
      }
    }
  }

  return 'other';
}

export const categoryColors: Record<ExpenseCategory, string> = {
  food: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  travel: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  rent: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  utilities: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  entertainment: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  shopping: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  health: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export const categoryEmojis: Record<ExpenseCategory, string> = {
  food: '🍔',
  travel: '✈️',
  rent: '🏠',
  utilities: '⚡',
  entertainment: '🎬',
  shopping: '🛍️',
  health: '💊',
  other: '📌',
};
