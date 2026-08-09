import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [modal,     setModal]     = useState(false);
  const [form,      setForm]      = useState({ nombre:'', email:'', password:'', rol:'empleado' });
  const [error,     setError]     = useState('');
  const [guardando, setGuardando] = useState(false);

  const [modalEditar,  setModalEditar]  = useState(false);
  const [empEditando,  setEmpEditando]  = useState(null);
  const [formEditar,   setFormEditar]   = useState({ nombre:'', email:'', rol:'empleado' });
  const [errorEditar,  setErrorEditar]  = useState('');
  const [guardandoEditar, setGuardandoEditar] = useState(false);

  useEffect(() => { cargarEmpleados(); }, []);

  const cargarEmpleados = async () => {
    try {
      const res = await api.get('/admin/empleados');
      setEmpleados(res.data.empleados || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleSubirFoto = async (empId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('foto', file);
    try {
      await api.post(`/admin/empleados/${empId}/foto`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      cargarEmpleados();
    } catch (err) {
      alert('Error al subir foto');
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await api.post('/admin/empleados', form);
      setModal(false);
      setForm({ nombre:'', email:'', password:'', rol:'empleado' });
      cargarEmpleados();
      if (window.confirm('¿Deseas agregar el horario del nuevo empleado ahora?')) {
        window.location.href = '/horarios';
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear empleado');
    } finally {
      setGuardando(false);
    }
  };

  const handleAbrirEditar = (emp) => {
    setEmpEditando(emp);
    setFormEditar({ nombre: emp.nombre, email: emp.email, rol: emp.rol });
    setErrorEditar('');
    setModalEditar(true);
  };

  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    setErrorEditar('');
    setGuardandoEditar(true);
    try {
      await api.put(`/admin/empleados/${empEditando.id}`, formEditar);
      setModalEditar(false);
      cargarEmpleados();
    } catch (err) {
      setErrorEditar(err.response?.data?.error || 'Error al actualizar empleado');
    } finally {
      setGuardandoEditar(false);
    }
  };

  const handleToggleEstado = async (emp) => {
    if (!window.confirm(
      `¿${emp.activo ? 'Desactivar' : 'Activar'} a ${emp.nombre}?`
    )) return;
    try {
      await api.put(`/admin/empleados/${emp.id}/estado`, { activo: !emp.activo });
      cargarEmpleados();
    } catch (err) {
      alert('Error al cambiar estado del empleado');
    }
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div>
          <h1 style={s.titulo}>Empleados</h1>
          <p style={s.sub}>Gestión del personal registrado — {empleados.length} registrados</p>
        </div>
        <button onClick={() => setModal(true)} style={s.botonNuevo}>
          + Nuevo empleado
        </button>
      </div>

      <div style={s.grid}>
        {cargando ? (
          <div style={s.cargando}>Cargando empleados...</div>
        ) : empleados.length === 0 ? (
          <div style={s.vacio}>No hay empleados registrados</div>
        ) : empleados.map((emp, i) => (
          <div key={i} style={s.card}>

            {/* Foto de perfil */}
            <div style={s.avatarWrapper}>
              {emp.foto_perfil ? (
                <img
                  src={emp.foto_perfil}
                  alt={emp.nombre}
                  style={s.avatarImg}
                />
              ) : (
                <div style={s.avatarLetra}>
                  {emp.nombre?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}

              {/* Botón para subir foto */}
              <label style={s.botonFoto} title="Subir foto de perfil">
                📷
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => handleSubirFoto(emp.id, e)}
                />
              </label>
            </div>

            {/* Info del empleado */}
            <div style={s.cardInfo}>
              <div style={s.cardNombre}>{emp.nombre}</div>
              <div style={s.cardEmail}>{emp.email}</div>
              <div style={s.cardFooter}>
                <span style={{
                  ...s.badge,
                  background: emp.rol === 'admin' ? '#E6F1FB' : '#E1F5EE',
                  color:      emp.rol === 'admin' ? '#0C447C' : '#085041',
                }}>
                  {emp.rol}
                </span>
                <span style={{
                  ...s.badge,
                  background: emp.activo ? '#E1F5EE' : '#FCEBEB',
                  color:      emp.activo ? '#085041' : '#A32D2D',
                }}>
                  {emp.activo ? '● Activo' : '○ Inactivo'}
                </span>
              </div>
            </div>

            {/* Botón editar */}
            <button
              onClick={() => handleAbrirEditar(emp)}
              style={s.botonEditar}
              title="Editar datos del empleado"
            >
              ✏️
            </button>

            {/* Botón toggle estado */}
            <button
              onClick={() => handleToggleEstado(emp)}
              style={{
                ...s.botonToggle,
                background: emp.activo ? '#FCEBEB' : '#E1F5EE',
                color:      emp.activo ? '#A32D2D' : '#085041',
              }}
            >
              {emp.activo ? 'Desactivar' : 'Activar'}
            </button>

          </div>
        ))}
      </div>

      {/* Modal nuevo empleado */}
      {modal && (
        <div style={s.overlay} onClick={() => setModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h2 style={s.modalTitulo}>Nuevo empleado</h2>
            <form onSubmit={handleGuardar} style={s.form}>
              {error && <div style={s.error}>{error}</div>}
              <div style={s.campo}>
                <label style={s.label}>Nombre completo</label>
                <input
                  required style={s.input} value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: María González"
                />
              </div>
              <div style={s.campo}>
                <label style={s.label}>Correo electrónico</label>
                <input
                  required type="email" style={s.input} value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="maria@correo.com"
                />
              </div>
              <div style={s.campo}>
                <label style={s.label}>Contraseña inicial</label>
                <input
                  required type="password" style={s.input} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres" minLength={6}
                />
              </div>
              <div style={s.campo}>
                <label style={s.label}>Rol</label>
                <select
                  style={s.input} value={form.rol}
                  onChange={e => setForm({ ...form, rol: e.target.value })}
                >
                  <option value="empleado">Empleado</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div style={s.botonesModal}>
                <button type="button" onClick={() => setModal(false)} style={s.botonCancelar}>
                  Cancelar
                </button>
                <button type="submit" style={s.botonGuardar} disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Crear empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal editar empleado */}
      {modalEditar && (
        <div style={s.overlay} onClick={() => setModalEditar(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h2 style={s.modalTitulo}>Editar empleado</h2>
            <form onSubmit={handleGuardarEdicion} style={s.form}>
              {errorEditar && <div style={s.error}>{errorEditar}</div>}
              <div style={s.campo}>
                <label style={s.label}>Nombre completo</label>
                <input
                  required style={s.input} value={formEditar.nombre}
                  onChange={e => setFormEditar({ ...formEditar, nombre: e.target.value })}
                />
              </div>
              <div style={s.campo}>
                <label style={s.label}>Correo electrónico</label>
                <input
                  required type="email" style={s.input} value={formEditar.email}
                  onChange={e => setFormEditar({ ...formEditar, email: e.target.value })}
                />
              </div>
              <div style={s.campo}>
                <label style={s.label}>Rol</label>
                <select
                  style={s.input} value={formEditar.rol}
                  onChange={e => setFormEditar({ ...formEditar, rol: e.target.value })}
                >
                  <option value="empleado">Empleado</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div style={s.botonesModal}>
                <button type="button" onClick={() => setModalEditar(false)} style={s.botonCancelar}>
                  Cancelar
                </button>
                <button type="submit" style={s.botonGuardar} disabled={guardandoEditar}>
                  {guardandoEditar ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  container:   { padding: 32 },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  titulo:      { fontSize: 28, fontWeight: 'bold', color: '#04342C', margin: 0 },
  sub:         { fontSize: 14, color: '#888', marginTop: 4 },
  botonNuevo:  { padding: '10px 20px', background: '#04342C', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: '600', cursor: 'pointer' },

  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 },
  cargando:    { padding: 40, textAlign: 'center', color: '#888', gridColumn: '1/-1' },
  vacio:       { padding: 40, textAlign: 'center', color: '#888', gridColumn: '1/-1' },

  card:        {
    background: '#fff', borderRadius: 12,
    padding: '16px 20px',
    display: 'flex', alignItems: 'center', gap: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    overflow: 'visible',
    minWidth: 0,
  },

  // Avatar
  avatarWrapper: {
    position: 'relative', flexShrink: 0,
    width: 64, height: 64,
  },
  avatarImg:   {
    width: 64, height: 64, borderRadius: '50%',
    objectFit: 'cover', border: '3px solid #04342C',
    display: 'block',
  },
  avatarLetra: {
    width: 64, height: 64, borderRadius: '50%',
    background: '#04342C', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 24, fontWeight: 'bold',
  },
  botonFoto:   {
    position: 'absolute', bottom: -2, right: -2,
    width: 24, height: 24, borderRadius: '50%',
    background: '#1D9E75', border: '2px solid #fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: 12, zIndex: 10,
  },

  // Info
  cardInfo:    { flex: 1, minWidth: 0 },
  cardNombre:  { fontSize: 14, fontWeight: '700', color: '#222', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  cardEmail:   { fontSize: 12, color: '#888', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  cardFooter:  { display: 'flex', gap: 6, flexWrap: 'wrap' },
  badge:       { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: '600' },

  // Botón editar
  botonEditar: {
    width: 34, height: 34, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#F5F5F5', border: '1px solid #E0E0E0', borderRadius: 8,
    cursor: 'pointer', fontSize: 14, alignSelf: 'center',
  },

  // Botón toggle
  botonToggle: {
    padding: '7px 14px', fontSize: 12, fontWeight: '600',
    border: 'none', borderRadius: 8, cursor: 'pointer',
    flexShrink: 0, whiteSpace: 'nowrap',
    alignSelf: 'center', 
  },

  // Modal
  overlay:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:        { background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalTitulo:  { fontSize: 22, fontWeight: 'bold', color: '#04342C', marginBottom: 24 },
  form:         { display: 'flex', flexDirection: 'column', gap: 16 },
  error:        { background: '#FCEBEB', color: '#A32D2D', padding: '10px 14px', borderRadius: 8, fontSize: 13 },
  campo:        { display: 'flex', flexDirection: 'column', gap: 6 },
  label:        { fontSize: 13, fontWeight: '500', color: '#444' },
  input:        { padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, background: '#F5F5F5' },
  botonesModal: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 },
  botonCancelar:{ padding: '10px 20px', background: '#F5F5F5', color: '#444', border: '1px solid #E0E0E0', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  botonGuardar: { padding: '10px 20px', background: '#04342C', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: '600' },
};