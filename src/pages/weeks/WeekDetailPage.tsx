import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ApiService } from '../../services/api.service';
import { useToast } from '../../context/ToastContext';
import { Category, BudgetExpense, ExtraExpense, CategoryWeekTotal, Week } from '../../types';
import { formatCurrency } from '../../utils/formatters';

export const WeekDetailPage: React.FC = () => {
  const { yearId, monthId, weekId } = useParams<{ yearId: string; monthId: string; weekId: string }>();
  const navigate = useNavigate();

  const yId = parseInt(yearId || '0', 10);
  const mId = parseInt(monthId || '0', 10);
  const wId = parseInt(weekId || '0', 10);

  const [weekData, setWeekData] = useState<{
    week: Week;
    budgetExpenses: BudgetExpense[];
    extraExpenses: ExtraExpense[];
    categoryTotals: CategoryWeekTotal[];
  } | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [prevWeekId, setPrevWeekId] = useState<number | null>(null);
  const [nextWeekId, setNextWeekId] = useState<number | null>(null);

  const [showExtraModal, setShowExtraModal] = useState(false);
  const [newExtra, setNewExtra] = useState<Partial<ExtraExpense>>({ amount: 0, concept: '', payment_method: '' });

  const { success, error, warning, confirm } = useToast();

  const budgetUpdateDebounceRef = useRef<{ [id: number]: any }>({});
  const extraUpdateDebounceRef = useRef<{ [id: number]: any }>({});

  const loadWeekData = () => {
    if (!wId) return;

    ApiService.getWeekDetail(wId)
      .then((data) => {
        setWeekData(data);
      })
      .catch((err) => error(err.response?.data?.message || 'Error al cargar detalle de la semana'));

    if (mId) {
      ApiService.getWeeksByMonth(mId)
        .then((weeks) => {
          const idx = weeks.findIndex((w) => w.id === wId);
          if (idx !== -1) {
            setPrevWeekId(idx > 0 ? weeks[idx - 1].id : null);
            setNextWeekId(idx < weeks.length - 1 ? weeks[idx + 1].id : null);
          }
        })
        .catch(console.error);
    }
  };

  useEffect(() => {
    loadWeekData();
    ApiService.getCategories().then(setCategories).catch(console.error);
  }, [wId, mId]);

  const queueBudgetUpdate = (b: BudgetExpense) => {
    if (!b.id) return;
    if (budgetUpdateDebounceRef.current[b.id]) {
      clearTimeout(budgetUpdateDebounceRef.current[b.id]);
    }
    budgetUpdateDebounceRef.current[b.id] = setTimeout(async () => {
      try {
        await ApiService.updateBudgetExpense(b.id!, b);
        loadWeekData();
      } catch (err) {
        console.error('Error al actualizar gasto presupuestado:', err);
      }
    }, 500);
  };

  const queueExtraUpdate = (ext: ExtraExpense) => {
    if (!ext.id) return;
    if (extraUpdateDebounceRef.current[ext.id]) {
      clearTimeout(extraUpdateDebounceRef.current[ext.id]);
    }
    extraUpdateDebounceRef.current[ext.id] = setTimeout(async () => {
      try {
        await ApiService.updateExtraExpense(ext.id!, ext);
        loadWeekData();
      } catch (err) {
        console.error('Error al actualizar gasto extra:', err);
      }
    }, 500);
  };

  const deleteBudgetRow = async (id: number) => {
    const confirmed = await confirm('¿Deseas eliminar este gasto presupuestado?');
    if (!confirmed) return;

    try {
      await ApiService.deleteBudgetExpense(id);
      success('Gasto presupuestado eliminado');
      loadWeekData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Error al eliminar gasto');
    }
  };

  const deleteExtraRow = async (id: number) => {
    const confirmed = await confirm('¿Deseas eliminar este gasto extra?');
    if (!confirmed) return;

    try {
      await ApiService.deleteExtraExpense(id);
      success('Gasto extra eliminado');
      loadWeekData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Error al eliminar gasto extra');
    }
  };

  const openExtraModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setNewExtra({
      month_id: mId,
      week_id: wId,
      category_id: categories[0]?.id || 1,
      date: today,
      concept: '',
      amount: 0,
      payment_method: '',
    });
    setShowExtraModal(true);
  };

  const saveExtraExpense = async () => {
    if (!newExtra.concept || !newExtra.amount) {
      warning('Por favor ingresa concepto y monto del gasto extra');
      return;
    }
    try {
      await ApiService.createExtraExpense(newExtra as ExtraExpense);
      success('Gasto extra registrado 🌸');
      setShowExtraModal(false);
      loadWeekData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Error al crear gasto extra');
    }
  };

  if (!weekData) {
    return (
      <div className="week-container animate-fade-in-up" style={{ textAlign: 'center', paddingTop: '50px' }}>
        <p><i className="fa-solid fa-spinner fa-spin"></i> Cargando detalle de la semana...</p>
      </div>
    );
  }

  return (
    <div className="week-container animate-fade-in-up">
      {/* HEADER */}
      <div className="week-header card-pastel">
        <div>
          <span className="chinese-title">周度详情 — Detalle de Semana</span>
          <h1>
            Semana {weekData.week.week_number} ({weekData.week.start_date} al {weekData.week.end_date})
          </h1>
        </div>
        <div className="header-nav-actions">
          {prevWeekId && (
            <Link to={`/years/${yId}/months/${mId}/weeks/${prevWeekId}`} className="btn-pastel btn-secondary-pastel btn-nav">
              <i className="fa-solid fa-chevron-left"></i> Semana anterior
            </Link>
          )}
          <Link to={`/years/${yId}/months/${mId}`} className="btn-pastel btn-secondary-pastel">
            <i className="fa-solid fa-calendar-days"></i> Agenda del Mes
          </Link>
          {nextWeekId && (
            <Link to={`/years/${yId}/months/${mId}/weeks/${nextWeekId}`} className="btn-pastel btn-secondary-pastel btn-nav">
              Semana siguiente <i className="fa-solid fa-chevron-right"></i>
            </Link>
          )}
        </div>
      </div>

      {/* SECCIÓN 1: GASTOS PRESUPUESTADOS (DEL CALENDARIO) */}
      <section className="card-pastel section-box">
        <div className="section-header">
          <div>
            <h2>Gastos Presupuestados en Calendario</h2>
            <p className="subtitle">
              Registra el <strong>Valor Real</strong> de lo gastado en cada elemento presupuestado.
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Fecha</th>
                <th>Concepto</th>
                <th>Medio de Pago</th>
                <th>Presupuestado</th>
                <th>Valor Real Gastado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {weekData.budgetExpenses?.map((b) => (
                <tr key={b.id}>
                  <td>
                    <select
                      value={b.category_id}
                      onChange={(e) => {
                        const catId = parseInt(e.target.value);
                        const updated = { ...b, category_id: catId };
                        setWeekData((prev) =>
                          prev
                            ? {
                                ...prev,
                                budgetExpenses: prev.budgetExpenses.map((row) => (row.id === b.id ? updated : row)),
                              }
                            : null
                        );
                        queueBudgetUpdate(updated);
                      }}
                      className="table-select"
                      style={{ borderLeftColor: b.category_color }}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.icon} {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="date"
                      value={b.date || ''}
                      onChange={(e) => {
                        const updated = { ...b, date: e.target.value };
                        setWeekData((prev) =>
                          prev
                            ? {
                                ...prev,
                                budgetExpenses: prev.budgetExpenses.map((row) => (row.id === b.id ? updated : row)),
                              }
                            : null
                        );
                        queueBudgetUpdate(updated);
                      }}
                      className="table-input"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={b.concept || ''}
                      onChange={(e) => {
                        const updated = { ...b, concept: e.target.value };
                        setWeekData((prev) =>
                          prev
                            ? {
                                ...prev,
                                budgetExpenses: prev.budgetExpenses.map((row) => (row.id === b.id ? updated : row)),
                              }
                            : null
                        );
                        queueBudgetUpdate(updated);
                      }}
                      className="table-input"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={b.payment_method || ''}
                      onChange={(e) => {
                        const updated = { ...b, payment_method: e.target.value };
                        setWeekData((prev) =>
                          prev
                            ? {
                                ...prev,
                                budgetExpenses: prev.budgetExpenses.map((row) => (row.id === b.id ? updated : row)),
                              }
                            : null
                        );
                        queueBudgetUpdate(updated);
                      }}
                      className="table-input"
                      placeholder="Ej: Tarjeta, Efectivo"
                    />
                  </td>
                  <td className="font-bold">{formatCurrency(b.budget_amount)}</td>
                  <td>
                    <input
                      type="number"
                      value={b.real_amount ?? ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        const updated = { ...b, real_amount: val };
                        setWeekData((prev) =>
                          prev
                            ? {
                                ...prev,
                                budgetExpenses: prev.budgetExpenses.map((row) => (row.id === b.id ? updated : row)),
                              }
                            : null
                        );
                        queueBudgetUpdate(updated);
                      }}
                      className="table-input input-real-value"
                      placeholder="$ 0"
                    />
                  </td>
                  <td>
                    <button onClick={() => deleteBudgetRow(b.id!)} className="btn-icon-danger" title="Eliminar">
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {(!weekData.budgetExpenses || weekData.budgetExpenses.length === 0) && (
                <tr>
                  <td colSpan={7} className="text-center">
                    No hay gastos presupuestados para esta semana desde el calendario.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECCIÓN 2: GASTOS EXTRA (NO PRESUPUESTADOS) */}
      <section className="card-pastel section-box">
        <div className="section-header">
          <div>
            <h2>Gastos No Presupuestados (Extra)</h2>
            <p className="subtitle">Agrega compras o imprevistos no planificados durante la semana.</p>
          </div>
          <button onClick={openExtraModal} className="btn-pastel btn-primary-pastel">
            <i className="fa-solid fa-plus"></i> Agregar Gasto Extra
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Fecha</th>
                <th>Concepto</th>
                <th>Medio de Pago</th>
                <th>Valor Gastado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {weekData.extraExpenses?.map((ext) => (
                <tr key={ext.id}>
                  <td>
                    <select
                      value={ext.category_id}
                      onChange={(e) => {
                        const catId = parseInt(e.target.value);
                        const updated = { ...ext, category_id: catId };
                        setWeekData((prev) =>
                          prev
                            ? {
                                ...prev,
                                extraExpenses: prev.extraExpenses.map((row) => (row.id === ext.id ? updated : row)),
                              }
                            : null
                        );
                        queueExtraUpdate(updated);
                      }}
                      className="table-select"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.icon} {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="date"
                      value={ext.date || ''}
                      onChange={(e) => {
                        const updated = { ...ext, date: e.target.value };
                        setWeekData((prev) =>
                          prev
                            ? {
                                ...prev,
                                extraExpenses: prev.extraExpenses.map((row) => (row.id === ext.id ? updated : row)),
                              }
                            : null
                        );
                        queueExtraUpdate(updated);
                      }}
                      className="table-input"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={ext.concept || ''}
                      onChange={(e) => {
                        const updated = { ...ext, concept: e.target.value };
                        setWeekData((prev) =>
                          prev
                            ? {
                                ...prev,
                                extraExpenses: prev.extraExpenses.map((row) => (row.id === ext.id ? updated : row)),
                              }
                            : null
                        );
                        queueExtraUpdate(updated);
                      }}
                      className="table-input"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={ext.payment_method || ''}
                      onChange={(e) => {
                        const updated = { ...ext, payment_method: e.target.value };
                        setWeekData((prev) =>
                          prev
                            ? {
                                ...prev,
                                extraExpenses: prev.extraExpenses.map((row) => (row.id === ext.id ? updated : row)),
                              }
                            : null
                        );
                        queueExtraUpdate(updated);
                      }}
                      className="table-input"
                      placeholder="Ej: Tarjeta, Efectivo"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={ext.amount ?? ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        const updated = { ...ext, amount: val };
                        setWeekData((prev) =>
                          prev
                            ? {
                                ...prev,
                                extraExpenses: prev.extraExpenses.map((row) => (row.id === ext.id ? updated : row)),
                              }
                            : null
                        );
                        queueExtraUpdate(updated);
                      }}
                      className="table-input input-real-value"
                      placeholder="$ 0"
                    />
                  </td>
                  <td>
                    <button onClick={() => deleteExtraRow(ext.id!)} className="btn-icon-danger" title="Eliminar">
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {(!weekData.extraExpenses || weekData.extraExpenses.length === 0) && (
                <tr>
                  <td colSpan={6} className="text-center">
                    No se han registrado gastos extra en esta semana.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECCIÓN 3: TOTALES GASTADOS POR CATEGORÍA AL FINAL DE LA SEMANA */}
      <section className="card-pastel section-box">
        <div className="chinese-title-wrapper">
          <h2>Totales Gastados por Categoría (Semana {weekData.week.week_number})</h2>
        </div>

        <div className="category-totals-grid">
          {weekData.categoryTotals?.map((catTotal) => (
            <div
              key={catTotal.categoryId}
              className="category-total-card"
              style={{ backgroundColor: catTotal.categoryColor }}
            >
              <div className="cat-card-header">
                <span className="cat-icon">{catTotal.categoryIcon}</span>
                <span className="cat-name">{catTotal.categoryName}</span>
              </div>
              <div className="cat-card-body">
                <span>Presupuestado: {formatCurrency(catTotal.totalBudget)}</span>
                <strong>Real Gastado: {formatCurrency(catTotal.totalSpent)}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL CREAR GASTO EXTRA */}
      {showExtraModal && (
        <div className="modal-overlay" onClick={() => setShowExtraModal(false)}>
          <div className="modal-card card-pastel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🌸 Agregar Gasto No Presupuestado</h3>
              <button onClick={() => setShowExtraModal(false)} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Fecha:</label>
                <input
                  type="date"
                  value={newExtra.date || ''}
                  onChange={(e) => setNewExtra({ ...newExtra, date: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Categoría:</label>
                <select
                  value={newExtra.category_id || categories[0]?.id}
                  onChange={(e) => setNewExtra({ ...newExtra, category_id: parseInt(e.target.value) })}
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
                  value={newExtra.concept || ''}
                  onChange={(e) => setNewExtra({ ...newExtra, concept: e.target.value })}
                  placeholder="Ej: Salida espontánea a cenar"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Medio de Pago:</label>
                <input
                  type="text"
                  value={newExtra.payment_method || ''}
                  onChange={(e) => setNewExtra({ ...newExtra, payment_method: e.target.value })}
                  placeholder="Ej: Tarjeta débito, Efectivo"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Monto Real Gastado ($):</label>
                <input
                  type="number"
                  value={newExtra.amount || ''}
                  onChange={(e) => setNewExtra({ ...newExtra, amount: parseFloat(e.target.value) || 0 })}
                  className="form-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowExtraModal(false)} className="btn-pastel btn-secondary-pastel">
                Cancelar
              </button>
              <button onClick={saveExtraExpense} className="btn-pastel btn-primary-pastel">
                Guardar Gasto Extra
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .week-container {
          max-width: 1200px;
          margin: 30px auto;
          padding: 0 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .week-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .header-nav-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }
        .btn-nav {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .section-box {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table th, .data-table td {
          padding: 12px;
          border-bottom: 1px solid #FFF0F4;
        }
        .data-table th {
          background: #FFF0F4;
          color: #4A3F55;
          text-align: left;
        }
        .table-input, .table-select {
          width: 100%;
          padding: 8px;
          border-radius: 8px;
          border: 1px solid #F4A6C1;
          font-family: 'Comfortaa', cursive;
          outline: none;
          background: #FFFFFF;
        }
        .input-real-value {
          font-weight: 700;
          color: #D4566A;
        }
        .btn-icon-danger {
          background: #FFE5EC;
          border: 1px solid #F4A6C1;
          color: #D4566A;
          cursor: pointer;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          transition: background 0.2s ease;
        }
        .btn-icon-danger:hover {
          background: #D4566A;
          color: white;
        }
        .category-totals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
        }
        .category-total-card {
          padding: 16px;
          border-radius: 16px;
          color: #333;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .cat-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 1rem;
        }
        .cat-card-body {
          display: flex;
          flex-direction: column;
          font-size: 0.85rem;
        }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }
        .modal-card { width: 100%; max-width: 450px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .close-btn { background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #888; }
        .form-group { margin-bottom: 12px; display: flex; flex-direction: column; gap: 4px; }
        .form-input { padding: 8px 12px; border-radius: 10px; border: 1.5px solid #F4A6C1; outline: none; width: 100%; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px; }

        @media (max-width: 768px) {
          .week-container { margin: 14px auto; padding: 0 12px; gap: 16px; }
          .week-header { flex-direction: column; text-align: center; }
          .header-nav-actions { justify-content: center; width: 100%; }
          .section-header { flex-direction: column; text-align: center; gap: 10px; }
          .category-totals-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }
          .category-total-card { padding: 12px; }
        }
      `}</style>
    </div>
  );
};
