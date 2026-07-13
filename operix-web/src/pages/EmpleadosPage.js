import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [modal,     setModal]     = useState(false);
  const [form,      setForm]      = useState({ nombre:'', email:'', password:'', rol:'empleado' });
  const [error,     setError]     = useState('');
  const [guardando, setGuardando] = useState(false);

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
      cargarEmpleados();
      setModal(false);
setForm({ nombre:'', email:'', password:'', rol:'empleado' });
cargarEmpleados();
// Pregunta si quiere agregar horario
if (window.confirm('¿Deseas agregar el horario del nuevo empleado ahora?')) {
  window.location.href = '/horarios';
}
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear empleado');
    } finally {
      setGuardando(false);
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
          <p style={s.sub}>Gestión del personal registrado</p>
        </div>
        <button onClick={() => setModal(true)} style={s.botonNuevo}>
          + Nuevo empleado
        </button>
      </div>

      {/* Lista */}
      <div style={s.grid}>
        {cargando ? (
          <div style={s.cargando}>Cargando empleados...</div>
        ) : empleados.length === 0 ? (
          <div style={s.vacio}>No hay empleados registrados</div>
        ) : empleados.map((emp, i) => (
<div key={i} style={s.card}>

  <div style={{ position: 'relative', flexShrink: 0 }}>
    {emp.foto_perfil ? (
      <img
        src={emp.foto_perfil}
        alt={emp.nombre}
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid #04342C'
        }}
      />
    ) : (
      <div style={s.cardAvatar}>
        {emp.nombre?.charAt(0) || '?'}
      </div>
    )}

    <label
      style={{
        position: 'absolute',
        bottom: -4,
        right: -4,
        background: '#04342C',
        borderRadius: '50%',
        width: 22,
        height: 22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: 11,
        color: '#fff'
      }}
      title="Cambiar foto"
    >
      📷
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleSubirFoto(emp.id, e)}
      />
    </label>
  </div>

  <div style={s.cardInfo}>
    ...
  </div>

  <div style={s.cardAcciones}>
    ...
  </div>

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
                <input required style={s.input} value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: María González" />
              </div>
              <div style={s.campo}>
                <label style={s.label}>Correo electrónico</label>
                <input required type="email" style={s.input} value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="maria@correo.com" />
              </div>
              <div style={s.campo}>
                <label style={s.label}>Contraseña inicial</label>
                <input required type="password" style={s.input} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres" minLength={6} />
              </div>
              <div style={s.campo}>
                <label style={s.label}>Rol</label>
                <select style={s.input} value={form.rol}
                  onChange={e => setForm({ ...form, rol: e.target.value })}>
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
    </div>
  );
}

const s = {
  container:    { padding: 32 },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  titulo:       { fontSize: 28, fontWeight: 'bold', color: '#04342C', margin: 0 },
  sub:          { fontSize: 14, color: '#888', marginTop: 4 },
  botonNuevo:   { padding: '10px 20px', background: '#04342C', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: '600', cursor: 'pointer' },
  grid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 },
  cargando:     { padding: 40, textAlign: 'center', color: '#888', gridColumn: '1/-1' },
  vacio:        { padding: 40, textAlign: 'center', color: '#888', gridColumn: '1/-1' },
  card:         {
    background: '#fff', borderRadius: 12, padding: 20,
    display: 'flex', alignItems: 'center', gap: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    position: 'relative',
  },
  cardAvatar:   {
    width: 48, height: 48, borderRadius: '50%',
    background: '#04342C', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, fontWeight: 'bold', flexShrink: 0,
  },
  cardInfo:     { flex: 1 },
  cardNombre:   { fontSize: 15, fontWeight: '600', color: '#222' },
  cardEmail:    { fontSize: 13, color: '#888', marginTop: 2, marginBottom: 6 },
  badge:        { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: '600' },
  cardAcciones: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  statusDot:    { width: 10, height: 10, borderRadius: '50%' },
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