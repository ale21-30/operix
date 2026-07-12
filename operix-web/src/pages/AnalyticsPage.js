import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ML_URL = 'https://operix-production-052c.up.railway.app/api/admin';

const COLORES_CATEGORIA = {
  'Puntual':             '#1D9E75',
  'Tardanza leve':       '#BA7517',
  'Tardanza frecuente':  '#E24B4A',
};

export default function AnalyticsPage() {
  const [datos,     setDatos]     = useState(null);
  const [cargando,  setCargando]  = useState(true);
  const [error,     setError]     = useState(null);
  const [entrenando,setEntrenando]= useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

const cargarDatos = async () => {
  setCargando(true);
  setError(null);
  try {
    const token = localStorage.getItem('operix_token');
    const res = await fetch(
      'https://operix-production-052c.up.railway.app/api/admin/ml/resumen',
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    const data = await res.json();
    if (data.ok) {
      setDatos(data);
    } else {
      setError(data.error || JSON.stringify(data));
    }
  } catch (err) {
    setError(`Error: ${err.message}`);  // ← muestra el error real
  } finally {
    setCargando(false);
  }
};

const reentrenar = async () => {
  setEntrenando(true);
  try {
    const token = localStorage.getItem('operix_token');
    const res = await fetch(
      'https://operix-production-052c.up.railway.app/api/admin/ml/entrenar',
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    const data = await res.json();
    if (data.ok) {
      alert(`✅ Modelo reentrenado correctamente`);
      cargarDatos();
    }
  } catch (err) {
    alert('Error al entrenar el modelo');
  } finally {
    setEntrenando(false);
  }
};

  if (cargando) return <div style={s.cargando}>🤖 Cargando análisis ML...</div>;

  if (error) return (
    <div style={s.container}>
      <div style={s.errorBox}>
        <h2 style={{ color:'#A32D2D', marginBottom:12 }}>⚠️ Error de conexión ML</h2>
        <p style={{ color:'#666', marginBottom:16 }}>{error}</p>
        <p style={{ color:'#888', fontSize:13 }}>
          Asegúrate de que el servidor Python está corriendo:<br/>
          <code style={s.code}>cd operix-ml && python app.py</code>
        </p>
        <button onClick={cargarDatos} style={s.botonReintentar}>
          Reintentar conexión
        </button>
      </div>
    </div>
  );

  const { analisis, predicciones, accuracy } = datos;

  // Datos para gráfico de puntualidad por categoría

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div>
          <h1 style={s.titulo}>Analítica ML</h1>
          <p style={s.sub}>Análisis descriptivo y predicción de puntualidad</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={reentrenar} style={s.botonEntrenar} disabled={entrenando}>
            {entrenando ? '⏳ Entrenando...' : '🔄 Re-entrenar modelo'}
          </button>
          <button onClick={cargarDatos} style={s.botonRefresh}>
            🔃 Actualizar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={s.grid4}>
        <div style={{ ...s.kpi, borderTopColor:'#1D9E75' }}>
          <div style={s.kpiIcono}>📋</div>
          <div style={{ ...s.kpiValor, color:'#1D9E75' }}>{analisis.total_turnos}</div>
          <div style={s.kpiLabel}>Total turnos</div>
        </div>
        <div style={{ ...s.kpi, borderTopColor:'#185FA5' }}>
          <div style={s.kpiIcono}>⏱️</div>
          <div style={{ ...s.kpiValor, color:'#185FA5' }}>{analisis.promedio_horas}h</div>
          <div style={s.kpiLabel}>Promedio por turno</div>
        </div>
        <div style={{ ...s.kpi, borderTopColor:'#1D9E75' }}>
          <div style={s.kpiIcono}>✅</div>
          <div style={{ ...s.kpiValor, color:'#1D9E75' }}>{analisis.pct_puntualidad}%</div>
          <div style={s.kpiLabel}>Puntualidad global</div>
        </div>
        <div style={{ ...s.kpi, borderTopColor:'#533AB7' }}>
          <div style={s.kpiIcono}>🤖</div>
          <div style={{ ...s.kpiValor, color:'#533AB7' }}>{accuracy}%</div>
          <div style={s.kpiLabel}>Accuracy del modelo</div>
        </div>
      </div>

      {/* Gráficos */}
      <div style={s.grid2}>

        {/* Distribución por hora */}
        <div style={s.card}>
          <h3 style={s.cardTitulo}>📊 Entradas por hora del día</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analisis.distribucion_hora}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="hora" tick={{ fontSize:12 }} />
              <YAxis tick={{ fontSize:12 }} />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#04342C" radius={[4,4,0,0]} name="Turnos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por día */}
        <div style={s.card}>
          <h3 style={s.cardTitulo}>📅 Turnos por día de la semana</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analisis.distribucion_dia}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="dia" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:12 }} />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#1D9E75" radius={[4,4,0,0]} name="Turnos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Predicciones ML */}
      <div style={s.card}>
        <h3 style={s.cardTitulo}>
          🤖 Clasificación ML de puntualidad por empleado
          <span style={s.accuracyBadge}>Accuracy: {accuracy}%</span>
        </h3>
        <p style={s.cardDesc}>
          El modelo de árbol de decisión clasifica a cada empleado según sus patrones
          históricos de entrada. Entrenado con datos reales de la empresa.
        </p>

        {predicciones.length === 0 ? (
          <div style={s.vacio}>No hay datos suficientes para predicciones</div>
        ) : (
          <div style={s.tablaWrapper}>
            <table style={s.t}>
              <thead>
                <tr style={s.trHead}>
                  <th style={s.th}>Empleado</th>
                  <th style={s.th}>Sede</th>
                  <th style={s.th}>Turnos analizados</th>
                  <th style={s.th}>Hora promedio entrada</th>
                  <th style={s.th}>Categoría ML</th>
                  <th style={s.th}>Confianza</th>
                </tr>
              </thead>
              <tbody>
                {predicciones.map((p, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid #F0F0F0' }}>
                    <td style={s.td}><strong>{p.empleado}</strong></td>
                    <td style={s.td}>{p.sede}</td>
                    <td style={s.td}>{p.total_turnos}</td>
                    <td style={s.td}>{p.hora_promedio}</td>
                    <td style={s.td}>
                      <span style={{
                        ...s.badge,
                        background: COLORES_CATEGORIA[p.categoria] + '22',
                        color:      COLORES_CATEGORIA[p.categoria],
                        border:     `1px solid ${COLORES_CATEGORIA[p.categoria]}44`,
                      }}>
                        {p.categoria === 'Puntual' ? '✓' : p.categoria === 'Tardanza leve' ? '⚠' : '⚠⚠'} {p.categoria}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={s.barraConfianza}>
                        <div style={{
                          ...s.barraRelleno,
                          width: `${p.confianza}%`,
                          background: COLORES_CATEGORIA[p.categoria]
                        }} />
                        <span style={s.barraTexto}>{p.confianza}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Estadísticas por empleado */}
      {analisis.empleados_stats && analisis.empleados_stats.length > 0 && (
        <div style={s.card}>
          <h3 style={s.cardTitulo}>👥 Estadísticas detalladas por empleado</h3>
          <div style={s.tablaWrapper}>
            <table style={s.t}>
              <thead>
                <tr style={s.trHead}>
                  <th style={s.th}>Empleado</th>
                  <th style={s.th}>Total turnos</th>
                  <th style={s.th}>Hora promedio entrada</th>
                  <th style={s.th}>Tardanzas</th>
                  <th style={s.th}>% Puntualidad</th>
                </tr>
              </thead>
              <tbody>
                {analisis.empleados_stats.map((emp, i) => (
                  <tr key={i} style={{ borderBottom:'1px solid #F0F0F0' }}>
                    <td style={s.td}><strong>{emp.empleado}</strong></td>
                    <td style={s.td}>{emp.total_turnos}</td>
                    <td style={s.td}>{emp.promedio_entrada_fmt}</td>
                    <td style={s.td}>
                      <span style={{ color: emp.tardanzas > 0 ? '#E24B4A' : '#1D9E75', fontWeight:'600' }}>
                        {emp.tardanzas}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={s.barraConfianza}>
                        <div style={{
                          ...s.barraRelleno,
                          width: `${emp.pct_puntualidad}%`,
                          background: emp.pct_puntualidad >= 90 ? '#1D9E75' :
                                      emp.pct_puntualidad >= 70 ? '#BA7517' : '#E24B4A'
                        }} />
                        <span style={s.barraTexto}>{emp.pct_puntualidad}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comparación de modelos */}
{datos.comparacion && Object.keys(datos.comparacion).length > 0 && (
  <div style={s.card}>
    <h3 style={s.cardTitulo}>
      🏆 Comparación de Modelos ML
      <span style={{
        ...s.accuracyBadge,
        background: '#E6F1FB',
        color: '#0C447C',
        marginLeft: 12
      }}>
        Mejor: {datos.mejor}
      </span>
    </h3>
    <p style={s.cardDesc}>
      Se entrenaron y evaluaron dos modelos de clasificación supervisada.
      El sistema selecciona automáticamente el de mejor desempeño según F1-Score.
    </p>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
      {Object.values(datos.comparacion).map((modelo, i) => (
        <div key={i} style={{
          border: `2px solid ${modelo.nombre === datos.mejor ? '#1D9E75' : '#E0E0E0'}`,
          borderRadius: 12,
          padding: 20,
          background: modelo.nombre === datos.mejor ? '#F0FBF6' : '#FAFAFA',
          position: 'relative'
        }}>
          {modelo.nombre === datos.mejor && (
            <span style={{
              position: 'absolute', top: 12, right: 12,
              background: '#1D9E75', color: '#fff',
              fontSize: 11, fontWeight: '700',
              padding: '3px 10px', borderRadius: 20
            }}>
              ✓ SELECCIONADO
            </span>
          )}
          <h4 style={{
            fontSize: 15, fontWeight: '600',
            color: modelo.nombre === datos.mejor ? '#04342C' : '#444',
            marginBottom: 16
          }}>
            {i === 0 ? '🌳' : '📈'} {modelo.nombre}
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Accuracy',  valor: modelo.accuracy },
              { label: 'Precision', valor: modelo.precision },
              { label: 'Recall',    valor: modelo.recall },
              { label: 'F1-Score',  valor: modelo.f1 },
            ].map((m, j) => (
              <div key={j} style={{
                background: '#fff', borderRadius: 8,
                padding: '10px 14px', textAlign: 'center',
                border: '1px solid #E0E0E0'
              }}>
                <div style={{
                  fontSize: 20, fontWeight: 'bold',
                  color: modelo.nombre === datos.mejor ? '#1D9E75' : '#533AB7'
                }}>
                  {m.valor}%
                </div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 12, fontSize: 11,
            color: '#888', fontStyle: 'italic'
          }}>
            Parámetros: {modelo.params}
          </div>
        </div>
      ))}
    </div>

    <div style={{
      background: '#F0F7F4', borderRadius: 8,
      padding: '12px 16px', fontSize: 13,
      color: '#444', lineHeight: 1.6,
      borderLeft: '4px solid #04342C'
    }}>
      <strong>¿Por qué {datos.mejor}?</strong>{' '}
      {datos.mejor === 'Árbol de Decisión'
        ? 'El Árbol de Decisión obtuvo mejor F1-Score en este conjunto de datos. Además ofrece mayor interpretabilidad: las reglas de decisión son visibles y explicables a la administración sin conocimientos técnicos.'
        : 'La Regresión Logística obtuvo mejor F1-Score en este conjunto de datos. Es especialmente efectiva cuando las clases tienen distribuciones linealmente separables en el espacio de features.'}
    </div>
  </div>
)}

      {/* Nota metodológica */}
      <div style={s.nota}>
        <strong>📖 Metodología:</strong> El modelo utiliza un árbol de decisión supervisado
        (scikit-learn) entrenado sobre registros históricos de asistencia. Las features
        incluyen: hora de entrada promedio, desviación estándar, día de semana y sede.
        Las categorías son: <strong>Puntual</strong> (entrada antes de 8:30),{' '}
        <strong>Tardanza leve</strong> (8:30–9:00) y{' '}
        <strong>Tardanza frecuente</strong> (después de 9:00).
      </div>
    </div>
  );
}

const s = {
  container:   { padding:32 },
  cargando:    { padding:60, textAlign:'center', color:'#888', fontSize:16 },
  header:      { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 },
  titulo:      { fontSize:28, fontWeight:'bold', color:'#04342C', margin:0 },
  sub:         { fontSize:14, color:'#888', marginTop:4 },
  botonEntrenar:{ padding:'10px 18px', background:'#533AB7', color:'#fff', border:'none', borderRadius:8, fontSize:14, fontWeight:'600', cursor:'pointer' },
  botonRefresh: { padding:'10px 18px', background:'#F5F5F5', color:'#444', border:'1px solid #E0E0E0', borderRadius:8, fontSize:14, cursor:'pointer' },
  botonReintentar:{ marginTop:16, padding:'10px 20px', background:'#04342C', color:'#fff', border:'none', borderRadius:8, cursor:'pointer' },
  errorBox:    { background:'#FCEBEB', borderRadius:12, padding:32, maxWidth:500 },
  code:        { background:'#F5F5F5', padding:'4px 8px', borderRadius:4, fontSize:12, fontFamily:'monospace' },
  grid4:       { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16, marginBottom:24 },
  kpi:         { background:'#fff', borderRadius:12, padding:20, borderTop:'4px solid', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' },
  kpiIcono:    { fontSize:24, marginBottom:8 },
  kpiValor:    { fontSize:32, fontWeight:'bold' },
  kpiLabel:    { fontSize:13, color:'#888', marginTop:4 },
  grid2:       { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 },
  card:        { background:'#fff', borderRadius:12, padding:24, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', marginBottom:16 },
  cardTitulo:  { fontSize:16, fontWeight:'600', color:'#04342C', marginBottom:8, display:'flex', alignItems:'center', gap:12 },
  cardDesc:    { fontSize:13, color:'#888', marginBottom:16, lineHeight:1.6 },
  accuracyBadge:{ fontSize:12, background:'#E1F5EE', color:'#085041', padding:'3px 10px', borderRadius:20, fontWeight:'500' },
  vacio:       { padding:32, textAlign:'center', color:'#888' },
  tablaWrapper:{ overflowX:'auto' },
  t:           { width:'100%', borderCollapse:'collapse' },
  trHead:      { background:'#F9F9F9' },
  th:          { padding:'10px 14px', textAlign:'left', fontSize:11, color:'#888', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.05em', whiteSpace:'nowrap' },
  td:          { padding:'12px 14px', fontSize:14, color:'#222' },
  badge:       { padding:'5px 12px', borderRadius:20, fontSize:12, fontWeight:'600' },
  barraConfianza:{ display:'flex', alignItems:'center', gap:8, minWidth:120 },
  barraRelleno:{ height:8, borderRadius:4, transition:'width 0.3s', minWidth:2 },
  barraTexto:  { fontSize:12, color:'#666', whiteSpace:'nowrap' },
  nota:        { background:'#F0F7F4', borderRadius:10, padding:16, fontSize:13, color:'#444', lineHeight:1.7, borderLeft:'4px solid #04342C' },
};