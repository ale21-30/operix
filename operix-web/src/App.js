import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage    from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TurnosPage   from './pages/TurnosPage';
import EmpleadosPage from './pages/EmpleadosPage';
import SedesPage    from './pages/SedesPage';
import Layout       from './components/Layout';
import AnalyticsPage from './pages/AnalyticsPage';
import TurnosActivosPage from './pages/TurnosActivosPage';
import HorariosPage from './pages/HorariosPage';
import TurnoDetallePage from './pages/TurnoDetallePage';

function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();
  if (cargando) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', color:'#04342C' }}>Cargando...</div>;
  return usuario ? children : <Navigate to="/login" />;
}

function RutaPublica({ children }) {
  const { usuario, cargando } = useAuth();
  if (cargando) return null;
  return usuario ? <Navigate to="/" /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<RutaPublica><LoginPage /></RutaPublica>} />
          <Route path="/" element={<RutaProtegida><Layout /></RutaProtegida>}>
            <Route index           element={<DashboardPage />} />
            <Route path="turnos"   element={<TurnosPage />} />
            <Route path="empleados" element={<EmpleadosPage />} />
            <Route path="sedes"    element={<SedesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="turnos-activos" element={<TurnosActivosPage />} />
            <Route path="horarios" element={<HorariosPage />} />
            <Route path="turnos/:id" element={<TurnoDetallePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}