import React, { useState, useEffect } from 'react';
import { getTurnosActivos, cerrarTurno } from '../services/api';

export default function TurnosActivosPage() {
  const [turnos,   setTurnos]   = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cerrando, setCerrando] = useState(null);

  useEffect(() => {
    cargar();
    // Refresca cada 30 segundos
    const interval = setInterval(cargar, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargar = async () => {
    try {
      const data = await getTurnosActivos();
      setTurnos(data.turnos || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleCerrar = async (turno) => {
    if (!window.confirm(
      `¿Cerrar turno de ${turno.empleado} en ${turno.sede}?\n` +
      `Lleva ${turno.horas_activo} horas activo.`
    )) return;

    setCerrando(turno.id);
    try {
      const data = await cerrarTurno(turno.id);
      alert(`✅ ${data.mensaje}`);
      cargar();
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setCerrando(null);
    }
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div>
          <h1 style={s.titulo}>Turnos Activos</h1>
          <p style={s.sub}>
            {turnos.length === 0
              ? 'No hay turnos activos en este momento'
              : `${turnos.length} turno${turnos.length > 1 ? 's' : ''} en curso`}
          </p>
        </div>
        <button onClick={cargar} style={s.botonRefresh}>
          🔃 Actualizar
        </button>
      </div>

      {cargando ? (
        <div style={s.cargando}>Cargando turnos activos...</div>
      ) : turnos.length === 0 ? (
        <div style={s.vacio}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <p style={{ color: '#888' }}>Todos los turnos están cerrados</p>
        </div>
      ) : (
        <div style={s.tablaBox}>
          <table style={s.t}>
            <thead>
              <tr style={s.trHead}>
                <th style={s.th}>Empleado</th>
                <th style={s.th}>Email</th>
                <th style={s.th}>Sede</th>
                <th style={s.th}>Entrada</th>
                <th style={s.th}>Tiempo activo</th>
                <th style={s.th}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {turnos.map((t, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F0F0F0' }}>
                  <td style={s.td}><strong>{t.empleado}</strong></td>
                  <td style={{ ...s.td, color: '#888', fontSize: 13 }}>{t.email}</td>
                  <td style={s.td}>{t.sede}</td>
                  <td style={s.td}>
                    {new Date(t.entrada_hora).toLocaleTimeString('es-EC', {
                      hour: '2-digit', minute: '2-digit',
                      timeZone: 'America/Guayaquil'
                    })}
                    <br/>
                    <span style={{ fontSize: 11, color: '#888' }}>
                      {new Date(t.entrada_hora).toLocaleDateString('es-EC', {
                        timeZone: 'America/Guayaquil'
                      })}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span style={{
                      color: t.horas_activo > 10 ? '#E24B4A' :
                             t.horas_activo > 8  ? '#BA7517' : '#1D9E75',
                      fontWeight: '600'
                    }}>
                      {t.horas_activo}h
                    </span>
                    {t.horas_activo > 10 && (
                      <span style={{ marginLeft: 6, fontSize: 12 }}>⚠️</span>
                    )}
                  </td>
                  <td style={s.td}>
                    <button
                      onClick={() => handleCerrar(t)}
                      disabled={cerrando === t.id}
                      style={{
                        ...s.botonCerrar,
                        opacity: cerrando === t.id ? 0.6 : 1
                      }}
                    >
                      {cerrando === t.id ? 'Cerrando...' : '⏹ Cerrar turno'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={s.nota}>
        ⚠️ El cierre manual registra la hora actual como hora de salida.
        Úsalo solo cuando el empleado olvidó cerrar su turno.
        Se refresca automáticamente cada 30 segundos.
      </div>
    </div>
  );
}

const s = {
  container:  { padding: 32 },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  titulo:     { fontSize: 28, fontWeight: 'bold', color: '#04342C', margin: 0 },
  sub:        { fontSize: 14, color: '#888', marginTop: 4 },
  botonRefresh:{ padding: '10px 20px', background: '#F5F5F5', color: '#444', border: '1px solid #E0E0E0', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  cargando:   { padding: 40, textAlign: 'center', color: '#888' },
  vacio:      { padding: 60, textAlign: 'center' },
  tablaBox:   { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflowX: 'auto', marginBottom: 16 },
  t:          { width: '100%', borderCollapse: 'collapse' },
  trHead:     { background: '#F9F9F9' },
  th:         { padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' },
  td:         { padding: '14px 16px', fontSize: 14, color: '#222' },
  botonCerrar:{ padding: '8px 14px', background: '#E24B4A', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: '600' },
  nota:       { background: '#FFF3CD', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#633806', borderLeft: '4px solid #BA7517' },
};