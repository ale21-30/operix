import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Image
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { eliminarToken, apiRequest } from '../services/api';

const logo = require('../../assets/icono.png');

export default function HomeScreen({ navigation }) {
  const [turnoActivo,   setTurnoActivo]   = useState(null);
  const [tiempoTurno,   setTiempoTurno]   = useState('');
  const [cargandoTurno, setCargandoTurno] = useState(true);
  const [usuario,       setUsuario]       = useState(null);

  useEffect(() => {
    cargarUsuario();
    verificarTurnoActivo();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      verificarTurnoActivo();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (!turnoActivo) return;
    const interval = setInterval(() => {
      const inicio = new Date(turnoActivo.entrada_hora);
      const ahora  = new Date();
      const diff   = Math.floor((ahora - inicio) / 1000);
      const horas  = Math.floor(diff / 3600);
      const mins   = Math.floor((diff % 3600) / 60);
      const segs   = diff % 60;
      setTiempoTurno(
        `${String(horas).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(segs).padStart(2,'0')}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [turnoActivo]);

  const cargarUsuario = async () => {
    try {
      const data = await SecureStore.getItemAsync('operix_usuario');
      if (data) setUsuario(JSON.parse(data));
    } catch (err) {
      console.log('Error cargando usuario:', err);
    }
  };

  const verificarTurnoActivo = async () => {
    setCargandoTurno(true);
    try {
      const data = await apiRequest('/turnos/activo', 'GET');
      setTurnoActivo(data.turno || null);
    } catch (err) {
      setTurnoActivo(null);
    } finally {
      setCargandoTurno(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás segura que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await eliminarToken();
            await SecureStore.deleteItemAsync('operix_usuario');
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  const opciones = [
    { titulo: 'Registrar Entrada', icono: '🟢', pantalla: 'Entrada', color: '#1D9E75' },
    { titulo: 'Registrar Salida',  icono: '🔴', pantalla: 'Salida',  color: '#E24B4A' },
    { titulo: 'Break de Almuerzo', icono: '🍽️', pantalla: 'Break',   color: '#BA7517' },
    { titulo: 'Registrar Novedad', icono: '📝', pantalla: 'Novedad', color: '#185FA5' },
    { titulo: 'Mi Historial',      icono: '📋', pantalla: 'Historial',color: '#533AB7' },
  ];

  // Primer nombre solo
  const primerNombre = usuario?.nombre?.split(' ')[0] || '';

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.bienvenida}>
        <View style={styles.headerRow}>
          {/* Foto de perfil o logo */}
          {usuario?.foto_perfil ? (
            <Image
              source={{ uri: usuario.foto_perfil }}
              style={styles.fotoPerfil}
            />
          ) : (
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          )}
          <View style={styles.headerTexto}>
            <Text style={styles.hola}>¡Bienvenida, {primerNombre}! 👋</Text>
            <Text style={styles.fecha}>
              {new Date().toLocaleDateString('es-EC', {
                weekday: 'long', day: 'numeric', month: 'long'
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* Contador turno activo */}
      {turnoActivo && (
        <View style={styles.turnoActivoBox}>
          <View style={styles.turnoActivoRow}>
            <View style={styles.pulsoDot} />
            <Text style={styles.turnoActivoLabel}>Turno activo</Text>
          </View>
          <Text style={styles.turnoActivoTiempo}>{tiempoTurno}</Text>
          <Text style={styles.turnoActivoSede}>
            📍 {turnoActivo.sede} — entrada a las{' '}
            {new Date(turnoActivo.entrada_hora).toLocaleTimeString('es-EC', {
              hour: '2-digit', minute: '2-digit',
              timeZone: 'America/Guayaquil'
            })}
          </Text>
        </View>
      )}

      {/* Menú */}
      <View style={styles.grid}>
        {opciones.map((op, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.card, { borderLeftColor: op.color }]}
            onPress={() => navigation.navigate(op.pantalla)}
          >
            <Text style={styles.cardIcono}>{op.icono}</Text>
            <Text style={styles.cardTitulo}>{op.titulo}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutTexto}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#F5F5F5' },
  bienvenida:        { backgroundColor: '#04342C', padding: 24, paddingTop: 48 },
  headerRow:         { flexDirection: 'row', alignItems: 'center', gap: 14 },
  fotoPerfil:        {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 3, borderColor: '#9FE1CB',
    flexShrink: 0,
  },
  logo:              { width: 64, height: 64, flexShrink: 0 },
  headerTexto:       { flex: 1 },
  hola:              { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  fecha:             { fontSize: 13, color: '#9FE1CB', marginTop: 4, textTransform: 'capitalize' },
  turnoActivoBox:    {
    backgroundColor: '#04342C', marginHorizontal: 16,
    marginTop: -8, borderRadius: 12, padding: 16,
    marginBottom: 8, borderWidth: 1, borderColor: '#1D9E75',
  },
  turnoActivoRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  pulsoDot:          { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1D9E75', marginRight: 8 },
  turnoActivoLabel:  { color: '#9FE1CB', fontSize: 13, fontWeight: '500' },
  turnoActivoTiempo: { color: '#fff', fontSize: 36, fontWeight: 'bold', fontFamily: 'monospace', textAlign: 'center' },
  turnoActivoSede:   { color: '#9FE1CB', fontSize: 12, textAlign: 'center', marginTop: 4 },
  grid:              { padding: 16, gap: 12 },
  card:              {
    backgroundColor: '#fff', borderRadius: 12, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    borderLeftWidth: 5, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3,
  },
  cardIcono:         { fontSize: 28 },
  cardTitulo:        { fontSize: 16, fontWeight: '600', color: '#222' },
  logout:            { margin: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E24B4A', alignItems: 'center', marginBottom: 32 },
  logoutTexto:       { color: '#E24B4A', fontWeight: '600', fontSize: 15 },
});