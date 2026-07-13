import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function TurnoDetallePage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [turno,      setTurno]      = useState(null);
  const [novedades,  setNovedades]  = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [fotoAmpliada, setFotoAmpliada] = useState(null);

  useEffect(() => { cargarDetalle(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const cargarDetalle = async () => {
    try {
      const res = await api.get(`/admin/turnos/${id}/detalle`);
      setTurno(res.data.turno);
      setNovedades(res.data.novedades || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) return <div style={s.cargando}>Cargando detalle...</div>;
  if (!turno)   return <div style={s.cargando}>Turno no encontrado</div>;

  return (
    <div style={s.container}>
      <button onClick={() => navigate('/turnos')} style={s.botonVolver}>
        ← Volver a turnos
      </button>

      <h1 style={s.titulo}>Detalle del Turno</h1>

      {/* Info del turno */}
      <div style={s.card}>
        <div style={s.grid2}>
          <div>
            <div style={s.campo}><span style={s.etiqueta}>Empleado</span><span style={s.valor}>{turno.empleado}</span></div>
            <div style={s.campo}><span style={s.etiqueta}>Sede</span><span style={s.valor}>{turno.sede}</span></div>
            <div style={s.campo}><span style={s.etiqueta}>Estado</span>
              <span style={{
                ...s.badge,
                background: turno.estado === 'completado' ? '#E1F5EE' : '#FFF3CD',
                color:      turno.estado === 'completado' ? '#085041' : '#856404',
              }}>
                {turno.estado === 'completado' ? '✓ Completado' : '● Activo'}
              </span>
            </div>
            <div style={s.campo}><span style={s.etiqueta}>Horas trabajadas</span><span style={s.valor}>{turno.horas_trabajadas}h</span></div>
          </div>
          <div>
            <div style={s.campo}>
              <span style={s.etiqueta}>🟢 Entrada</span>
              <span style={s.valor}>
                {turno.entrada_hora ? new Date(turno.entrada_hora).toLocaleString('es-EC', { timeZone: 'America/Guayaquil' }) : '--'}
              </span>
            </div>
            <div style={s.campo}>
              <span style={s.etiqueta}>🔴 Salida</span>
              <span style={s.valor}>
                {turno.salida_hora ? new Date(turno.salida_hora).toLocaleString('es-EC', { timeZone: 'America/Guayaquil' }) : '--'}
              </span>
            </div>
            {turno.entrada_lat && (
              <div style={s.campo}>
                <span style={s.etiqueta}>📍 Coordenadas entrada</span>
                <span style={{ ...s.valor, fontSize: 12, fontFamily: 'monospace' }}>
                  {parseFloat(turno.entrada_lat).toFixed(6)}, {parseFloat(turno.entrada_lng).toFixed(6)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fotos del turno */}
      <div style={s.card}>
        <h2 style={s.subtitulo}>📸 Fotos de evidencia</h2>
        <div style={s.fotosRow}>
          {turno.entrada_foto ? (
            <div style={s.fotoBox}>
              <div style={s.fotoLabel}>🟢 Entrada</div>
              <img
                src={turno.entrada_foto}
                alt="Entrada"
                style={s.fotoImg}
                onClick={() => setFotoAmpliada(turno.entrada_foto)}
              />
            </div>
          ) : (
            <div style={s.fotoVacia}>🟢 Sin foto de entrada</div>
          )}
          {turno.salida_foto ? (
            <div style={s.fotoBox}>
              <div style={s.fotoLabel}>🔴 Salida</div>
              <img
                src={turno.salida_foto}
                alt="Salida"
                style={s.fotoImg}
                onClick={() => setFotoAmpliada(turno.salida_foto)}
              />
            </div>
          ) : (
            <div style={s.fotoVacia}>🔴 Sin foto de salida</div>
          )}
        </div>
      </div>

      {/* Novedades */}
      <div style={s.card}>
        <h2 style={s.subtitulo}>📝 Novedades del turno</h2>
        {novedades.length === 0 ? (
          <p style={{ color: '#888', fontSize: 14 }}>Sin novedades registradas</p>
        ) : novedades.map((n, i) => (
          <div key={i} style={s.novedadCard}>
            <div style={s.novedadHeader}>
              <span style={s.novedadFecha}>
                {new Date(n.creado_en).toLocaleString('es-EC', { timeZone: 'America/Guayaquil' })}
              </span>
            </div>
            <p style={s.novedadTexto}>{n.descripcion}</p>
            {n.foto && (
              <img
                src={n.foto}
                alt="Novedad"
                style={{ ...s.fotoImg, marginTop: 10 }}
                onClick={() => setFotoAmpliada(n.foto)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Lightbox foto ampliada */}
      {fotoAmpliada && (
        <div
          style={s.lightbox}
          onClick={() => setFotoAmpliada(null)}
        >
          <img
            src={fotoAmpliada}
            alt="Ampliada"
            style={s.fotoAmpliada}
          />
          <button style={s.cerrarLightbox} onClick={() => setFotoAmpliada(null)}>✕</button>
        </div>
      )}
    </div>
  );
}

const s = {
  container:     { padding: 32 },
  cargando:      { padding: 40, textAlign: 'center', color: '#888' },
  botonVolver:   { padding: '8px 16px', background: '#F5F5F5', border: '1px solid #E0E0E0', borderRadius: 8, cursor: 'pointer', fontSize: 14, marginBottom: 20 },
  titulo:        { fontSize: 26, fontWeight: 'bold', color: '#04342C', marginBottom: 20 },
  card:          { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 16 },
  subtitulo:     { fontSize: 16, fontWeight: '600', color: '#04342C', marginBottom: 16 },
  grid2:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  campo:         { marginBottom: 14 },
  etiqueta:      { display: 'block', fontSize: 12, color: '#888', fontWeight: '500', marginBottom: 3 },
  valor:         { fontSize: 15, color: '#222', fontWeight: '500' },
  badge:         { display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: '600' },
  fotosRow:      { display: 'flex', gap: 20, flexWrap: 'wrap' },
  fotoBox:       { display: 'flex', flexDirection: 'column', gap: 8 },
  fotoLabel:     { fontSize: 13, fontWeight: '500', color: '#444' },
  fotoImg:       { width: 200, height: 200, objectFit: 'cover', borderRadius: 10, cursor: 'pointer', border: '1px solid #E0E0E0' },
  fotoVacia:     { width: 200, height: 200, background: '#F5F5F5', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 13, border: '1px dashed #E0E0E0' },
  novedadCard:   { background: '#F9F9F9', borderRadius: 10, padding: 16, marginBottom: 12, borderLeft: '4px solid #185FA5' },
  novedadHeader: { marginBottom: 8 },
  novedadFecha:  { fontSize: 12, color: '#888' },
  novedadTexto:  { fontSize: 14, color: '#333', lineHeight: 1.6, margin: 0 },
  lightbox:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, cursor: 'pointer' },
  fotoAmpliada:  { maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8, objectFit: 'contain' },
  cerrarLightbox:{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 18, cursor: 'pointer' },
};