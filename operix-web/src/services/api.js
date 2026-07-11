import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://operix-production-052c.up.railway.app/api';

const api = axios.create({ baseURL: BASE_URL });

// Interceptor — agrega el token a cada petición automáticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('operix_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor — si el token expira redirige al login
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('operix_token');
      localStorage.removeItem('operix_usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const loginAdmin = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const getTurnos = async (filtros = {}) => {
  const res = await api.get('/admin/turnos', { params: filtros });
  return res.data;
};

export const getEmpleados = async () => {
  const res = await api.get('/admin/empleados');
  return res.data;
};

export const getSedes = async () => {
  const res = await api.get('/admin/sedes');
  return res.data;
};

export const getResumen = async () => {
  const res = await api.get('/admin/resumen');
  return res.data;
};

export const crearEmpleado = async (datos) => {
  const res = await api.post('/admin/empleados', datos);
  return res.data;
};

export const crearSede = async (datos) => {
  const res = await api.post('/admin/sedes', datos);
  return res.data;
};

export const getTurnosActivos = async () => {
  const res = await api.get('/admin/turnos/activos');
  return res.data;
};

export const cerrarTurno = async (id) => {
  const res = await api.put(`/admin/turnos/${id}/cerrar`);
  return res.data;
};

export const toggleUsuario = async (id, activo) => {
  const res = await api.put(`/admin/empleados/${id}/estado`, { activo });
  return res.data;
};