import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../../services/api.service';
import { PendingBudgetExpense, UpdateNewsItem } from '../../types';
import { formatCurrency } from '../../utils/formatters';

// Lista cronológica de novedades y actualizaciones del sistema presentadas como noticias
export const APP_NEWS_UPDATES: UpdateNewsItem[] = [
  {
    id: 'news-2026-10-19-recurrence-scopes',
    version: 'v2.6',
    title: '🔁 Control Flexible de Gastos Recurrentes',
    date: '19 Oct 2026',
    tag: 'Flexibilidad Total',
    tagColor: '#B28DFF',
    icon: '⚡',
    headline: '¡Elige qué modificar o eliminar: solo este gasto, este y los futuros, o toda la serie!',
    description:
      'Ahora, al editar o borrar un gasto programado periódicamente, una ventana inteligente te ofrece 3 opciones claras: «Solo este gasto» (modifica/borra solo esa fecha), «Este y los futuros» (aplica desde esta fecha en adelante conservando el historial) o «Todas las repeticiones» (para toda la serie). Además, tus montos reales ya registrados se protegen siempre.',
    highlights: [
      'Opciones: Solo este, Este y futuros, o Toda la serie',
      'Disponible al editar o eliminar en calendario, lista y semanas',
      'Protege los montos reales ejecutados en cada ocurrencia',
    ],
  },
  {
    id: 'news-2026-10-19-savings-withdraw',
    version: 'v2.5',
    title: '💰 Retiro de Ahorros como Gasto Especial',
    date: '19 Oct 2026',
    tag: 'Finanzas Inteligentes',
    tagColor: '#FFE5A0',
    icon: '🪙',
    headline: '¡Ahora puedes extraer dinero de tus ahorros sin alterar tu restante mensual libre!',
    description:
      'Se incorporó el medio de pago especial «Retiro de Ahorros». Al registrar cualquier gasto presupuestado o extra con este medio de pago, el dinero se descuenta de tu fondo de ahorros en lugar de tu dinero disponible del mes. Además, la tarjeta de ahorro y el resumen mensual ahora calculan tu Ahorro Neto en tiempo real.',
    highlights: [
      'No resta del Restante Libre mensual',
      'Muestra desglose de Retirado y Ahorro Neto',
      'Cálculo sincronizado en el resumen mensual y anual',
    ],
  },
  {
    id: 'news-2026-10-19-payment-methods',
    version: 'v2.4',
    title: '💳 Gestión Personalizada de Medios de Pago',
    date: '19 Oct 2026',
    tag: 'Personalización',
    tagColor: '#A8D8EA',
    icon: '💳',
    headline: 'Configura tus cuentas una sola vez y selecciónalas con listas desplegables',
    description:
      'Nueva pestaña en Configuración para administrar tus medios de pago (como Visa, MasterCard, Débito Bancolombia, Addi, Efectivo o Nequi). Todos los formularios de gastos ahora cuentan con selector desplegable rápido y si renombras un medio de pago, todos tus gastos asociados se actualizan automáticamente.',
    highlights: [
      'Listas desplegables en calendario, lista y semanas',
      'Renombrado retroactivo en gastos existentes',
      'Compatibilidad total con gastos históricos',
    ],
  },
  {
    id: 'news-2026-10-19-calendar-list-view',
    version: 'v2.3',
    title: '📋 Vista de Lista y Edición en Agenda Mensual',
    date: '19 Oct 2026',
    tag: 'Productividad',
    tagColor: '#C3AED6',
    icon: '🗓️',
    headline: 'Visualiza tus gastos en tabla o calendario y edítalos con un solo clic',
    description:
      'Tu Agenda Mensual ahora te permite alternar entre el Calendario Interactivo y una nueva Vista de Lista ordenada cronológicamente con totales presupuestados. Además, ahora puedes editar directamente cualquier gasto presupuestado (fecha, categoría, concepto, medio de pago o monto) tanto desde el calendario como desde la lista.',
    highlights: [
      'Conmutador dinámico Calendario / Lista',
      'Edición completa de gastos presupuestados',
      'Mantiene el valor real al modificar la planificación',
    ],
  },
  {
    id: 'news-2026-10-19-recurring-expenses',
    version: 'v2.2',
    title: '🔁 Programación de Gastos Recurrentes',
    date: '19 Oct 2026',
    tag: 'Automatización',
    tagColor: '#A8E6CF',
    icon: '🔄',
    headline: '¡Automatiza tu presupuesto con repetición diaria, semanal, quincenal, mensual o anual!',
    description:
      'Programa tus obligaciones periódicas (como arriendo, cuotas, suscripciones o servicios). El sistema calcula los días y los ubica en cada mes y semana correspondiente. Cada ocurrencia es independiente: si en una semana el valor real cambia, no afecta a las demás, y puedes borrar solo una ocurrencia o la serie completa.',
    highlights: [
      'Frecuencias: Diaria, Semanal, Cada 2 semanas, Mensual y Anual',
      'Valores reales totalmente independientes',
      'Opción de borrar solo este gasto o la serie hacia el futuro',
    ],
  },
  {
    id: 'news-2026-10-19-budget-grand-total',
    version: 'v2.1',
    title: '🧾 Total General Presupuestado en el Resumen',
    date: '19 Oct 2026',
    tag: 'Resumen Mensual',
    tagColor: '#FFE5EC',
    icon: '📊',
    headline: 'Visión panorámica clara de lo presupuestado frente a lo ejecutado',
    description:
      'En la sección de Totalización de Gastos por Medio de Pago del Resumen del Mes, añadimos una tarjeta destacada con el Total General Presupuestado para que puedas comparar de inmediato tu proyección global frente a los gastos reales.',
    highlights: [
      'Tarjeta destacada con el gran total presupuestado',
      'Suma armonizada de todos los medios de pago',
    ],
  },
  {
    id: 'news-2026-10-19-nav-fluidity',
    version: 'v2.0',
    title: '⚡ Navegación Fluida y Segura entre Semanas',
    date: '19 Oct 2026',
    tag: 'Experiencia de Usuario',
    tagColor: '#F7C59F',
    icon: '🚀',
    headline: 'Transición instantánea entre semanas sin saltos ni esperas accidentales',
    description:
      'Solucionamos los retrasos y rebotes al avanzar o retroceder entre semanas. Las peticiones asíncronas y los autoguardados en segundo plano ahora respetan estrictamente la semana que estás visualizando.',
    highlights: [
      'Transiciones de semana limpias e inmediatas',
      'Protección contra condiciones de carrera en red',
    ],
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pendingExpenses: PendingBudgetExpense[];
  loadingPending: boolean;
  onRefreshPending: () => void;
}

const STORAGE_KEY_READ_NEWS = 'panda_read_news_ids_v1';

export const NotificationsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  pendingExpenses,
  loadingPending,
  onRefreshPending,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'news' | 'pending'>('pending');
  const [readNewsIds, setReadNewsIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_READ_NEWS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (isOpen) {
      onRefreshPending();
    }
  }, [isOpen]);

  const markAllNewsAsRead = () => {
    const allIds = APP_NEWS_UPDATES.map((n) => n.id);
    setReadNewsIds(allIds);
    try {
      localStorage.setItem(STORAGE_KEY_READ_NEWS, JSON.stringify(allIds));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNavigateToExpense = (exp: PendingBudgetExpense) => {
    onClose();
    if (exp.week_id) {
      navigate(`/years/${exp.year_id}/months/${exp.month_id}/weeks/${exp.week_id}`);
    } else {
      navigate(`/years/${exp.year_id}/months/${exp.month_id}`);
    }
  };

  if (!isOpen) return null;

  const unreadNewsCount = APP_NEWS_UPDATES.filter((n) => !readNewsIds.includes(n.id)).length;
  const pendingCount = pendingExpenses.length;

  return (
    <div className="notif-modal-overlay" onClick={onClose}>
      <div className="notif-modal-card card-pastel" onClick={(e) => e.stopPropagation()}>
        {/* HEADER */}
        <div className="notif-modal-header">
          <div className="notif-header-title">
            <span className="notif-bell-icon">🔔</span>
            <div>
              <h3>Centro de Notificaciones</h3>
              <p className="subtitle">Novedades del Panda Ahorrador y gastos por ejecutar</p>
            </div>
          </div>
          <button className="notif-close-btn" onClick={onClose} aria-label="Cerrar">
            &times;
          </button>
        </div>

        {/* TABS */}
        <div className="notif-tabs">
          <button
            className={`notif-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <i className="fa-solid fa-hourglass-half"></i> Gastos Pendientes
            {pendingCount > 0 && <span className="notif-badge count-pending">{pendingCount}</span>}
          </button>
          <button
            className={`notif-tab-btn ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            <i className="fa-solid fa-newspaper"></i> Novedades & Actualizaciones
            {unreadNewsCount > 0 && <span className="notif-badge count-news">{unreadNewsCount}</span>}
          </button>
        </div>

        {/* CONTENIDO TAB 1: GASTOS PENDIENTES */}
        {activeTab === 'pending' && (
          <div className="notif-tab-content">
            <div className="notif-content-intro">
              <p>
                Gastos presupuestados que aún no tienen registrado su monto real ejecutado. Haz clic en cualquiera para ir directamente a la semana correspondiente:
              </p>
            </div>

            {loadingPending ? (
              <div className="notif-loading">
                <i className="fa-solid fa-spinner fa-spin"></i> Cargando gastos pendientes...
              </div>
            ) : pendingExpenses.length === 0 ? (
              <div className="notif-empty-state">
                <div className="empty-icon">🐼🎉</div>
                <h4>¡Estás al día!</h4>
                <p>No tienes ningún gasto presupuestado pendiente de ejecutar en este momento.</p>
              </div>
            ) : (
              <div className="pending-expenses-list">
                {pendingExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="pending-expense-card"
                    onClick={() => handleNavigateToExpense(exp)}
                    title="Clic para ir a la semana del gasto"
                  >
                    <div className="pending-card-left">
                      <div className="pending-cat-badge" style={{ backgroundColor: exp.category_color || '#F4A6C1' }}>
                        {exp.category_icon || '📦'} {exp.category_name}
                      </div>
                      <div className="pending-concept">
                        <strong>{exp.recurrence_id ? '🔁 ' : ''}{exp.concept}</strong>
                      </div>
                      <div className="pending-meta">
                        <span>📅 {exp.date}</span>
                        {exp.week_number && (
                          <span className="pill-week">Semana {exp.week_number}</span>
                        )}
                        <span>• {exp.month_name} {exp.year}</span>
                        {exp.payment_method && (
                          <span className="pill-pm">💳 {exp.payment_method}</span>
                        )}
                      </div>
                    </div>

                    <div className="pending-card-right">
                      <div className="pending-amount">
                        <span className="amount-label">Presupuestado:</span>
                        <strong className="amount-val">{formatCurrency(exp.budget_amount)}</strong>
                      </div>
                      <button className="btn-go-week" onClick={(e) => { e.stopPropagation(); handleNavigateToExpense(exp); }}>
                        Ejecutar <i className="fa-solid fa-chevron-right"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTENIDO TAB 2: NOVEDADES Y ACTUALIZACIONES */}
        {activeTab === 'news' && (
          <div className="notif-tab-content">
            <div className="notif-news-header-row">
              <p className="subtitle" style={{ margin: 0 }}>
                Últimas mejoras, funcionalidades y noticias de tu Panda Ahorrador 🌸
              </p>
              {unreadNewsCount > 0 && (
                <button onClick={markAllNewsAsRead} className="btn-mark-read">
                  <i className="fa-solid fa-check-double"></i> Marcar leídas
                </button>
              )}
            </div>

            <div className="news-timeline">
              {APP_NEWS_UPDATES.map((news) => {
                const isRead = readNewsIds.includes(news.id);
                return (
                  <article key={news.id} className={`news-card ${isRead ? 'read' : 'unread'}`}>
                    <div className="news-top">
                      <div className="news-badges">
                        <span className="badge-version">{news.version}</span>
                        <span className="badge-tag" style={{ backgroundColor: news.tagColor || '#FFE5EC' }}>
                          {news.tag}
                        </span>
                        {!isRead && <span className="badge-new-dot">NUEVA</span>}
                      </div>
                      <span className="news-date">{news.date}</span>
                    </div>

                    <h4 className="news-title">
                      <span className="news-icon">{news.icon}</span> {news.title}
                    </h4>

                    <p className="news-headline">{news.headline}</p>
                    <p className="news-description">{news.description}</p>

                    {news.highlights && (
                      <ul className="news-highlights">
                        {news.highlights.map((h, i) => (
                          <li key={i}>
                            <i className="fa-solid fa-check"></i> {h}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        )}

        <div className="notif-modal-footer">
          <span className="footer-tip">💡 Consejo: Mantén tu presupuesto al día ejecutando tus gastos semanales.</span>
          <button onClick={onClose} className="btn-pastel btn-primary-pastel btn-sm">
            Entendido
          </button>
        </div>
      </div>

      <style>{`
        .notif-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(40, 25, 35, 0.5);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3000;
          padding: 16px;
          animation: fadeIn 0.2s ease;
        }

        .notif-modal-card {
          width: 100%;
          max-width: 650px;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          background: #FFFFFF;
          border-radius: 20px;
          border: 2px solid #F4A6C1;
          box-shadow: 0 16px 40px rgba(212, 86, 106, 0.25);
          overflow: hidden;
          animation: scaleUp 0.22s ease-out;
        }

        .notif-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 22px 14px;
          border-bottom: 1.5px solid #FFE5EC;
          background: linear-gradient(135deg, #FFF0F4 0%, #FFFFFF 100%);
        }

        .notif-header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .notif-bell-icon {
          font-size: 1.8rem;
          background: #FFF0F4;
          padding: 8px;
          border-radius: 12px;
          border: 1px solid #F4A6C1;
          display: inline-block;
        }

        .notif-header-title h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #D4566A;
        }

        .notif-header-title .subtitle {
          margin: 2px 0 0;
          font-size: 0.82rem;
          color: #7A6882;
        }

        .notif-close-btn {
          background: none;
          border: none;
          font-size: 1.8rem;
          color: #7A6882;
          cursor: pointer;
          line-height: 1;
          padding: 0 4px;
          transition: color 0.2s;
        }
        .notif-close-btn:hover { color: #D4566A; }

        .notif-tabs {
          display: flex;
          gap: 6px;
          padding: 10px 18px;
          background: #FFF9FA;
          border-bottom: 1px solid #FFE5EC;
        }

        .notif-tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 9px 14px;
          border-radius: 12px;
          border: 1.5px solid transparent;
          background: transparent;
          color: #665275;
          font-family: inherit;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .notif-tab-btn.active {
          background: #FFFFFF;
          color: #D4566A;
          border-color: #F4A6C1;
          box-shadow: 0 2px 8px rgba(212, 86, 106, 0.12);
        }

        .notif-badge {
          font-size: 0.72rem;
          padding: 2px 7px;
          border-radius: 10px;
          font-weight: 800;
          line-height: 1.2;
        }
        .count-pending { background: #D4566A; color: #FFFFFF; }
        .count-news { background: #5A82E6; color: #FFFFFF; }

        .notif-tab-content {
          padding: 18px 22px;
          overflow-y: auto;
          flex: 1;
        }

        .notif-content-intro {
          font-size: 0.85rem;
          color: #665275;
          margin-bottom: 14px;
        }

        .notif-loading {
          text-align: center;
          padding: 30px;
          color: #D4566A;
          font-size: 0.95rem;
        }

        .notif-empty-state {
          text-align: center;
          padding: 36px 20px;
        }
        .empty-icon { font-size: 3rem; margin-bottom: 10px; }
        .notif-empty-state h4 { margin: 0 0 6px; color: #4A3F55; font-size: 1.15rem; }
        .notif-empty-state p { margin: 0; color: #7A6882; font-size: 0.88rem; }

        .pending-expenses-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .pending-expense-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 14px;
          background: #FFFFFF;
          border: 1.5px solid #FFE5EC;
          cursor: pointer;
          transition: all 0.22s ease;
        }
        .pending-expense-card:hover {
          border-color: #D4566A;
          transform: translateY(-2px);
          box-shadow: 0 4px 14px rgba(212, 86, 106, 0.12);
        }

        .pending-card-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .pending-cat-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #2E1B24;
          padding: 2px 8px;
          border-radius: 8px;
          width: fit-content;
        }

        .pending-concept strong {
          color: #4A3F55;
          font-size: 0.95rem;
        }

        .pending-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          font-size: 0.78rem;
          color: #7A6882;
        }

        .pill-week {
          background: #FFF0F4;
          color: #D4566A;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 6px;
        }

        .pill-pm {
          background: #F0F4FF;
          color: #3C63C7;
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 6px;
        }

        .pending-card-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          flex-shrink: 0;
        }

        .pending-amount {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          line-height: 1.2;
        }
        .amount-label { font-size: 0.72rem; color: #7A6882; }
        .amount-val { font-size: 1.05rem; color: #D4566A; }

        .btn-go-week {
          background: #FFF0F4;
          color: #D4566A;
          border: 1px solid #F4A6C1;
          font-family: inherit;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 5px 10px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s ease;
        }
        .btn-go-week:hover {
          background: #D4566A;
          color: #FFFFFF;
          border-color: #D4566A;
        }

        /* TAB NOVEDADES */
        .notif-news-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          gap: 10px;
        }

        .btn-mark-read {
          background: none;
          border: none;
          color: #D4566A;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
        }
        .btn-mark-read:hover { background: #FFF0F4; }

        .news-timeline {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .news-card {
          padding: 14px 16px;
          border-radius: 14px;
          border: 1.5px solid #FFE5EC;
          background: #FFFFFF;
          transition: all 0.2s ease;
        }
        .news-card.unread {
          border-left: 5px solid #D4566A;
          background: #FFFDFE;
        }

        .news-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .news-badges {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .badge-version {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 6px;
          background: #4A3F55;
          color: #FFFFFF;
        }

        .badge-tag {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 8px;
          color: #4A3F55;
        }

        .badge-new-dot {
          font-size: 0.65rem;
          font-weight: 800;
          background: #D4566A;
          color: #FFFFFF;
          padding: 1px 6px;
          border-radius: 6px;
        }

        .news-date {
          font-size: 0.75rem;
          color: #9E8EA8;
          font-weight: 600;
        }

        .news-title {
          margin: 4px 0 6px;
          font-size: 1rem;
          color: #4A3F55;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .news-headline {
          font-size: 0.86rem;
          font-weight: 700;
          color: #D4566A;
          margin: 0 0 6px;
        }

        .news-description {
          font-size: 0.83rem;
          color: #5C4F66;
          line-height: 1.45;
          margin: 0 0 8px;
        }

        .news-highlights {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .news-highlights li {
          font-size: 0.78rem;
          color: #4A3F55;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .news-highlights li i {
          color: #2E7D32;
          font-size: 0.7rem;
        }

        .notif-modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 22px;
          border-top: 1.5px solid #FFE5EC;
          background: #FFF9FA;
        }
        .footer-tip {
          font-size: 0.76rem;
          color: #7A6882;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.94); }
          to { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 600px) {
          .notif-modal-card { max-height: 94vh; }
          .notif-tab-btn { font-size: 0.78rem; padding: 7px 10px; }
          .pending-expense-card { flex-direction: column; align-items: stretch; }
          .pending-card-right { flex-direction: row; justify-content: space-between; align-items: center; margin-top: 6px; }
          .footer-tip { display: none; }
        }
      `}</style>
    </div>
  );
};
