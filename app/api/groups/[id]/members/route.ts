import connectDB from '@/lib/mongodb';
import Group, { IGroupMemberDoc } from '@/lib/models/Group';
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
    const { name, email } = body as { name: string; email: string };

    if (!name?.trim() || !email?.trim()) {
      return Response.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const group = await Group.findById(id);
    if (!group) return Response.json({ error: 'Group not found' }, { status: 404 });

    const exists = group.members.some(
      (m: IGroupMemberDoc) => m.email.toLowerCase() === email.toLowerCase()
    );
    if (exists) {
      return Response.json({ error: 'Member already in group' }, { status: 409 });
    }

    const userId = new mongoose.Types.ObjectId().toString();
    group.members.push({ userId, name: name.trim(), email: email.toLowerCase().trim() });
    await group.save();

    return Response.json({ group }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/groups/[id]/members]', error);
    return Response.json({ error: 'Failed to add member' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ error: 'Invalid group ID' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return Response.json({ error: 'userId query param required' }, { status: 400 });
    }

    const group = await Group.findById(id);
    if (!group) return Response.json({ error: 'Group not found' }, { status: 404 });

    group.members = group.members.filter((m: IGroupMemberDoc) => m.userId !== userId);
    await group.save();

    return Response.json({ group });
  } catch (error) {
    console.error('[DELETE /api/groups/[id]/members]', error);
    return Response.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}
