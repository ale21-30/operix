import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/',          label: 'Dashboard',  icono: '📊' },
    { path: '/turnos',    label: 'Turnos',     icono: '🕐' },
    { path: '/empleados', label: 'Empleados',  icono: '👥' },
    { path: '/sedes',     label: 'Sedes',      icono: '📍' },
     { path: '/analytics',  label: 'Analítica ML', icono: '🤖' }, 
  ];

  return (
    <div style={s.wrapper}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
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
                fontWeight: isActive ? '600' : '400',
              })}
            >
              <span style={{ fontSize: 18 }}>{item.icono}</span>
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
            <div>
              <div style={s.userName}>{usuario?.nombre}</div>
              <div style={s.userRol}>{usuario?.rol}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={s.logoutBtn}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main style={s.main}>
        <Outlet />
      </main>
    </div>
  );
}

const s = {
  wrapper:   { display:'flex', minHeight:'100vh' },
  sidebar:   {
    width: 240, background:'#04342C', color:'#fff',
    display:'flex', flexDirection:'column',
    position:'sticky', top:0, height:'100vh',
  },
  logoArea:  {
    display:'flex', alignItems:'center', gap:12,
    padding:'24px 20px', borderBottom:'1px solid rgba(255,255,255,0.1)',
  },
  logoCircle:{
    width:40, height:40, borderRadius:'50%',
    background:'#fff', display:'flex',
    alignItems:'center', justifyContent:'center',
    fontSize:20, fontWeight:'bold', color:'#04342C',
  },
  logoNombre:{ fontSize:18, fontWeight:'bold' },
  logoSub:   { fontSize:11, color:'#9FE1CB', letterSpacing:'0.05em' },
  nav:       { flex:1, padding:'16px 0' },
  navItem:   {
    display:'flex', alignItems:'center', gap:12,
    padding:'12px 20px', color:'#fff',
    textDecoration:'none', borderRadius:8,
    margin:'2px 8px', transition:'background 0.15s',
  },
  userArea:  {
    padding:16, borderTop:'1px solid rgba(255,255,255,0.1)',
  },
  userInfo:  { display:'flex', alignItems:'center', gap:10, marginBottom:12 },
  userAvatar:{
    width:36, height:36, borderRadius:'50%',
    background:'rgba(255,255,255,0.2)',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:16, fontWeight:'bold',
  },
  userName:  { fontSize:13, fontWeight:'500' },
  userRol:   { fontSize:11, color:'#9FE1CB', textTransform:'capitalize' },
  logoutBtn: {
    width:'100%', padding:'8px 12px',
    background:'rgba(226,75,74,0.2)', color:'#FF8A89',
    border:'1px solid rgba(226,75,74,0.3)', borderRadius:8,
    cursor:'pointer', fontSize:13, fontWeight:'500',
  },
  main: { flex:1, overflow:'auto' },
};