import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario,  setUsuario]  = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token   = localStorage.getItem('operix_token');
    const usuarioGuardado = localStorage.getItem('operix_usuario');
    if (token && usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setCargando(false);
  }, []);

  const login = (token, usuario) => {
    localStorage.setItem('operix_token',   token);
    localStorage.setItem('operix_usuario', JSON.stringify(usuario));
    setUsuario(usuario);
  };

  const logout = () => {
    localStorage.removeItem('operix_token');
    localStorage.removeItem('operix_usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);