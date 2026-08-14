export interface BudgetExpense {
  id?: number;
  month_id: number;
  week_id?: number;
  category_id: number;
  date: string;
  concept: string;
  budget_amount: number;
  real_amount?: number;
  payment_method?: string;
  category_name?: string;
  category_color?: string;
  category_icon?: string;
}

export interface ExtraExpense {
  id?: number;
  month_id: number;
  week_id?: number;
  category_id: number;
  date: string;
  concept: string;
  amount: number;
  payment_method?: string;
  category_name?: string;
  category_color?: string;
  category_icon?: string;
}

