import connectDB from '@/lib/mongodb';
import Expense from '@/lib/models/Expense';
import Split from '@/lib/models/Split';
import mongoose from 'mongoose';

type Params = { params: Promise<{ id: string; expenseId: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await connectDB();
    const { id, expenseId } = await params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(expenseId)) {
      return Response.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const expense = await Expense.findOneAndDelete({ _id: expenseId, groupId: id });
    if (!expense) return Response.json({ error: 'Expense not found' }, { status: 404 });

    await Split.deleteMany({ expenseId });

    return Response.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('[DELETE /api/groups/[id]/expenses/[expenseId]]', error);
    return Response.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
