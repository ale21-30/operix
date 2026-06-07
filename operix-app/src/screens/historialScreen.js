import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { obtenerHistorial } from '../services/api';

export default function HistorialScreen() {
  const [turnos,    setTurnos]    = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [refresh,   setRefresh]   = useState(false);

  const cargarHistorial = async () => {
    try {
      const respuesta = await obtenerHistorial();
      setTurnos(respuesta.turnos);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setCargando(false);
      setRefresh(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  const onRefresh = () => {
    setRefresh(true);
    cargarHistorial();
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#04342C" />
        <Text style={styles.cargandoTexto}>Cargando historial...</Text>
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
      <Text style={styles.subtitulo}>Últimos 30 turnos</Text>

      {turnos.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioIcono}>📋</Text>
          <Text style={styles.vacioTexto}>No hay turnos registrados aún</Text>
        </View>
      ) : (
        turnos.map((turno, i) => (
          <View key={i} style={styles.card}>

            {/* Header de la card */}
            <View style={styles.cardHeader}>
              <Text style={styles.sede}>{turno.sede}</Text>
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

            {/* Horarios */}
            <View style={styles.horarios}>
              <View style={styles.horario}>
                <Text style={styles.horarioLabel}>🟢 Entrada</Text>
                <Text style={styles.horarioValor}>
                  {turno.entrada_hora
                    ? new Date(turno.entrada_hora).toLocaleTimeString('es-EC', {
                        hour: '2-digit', minute: '2-digit'
                      })
                    : '--:--'}
                </Text>
              </View>
              <View style={styles.horario}>
                <Text style={styles.horarioLabel}>🔴 Salida</Text>
                <Text style={styles.horarioValor}>
                  {turno.salida_hora
                    ? new Date(turno.salida_hora).toLocaleTimeString('es-EC', {
                        hour: '2-digit', minute: '2-digit'
                      })
                    : '--:--'}
                </Text>
              </View>
              <View style={styles.horario}>
                <Text style={styles.horarioLabel}>⏱️ Horas</Text>
                <Text style={styles.horarioValor}>
                  {turno.horas_trabajadas ? `${turno.horas_trabajadas}h` : '-'}
                </Text>
              </View>
            </View>

            {/* Fecha */}
            <Text style={styles.fecha}>
              📅 {new Date(turno.entrada_hora).toLocaleDateString('es-EC', {
                weekday: 'long', day: 'numeric', month: 'long'
              })}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cargandoTexto: { marginTop: 12, color: '#666', fontSize: 14 },
  subtitulo: {
    fontSize: 13, color: '#888',
    marginBottom: 16, fontWeight: '500',
  },
  vacio: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  vacioIcono: { fontSize: 48, marginBottom: 12 },
  vacioTexto: { fontSize: 15, color: '#888' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sede: { fontSize: 15, fontWeight: '600', color: '#04342C', flex: 1 },
  estadoBadge: {
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  estadoTexto: { fontSize: 11, fontWeight: '600' },
  horarios: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
  },
  horario: { alignItems: 'center', flex: 1 },
  horarioLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  horarioValor: { fontSize: 15, fontWeight: '600', color: '#222' },
  fecha: { fontSize: 12, color: '#888', textTransform: 'capitalize' },
});