import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Category } from '../interfaces/category.interface';
import { Year } from '../interfaces/year.interface';
import { Month } from '../interfaces/month.interface';
import { Income } from '../interfaces/income.interface';
import { BudgetExpense, ExtraExpense } from '../interfaces/expense.interface';
import { Week, CategoryWeekTotal } from '../interfaces/week.interface';
import { MonthChallengeData } from '../interfaces/challenge.interface';
import { AnnualSummary, CategoryChartData } from '../interfaces/summary.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  // CATEGORÍAS
  getCategories(): Observable<Category[]> {
    return this.http.get<{ success: boolean; data: Category[] }>(`${this.apiUrl}/categories`)
      .pipe(map(res => res.data));
  }

  createCategory(data: { name: string; color: string; icon: string }): Observable<Category> {
    return this.http.post<{ success: boolean; data: Category }>(`${this.apiUrl}/categories`, data)
      .pipe(map(res => res.data));
  }

  updateCategory(id: number, data: { name?: string; color?: string; icon?: string }): Observable<Category> {
    return this.http.put<{ success: boolean; data: Category }>(`${this.apiUrl}/categories/${id}`, data)
      .pipe(map(res => res.data));
  }

  deleteCategory(id: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/categories/${id}`)
      .pipe(map(res => res.success));
  }

  // AÑOS
  getYears(): Observable<Year[]> {
    return this.http.get<{ success: boolean; data: Year[] }>(`${this.apiUrl}/years`)
      .pipe(map(res => res.data));
  }

  getYearById(id: number): Observable<Year> {
    return this.http.get<{ success: boolean; data: Year }>(`${this.apiUrl}/years/${id}`)
      .pipe(map(res => res.data));
  }

  createYear(year: number, startMonth: number): Observable<Year> {
    return this.http.post<{ success: boolean; data: Year }>(`${this.apiUrl}/years`, { year, startMonth })
      .pipe(map(res => res.data));
  }

  deleteYear(id: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/years/${id}`)
      .pipe(map(res => res.success));
  }

  // MESES
  getMonthDetails(monthId: number): Observable<any> {
    return this.http.get<{ success: boolean; data: any }>(`${this.apiUrl}/months/${monthId}`)
      .pipe(map(res => res.data));
  }

  // INGRESOS & AHORRO
  getIncomesByMonth(monthId: number): Observable<Income[]> {
    return this.http.get<{ success: boolean; data: Income[] }>(`${this.apiUrl}/incomes/month/${monthId}`)
      .pipe(map(res => res.data));
  }

  createIncome(income: Income): Observable<Income> {
    return this.http.post<{ success: boolean; data: Income }>(`${this.apiUrl}/incomes`, income)
      .pipe(map(res => res.data));
  }

  updateIncome(id: number, income: Partial<Income>): Observable<boolean> {
    return this.http.put<{ success: boolean }>(`${this.apiUrl}/incomes/${id}`, income)
      .pipe(map(res => res.success));
  }

  deleteIncome(id: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/incomes/${id}`)
      .pipe(map(res => res.success));
  }

  setMonthSaving(monthId: number, amount: number): Observable<boolean> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/incomes/saving`, { monthId, amount })
      .pipe(map(res => res.success));
  }

  // GASTOS PRESUPUESTADOS
  createBudgetExpense(expense: BudgetExpense): Observable<BudgetExpense> {
    return this.http.post<{ success: boolean; data: BudgetExpense }>(`${this.apiUrl}/expenses/budget`, expense)
      .pipe(map(res => res.data));
  }

  updateBudgetExpense(id: number, expense: Partial<BudgetExpense>): Observable<boolean> {
    return this.http.put<{ success: boolean }>(`${this.apiUrl}/expenses/budget/${id}`, expense)
      .pipe(map(res => res.success));
  }

  deleteBudgetExpense(id: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/expenses/budget/${id}`)
      .pipe(map(res => res.success));
  }

  // GASTOS EXTRA
  createExtraExpense(expense: ExtraExpense): Observable<ExtraExpense> {
    return this.http.post<{ success: boolean; data: ExtraExpense }>(`${this.apiUrl}/expenses/extra`, expense)
      .pipe(map(res => res.data));
  }

  updateExtraExpense(id: number, expense: Partial<ExtraExpense>): Observable<boolean> {
    return this.http.put<{ success: boolean }>(`${this.apiUrl}/expenses/extra/${id}`, expense)
      .pipe(map(res => res.success));
  }

  deleteExtraExpense(id: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/expenses/extra/${id}`)
      .pipe(map(res => res.success));
  }

  // SEMANAS
  getWeeksByMonth(monthId: number): Observable<Week[]> {
    return this.http.get<{ success: boolean; data: Week[] }>(`${this.apiUrl}/weeks/month/${monthId}`)
      .pipe(map(res => res.data));
  }

  getWeekDetail(weekId: number): Observable<{ week: Week; budgetExpenses: BudgetExpense[]; extraExpenses: ExtraExpense[]; categoryTotals: CategoryWeekTotal[] }> {
    return this.http.get<{ success: boolean; data: any }>(`${this.apiUrl}/weeks/${weekId}`)
      .pipe(map(res => res.data));
  }

  // RETOS
  getMonthChallenge(monthId: number): Observable<MonthChallengeData> {
    return this.http.get<{ success: boolean; data: MonthChallengeData }>(`${this.apiUrl}/challenges/month/${monthId}`)
      .pipe(map(res => res.data));
  }

  updateChallengeProgress(monthChallengeId: number, day: number, completed: boolean): Observable<boolean> {
    return this.http.put<{ success: boolean }>(`${this.apiUrl}/challenges/progress`, { monthChallengeId, day, completed })
      .pipe(map(res => res.success));
  }

  // RESÚMENES & GRÁFICOS
  getAnnualSummary(yearId: number): Observable<AnnualSummary> {
    return this.http.get<{ success: boolean; data: AnnualSummary }>(`${this.apiUrl}/summary/year/${yearId}`)
      .pipe(map(res => res.data));
  }

  getAnnualCategoryCharts(yearId: number): Observable<CategoryChartData[]> {
    return this.http.get<{ success: boolean; data: CategoryChartData[] }>(`${this.apiUrl}/summary/year/${yearId}/categories`)
      .pipe(map(res => res.data));
  }

  getMonthWeeklyCategoryBreakdown(monthId: number): Observable<any[]> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.apiUrl}/summary/month/${monthId}/categories-weekly`)
      .pipe(map(res => res.data));
  }
}

