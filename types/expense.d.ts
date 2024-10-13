declare global {
  interface Expense {
    id?: number;
    credit: number;
    debit: number;
    description: string;
    date: string;
    category: string;
  }
}

export {};
