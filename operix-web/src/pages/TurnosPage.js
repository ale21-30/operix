import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import api from '../services/api';

export default function TurnosPage() {
  const [turnos,    setTurnos]    = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [filtros,   setFiltros]   = useState({ fecha: '', empleado_id: '' });
  const [empleados, setEmpleados] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [turnosRes, empRes] = await Promise.all([
        api.get('/admin/turnos'),
        api.get('/admin/empleados')
      ]);
      setTurnos(turnosRes.data.turnos   || []);
      setEmpleados(empRes.data.empleados || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = async () => {
    setCargando(true);
    try {
      const res = await api.get('/admin/turnos', { params: filtros });
      setTurnos(res.data.turnos || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const exportarExcel = () => {
    const datos = turnos.map(t => ({
      'Empleado':   t.empleado,
      'Sede':       t.sede,
      'Fecha':      t.entrada_hora ? new Date(t.entrada_hora).toLocaleDateString('es-EC') : '',
      'Entrada':    t.entrada_hora ? new Date(t.entrada_hora).toLocaleTimeString('es-EC') : '',
      'Salida':     t.salida_hora  ? new Date(t.salida_hora).toLocaleTimeString('es-EC')  : '',
      'Horas':      t.horas_trabajadas || 0,
      'Estado':     t.estado,
    }));

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Turnos');

    // Estilo del header
    const rango = XLSX.utils.decode_range(ws['!ref']);
    for (let C = rango.s.c; C <= rango.e.c; C++) {
      const celda = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[celda]) continue;
      ws[celda].s = { font: { bold: true }, fill: { fgColor: { rgb: '04342C' } } };
    }

    const buffer = XLSX.write(wb, { bookType:'xlsx', type:'array' });
    saveAs(new Blob([buffer]), `Turnos_Operix_${new Date().toLocaleDateString('es-EC').replace(/\//g,'-')}.xlsx`);
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div>
          <h1 style={s.titulo}>Turnos</h1>
          <p style={s.sub}>Historial completo de turnos registrados</p>
        </div>
        <button onClick={exportarExcel} style={s.botonExcel}>
          📥 Exportar Excel
        </button>
      </div>

      {/* Filtros */}
      <div style={s.filtrosBox}>
        <div style={s.filtrosRow}>
          <div style={s.campo}>
            <label style={s.label}>Fecha</label>
            <input
              type="date"
              value={filtros.fecha}
              onChange={e => setFiltros({ ...filtros, fecha: e.target.value })}
              style={s.input}
            />
          </div>
          <div style={s.campo}>
            <label style={s.label}>Empleado</label>
            <select
              value={filtros.empleado_id}
              onChange={e => setFiltros({ ...filtros, empleado_id: e.target.value })}
              style={s.input}
            >
              <option value="">Todos</option>
              {empleados.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nombre}</option>
              ))}
            </select>
          </div>
          <button onClick={aplicarFiltros} style={s.botonFiltrar}>
            🔍 Filtrar
          </button>
          <button onClick={() => { setFiltros({ fecha:'', empleado_id:'' }); cargarDatos(); }} style={s.botonLimpiar}>
            ✕ Limpiar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div style={s.tablaBox}>
        {cargando ? (
          <div style={s.cargando}>Cargando turnos...</div>
        ) : (
          <table style={s.t}>
            <thead>
              <tr style={s.trHead}>
                <th style={s.th}>Empleado</th>
                <th style={s.th}>Sede</th>
                <th style={s.th}>Fecha</th>
                <th style={s.th}>Entrada</th>
                <th style={s.th}>Salida</th>
                <th style={s.th}>Horas</th>
                <th style={s.th}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {turnos.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign:'center', padding:32, color:'#888' }}>
                    No hay turnos con esos filtros
                  </td>
                </tr>
              ) : turnos.map((t, i) => (
                <tr key={i} style={{ borderBottom:'1px solid #F0F0F0' }}>
                  <td style={s.td}><strong>{t.empleado}</strong></td>
                  <td style={s.td}>{t.sede}</td>
                  <td style={s.td}>
                    {t.entrada_hora ? new Date(t.entrada_hora).toLocaleDateString('es-EC') : '--'}
                  </td>
                  <td style={s.td}>
                    {t.entrada_hora ? new Date(t.entrada_hora).toLocaleTimeString('es-EC', { hour:'2-digit', minute:'2-digit' }) : '--'}
                  </td>
                  <td style={s.td}>
                    {t.salida_hora ? new Date(t.salida_hora).toLocaleTimeString('es-EC', { hour:'2-digit', minute:'2-digit' }) : '--'}
                  </td>
                  <td style={s.td}>{t.horas_trabajadas ? `${t.horas_trabajadas}h` : '-'}</td>
                  <td style={s.td}>
                    <span style={{
                      ...s.badge,
                      background: t.estado === 'completado' ? '#E1F5EE' : '#FFF3CD',
                      color:      t.estado === 'completado' ? '#085041' : '#856404',
                    }}>
                      {t.estado === 'completado' ? '✓ Completado' : '● Activo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const s = {
  container: { padding:32 },
  header:    { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 },
  titulo:    { fontSize:28, fontWeight:'bold', color:'#04342C', margin:0 },
  sub:       { fontSize:14, color:'#888', marginTop:4 },
  botonExcel:{
    padding:'10px 20px', background:'#1D9E75',
    color:'#fff', border:'none', borderRadius:8,
    fontSize:14, fontWeight:'600', cursor:'pointer',
  },
  filtrosBox:{ background:'#fff', borderRadius:12, padding:20, marginBottom:20, boxShadow:'0 1px 4px rgba(0,0,0,0.08)' },
  filtrosRow:{ display:'flex', gap:12, alignItems:'flex-end', flexWrap:'wrap' },
  campo:     { display:'flex', flexDirection:'column', gap:6, minWidth:160 },
  label:     { fontSize:12, color:'#888', fontWeight:'500' },
  input:     { padding:'8px 12px', border:'1px solid #E0E0E0', borderRadius:8, fontSize:14, background:'#F5F5F5' },
  botonFiltrar:{ padding:'8px 16px', background:'#04342C', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:14, fontWeight:'500', alignSelf:'flex-end' },
  botonLimpiar:{ padding:'8px 16px', background:'#F5F5F5', color:'#444', border:'1px solid #E0E0E0', borderRadius:8, cursor:'pointer', fontSize:14, alignSelf:'flex-end' },
  tablaBox:  { background:'#fff', borderRadius:12, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', overflowX:'auto' },
  cargando:  { padding:40, textAlign:'center', color:'#888' },
  t:         { width:'100%', borderCollapse:'collapse' },
  trHead:    { background:'#F9F9F9' },
  th:        { padding:'12px 16px', textAlign:'left', fontSize:12, color:'#888', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' },
  td:        { padding:'12px 16px', fontSize:14, color:'#222' },
  badge:     { padding:'4px 10px', borderRadius:20, fontSize:12, fontWeight:'600' },
};