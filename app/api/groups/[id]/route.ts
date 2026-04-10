import connectDB from '@/lib/mongodb';
import Group from '@/lib/models/Group';
import Expense from '@/lib/models/Expense';
import Split from '@/lib/models/Split';
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
    return Response.json({ group });
  } catch (error) {
    console.error('[GET /api/groups/[id]]', error);
    return Response.json({ error: 'Failed to fetch group' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: 'Invalid group ID' }, { status: 400 });
    }
    const body = await request.json();
    const { name, description } = body as { name?: string; description?: string };

    const group = await Group.findByIdAndUpdate(
      id,
      { ...(name && { name: name.trim() }), ...(description !== undefined && { description: description.trim() }) },
      { new: true }
    ).lean();
    if (!group) return Response.json({ error: 'Group not found' }, { status: 404 });
    return Response.json({ group });
  } catch (error) {
    console.error('[PUT /api/groups/[id]]', error);
    return Response.json({ error: 'Failed to update group' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: 'Invalid group ID' }, { status: 400 });
    }
    await Group.findByIdAndDelete(id);
    await Expense.deleteMany({ groupId: id });
    await Split.deleteMany({ groupId: id });
    return Response.json({ message: 'Group deleted' });
  } catch (error) {
    console.error('[DELETE /api/groups/[id]]', error);
    return Response.json({ error: 'Failed to delete group' }, { status: 500 });
  }
}
