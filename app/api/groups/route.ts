import connectDB from '@/lib/mongodb';
import Group from '@/lib/models/Group';

export async function GET() {
  try {
    await connectDB();
    const groups = await Group.find({}).sort({ createdAt: -1 }).lean();
    return Response.json({ groups });
  } catch (error) {
    console.error('[GET /api/groups]', error);
    return Response.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, description } = body as { name: string; description?: string };

    if (!name?.trim()) {
      return Response.json({ error: 'Group name is required' }, { status: 400 });
    }

    const group = await Group.create({ name: name.trim(), description: description?.trim() });
    return Response.json({ group }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/groups]', error);
    return Response.json({ error: 'Failed to create group' }, { status: 500 });
  }
}
