import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../services/api';

export default function DashboardPage() {
  const [resumen,  setResumen]  = useState(null);
  const [turnos,   setTurnos]   = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resumenRes, turnosRes] = await Promise.all([
        api.get('/admin/resumen'),
        api.get('/admin/turnos', { params: { limite: 10 } })
      ]);
      setResumen(resumenRes.data);
      setTurnos(turnosRes.data.turnos || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) return <div style={s.cargando}>Cargando dashboard...</div>;

  const tarjetas = [
    { titulo:'Turnos hoy',       valor: resumen?.turnos_hoy      || 0, color:'#1D9E75', icono:'🕐' },
    { titulo:'Activos ahora',    valor: resumen?.turnos_activos  || 0, color:'#185FA5', icono:'🟢' },
    { titulo:'Empleados',        valor: resumen?.total_empleados || 0, color:'#533AB7', icono:'👥' },
    { titulo:'Sedes activas',    valor: resumen?.total_sedes     || 0, color:'#BA7517', icono:'📍' },
  ];

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h1 style={s.titulo}>Dashboard</h1>
        <p style={s.fecha}>
          {new Date().toLocaleDateString('es-EC', {
            weekday:'long', day:'numeric', month:'long', year:'numeric'
          })}
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div style={s.grid4}>
        {tarjetas.map((t, i) => (
          <div key={i} style={{ ...s.tarjeta, borderTopColor: t.color }}>
            <div style={s.tarjetaIcono}>{t.icono}</div>
            <div style={{ ...s.tarjetaValor, color: t.color }}>{t.valor}</div>
            <div style={s.tarjetaTitulo}>{t.titulo}</div>
          </div>
        ))}
      </div>

      {/* Turnos recientes */}
      <div style={s.seccion}>
        <h2 style={s.seccionTitulo}>Turnos recientes</h2>
        <div style={s.tabla}>
          <table style={s.t}>
            <thead>
              <tr style={s.tr}>
                <th style={s.th}>Empleado</th>
                <th style={s.th}>Sede</th>
                <th style={s.th}>Entrada</th>
                <th style={s.th}>Salida</th>
                <th style={s.th}>Horas</th>
                <th style={s.th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {turnos.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign:'center', padding:24, color:'#888' }}>
                    No hay turnos registrados
                  </td>
                </tr>
              ) : turnos.map((turno, i) => (
                <tr key={i} style={{ borderBottom:'1px solid #F0F0F0' }}>
                  <td style={s.td}>{turno.empleado}</td>
                  <td style={s.td}>{turno.sede}</td>
                  <td style={s.td}>
                    {turno.entrada_hora
                      ? new Date(turno.entrada_hora).toLocaleTimeString('es-EC', { hour:'2-digit', minute:'2-digit' })
                      : '--'}
                  </td>
                  <td style={s.td}>
                    {turno.salida_hora
                      ? new Date(turno.salida_hora).toLocaleTimeString('es-EC', { hour:'2-digit', minute:'2-digit' })
                      : '--'}
                  </td>
                  <td style={s.td}>{turno.horas_trabajadas ? `${turno.horas_trabajadas}h` : '-'}</td>
                  <td style={s.td}>
                    <span style={{
                      ...s.badge,
                      background: turno.estado === 'completado' ? '#E1F5EE' : '#FFF3CD',
                      color:      turno.estado === 'completado' ? '#085041' : '#856404',
                    }}>
                      {turno.estado === 'completado' ? '✓ Completado' : '● Activo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const s = {
  cargando:  { padding:40, textAlign:'center', color:'#888' },
  container: { padding:32 },
  header:    { marginBottom:32 },
  titulo:    { fontSize:28, fontWeight:'bold', color:'#04342C', margin:0 },
  fecha:     { fontSize:14, color:'#888', marginTop:4, textTransform:'capitalize' },
  grid4:     { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))', gap:16, marginBottom:32 },
  tarjeta:   {
    background:'#fff', borderRadius:12,
    padding:20, borderTop:'4px solid',
    boxShadow:'0 1px 4px rgba(0,0,0,0.08)',
  },
  tarjetaIcono: { fontSize:28, marginBottom:8 },
  tarjetaValor: { fontSize:36, fontWeight:'bold' },
  tarjetaTitulo:{ fontSize:13, color:'#888', marginTop:4 },
  seccion:   { background:'#fff', borderRadius:12, padding:24, boxShadow:'0 1px 4px rgba(0,0,0,0.08)' },
  seccionTitulo: { fontSize:18, fontWeight:'600', color:'#04342C', marginBottom:16 },
  tabla:     { overflowX:'auto' },
  t:         { width:'100%', borderCollapse:'collapse' },
  tr:        { background:'#F9F9F9' },
  th:        { padding:'10px 14px', textAlign:'left', fontSize:12, color:'#888', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.05em' },
  td:        { padding:'12px 14px', fontSize:14, color:'#222' },
  badge:     { padding:'4px 10px', borderRadius:20, fontSize:12, fontWeight:'600' },
};