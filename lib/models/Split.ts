import { Schema, model, models, Document, Types } from 'mongoose';

export interface ISplitDocument extends Document {
  expenseId: Types.ObjectId;
  groupId: Types.ObjectId;
  owedBy: string;
  owedTo: string;
  amount: number;
  settled: boolean;
  createdAt: Date;
}

const SplitSchema = new Schema<ISplitDocument>(
  {
    expenseId: { type: Schema.Types.ObjectId, ref: 'Expense', required: true },
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    owedBy: { type: String, required: true },
    owedTo: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    settled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SplitSchema.index({ expenseId: 1 });
SplitSchema.index({ groupId: 1, settled: 1 });

const Split = models.Split ?? model<ISplitDocument>('Split', SplitSchema);
export default Split;
