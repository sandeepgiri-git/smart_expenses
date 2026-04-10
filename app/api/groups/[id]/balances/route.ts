import connectDB from '@/lib/mongodb';
import Split from '@/lib/models/Split';
import Group from '@/lib/models/Group';
import { calculateNetBalances, minimizeTransactions } from '@/lib/balanceCalculator';
import mongoose from 'mongoose';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: 'Invalid group ID' }, { status: 400 });
    }

    const group = await Group.findById(id).lean();
    if (!group) return Response.json({ error: 'Group not found' }, { status: 404 });

    const splits = await Split.find({ groupId: id }).lean();

    const memberMap = new Map<string, string>(
      group.members.map((m: { userId: string; name: string }) => [m.userId, m.name])
    );

    const netBalances = calculateNetBalances(splits, memberMap);
    const settlements = minimizeTransactions(netBalances);

    return Response.json({ netBalances, settlements });
  } catch (error) {
    console.error('[GET /api/groups/[id]/balances]', error);
    return Response.json({ error: 'Failed to calculate balances' }, { status: 500 });
  }
}
