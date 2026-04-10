import connectDB from '@/lib/mongodb';
import Expense from '@/lib/models/Expense';
import Split from '@/lib/models/Split';
import Group from '@/lib/models/Group';
import { categorizeExpense } from '@/lib/expenseCategories';
import mongoose from 'mongoose';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: 'Invalid group ID' }, { status: 400 });
    }
    const expenses = await Expense.find({ groupId: id }).sort({ createdAt: -1 }).lean();
    return Response.json({ expenses });
  } catch (error) {
    console.error('[GET /api/groups/[id]/expenses]', error);
    return Response.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: 'Invalid group ID' }, { status: 400 });
    }

    const group = await Group.findById(id).lean();
    if (!group) return Response.json({ error: 'Group not found' }, { status: 404 });

    const body = await request.json();
    const { title, amount, paidBy, splitType, participants, customAmounts } = body as {
      title: string;
      amount: number;
      paidBy: string;
      splitType: 'equal' | 'custom';
      participants: string[];
      customAmounts?: Record<string, number>;
    };

    if (!title?.trim()) return Response.json({ error: 'Title is required' }, { status: 400 });
    if (!amount || amount <= 0) return Response.json({ error: 'Amount must be positive' }, { status: 400 });
    if (!paidBy) return Response.json({ error: 'paidBy is required' }, { status: 400 });
    if (!participants?.length) return Response.json({ error: 'At least one participant required' }, { status: 400 });

    if (splitType === 'custom' && customAmounts) {
      const total = Object.values(customAmounts).reduce((s, v) => s + v, 0);
      if (Math.abs(total - amount) > 0.01) {
        return Response.json({ error: `Custom amounts (${total}) must equal total amount (${amount})` }, { status: 400 });
      }
    }

    const category = categorizeExpense(title);

    const expense = await Expense.create({
      groupId: id,
      title: title.trim(),
      amount,
      category,
      paidBy,
      splitType,
      participants,
    });

    // Build split records
    const splits = [];
    for (const participantId of participants) {
      if (participantId === paidBy) continue; // payer doesn't owe themselves
      let share: number;
      if (splitType === 'equal') {
        share = amount / participants.length;
      } else {
        share = customAmounts?.[participantId] ?? 0;
      }
      if (share <= 0) continue;

      splits.push({
        expenseId: expense._id,
        groupId: id,
        owedBy: participantId,
        owedTo: paidBy,
        amount: Math.round(share * 100) / 100,
        settled: false,
      });
    }

    if (splits.length > 0) {
      await Split.insertMany(splits);
    }

    return Response.json({ expense }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/groups/[id]/expenses]', error);
    return Response.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
