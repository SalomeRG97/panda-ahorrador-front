export interface MonthSummaryItem {
  monthId: number;
  monthNumber: number;
  monthName: string;
  income: number;
  expenses: number;
  savings: number;
  fixed: number;
  remaining: number;
}

export interface AnnualSummary {
  totals: {
    income: number;
    expenses: number;
    savings: number;
    fixed: number;
    remaining: number;
  };
  months: MonthSummaryItem[];
}

export interface CategoryChartData {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  monthlyData: number[];
}
