import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Image, ActivityIndicator, RefreshControl
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { eliminarToken, obtenerTurnosActivos, obtenerTurnosRecientes } from '../services/api';
import { registrarPushToken } from '../services/notifications';

const logo = require('../../assets/icono.png');

export default function AdminHomeScreen({ navigation }) {
  const [usuario,         setUsuario]         = useState(null);
  const [turnosActivos,   setTurnosActivos]   = useState([]);
  const [turnosRecientes, setTurnosRecientes] = useState([]);
  const [cargando,        setCargando]        = useState(true);
  const [refresh,         setRefresh]         = useState(false);

  const listenerRef = useRef(null);

  useEffect(() => {
    cargarUsuario();
    cargarDatos();
    registrarPushToken();

    listenerRef.current = Notifications.addNotificationReceivedListener(() => {
      cargarDatos();
    });

    return () => {
      if (listenerRef.current) {
        Notifications.removeNotificationSubscription(listenerRef.current);
      }
    };
  }, []);

  const cargarUsuario = async () => {
    try {
      const data = await SecureStore.getItemAsync('operix_usuario');
      if (data) setUsuario(JSON.parse(data));
    } catch (err) {
      console.log('Error cargando usuario:', err);
    }
  };

  const cargarDatos = async () => {
    try {
      const [activos, recientes] = await Promise.all([
        obtenerTurnosActivos(),
        obtenerTurnosRecientes(),
      ]);
      setTurnosActivos(activos.turnos || []);
      setTurnosRecientes(recientes.turnos || []);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setCargando(false);
      setRefresh(false);
    }
  };

  const onRefresh = () => {
    setRefresh(true);
    cargarDatos();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas salir?',
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

  const primerNombre = usuario?.nombre?.split(' ')[0] || '';

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#04342C" />
        <Text style={styles.cargandoTexto}>Cargando panel admin...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refresh} onRefresh={onRefresh} colors={['#04342C']} />
      }
    >
      {/* Header */}
      <View style={styles.bienvenida}>
        <View style={styles.headerRow}>
          {usuario?.foto_perfil ? (
            <Image source={{ uri: usuario.foto_perfil }} style={styles.fotoPerfil} />
          ) : (
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          )}
          <View style={styles.headerTexto}>
            <Text style={styles.hola}>Panel Admin, {primerNombre} 👋</Text>
            <Text style={styles.fecha}>
              {new Date().toLocaleDateString('es-EC', {
                weekday: 'long', day: 'numeric', month: 'long'
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* Turnos activos */}
      <Text style={styles.seccionTitulo}>🟢 Turnos activos ahora ({turnosActivos.length})</Text>
      {turnosActivos.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioTexto}>Nadie tiene un turno activo en este momento</Text>
        </View>
      ) : (
        turnosActivos.map((turno) => (
          <View key={turno.id} style={styles.card}>
            <Text style={styles.cardEmpleado}>{turno.empleado}</Text>
            <Text style={styles.cardDetalle}>
              📍 {turno.sede} — entrada a las{' '}
              {new Date(turno.entrada_hora).toLocaleTimeString('es-EC', {
                hour: '2-digit', minute: '2-digit', timeZone: 'America/Guayaquil'
              })}
            </Text>
            <Text style={styles.cardDetalle}>⏱️ {turno.horas_activo}h activo</Text>
          </View>
        ))
      )}

      {/* Actividad reciente */}
      <Text style={styles.seccionTitulo}>📋 Actividad reciente</Text>
      {turnosRecientes.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioTexto}>No hay turnos registrados aún</Text>
        </View>
      ) : (
        turnosRecientes.map((turno) => (
          <View key={turno.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmpleado}>{turno.empleado}</Text>
              <View style={[
                styles.estadoBadge,
                { backgroundColor: turno.estado === 'completado' ? '#E1F5EE' : '#FFF3CD' }
              ]}>
                <Text style={[
                  styles.estadoTexto,
                  { color: turno.estado === 'completado' ? '#085041' : '#856404' }
                ]}>
                  {turno.estado === 'completado' ? '✓ Completado' : '● Activo'}
                </Text>
              </View>
            </View>
            <Text style={styles.cardDetalle}>📍 {turno.sede}</Text>
            <Text style={styles.cardDetalle}>
              📅 {new Date(turno.entrada_hora).toLocaleDateString('es-EC', {
                weekday: 'long', day: 'numeric', month: 'long'
              })}
            </Text>
          </View>
        ))
      )}

      <Text style={styles.nota}>
        Para gestionar empleados, sedes, horarios o revisar el detalle de novedades, usa el panel web.
      </Text>

      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutTexto}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, backgroundColor: '#F5F5F5' },
  centrado:          { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cargandoTexto:     { marginTop: 12, color: '#666', fontSize: 14 },
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
  seccionTitulo:     { fontSize: 15, fontWeight: '600', color: '#04342C', margin: 16, marginBottom: 8 },
  vacio:             { alignItems: 'center', paddingVertical: 24, marginHorizontal: 16 },
  vacioTexto:        { fontSize: 14, color: '#888', textAlign: 'center' },
  card:              {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginHorizontal: 16, marginBottom: 12, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3,
  },
  cardHeader:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardEmpleado:      { fontSize: 15, fontWeight: '600', color: '#222' },
  cardDetalle:       { fontSize: 13, color: '#666', marginTop: 2 },
  estadoBadge:       { borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10 },
  estadoTexto:       { fontSize: 11, fontWeight: '600' },
  nota:              { fontSize: 12, color: '#999', textAlign: 'center', marginHorizontal: 24, marginTop: 8, marginBottom: 16 },
  logout:            { margin: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E24B4A', alignItems: 'center', marginBottom: 32 },
  logoutTexto:       { color: '#E24B4A', fontWeight: '600', fontSize: 15 },
});
