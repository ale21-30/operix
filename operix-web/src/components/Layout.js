import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LuLayoutDashboard, LuClock, LuUsers, LuMapPin,
  LuBrainCircuit, LuActivity, LuCalendarDays, LuLogOut
} from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/',               label: 'Dashboard',     Icono: LuLayoutDashboard },
    { path: '/turnos',         label: 'Turnos',         Icono: LuClock },
    { path: '/empleados',      label: 'Empleados',      Icono: LuUsers },
    { path: '/sedes',          label: 'Sedes',          Icono: LuMapPin },
    { path: '/analytics',      label: 'Analítica ML',   Icono: LuBrainCircuit },
    { path: '/turnos-activos', label: 'Activos',        Icono: LuActivity },
    { path: '/horarios',       label: 'Horarios',       Icono: LuCalendarDays },
  ];

  return (
    <div style={s.wrapper}>
      {/* Navbar superior */}
      <header style={s.navbar}>
        <div style={s.navbarInner}>
          {/* Logo */}
          <div style={s.logoArea}>
            <div style={s.logoCircle}>O</div>
            <div>
              <div style={s.logoNombre}>Operix</div>
              <div style={s.logoSub}>Panel Admin</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={s.nav}>
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                style={({ isActive }) => ({
                  ...s.navItem,
                  background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  fontWeight: isActive ? '600' : '500',
                })}
              >
                <item.Icono size={17} strokeWidth={2} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Usuario */}
          <div style={s.userArea}>
            <div style={s.userInfo}>
              <div style={s.userAvatar}>
                {usuario?.nombre?.charAt(0) || 'A'}
              </div>
              <div style={s.userTextos}>
                <div style={s.userName}>{usuario?.nombre}</div>
                <div style={s.userRol}>{usuario?.rol}</div>
              </div>
            </div>
            <button onClick={handleLogout} style={s.logoutBtn} title="Cerrar sesión">
              <LuLogOut size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main style={s.main}>
        <Outlet />
      </main>
    </div>
  );
}

const s = {
  wrapper:    { minHeight: '100vh', background: '#F5F5F5' },
  navbar:     {
    background: '#04342C', color: '#fff',
    position: 'sticky', top: 0, zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  navbarInner: {
    display: 'flex', alignItems: 'center', gap: 24,
    padding: '10px 24px', maxWidth: 1600, margin: '0 auto',
  },
  logoArea:   { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  logoCircle: {
    width: 36, height: 36, borderRadius: '50%',
    background: '#fff', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: 17, fontWeight: 800, color: '#04342C',
  },
  logoNombre: { fontSize: 15, fontWeight: 700, lineHeight: 1.1 },
  logoSub:    { fontSize: 10, color: '#9FE1CB', letterSpacing: '0.05em', lineHeight: 1.1 },
  nav:        { flex: 1, display: 'flex', gap: 4, overflowX: 'auto' },
  navItem:    {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '9px 14px', color: '#fff', fontSize: 13.5,
    textDecoration: 'none', borderRadius: 8,
    whiteSpace: 'nowrap', transition: 'background 0.15s',
  },
  userArea:   { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  userInfo:   { display: 'flex', alignItems: 'center', gap: 8 },
  userAvatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 700, flexShrink: 0,
  },
  userTextos: { lineHeight: 1.2 },
  userName:   { fontSize: 13, fontWeight: 600 },
  userRol:    { fontSize: 11, color: '#9FE1CB', textTransform: 'capitalize' },
  logoutBtn:  {
    width: 34, height: 34, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: 'rgba(226,75,74,0.2)', color: '#FF8A89',
    border: '1px solid rgba(226,75,74,0.3)', borderRadius: 8,
    cursor: 'pointer', flexShrink: 0,
  },
  main: { padding: 0 },
};
