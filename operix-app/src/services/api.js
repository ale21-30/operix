import * as SecureStore from 'expo-secure-store';

// URL base del backend — mientras desarrollas usa tu IP local
// Cambia esta IP por la IP de tu computadora en la red WiFi
const BASE_URL = 'http://192.168.100.17:3000/api';
// ↑ Luego te explico cómo encontrar tu IP exacta

// ─────────────────────────────────────────
// Guarda el token en el almacenamiento seguro del celular
// ─────────────────────────────────────────
export const guardarToken = async (token) => {
  await SecureStore.setItemAsync('operix_token', token);
};

// ─────────────────────────────────────────
// Obtiene el token guardado
// ─────────────────────────────────────────
export const obtenerToken = async () => {
  return await SecureStore.getItemAsync('operix_token');
};

// ─────────────────────────────────────────
// Elimina el token (logout)
// ─────────────────────────────────────────
export const eliminarToken = async () => {
  await SecureStore.deleteItemAsync('operix_token');
};

// ─────────────────────────────────────────
// Función principal para hacer peticiones al backend
// ─────────────────────────────────────────
export const apiRequest = async (endpoint, method = 'GET', body = null, isFormData = false) => {
  
  // Obtiene el token guardado
  const token = await obtenerToken();

  // Configura los headers de la petición
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Si no es FormData, envía JSON
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // Configura la petición
  const config = {
    method,
    headers,
  };

  // Agrega el body si existe
  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  // Hace la petición al backend
  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  // Si el servidor responde con error, lo lanza
  if (!response.ok) {
    throw new Error(data.error || 'Error del servidor');
  }

  return data;
};

// ─────────────────────────────────────────
// Funciones específicas de la API
// ─────────────────────────────────────────

export const login = async (email, password) => {
  return await apiRequest('/auth/login', 'POST', { email, password });
};

export const registrarEntrada = async (sede_id, latitud, longitud) => {
  const formData = new FormData();
  formData.append('sede_id', sede_id);
  formData.append('latitud', latitud);
  formData.append('longitud', longitud);
  return await apiRequest('/turnos/entrada', 'POST', formData, true);
};

export const registrarSalida = async (latitud, longitud) => {
  const formData = new FormData();
  formData.append('latitud', latitud);
  formData.append('longitud', longitud);
  return await apiRequest('/turnos/salida', 'POST', formData, true);
};

export const iniciarBreak = async () => {
  return await apiRequest('/turnos/break/inicio', 'POST');
};

export const finalizarBreak = async () => {
  return await apiRequest('/turnos/break/fin', 'POST');
};

export const registrarNovedad = async (descripcion) => {
  const formData = new FormData();
  formData.append('descripcion', descripcion);
  return await apiRequest('/turnos/novedad', 'POST', formData, true);
};

export const obtenerHistorial = async () => {
  return await apiRequest('/turnos/historial', 'GET');
};