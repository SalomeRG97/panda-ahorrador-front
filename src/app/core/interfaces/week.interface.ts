export interface Week {
  id: number;
  month_id: number;
  week_number: number;
  start_date: string;
  end_date: string;
}

export interface CategoryWeekTotal {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  totalBudget: number;
  totalRealBudget: number;
  totalExtra: number;
  totalSpent: number;
}
