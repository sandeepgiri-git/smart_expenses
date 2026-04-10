import { Schema, model, models, Document, Types } from 'mongoose';

export interface IExpenseDocument extends Document {
  groupId: Types.ObjectId;
  title: string;
  amount: number;
  category: string;
  paidBy: string;
  splitType: 'equal' | 'custom';
  participants: string[];
  createdAt: Date;
}

const ExpenseSchema = new Schema<IExpenseDocument>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: {
      type: String,
      enum: ['food', 'travel', 'rent', 'utilities', 'entertainment', 'shopping', 'health', 'other'],
      default: 'other',
    },
    paidBy: { type: String, required: true },
    splitType: { type: String, enum: ['equal', 'custom'], default: 'equal' },
    participants: { type: [String], required: true },
  },
  { timestamps: true }
);

const Expense = models.Expense ?? model<IExpenseDocument>('Expense', ExpenseSchema);
export default Expense;
