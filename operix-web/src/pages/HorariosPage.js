import React, { useState, useEffect } from 'react';
import api from '../services/api';

const DIAS_OPTIONS = [
  'lunes a viernes',
  'lunes, martes y jueves',
  'lunes y miercoles',
  'martes y jueves',
  'sabado y domingo',
  'todos los dias',
  'lunes a sabado',
];

export default function HorariosPage() {
  const [horarios,   setHorarios]   = useState([]);
  const [empleados,  setEmpleados]  = useState([]);
  const [sedes,      setSedes]      = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [modal,      setModal]      = useState(false);
  const [editando,   setEditando]   = useState(null);
  const [error,      setError]      = useState('');
  const [guardando,  setGuardando]  = useState(false);
  const [busqueda,   setBusqueda]   = useState('');

  const formVacio = {
    usuario_id: '', sede_id: '',
    hora_entrada: '', hora_salida: '', dias: 'lunes a viernes'
  };
  const [form, setForm] = useState(formVacio);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [hRes, eRes, sRes] = await Promise.all([
        api.get('/admin/horarios'),
        api.get('/admin/empleados'),
        api.get('/admin/sedes'),
      ]);
      setHorarios(hRes.data.horarios || []);
      setEmpleados(eRes.data.empleados || []);
      setSedes(sRes.data.sedes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const abrirNuevo = () => {
    setEditando(null);
    setForm(formVacio);
    setError('');
    setModal(true);
  };

  const abrirEditar = (h) => {
    setEditando(h);
    setForm({
      usuario_id:   h.usuario_id,
      sede_id:      h.sede_id,
      hora_entrada: h.hora_entrada?.slice(0,5) || '',
      hora_salida:  h.hora_salida?.slice(0,5)  || '',
      dias:         h.dias,
    });
    setError('');
    setModal(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      if (editando) {
        await api.put(`/admin/horarios/${editando.id}`, {
          hora_entrada: form.hora_entrada,
          hora_salida:  form.hora_salida,
          dias:         form.dias,
          activo:       true,
        });
      } else {
        await api.post('/admin/horarios', form);
      }
      setModal(false);
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id, empleado, sede) => {
    if (!window.confirm(`¿Eliminar horario de ${empleado} en ${sede}?`)) return;
    try {
      await api.delete(`/admin/horarios/${id}`);
      cargarDatos();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  // Agrupa horarios por empleado
  const porEmpleado = horarios
    .filter(h => h.empleado.toLowerCase().includes(busqueda.toLowerCase()))
    .reduce((acc, h) => {
      if (!acc[h.usuario_id]) {
        acc[h.usuario_id] = { empleado: h.empleado, email: h.email, horarios: [] };
      }
      acc[h.usuario_id].horarios.push(h);
      return acc;
    }, {});

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.titulo}>Horarios</h1>
          <p style={s.sub}>Gestión de horarios por empleado y sede</p>
        </div>
        <button onClick={abrirNuevo} style={s.botonNuevo}>
          + Nuevo horario
        </button>
      </div>

      {/* Buscador */}
      <div style={s.buscadorBox}>
        <input
          style={s.buscador}
          placeholder="🔍 Buscar empleado..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* Lista por empleado */}
      {cargando ? (
        <div style={s.cargando}>Cargando horarios...</div>
      ) : Object.keys(porEmpleado).length === 0 ? (
        <div style={s.vacio}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
          <p style={{ color: '#888' }}>No hay horarios registrados</p>
        </div>
      ) : (
        Object.values(porEmpleado).map((grupo, i) => (
          <div key={i} style={s.grupoCard}>
            {/* Header del empleado */}
            <div style={s.grupoHeader}>
              <div style={s.avatar}>
                {grupo.empleado.charAt(0)}
              </div>
              <div>
                <div style={s.grupoNombre}>{grupo.empleado}</div>
                <div style={s.grupoEmail}>{grupo.email}</div>
              </div>
              <span style={s.badgeSedes}>
                {grupo.horarios.length} sede{grupo.horarios.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Horarios del empleado */}
            <div style={s.horariosGrid}>
              {grupo.horarios.map((h, j) => (
                <div key={j} style={s.horarioCard}>
                  <div style={s.horarioSede}>📍 {h.sede}</div>
                  <div style={s.horarioHoras}>
                    <span style={s.horaTag}>🟢 {h.hora_entrada?.slice(0,5)}</span>
                    <span style={{ color: '#888', fontSize: 13 }}>→</span>
                    <span style={s.horaTag}>🔴 {h.hora_salida?.slice(0,5)}</span>
                  </div>
                  <div style={s.horarioDias}>📆 {h.dias}</div>
                  <div style={s.horarioAcciones}>
                    <button
                      onClick={() => abrirEditar(h)}
                      style={s.botonEditar}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(h.id, h.empleado, h.sede)}
                      style={s.botonEliminar}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Modal */}
      {modal && (
        <div style={s.overlay} onClick={() => setModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h2 style={s.modalTitulo}>
              {editando ? '✏️ Editar horario' : '+ Nuevo horario'}
            </h2>

            <form onSubmit={handleGuardar} style={s.form}>
              {error && <div style={s.error}>{error}</div>}

              {/* Empleado — solo en nuevo */}
              {!editando && (
                <div style={s.campo}>
                  <label style={s.label}>Empleado</label>
                  <select required style={s.input}
                    value={form.usuario_id}
                    onChange={e => setForm({ ...form, usuario_id: e.target.value })}>
                    <option value="">Selecciona un empleado</option>
                    {empleados
                      .filter(e => e.rol === 'empleado')
                      .map(e => (
                        <option key={e.id} value={e.id}>{e.nombre}</option>
                      ))}
                  </select>
                </div>
              )}

              {/* Sede — solo en nuevo */}
              {!editando && (
                <div style={s.campo}>
                  <label style={s.label}>Sede</label>
                  <select required style={s.input}
                    value={form.sede_id}
                    onChange={e => setForm({ ...form, sede_id: e.target.value })}>
                    <option value="">Selecciona una sede</option>
                    {sedes.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
              )}

              {editando && (
                <div style={s.infoEditar}>
                  <strong>{editando.empleado}</strong> — {editando.sede}
                </div>
              )}

              {/* Horas */}
              <div style={s.filaHoras}>
                <div style={s.campo}>
                  <label style={s.label}>🟢 Hora entrada</label>
                  <input required type="time" style={s.input}
                    value={form.hora_entrada}
                    onChange={e => setForm({ ...form, hora_entrada: e.target.value })} />
                </div>
                <div style={s.campo}>
                  <label style={s.label}>🔴 Hora salida</label>
                  <input required type="time" style={s.input}
                    value={form.hora_salida}
                    onChange={e => setForm({ ...form, hora_salida: e.target.value })} />
                </div>
              </div>

              {/* Días */}
              <div style={s.campo}>
                <label style={s.label}>📆 Días de trabajo</label>
                <select style={s.input}
                  value={form.dias}
                  onChange={e => setForm({ ...form, dias: e.target.value })}>
                  {DIAS_OPTIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div style={s.botonesModal}>
                <button type="button" onClick={() => setModal(false)} style={s.botonCancelar}>
                  Cancelar
                </button>
                <button type="submit" style={s.botonGuardar} disabled={guardando}>
                  {guardando ? 'Guardando...' : editando ? 'Actualizar' : 'Crear horario'}
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
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  titulo:       { fontSize: 28, fontWeight: 'bold', color: '#04342C', margin: 0 },
  sub:          { fontSize: 14, color: '#888', marginTop: 4 },
  botonNuevo:   { padding: '10px 20px', background: '#04342C', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: '600', cursor: 'pointer' },
  buscadorBox:  { marginBottom: 20 },
  buscador:     { width: '100%', maxWidth: 400, padding: '10px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, background: '#F5F5F5', outline: 'none' },
  cargando:     { padding: 40, textAlign: 'center', color: '#888' },
  vacio:        { padding: 60, textAlign: 'center' },
  grupoCard:    { background: '#fff', borderRadius: 12, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' },
  grupoHeader:  { display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: '#F9F9F9', borderBottom: '1px solid #F0F0F0' },
  avatar:       { width: 44, height: 44, borderRadius: '50%', background: '#04342C', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 'bold', flexShrink: 0 },
  grupoNombre:  { fontSize: 15, fontWeight: '600', color: '#222' },
  grupoEmail:   { fontSize: 12, color: '#888', marginTop: 2 },
  badgeSedes:   { marginLeft: 'auto', background: '#E1F5EE', color: '#085041', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: '600' },
  horariosGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, padding: 16 },
  horarioCard:  { background: '#F9FFFE', border: '1px solid #E1F5EE', borderRadius: 10, padding: 14 },
  horarioSede:  { fontSize: 13, fontWeight: '600', color: '#04342C', marginBottom: 10 },
  horarioHoras: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  horaTag:      { fontSize: 13, fontWeight: '500', color: '#333' },
  horarioDias:  { fontSize: 12, color: '#666', marginBottom: 12, textTransform: 'capitalize' },
  horarioAcciones: { display: 'flex', gap: 8 },
  botonEditar:  { flex: 1, padding: '6px 10px', background: '#E6F1FB', color: '#0C447C', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: '500' },
  botonEliminar:{ flex: 1, padding: '6px 10px', background: '#FCEBEB', color: '#A32D2D', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: '500' },
  overlay:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:        { background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' },
  modalTitulo:  { fontSize: 20, fontWeight: 'bold', color: '#04342C', marginBottom: 20 },
  form:         { display: 'flex', flexDirection: 'column', gap: 16 },
  error:        { background: '#FCEBEB', color: '#A32D2D', padding: '10px 14px', borderRadius: 8, fontSize: 13 },
  infoEditar:   { background: '#E1F5EE', color: '#04342C', padding: '10px 14px', borderRadius: 8, fontSize: 14 },
  filaHoras:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  campo:        { display: 'flex', flexDirection: 'column', gap: 6 },
  label:        { fontSize: 13, fontWeight: '500', color: '#444' },
  input:        { padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, background: '#F5F5F5' },
  botonesModal: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 },
  botonCancelar:{ padding: '10px 20px', background: '#F5F5F5', color: '#444', border: '1px solid #E0E0E0', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  botonGuardar: { padding: '10px 20px', background: '#04342C', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: '600' },
};