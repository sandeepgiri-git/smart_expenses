import type { ISettlement, INetBalance } from './types';

interface RawSplit {
  owedBy: string;
  owedTo: string;
  amount: number;
  settled: boolean;
  owedByName?: string;
  owedToName?: string;
}

export function calculateNetBalances(splits: RawSplit[], memberMap: Map<string, string>): INetBalance[] {
  // net[userId] = positive means others owe them, negative means they owe others
  const net = new Map<string, number>();

  for (const split of splits) {
    if (split.settled) continue;

    const prevOwedTo = net.get(split.owedTo) ?? 0;
    const prevOwedBy = net.get(split.owedBy) ?? 0;

    net.set(split.owedTo, prevOwedTo + split.amount);
    net.set(split.owedBy, prevOwedBy - split.amount);
  }

  const balances: INetBalance[] = [];
  for (const [userId, netAmount] of net.entries()) {
    if (Math.abs(netAmount) < 0.01) continue; // Skip near-zero balances
    balances.push({
      userId,
      name: memberMap.get(userId) ?? 'Unknown',
      netAmount: Math.round(netAmount * 100) / 100,
    });
  }

  return balances.sort((a, b) => b.netAmount - a.netAmount);
}

/**
 * Greedy debt minimization algorithm.
 * Reduces the number of transactions needed to settle all debts.
 */
export function minimizeTransactions(
  netBalances: INetBalance[]
): ISettlement[] {
  const creditors = netBalances.filter((b) => b.netAmount > 0).map((b) => ({ ...b }));
  const debtors = netBalances.filter((b) => b.netAmount < 0).map((b) => ({ ...b, netAmount: Math.abs(b.netAmount) }));

  const settlements: ISettlement[] = [];

  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];

    const amount = Math.min(creditor.netAmount, debtor.netAmount);
    const rounded = Math.round(amount * 100) / 100;

    if (rounded > 0.01) {
      settlements.push({
        from: debtor.userId,
        fromName: debtor.name,
        to: creditor.userId,
        toName: creditor.name,
        amount: rounded,
      });
    }

    creditor.netAmount -= amount;
    debtor.netAmount -= amount;

    if (creditor.netAmount < 0.01) ci++;
    if (debtor.netAmount < 0.01) di++;
  }

  return settlements;
}
