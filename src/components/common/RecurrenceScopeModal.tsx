import React from 'react';
import { RecurrenceScope } from '../../types';

interface Props {
  isOpen: boolean;
  action: 'edit' | 'delete';
  concept?: string;
  date?: string;
  onSelectScope: (scope: RecurrenceScope) => void;
  onCancel: () => void;
}

export const RecurrenceScopeModal: React.FC<Props> = ({
  isOpen,
  action,
  concept,
  date,
  onSelectScope,
  onCancel,
}) => {
  if (!isOpen) return null;

  const isDelete = action === 'delete';

  return (
    <div className="recurrence-modal-overlay" onClick={onCancel}>
      <div className="recurrence-modal-card card-pastel" onClick={(e) => e.stopPropagation()}>
        {/* ENCABEZADO */}
        <div className="recurrence-modal-header">
          <div className="header-icon-badge">
            {isDelete ? '🗑️' : '✏️'}
          </div>
          <div>
            <h3>{isDelete ? 'Eliminar Gasto Recurrente' : 'Editar Gasto Recurrente'}</h3>
            <p className="subtitle">
              Este gasto forma parte de una serie programada periódicamente 🔁
            </p>
          </div>
          <button className="btn-close-modal" onClick={onCancel} aria-label="Cerrar">
            &times;
          </button>
        </div>

        {/* DETALLE DEL GASTO */}
        {(concept || date) && (
          <div className="expense-context-pill">
            <span className="pill-concept"><strong>Gasto:</strong> {concept || 'Sin concepto'}</span>
            {date && <span className="pill-date">📅 Fecha actual: {date}</span>}
          </div>
        )}

        <p className="scope-prompt-text">
          {isDelete
            ? '¿Cómo deseas eliminar este gasto de tu planificación?'
            : '¿A cuáles repeticiones deseas aplicar los cambios editados?'}
        </p>

        {/* OPCIONES DE ALCANCE (SCOPES) */}
        <div className="scope-options-grid">
          {/* OPCIÓN 1: SOLO ESTE */}
          <button
            type="button"
            className="scope-option-btn scope-single"
            onClick={() => onSelectScope('single')}
          >
            <div className="scope-icon-wrap">📌</div>
            <div className="scope-text-wrap">
              <h4>{isDelete ? 'Borrar solo este gasto' : 'Editar solo este gasto'}</h4>
              <p>
                {isDelete
                  ? 'Elimina únicamente la repetición de esta fecha. El resto de las repeticiones se mantienen intactas.'
                  : 'Modifica únicamente el registro de esta fecha. El resto de las repeticiones de la serie no se alteran.'}
              </p>
            </div>
          </button>

          {/* OPCIÓN 2: ESTE Y LOS FUTUROS */}
          <button
            type="button"
            className="scope-option-btn scope-future"
            onClick={() => onSelectScope('future')}
          >
            <div className="scope-icon-wrap">⏭️</div>
            <div className="scope-text-wrap">
              <h4>{isDelete ? 'Borrar este y los futuros' : 'Editar este y los futuros'}</h4>
              <p>
                {isDelete
                  ? 'Elimina este gasto y todas las repeticiones a partir de esta fecha hacia adelante. Las fechas pasadas se conservan.'
                  : 'Aplica los cambios a este gasto y a todas las repeticiones futuras. Las fechas pasadas se conservan con sus valores originales.'}
              </p>
            </div>
          </button>

          {/* OPCIÓN 3: TODAS LAS REPETICIONES */}
          <button
            type="button"
            className="scope-option-btn scope-all"
            onClick={() => onSelectScope('all')}
          >
            <div className="scope-icon-wrap">🔁</div>
            <div className="scope-text-wrap">
              <h4>{isDelete ? 'Borrar todas las repeticiones' : 'Editar todas las repeticiones'}</h4>
              <p>
                {isDelete
                  ? 'Elimina absolutamente todas las repeticiones de la serie (pasadas, presentes y futuras) y cancela la repetición.'
                  : 'Aplica los cambios a toda la serie (pasadas, presentes y futuras), manteniendo intacto el valor real que ya hayas registrado.'}
              </p>
            </div>
          </button>
        </div>

        {/* FOOTER */}
        <div className="recurrence-modal-footer">
          <button type="button" onClick={onCancel} className="btn-pastel btn-secondary-pastel btn-cancel">
            Cancelar
          </button>
        </div>
      </div>

      <style>{`
        .recurrence-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(40, 25, 45, 0.55);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 16px;
          animation: recFadeIn 0.22s ease-out;
        }
        @keyframes recFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .recurrence-modal-card {
          width: 100%;
          max-width: 540px;
          background: #FFFFFF;
          border-radius: 20px;
          box-shadow: 0 16px 40px rgba(74, 63, 85, 0.22);
          border: 2px solid #F4A6C1;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
          animation: recCardSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes recCardSlide {
          from { transform: translateY(18px) scale(0.97); }
          to { transform: translateY(0) scale(1); }
        }
        .recurrence-modal-header {
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px dashed rgba(244, 166, 193, 0.6);
          padding-bottom: 14px;
        }
        .header-icon-badge {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #FFF0F4;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          flex-shrink: 0;
          border: 1px solid #F4A6C1;
        }
        .recurrence-modal-header h3 {
          margin: 0;
          font-size: 1.18rem;
          color: #D4566A;
          font-family: 'Caveat', cursive, sans-serif;
          font-weight: 700;
        }
        .recurrence-modal-header .subtitle {
          margin: 2px 0 0 0;
          font-size: 0.8rem;
          color: #8C7B99;
        }
        .btn-close-modal {
          margin-left: auto;
          background: none;
          border: none;
          font-size: 1.6rem;
          line-height: 1;
          color: #8C7B99;
          cursor: pointer;
          transition: color 0.2s;
        }
        .btn-close-modal:hover {
          color: #D4566A;
        }
        .expense-context-pill {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          background: #FFF0F4;
          padding: 8px 14px;
          border-radius: 12px;
          border: 1px solid rgba(244, 166, 193, 0.4);
          font-size: 0.86rem;
          color: #4A3F55;
        }
        .scope-prompt-text {
          margin: 0;
          font-size: 0.92rem;
          font-weight: 600;
          color: #4A3F55;
        }
        .scope-options-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .scope-option-btn {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1.5px solid #E5E7EB;
          background: #FAFAFA;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .scope-option-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 86, 106, 0.12);
        }
        .scope-option-btn.scope-single:hover {
          background: #FFF9FA;
          border-color: #F4A6C1;
        }
        .scope-option-btn.scope-future:hover {
          background: #F0F9FF;
          border-color: #7BDCB5;
        }
        .scope-option-btn.scope-all:hover {
          background: #F8F5FF;
          border-color: #B28DFF;
        }
        .scope-icon-wrap {
          font-size: 1.4rem;
          line-height: 1;
          padding-top: 2px;
          flex-shrink: 0;
        }
        .scope-text-wrap h4 {
          margin: 0 0 3px 0;
          font-size: 0.96rem;
          font-weight: 700;
          color: #4A3F55;
        }
        .scope-text-wrap p {
          margin: 0;
          font-size: 0.8rem;
          color: #6B7280;
          line-height: 1.35;
        }
        .recurrence-modal-footer {
          display: flex;
          justify-content: flex-end;
          padding-top: 6px;
        }
        .btn-cancel {
          padding: 8px 18px;
          font-size: 0.88rem;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
