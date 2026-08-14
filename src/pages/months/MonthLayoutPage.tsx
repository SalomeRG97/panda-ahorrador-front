import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ApiService } from '../../services/api.service';
import { useToast } from '../../context/ToastContext';
import { Category, BudgetExpense, ExtraExpense, Income, Week, MonthChallengeData, ChallengeDayProgress } from '../../types';
import { formatCurrency } from '../../utils/formatters';

export const MonthLayoutPage: React.FC = () => {
  const { yearId, monthId } = useParams<{ yearId: string; monthId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const yId = parseInt(yearId || '0', 10);
  const mId = parseInt(monthId || '0', 10);

  const initialTab = (searchParams.get('tab') as any) || 'calendar';
  const [activeTab, setActiveTab] = useState<'calendar' | 'incomes' | 'summary' | 'challenge'>(
    ['calendar', 'incomes', 'summary', 'challenge'].includes(initialTab) ? initialTab : 'calendar'
  );

  const [monthDetails, setMonthDetails] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [calendarDays, setCalendarDays] = useState<{ dayNumber: number | null; dateStr: string; expenses: BudgetExpense[] }[]>([]);
  const [weeklyBreakdown, setWeeklyBreakdown] = useState<any[]>([]);
  const [challengeData, setChallengeData] = useState<MonthChallengeData | null>(null);

  const [monthSaving, setMonthSaving] = useState<number>(0);
  const [totalIncomes, setTotalIncomes] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [totalRemaining, setTotalRemaining] = useState<number>(0);

  const [paymentMethodsOverall, setPaymentMethodsOverall] = useState<{ method: string; total: number }[]>([]);
  const [categoryPaymentBreakdown, setCategoryPaymentBreakdown] = useState<
    {
      categoryId: number;
      categoryName: string;
      categoryIcon: string;
      categoryColor: string;
      total: number;
      methods: { method: string; total: number }[];
      expanded?: boolean;
    }[]
  >([]);

  // Modales
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [editingIncomeId, setEditingIncomeId] = useState<number | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<BudgetExpense | null>(null);

  const [newExpense, setNewExpense] = useState<Partial<BudgetExpense>>({ budget_amount: 0, concept: '', payment_method: '' });
  const [newIncome, setNewIncome] = useState<Partial<Income>>({ amount: 0, concept: '' });

  const { success, error, warning, confirm } = useToast();

  const calculateTotals = (data: any) => {
    if (!data) return;
    const incTotal = (data.incomes || []).reduce((sum: number, i: Income) => sum + parseFloat(i.amount as any || 0), 0);
    const budgetSum = (data.budgetExpenses || []).reduce(
      (sum: number, e: BudgetExpense) => sum + parseFloat(e.real_amount || e.budget_amount as any || 0),
      0
    );
    const extraSum = (data.extraExpenses || []).reduce((sum: number, e: ExtraExpense) => sum + parseFloat(e.amount as any || 0), 0);

    const expTotal = budgetSum + extraSum;
    const saving = data.saving || 0;

    setTotalIncomes(incTotal);
    setTotalExpenses(expTotal);
    setTotalRemaining(incTotal - expTotal - saving);

    // Payment methods breakdown
    const budgetExpenses: BudgetExpense[] = data.budgetExpenses || [];
    const extraExpenses: ExtraExpense[] = data.extraExpenses || [];

    const categoryMap = new Map<
      number,
      {
        categoryId: number;
        categoryName: string;
        categoryIcon: string;
        categoryColor: string;
        total: number;
        methodsMap: Map<string, number>;
      }
    >();

    const overallMethodsMap = new Map<string, number>();

    const processExpense = (exp: any, isExtra = false) => {
      const catId = exp.category_id;
      const catName = exp.category_name || 'Sin Categoría';
      const catIcon = exp.category_icon || '🏷️';
      const catColor = exp.category_color || '#E8A0BF';
      const rawMethod = exp.payment_method ? exp.payment_method.trim() : '';
      const method = rawMethod ? rawMethod : 'Sin especificar';
      const amount = isExtra
        ? parseFloat(exp.amount || 0)
        : exp.real_amount && parseFloat(exp.real_amount) > 0
        ? parseFloat(exp.real_amount)
        : parseFloat(exp.budget_amount || 0);

      if (!amount || isNaN(amount)) return;

      overallMethodsMap.set(method, (overallMethodsMap.get(method) || 0) + amount);

      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, {
          categoryId: catId,
          categoryName: catName,
          categoryIcon: catIcon,
          categoryColor: catColor,
          total: 0,
          methodsMap: new Map<string, number>(),
        });
      }

      const catData = categoryMap.get(catId)!;
      catData.total += amount;
      catData.methodsMap.set(method, (catData.methodsMap.get(method) || 0) + amount);
    };

    budgetExpenses.forEach((e) => processExpense(e, false));
    extraExpenses.forEach((e) => processExpense(e, true));

    setPaymentMethodsOverall(Array.from(overallMethodsMap.entries()).map(([method, total]) => ({ method, total })));

    setCategoryPaymentBreakdown(
      Array.from(categoryMap.values()).map((cat) => ({
        categoryId: cat.categoryId,
        categoryName: cat.categoryName,
        categoryIcon: cat.categoryIcon,
        categoryColor: cat.categoryColor,
        total: cat.total,
        methods: Array.from(cat.methodsMap.entries()).map(([method, total]) => ({ method, total })),
        expanded: false,
      }))
    );
  };

  const generateCalendarGrid = (data: any) => {
    if (!data) return;
    const year = data.month.year;
    const monthNum = data.month.month_number;

    const firstDay = new Date(year, monthNum - 1, 1).getDay();
    const daysInMonth = new Date(year, monthNum, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({ dayNumber: null, dateStr: '', expenses: [] });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayExpenses = (data.budgetExpenses || []).filter((e: BudgetExpense) => e.date === dateStr);
      days.push({ dayNumber: d, dateStr, expenses: dayExpenses });
    }

    setCalendarDays(days);
  };

  const loadMonthData = () => {
    ApiService.getMonthDetails(mId)
      .then((data) => {
        setMonthDetails(data);
        setMonthSaving(data.saving || 0);
        calculateTotals(data);
        generateCalendarGrid(data);
      })
      .catch((err) => error(err.response?.data?.message || 'Error al cargar detalles del mes'));
  };

  useEffect(() => {
    if (mId) {
      loadMonthData();
      ApiService.getCategories().then(setCategories).catch(console.error);
    }
  }, [mId]);

  useEffect(() => {
    if (activeTab === 'summary' && mId) {
      ApiService.getMonthWeeklyCategoryBreakdown(mId).then(setWeeklyBreakdown).catch(console.error);
    }
    if (activeTab === 'challenge' && mId) {
      ApiService.getMonthChallenge(mId).then(setChallengeData).catch(console.error);
    }
  }, [activeTab, mId]);

  const handleTabChange = (tab: 'calendar' | 'incomes' | 'summary' | 'challenge') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const toggleCategoryBreakdown = (categoryId: number) => {
    setCategoryPaymentBreakdown((prev) =>
      prev.map((c) => (c.categoryId === categoryId ? { ...c, expanded: !c.expanded } : c))
    );
  };

  const toggleChallengeDay = async (day: ChallengeDayProgress) => {
    if (!challengeData) return;
    const newCompleted = !day.completed;
    try {
      await ApiService.updateChallengeProgress(challengeData.challenge.month_challenge_id!, day.day, newCompleted);
      setChallengeData((prev) => {
        if (!prev) return null;
        const updatedProgress = prev.progress.map((d) => (d.day === day.day ? { ...d, completed: newCompleted } : d));
        const completedDays = updatedProgress.filter((d) => d.completed).length;
        const percentage = Math.round((completedDays / prev.stats.totalDays) * 100);
        return {
          ...prev,
          progress: updatedProgress,
          stats: { ...prev.stats, completedDays, percentage },
        };
      });
    } catch (err: any) {
      error('Error al actualizar reto');
    }
  };

  const openExpenseModal = (dateStr: string) => {
    setNewExpense({
      month_id: mId,
      date: dateStr,
      category_id: categories[0]?.id || 1,
      concept: '',
      budget_amount: 0,
      payment_method: '',
    });
    setShowExpenseModal(true);
  };

  const saveBudgetExpense = async () => {
    if (!newExpense.concept || !newExpense.budget_amount) {
      warning('Por favor ingresa concepto y monto');
      return;
    }
    try {
      await ApiService.createBudgetExpense(newExpense as BudgetExpense);
      success('Gasto presupuestado agregado 🌸');
      setShowExpenseModal(false);
      loadMonthData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Error al guardar gasto');
    }
  };

  const deleteBudgetExpense = async (id: number) => {
    const confirmed = await confirm('¿Deseas eliminar este gasto presupuestado?');
    if (!confirmed) return;

    try {
      await ApiService.deleteBudgetExpense(id);
      success('Gasto eliminado');
      setSelectedExpense(null);
      loadMonthData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Error al eliminar gasto');
    }
  };

  const openIncomeModal = (inc?: Income) => {
    const today = new Date().toISOString().split('T')[0];
    if (inc && inc.id) {
      setEditingIncomeId(inc.id);
      const formattedDate = inc.date ? inc.date.split('T')[0] : today;
      setNewIncome({ month_id: mId, date: formattedDate, concept: inc.concept, amount: inc.amount });
    } else {
      setEditingIncomeId(null);
      setNewIncome({ month_id: mId, date: today, concept: '', amount: 0 });
    }
    setShowIncomeModal(true);
  };

  const saveIncome = async () => {
    if (!newIncome.concept || !newIncome.amount) {
      warning('Por favor ingresa concepto y valor del ingreso');
      return;
    }
    try {
      if (editingIncomeId) {
        await ApiService.updateIncome(editingIncomeId, newIncome as Income);
        success('Ingreso actualizado 💰');
      } else {
        await ApiService.createIncome(newIncome as Income);
        success('Ingreso registrado 💰');
      }
      setShowIncomeModal(false);
      setEditingIncomeId(null);
      loadMonthData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Error al guardar ingreso');
    }
  };

  const deleteIncome = async (id?: number) => {
    if (!id) {
      error('ID de ingreso no válido');
      return;
    }
    const confirmed = await confirm('¿Deseas eliminar este ingreso?');
    if (!confirmed) return;

    try {
      await ApiService.deleteIncome(id);
      success('Ingreso eliminado');
      loadMonthData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Error al eliminar ingreso');
    }
  };

  const saveMonthSaving = async () => {
    try {
      await ApiService.setMonthSaving(mId, monthSaving);
      success('Meta de ahorro guardada 🪙');
      loadMonthData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Error al guardar ahorro');
    }
  };

  if (!monthDetails) {
    return (
      <div className="month-container animate-fade-in-up" style={{ textAlign: 'center', paddingTop: '50px' }}>
        <p><i className="fa-solid fa-spinner fa-spin"></i> Cargando agenda del mes...</p>
      </div>
    );
  }

  return (
    <div className="month-container animate-fade-in-up">
      {/* HEADER DEL MES */}
      <div className="month-header card-pastel">
        <div className="header-left">
          <span className="chinese-title">月度议程 — Agenda del Mes</span>
          <h1>{monthDetails.month.month_name} {monthDetails.month.year}</h1>
        </div>
        <div className="header-actions">
          <Link to={`/years/${yId}`} className="btn-pastel btn-secondary-pastel">
            <i className="fa-solid fa-chart-line"></i> Dashboard Anual
          </Link>
        </div>
      </div>

      {/* PESTAÑAS TIPO AGENDA */}
      <div className="agenda-tabs">
        <button
          className={`agenda-tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => handleTabChange('calendar')}
        >
          <i className="fa-solid fa-calendar-days"></i> Calendario
        </button>
        <button
          className={`agenda-tab-btn ${activeTab === 'incomes' ? 'active' : ''}`}
          onClick={() => handleTabChange('incomes')}
        >
          <i className="fa-solid fa-wallet"></i> Ingresos & Ahorro
        </button>
        <button
          className={`agenda-tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => handleTabChange('summary')}
        >
          <i className="fa-solid fa-table-list"></i> Resumen del Mes
        </button>
        <button
          className={`agenda-tab-btn ${activeTab === 'challenge' ? 'active' : ''}`}
          onClick={() => handleTabChange('challenge')}
        >
          <i className="fa-solid fa-bullseye"></i> Reto Interactivo
        </button>
      </div>

      {/* PESTAÑA 1: CALENDARIO INTERACTIVO */}
      {activeTab === 'calendar' && (
        <div className="tab-content card-pastel">
          <div className="calendar-header-actions">
            <h3>Calendario de Gastos Presupuestados</h3>
            <p className="subtitle">Haz clic en cualquier día para programar un gasto o ver sus detalles.</p>
            <div className="weeks-shortcut">
              <span>Acceso a Semanas:</span>
              {monthDetails.weeks?.map((w: Week) => (
                <Link key={w.id} to={`/years/${yId}/months/${mId}/weeks/${w.id}`} className="week-pill">
                  Semana {w.week_number}
                </Link>
              ))}
            </div>
          </div>

          {/* GRID DEL CALENDARIO */}
          <div className="calendar-grid-wrapper">
            <div className="calendar-grid">
              <div className="day-name">Dom</div>
              <div className="day-name">Lun</div>
              <div className="day-name">Mar</div>
              <div className="day-name">Mié</div>
              <div className="day-name">Jue</div>
              <div className="day-name">Vie</div>
              <div className="day-name">Sáb</div>

              {calendarDays.map((dayCell, index) => (
                <div
                  key={`${dayCell.dateStr}_${index}`}
                  className={`calendar-day-cell ${!dayCell.dateStr ? 'empty-day' : ''}`}
                  onClick={() => dayCell.dateStr && openExpenseModal(dayCell.dateStr)}
                >
                  {dayCell.dayNumber && <div className="day-number">{dayCell.dayNumber}</div>}
                  <div className="day-expenses">
                    {dayCell.expenses.map((exp) => (
                      <div
                        key={exp.id}
                        className="expense-tag"
                        style={{ backgroundColor: exp.category_color }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExpense(exp);
                        }}
                      >
                        <span className="exp-icon">{exp.category_icon}</span>
                        <span className="exp-concept">{exp.concept}</span>
                        <span className="exp-amount">{formatCurrency(exp.budget_amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: INGRESOS & AHORRO */}
      {activeTab === 'incomes' && (
        <div className="tab-content card-pastel">
          <div className="incomes-layout">
            <div className="incomes-main">
              <div className="section-title-row">
                <h3>Ingresos del Mes</h3>
                <button onClick={() => openIncomeModal()} className="btn-pastel btn-primary-pastel">
                  <i className="fa-solid fa-plus"></i> Agregar Ingreso
                </button>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Concepto</th>
                      <th>Valor</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthDetails.incomes?.map((inc: Income) => (
                      <tr key={inc.id}>
                        <td>{inc.date ? inc.date.split('T')[0] : ''}</td>
                        <td><strong>{inc.concept}</strong></td>
                        <td className="text-green">{formatCurrency(inc.amount)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              onClick={() => openIncomeModal(inc)}
                              className="btn-pastel btn-secondary-pastel"
                              style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                              title="Editar Ingreso"
                            >
                              <i className="fa-solid fa-pen"></i>
                            </button>
                            <button
                              onClick={() => deleteIncome(inc.id)}
                              className="btn-icon-danger"
                              title="Eliminar Ingreso"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(!monthDetails.incomes || monthDetails.incomes.length === 0) && (
                      <tr>
                        <td colSpan={4} className="text-center">No has registrado ingresos aún.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECCIÓN AHORRO DEL MES */}
            <div className="savings-card card-pastel">
              <div className="savings-icon">🪙</div>
              <h3>Ahorro del Mes</h3>
              <p>Define la cantidad que deseas destinar al ahorro este mes:</p>
              <div className="saving-input-group">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  value={monthSaving}
                  onChange={(e) => setMonthSaving(parseFloat(e.target.value) || 0)}
                  className="form-input"
                />
                <button onClick={saveMonthSaving} className="btn-pastel btn-primary-pastel">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: RESUMEN MENSUAL */}
      {activeTab === 'summary' && (
        <div className="tab-content card-pastel">
          <h3>Resumen Semanal por Categoría</h3>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  {monthDetails.weeks?.map((w: Week) => (
                    <th key={w.id}>Semana {w.week_number}</th>
                  ))}
                  <th>TOTAL MENSUAL</th>
                </tr>
              </thead>
              <tbody>
                {weeklyBreakdown.map((catRow) => (
                  <tr key={catRow.categoryId}>
                    <td className="category-title-cell">
                      <span className="badge-category" style={{ backgroundColor: catRow.categoryColor }}>
                        {catRow.categoryIcon} {catRow.categoryName}
                      </span>
                    </td>
                    {catRow.weeks?.map((w: any, idx: number) => (
                      <td key={idx}>{formatCurrency(w.total)}</td>
                    ))}
                    <td className="total-col">{formatCurrency(catRow.monthTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOTALES FINALES */}
          <div className="totals-summary-grid">
            <div className="total-box bg-ingresos">
              <span>Total Ingresos</span>
              <strong>{formatCurrency(totalIncomes)}</strong>
            </div>
            <div className="total-box bg-gastos">
              <span>Total Gastos</span>
              <strong>{formatCurrency(totalExpenses)}</strong>
            </div>
            <div className="total-box bg-ahorros">
              <span>Total Ahorro</span>
              <strong>{formatCurrency(monthSaving)}</strong>
            </div>
            <div className="total-box" style={{ background: '#A8D8EA', color: '#1E4B5E' }}>
              <span>Restante Libre</span>
              <strong>{formatCurrency(totalRemaining)}</strong>
            </div>
          </div>

          {/* SECCIÓN DESGLOSE POR MEDIO DE PAGO */}
          <div className="payment-methods-section" style={{ marginTop: '32px' }}>
            <h3 style={{ marginBottom: '16px', color: '#D4566A' }}>💳 Totalización de Gastos por Medio de Pago</h3>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '1.05rem', color: '#4A3F55', marginBottom: '12px' }}>Totales Generales por Tipo de Pago</h4>
              {paymentMethodsOverall.length > 0 ? (
                <div className="totals-summary-grid">
                  {paymentMethodsOverall.map((pm, idx) => (
                    <div key={idx} className="total-box" style={{ background: '#FFF0F4', border: '1.5px solid #F4A6C1', color: '#4A3F55' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>💳 {pm.method}</span>
                      <strong style={{ color: '#D4566A', fontSize: '1.15rem' }}>{formatCurrency(pm.total)}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#8C7B99', fontStyle: 'italic', fontSize: '0.9rem' }}>No hay registrados medios de pago para este mes aún.</p>
              )}
            </div>

            {/* DETALLE DESPLEGABLE POR CATEGORÍA */}
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '1.05rem', color: '#4A3F55', marginBottom: '12px' }}>Desglose por Categoría (Clic para desplegar)</h4>
              <div className="category-payment-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {categoryPaymentBreakdown.map((catRow) => (
                  <div key={catRow.categoryId} className="card-pastel" style={{ padding: '14px 18px', margin: 0, background: '#FFF9FA' }}>
                    <div
                      onClick={() => toggleCategoryBreakdown(catRow.categoryId)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span className="badge-category" style={{ backgroundColor: catRow.categoryColor }}>
                          {catRow.categoryIcon} {catRow.categoryName}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#8C7B99', fontWeight: 600 }}>({catRow.methods.length} medios de pago)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <strong style={{ color: '#D4566A', fontSize: '1rem' }}>{formatCurrency(catRow.total)}</strong>
                        <span style={{ fontSize: '0.9rem', color: '#D4566A', fontWeight: 'bold' }}>{catRow.expanded ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {catRow.expanded && (
                      <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed #F4A6C1' }}>
                        <table className="data-table" style={{ fontSize: '0.85rem' }}>
                          <thead>
                            <tr>
                              <th>Medio de Pago Usado</th>
                              <th>Total Gastado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {catRow.methods.map((m, idx) => (
                              <tr key={idx}>
                                <td>💳 <strong>{m.method}</strong></td>
                                <td style={{ color: '#D4566A', fontWeight: 700 }}>{formatCurrency(m.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 4: RETO INTERACTIVO */}
      {activeTab === 'challenge' && challengeData && (
        <div className="tab-content card-pastel">
          <div className="challenge-header">
            <span className="challenge-icon-big">{challengeData.challenge.icon}</span>
            <div>
              <h2 className="chinese-title">{challengeData.challenge.title}</h2>
              <p className="challenge-desc">{challengeData.challenge.description}</p>
            </div>
          </div>

          <div className="progress-bar-wrapper">
            <div className="progress-text">
              <span>Progreso: {challengeData.stats.completedDays} de {challengeData.stats.totalDays} días</span>
              <strong>{challengeData.stats.percentage}%</strong>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${challengeData.stats.percentage}%` }}></div>
            </div>
          </div>

          <div className="challenge-days-grid">
            {challengeData.progress.map((day) => (
              <div
                key={day.day}
                className={`challenge-day-card ${day.completed ? 'completed' : ''}`}
                onClick={() => toggleChallengeDay(day)}
              >
                <span className="day-num">Día {day.day}</span>
                <span className="check-icon">{day.completed ? '🌸 Listo' : '⚪'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL CREAR GASTO EN CALENDARIO */}
      {showExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="modal-card card-pastel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🌸 Agregar Gasto Presupuestado</h3>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Fecha:</label>
                <input
                  type="date"
                  value={newExpense.date || ''}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Categoría:</label>
                <select
                  value={newExpense.category_id || categories[0]?.id}
                  onChange={(e) => setNewExpense({ ...newExpense, category_id: parseInt(e.target.value) })}
                  className="form-input"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Concepto / Detalle:</label>
                <input
                  type="text"
                  value={newExpense.concept || ''}
                  onChange={(e) => setNewExpense({ ...newExpense, concept: e.target.value })}
                  placeholder="Ej: Servicio de luz"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Medio de Pago:</label>
                <input
                  type="text"
                  value={newExpense.payment_method || ''}
                  onChange={(e) => setNewExpense({ ...newExpense, payment_method: e.target.value })}
                  placeholder="Ej: Débito, Efectivo"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Monto Presupuestado ($):</label>
                <input
                  type="number"
                  value={newExpense.budget_amount || ''}
                  onChange={(e) => setNewExpense({ ...newExpense, budget_amount: parseFloat(e.target.value) || 0 })}
                  className="form-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowExpenseModal(false)} className="btn-pastel btn-secondary-pastel">
                Cancelar
              </button>
              <button onClick={saveBudgetExpense} className="btn-pastel btn-primary-pastel">
                Guardar Gasto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP DETALLE DE GASTO */}
      {selectedExpense && (
        <div className="modal-overlay" onClick={() => setSelectedExpense(null)}>
          <div className="modal-card card-pastel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalle del Gasto</h3>
            </div>
            <div className="modal-body">
              <div className="badge-category" style={{ backgroundColor: selectedExpense.category_color }}>
                {selectedExpense.category_icon} {selectedExpense.category_name}
              </div>
              <h2 style={{ marginTop: '12px' }}>{selectedExpense.concept}</h2>
              <p>Fecha: <strong>{selectedExpense.date}</strong></p>
              {selectedExpense.payment_method && (
                <p>Medio de Pago: <strong>{selectedExpense.payment_method}</strong></p>
              )}
              <p>Monto Presupuestado: <strong>{formatCurrency(selectedExpense.budget_amount)}</strong></p>
              {selectedExpense.real_amount !== undefined && (
                <p>Monto Real: <strong>{formatCurrency(selectedExpense.real_amount)}</strong></p>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => deleteBudgetExpense(selectedExpense.id!)} className="btn-pastel btn-delete-sm">
                Eliminar
              </button>
              <button onClick={() => setSelectedExpense(null)} className="btn-pastel btn-primary-pastel">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR INGRESO */}
      {showIncomeModal && (
        <div className="modal-overlay" onClick={() => setShowIncomeModal(false)}>
          <div className="modal-card card-pastel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💰 {editingIncomeId ? 'Editar Ingreso' : 'Agregar Nuevo Ingreso'}</h3>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Fecha:</label>
                <input
                  type="date"
                  value={newIncome.date || ''}
                  onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Concepto:</label>
                <input
                  type="text"
                  value={newIncome.concept || ''}
                  onChange={(e) => setNewIncome({ ...newIncome, concept: e.target.value })}
                  placeholder="Ej: Salario quincenal"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Valor ($):</label>
                <input
                  type="number"
                  value={newIncome.amount || ''}
                  onChange={(e) => setNewIncome({ ...newIncome, amount: parseFloat(e.target.value) || 0 })}
                  className="form-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowIncomeModal(false)} className="btn-pastel btn-secondary-pastel">
                Cancelar
              </button>
              <button onClick={saveIncome} className="btn-pastel btn-primary-pastel">
                {editingIncomeId ? 'Actualizar Ingreso' : 'Guardar Ingreso'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .month-container { max-width: 1200px; margin: 20px auto; padding: 0 16px; }
        .month-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .tab-content { padding: clamp(14px, 3vw, 24px); }
        .calendar-header-actions { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .weeks-shortcut { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
        .week-pill {
          background: #FFF0F4; border: 1px solid #F4A6C1; color: #D4566A; padding: 6px 12px; border-radius: 20px;
          text-decoration: none; font-weight: 700; font-size: 0.8rem; transition: all 0.2s ease;
        }
        .week-pill:hover { background: #D4566A; color: white; }
        .calendar-grid-wrapper { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .calendar-grid { display: grid; grid-template-columns: repeat(7, minmax(80px, 1fr)); gap: 6px; min-width: 580px; }
        .day-name { text-align: center; font-weight: 700; color: #4A3F55; padding: 6px; background: #FFF0F4; border-radius: 8px; font-size: 0.85rem; }
        .calendar-day-cell {
          min-height: 95px; max-height: 125px; background: #FFFFFF; border: 1px solid rgba(244, 166, 193, 0.4); border-radius: 10px;
          padding: 6px; cursor: pointer; display: flex; flex-direction: column; gap: 4px; transition: background 0.2s ease; overflow: hidden;
        }
        .calendar-day-cell:hover:not(.empty-day) { background: #FFF9FA; border-color: #D4566A; }
        .empty-day { background: #FAFAFA; border-color: transparent; cursor: default; }
        .day-number { font-weight: 700; font-size: 0.85rem; color: #4A3F55; }
        .day-expenses {
          display: flex; flex-direction: column; gap: 4px; max-height: 85px; overflow-y: auto; padding-right: 2px;
        }
        .day-expenses::-webkit-scrollbar { width: 3px; }
        .day-expenses::-webkit-scrollbar-thumb { background: #F4A6C1; border-radius: 10px; }
        .expense-tag {
          padding: 3px 5px; border-radius: 6px; font-size: 0.7rem; font-weight: 600; color: #333;
          display: flex; align-items: center; gap: 3px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .incomes-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
        .section-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { padding: 10px 12px; border-bottom: 1px solid #FFF0F4; font-size: 0.9rem; vertical-align: middle; }
        .data-table th { text-align: left; background: #FFF0F4; color: #4A3F55; white-space: nowrap; }
        .data-table td { white-space: nowrap; }
        .data-table td:nth-child(2) { white-space: normal; } /* Concepto puede romper si es muy largo */
        .savings-card { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .savings-icon { font-size: 2.5rem; }
        .saving-input-group { display: flex; align-items: center; gap: 6px; width: 100%; }
        .currency-symbol { font-weight: 700; font-size: 1.1rem; }
        .totals-summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-top: 20px; }
        .total-box { padding: 14px; border-radius: 14px; display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 0.9rem; white-space: nowrap; }
        .bg-ingresos { background: #EAF6F0; color: #1E4E36; }
        .bg-gastos { background: #FDEEF4; color: #6A1B3B; }
        .bg-ahorros { background: #FFF9EB; color: #5B4810; }
        .modal-header { margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1.5px dashed #F4A6C1; }
        .modal-header h3 { font-size: 1.3rem; color: #D4566A; margin: 0; }
        .challenge-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .challenge-icon-big { font-size: 3rem; }
        .progress-bar-wrapper { margin-bottom: 24px; }
        .progress-text { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.9rem; }
        .progress-track { height: 14px; background: #FFF0F4; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #F4A6C1, #D4566A); transition: width 0.4s ease; }
        .challenge-days-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(75px, 1fr)); gap: 10px; }
        .challenge-day-card {
          background: #FFFFFF; border: 2px solid #F4A6C1; border-radius: 10px; padding: 8px; text-align: center;
          cursor: pointer; display: flex; flex-direction: column; gap: 4px; transition: all 0.2s ease; font-size: 0.8rem;
        }
        .challenge-day-card.completed { background: #FFE5EC; border-color: #D4566A; transform: scale(1.03); }
        .form-group { margin-bottom: 12px; display: flex; flex-direction: column; gap: 4px; }
        .form-input { padding: 8px 12px; border-radius: 10px; border: 1.5px solid #F4A6C1; outline: none; font-size: 0.9rem; width: 100%; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px; }
        .btn-icon-danger { background: #FFE5EC; border: 1px solid #F4A6C1; color: #D4566A; cursor: pointer; width: 34px; height: 34px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.95rem; transition: background 0.2s ease; }
        .btn-icon-danger:hover { background: #D4566A; color: white; }
        @media (max-width: 900px) {
          .incomes-layout { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .month-container { margin: 10px auto; padding: 0 10px; }
          .month-header { flex-direction: column; text-align: center; }
          .totals-summary-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .total-box { padding: 10px; font-size: 0.8rem; }
          .challenge-header { flex-direction: column; text-align: center; }
          .challenge-days-grid { grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 6px; }
          .saving-input-group { flex-wrap: wrap; }
        }
      `}</style>
    </div>
  );
};
