import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function SedesPage() {
  const [sedes,    setSedes]    = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState({ nombre:'', direccion:'', latitud:'', longitud:'', radio_metros:100 });
  const [error,    setError]    = useState('');
  const [guardando,setGuardando]= useState(false);

  useEffect(() => { cargarSedes(); }, []);

  const cargarSedes = async () => {
    try {
      const res = await api.get('/admin/sedes');
      setSedes(res.data.sedes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await api.post('/admin/sedes', form);
      setModal(false);
      setForm({ nombre:'', direccion:'', latitud:'', longitud:'', radio_metros:100 });
      cargarSedes();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear sede');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div>
          <h1 style={s.titulo}>Sedes</h1>
          <p style={s.sub}>Gestión de sedes y puntos de trabajo</p>
        </div>
        <button onClick={() => setModal(true)} style={s.botonNuevo}>
          + Nueva sede
        </button>
      </div>

      <div style={s.grid}>
        {cargando ? (
          <div style={s.cargando}>Cargando sedes...</div>
        ) : sedes.length === 0 ? (
          <div style={s.vacio}>No hay sedes registradas</div>
        ) : sedes.map((sede, i) => (
          <div key={i} style={s.card}>
            <div style={s.cardIcono}>📍</div>
            <div style={s.cardInfo}>
              <div style={s.cardNombre}>{sede.nombre}</div>
              <div style={s.cardDir}>{sede.direccion || 'Sin dirección'}</div>
              <div style={s.cardCoord}>
                {sede.latitud && sede.longitud
                  ? `${parseFloat(sede.latitud).toFixed(6)}, ${parseFloat(sede.longitud).toFixed(6)}`
                  : 'Sin coordenadas'}
              </div>
              <div style={s.cardRadio}>Radio: {sede.radio_metros}m</div>
            </div>
            <span style={{
              ...s.badge,
              background: sede.activa ? '#E1F5EE' : '#FCEBEB',
              color:      sede.activa ? '#085041' : '#A32D2D',
            }}>
              {sede.activa ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        ))}
      </div>

      {modal && (
        <div style={s.overlay} onClick={() => setModal(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h2 style={s.modalTitulo}>Nueva sede</h2>
            <form onSubmit={handleGuardar} style={s.form}>
              {error && <div style={s.error}>{error}</div>}
              <div style={s.campo}>
                <label style={s.label}>Nombre de la sede</label>
                <input required style={s.input} value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Edificio Corporativo Norte" />
              </div>
              <div style={s.campo}>
                <label style={s.label}>Dirección</label>
                <input style={s.input} value={form.direccion}
                  onChange={e => setForm({ ...form, direccion: e.target.value })}
                  placeholder="Ej: Av. República del Salvador N36-84" />
              </div>
              <div style={s.row}>
                <div style={s.campo}>
                  <label style={s.label}>Latitud</label>
                  <input required style={s.input} value={form.latitud} type="number" step="any"
                    onChange={e => setForm({ ...form, latitud: e.target.value })}
                    placeholder="-0.180000" />
                </div>
                <div style={s.campo}>
                  <label style={s.label}>Longitud</label>
                  <input required style={s.input} value={form.longitud} type="number" step="any"
                    onChange={e => setForm({ ...form, longitud: e.target.value })}
                    placeholder="-78.480000" />
                </div>
              </div>
              <div style={s.campo}>
                <label style={s.label}>Radio de validación (metros)</label>
                <input style={s.input} value={form.radio_metros} type="number" min="50" max="1000"
                  onChange={e => setForm({ ...form, radio_metros: e.target.value })} />
              </div>
              <div style={s.botonesModal}>
                <button type="button" onClick={() => setModal(false)} style={s.botonCancelar}>Cancelar</button>
                <button type="submit" style={s.botonGuardar} disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Crear sede'}
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
  container: { padding:32 },
  header:    { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 },
  titulo:    { fontSize:28, fontWeight:'bold', color:'#04342C', margin:0 },
  sub:       { fontSize:14, color:'#888', marginTop:4 },
  botonNuevo:{ padding:'10px 20px', background:'#04342C', color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:'600', cursor:'pointer' },
  grid:      { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 },
  cargando:  { padding:40, textAlign:'center', color:'#888', gridColumn:'1/-1' },
  vacio:     { padding:40, textAlign:'center', color:'#888', gridColumn:'1/-1' },
  card:      { background:'#fff', borderRadius:12, padding:20, display:'flex', alignItems:'flex-start', gap:16, boxShadow:'0 1px 4px rgba(0,0,0,0.08)' },
  cardIcono: { fontSize:28, flexShrink:0 },
  cardInfo:  { flex:1 },
  cardNombre:{ fontSize:16, fontWeight:'600', color:'#222', marginBottom:4 },
  cardDir:   { fontSize:13, color:'#666', marginBottom:4 },
  cardCoord: { fontSize:12, color:'#888', fontFamily:'monospace', marginBottom:4 },
  cardRadio: { fontSize:12, color:'#888' },
  badge:     { padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:'600', flexShrink:0 },
  overlay:   { position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 },
  modal:     { background:'#fff', borderRadius:16, padding:32, width:'100%', maxWidth:480, boxShadow:'0 20px 60px rgba(0,0,0,0.3)', maxHeight:'90vh', overflowY:'auto' },
  modalTitulo:{ fontSize:22, fontWeight:'bold', color:'#04342C', marginBottom:24 },
  form:      { display:'flex', flexDirection:'column', gap:16 },
  error:     { background:'#FCEBEB', color:'#A32D2D', padding:'10px 14px', borderRadius:8, fontSize:13 },
  row:       { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 },
  campo:     { display:'flex', flexDirection:'column', gap:6 },
  label:     { fontSize:13, fontWeight:'500', color:'#444' },
  input:     { padding:'10px 14px', border:'1px solid #E0E0E0', borderRadius:8, fontSize:14, background:'#F5F5F5' },
  botonesModal:{ display:'flex', gap:12, justifyContent:'flex-end', marginTop:8 },
  botonCancelar:{ padding:'10px 20px', background:'#F5F5F5', color:'#444', border:'1px solid #E0E0E0', borderRadius:8, cursor:'pointer', fontSize:14 },
  botonGuardar: { padding:'10px 20px', background:'#04342C', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:14, fontWeight:'600' },
};