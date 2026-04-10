import { Schema, model, models, Document } from 'mongoose';

export interface IGroupMemberDoc {
  userId: string;
  name: string;
  email: string;
}

export interface IGroupDocument extends Document {
  name: string;
  description?: string;
  members: IGroupMemberDoc[];
  createdAt: Date;
}

const GroupMemberSchema = new Schema<IGroupMemberDoc>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
  },
  { _id: false }
);

const GroupSchema = new Schema<IGroupDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    members: { type: [GroupMemberSchema], default: [] },
  },
  { timestamps: true }
);

const Group = models.Group ?? model<IGroupDocument>('Group', GroupSchema);
export default Group;
