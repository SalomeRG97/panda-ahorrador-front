import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { User } from '../../types';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    role: 'regular' as 'admin' | 'regular' | 'viewer',
    isActive: true,
    password: '',
  });

  const { success, error, confirm } = useToast();

  const loadUsers = () => {
    api.get<{ success: boolean; data: User[] }>('/admin/users')
      .then((res) => setUsers(res.data.data))
      .catch((err) => error(err.response?.data?.message || 'Error al cargar usuarios'));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const getAvatarUrl = (avatar?: string | null): string => {
    if (avatar) {
      return avatar.startsWith('http') ? avatar : `http://localhost:3000${avatar}`;
    }
    return '/logo.png';
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingUserId(null);
    setFormData({ name: '', username: '', email: '', role: 'regular', isActive: true, password: '' });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setIsEditing(true);
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      password: '',
    });
    setShowModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && editingUserId) {
        await api.put(`/admin/users/${editingUserId}`, formData);
        success('Usuario actualizado correctamente ✨');
      } else {
        await api.post('/admin/users', formData);
        success('Usuario creado exitosamente 🌸');
      }
      setShowModal(false);
      loadUsers();
    } catch (err: any) {
      error(err.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const handleToggleStatus = async (id: number, targetStatus: boolean) => {
    const actionText = targetStatus ? 'reactivar' : 'desactivar';
    const confirmed = await confirm(`¿Estás seguro de ${actionText} este usuario?`);
    if (!confirmed) return;

    try {
      await api.put(`/admin/users/${id}/status`, { isActive: targetStatus });
      success(`Usuario ${targetStatus ? 'activado' : 'desactivado'}`);
      loadUsers();
    } catch (err: any) {
      error(err.response?.data?.message || `Error al ${actionText}`);
    }
  };

  return (
    <div className="admin-container animate-fade-in-up">
      <div className="header-section">
        <h1 className="chinese-title">用户管理</h1>
        <h2>Gestión de Usuarios (Admin)</h2>
        <p className="subtitle">Administra los usuarios del sistema, asigna roles y gestiona el estado de activación 🛡️</p>
      </div>

      <div className="actions-bar">
        <button onClick={openCreateModal} className="btn-pastel btn-primary-pastel">
          <i className="fa-solid fa-user-plus"></i> Crear Nuevo Usuario
        </button>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="card-pastel table-card">
        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="user-cell">
                    <img src={getAvatarUrl(u.avatarUrl)} alt="Avatar" className="table-avatar" />
                    <div className="user-info">
                      <span className="user-name">{u.name}</span>
                      <span className="user-username">@{u.username}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge role-${u.role}`}>
                      {u.role?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${u.isActive ? 'active' : 'inactive'}`}>
                      {u.isActive ? '🟢 Activo' : '🔴 Inactivo'}
                    </span>
                  </td>
                  <td>{u.createdAt ? u.createdAt.substring(0, 10) : ''}</td>
                  <td className="actions-cell">
                    <button onClick={() => openEditModal(u)} className="btn-icon btn-edit" title="Editar datos y rol">
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    {u.isActive ? (
                      <button onClick={() => handleToggleStatus(u.id, false)} className="btn-icon btn-delete" title="Desactivar usuario">
                        <i className="fa-solid fa-user-slash"></i>
                      </button>
                    ) : (
                      <button onClick={() => handleToggleStatus(u.id, true)} className="btn-icon btn-activate" title="Reactivar usuario">
                        <i className="fa-solid fa-user-check"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CREAR / EDITAR USUARIO */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card card-pastel" onClick={(e) => e.stopPropagation()}>
            <h3>
              <i className={`fa-solid ${isEditing ? 'fa-user-pen' : 'fa-user-plus'}`}></i>{' '}
              {isEditing ? 'Editar Usuario' : 'Crear Usuario'}
            </h3>

            <form onSubmit={handleSaveUser} className="modal-form">
              <div className="form-group">
                <label htmlFor="modalName">Nombre Completo</label>
                <input
                  type="text"
                  id="modalName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="modalUsername">Nombre de Usuario</label>
                <input
                  type="text"
                  id="modalUsername"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="modalEmail">Correo Electrónico</label>
                <input
                  type="email"
                  id="modalEmail"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="modalRole">Rol del Usuario</label>
                <select
                  id="modalRole"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  required
                  className="form-control"
                >
                  <option value="regular">REGULAR (Gestión de sus propios gastos)</option>
                  <option value="viewer">VIEWER (Solo lectura de gastos compartidos)</option>
                  <option value="admin">ADMIN (Administrador del sistema)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="modalStatus">Estado de la cuenta</label>
                <select
                  id="modalStatus"
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  required
                  className="form-control"
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>

              {!isEditing && (
                <div className="form-group">
                  <label htmlFor="modalPassword">Contraseña Inicial</label>
                  <input
                    type="password"
                    id="modalPassword"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Temporal123!"
                    className="form-control"
                  />
                </div>
              )}

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-pastel btn-secondary-pastel">
                  Cancelar
                </button>
                <button type="submit" className="btn-pastel btn-primary-pastel">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-container { max-width: 1100px; margin: 0 auto; padding: 24px 16px; }
        .header-section { text-align: center; margin-bottom: 24px; }
        .chinese-title { font-size: 2rem; color: var(--accent-red); margin: 0; }
        h2 { font-size: 1.5rem; color: var(--text-dark); }
        .subtitle { font-size: 0.9rem; color: var(--text-muted); }
        .actions-bar { display: flex; justify-content: flex-end; margin-bottom: 16px; }
        .table-card { padding: 16px; }
        .users-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .users-table th, .users-table td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #FFF0F4; }
        .users-table th { color: var(--accent-red); font-weight: 700; background-color: #FFF0F4; }
        .user-cell { display: flex; align-items: center; gap: 10px; }
        .table-avatar { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 2px solid #F4A6C1; }
        .user-info { display: flex; flex-direction: column; }
        .user-name { font-weight: 600; color: var(--text-dark); }
        .user-username { font-size: 0.78rem; color: var(--text-muted); }
        .role-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; }
        .role-admin { background-color: #FFE5A0; color: #7A5200; }
        .role-regular { background-color: #F4A6C1; color: white; }
        .role-viewer { background-color: #A8D8EA; color: #1E4E63; }
        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
        .status-badge.active { background-color: #E8F5E9; color: #2E7D32; }
        .status-badge.inactive { background-color: #FFEBEE; color: #C62828; }
        .actions-cell { display: flex; gap: 8px; }
        .btn-icon { border: none; background: none; font-size: 1rem; cursor: pointer; padding: 6px 8px; border-radius: 8px; transition: all 0.2s ease; }
        .btn-edit { color: #2196F3; }
        .btn-edit:hover { background-color: #E3F2FD; }
        .btn-delete { color: #E53935; }
        .btn-delete:hover { background-color: #FFEBEE; }
        .btn-activate { color: #43A047; }
        .btn-activate:hover { background-color: #E8F5E9; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.45); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
        .modal-card { width: 100%; max-width: 440px; padding: 24px; }
        .modal-form { display: flex; flex-direction: column; gap: 14px; margin-top: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 4px; }
        .form-group label { font-size: 0.85rem; font-weight: 600; }
        .form-control { padding: 10px 12px; border-radius: var(--radius-md); border: 1.5px solid #F4A6C1; background-color: #FFF0F4; font-family: var(--font-body); font-size: 0.9rem; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px; }
        @media (max-width: 600px) {
          .admin-container { padding: 16px 10px; }
          .actions-bar { justify-content: center; }
          .users-table th, .users-table td { padding: 8px; font-size: 0.8rem; }
        }
      `}</style>
    </div>
  );
};
