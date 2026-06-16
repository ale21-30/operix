import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginAdmin } from '../services/api';

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const data = await loginAdmin(email, password);
      if (data.usuario.rol !== 'admin') {
        setError('Solo administradores pueden acceder al panel web.');
        return;
      }
      login(data.token, data.usuario);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales incorrectas');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        {/* Logo */}
        <div style={s.logoArea}>
          <div style={s.logoCircle}>O</div>
          <h1 style={s.titulo}>Operix</h1>
          <p style={s.subtitulo}>Panel Administrativo</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} style={s.form}>
          {error && <div style={s.error}>{error}</div>}

          <div style={s.campo}>
            <label style={s.label}>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={s.input}
              placeholder="admin@operix.com"
              required
            />
          </div>

          <div style={s.campo}>
            <label style={s.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={s.input}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" style={s.boton} disabled={cargando}>
            {cargando ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <p style={s.footer}>v1.0.0 — Proyecto de Grado</p>
      </div>
    </div>
  );
}

const s = {
  container: {
    minHeight:'100vh', background:'#04342C',
    display:'flex', alignItems:'center', justifyContent:'center',
    padding:16,
  },
  card: {
    background:'#fff', borderRadius:20,
    padding:'40px 36px', width:'100%', maxWidth:420,
    boxShadow:'0 20px 60px rgba(0,0,0,0.3)',
  },
  logoArea:  { textAlign:'center', marginBottom:32 },
  logoCircle:{
    width:72, height:72, borderRadius:'50%',
    background:'#04342C', display:'flex',
    alignItems:'center', justifyContent:'center',
    fontSize:32, fontWeight:'bold', color:'#fff',
    margin:'0 auto 16px',
  },
  titulo:    { fontSize:28, fontWeight:'bold', color:'#04342C', margin:0 },
  subtitulo: { fontSize:13, color:'#888', marginTop:4 },
  form:      { display:'flex', flexDirection:'column', gap:16 },
  error:     {
    background:'#FCEBEB', color:'#A32D2D',
    padding:'10px 14px', borderRadius:8,
    fontSize:13, border:'1px solid #E24B4A',
  },
  campo:     { display:'flex', flexDirection:'column', gap:6 },
  label:     { fontSize:13, fontWeight:'500', color:'#444' },
  input:     {
    padding:'12px 14px', borderRadius:8,
    border:'1px solid #E0E0E0', fontSize:15,
    outline:'none', background:'#F5F5F5',
  },
  boton:     {
    padding:'14px', background:'#04342C',
    color:'#fff', border:'none', borderRadius:8,
    fontSize:16, fontWeight:'bold', cursor:'pointer',
    marginTop:8,
  },
  footer:    { textAlign:'center', color:'#888', fontSize:12, marginTop:24 },
};