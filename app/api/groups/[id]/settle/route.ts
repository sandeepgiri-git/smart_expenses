import connectDB from '@/lib/mongodb';
import Split from '@/lib/models/Split';
import mongoose from 'mongoose';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: 'Invalid group ID' }, { status: 400 });
    }

    const body = await request.json();
    const { fromUserId, toUserId } = body as { fromUserId: string; toUserId: string };

    if (!fromUserId || !toUserId) {
      return Response.json({ error: 'fromUserId and toUserId are required' }, { status: 400 });
    }

    const result = await Split.updateMany(
      { groupId: id, owedBy: fromUserId, owedTo: toUserId, settled: false },
      { settled: true }
    );

    return Response.json({ settledCount: result.modifiedCount });
  } catch (error) {
    console.error('[POST /api/groups/[id]/settle]', error);
    return Response.json({ error: 'Failed to settle debts' }, { status: 500 });
  }
}
