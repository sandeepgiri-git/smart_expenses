export type SplitType = 'equal' | 'custom';

export type ExpenseCategory =
  | 'food'
  | 'travel'
  | 'rent'
  | 'utilities'
  | 'entertainment'
  | 'shopping'
  | 'health'
  | 'other';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface IGroupMember {
  userId: string;
  name: string;
  email: string;
}

export interface IGroup {
  _id: string;
  name: string;
  description?: string;
  members: IGroupMember[];
  createdAt: string;
}

export interface ISplit {
  _id: string;
  expenseId: string;
  groupId: string;
  owedBy: string; // userId
  owedTo: string; // userId
  amount: number;
  settled: boolean;
  createdAt: string;
}

export interface IExpense {
  _id: string;
  groupId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  paidBy: string; // userId
  splitType: SplitType;
  participants: string[]; // userIds
  createdAt: string;
}

export interface INetBalance {
  userId: string;
  name: string;
  netAmount: number; // positive = owed money, negative = owes money
}

export interface ISettlement {
  from: string; // userId who owes
  fromName: string;
  to: string; // userId who is owed
  toName: string;
  amount: number;
}

export interface IBalanceResponse {
  netBalances: INetBalance[];
  settlements: ISettlement[];
}
