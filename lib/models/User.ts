import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    avatar: { type: String },
  },
  { timestamps: true }
);

const User = models.User ?? model<IUserDocument>('User', UserSchema);
export default User;
