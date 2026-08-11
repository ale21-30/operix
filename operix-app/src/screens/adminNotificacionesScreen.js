import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { obtenerActividad } from '../services/api';

const formatoFechaHora = (fecha) => {
  const d = new Date(fecha);
  const hoy = new Date();
  const esHoy = d.toDateString() === hoy.toDateString();
  const fechaTexto = esHoy
    ? 'Hoy'
    : d.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
  const horaTexto = d.toLocaleTimeString('es-EC', {
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Guayaquil'
  });
  return `${fechaTexto}, ${horaTexto}`;
};

export default function AdminNotificacionesScreen() {
  const [actividad, setActividad] = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [refresh,   setRefresh]   = useState(false);

  const cargarActividad = async () => {
    try {
      const respuesta = await obtenerActividad(100);
      setActividad(respuesta.actividad || []);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setCargando(false);
      setRefresh(false);
    }
  };

  useEffect(() => {
    cargarActividad();
  }, []);

  const onRefresh = () => {
    setRefresh(true);
    cargarActividad();
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#04342C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.lista}
        refreshControl={
          <RefreshControl refreshing={refresh} onRefresh={onRefresh} colors={['#04342C']} />
        }
      >
        <Text style={styles.subtitulo}>
          {actividad.length} notificaci{actividad.length !== 1 ? 'ones' : 'ón'} recibida{actividad.length !== 1 ? 's' : ''}
        </Text>

        {actividad.length === 0 ? (
          <View style={styles.vacio}>
            <Text style={styles.vacioIcono}>🔔</Text>
            <Text style={styles.vacioTexto}>Todavía no ha llegado ninguna notificación</Text>
          </View>
        ) : (
          actividad.map((item, i) => {
            const esEntrada = item.tipo === 'entrada';
            return (
              <View key={i} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcono}>{esEntrada ? '🟢' : '📝'}</Text>
                  <View style={styles.cardTextos}>
                    <Text style={styles.cardTitulo}>
                      {item.empleado} {esEntrada ? 'registró su entrada' : 'registró una novedad'}
                    </Text>
                    <Text style={styles.cardSub}>
                      📍 {item.sede} — {formatoFechaHora(item.fecha)}
                    </Text>
                    {!esEntrada && item.descripcion ? (
                      <Text style={styles.cardDescripcion} numberOfLines={2}>
                        {item.descripcion}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F5F5F5' },
  centrado:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  lista:           { flex: 1, padding: 16 },
  subtitulo:       { fontSize: 13, color: '#888', marginBottom: 12, fontWeight: '500' },
  vacio:           { alignItems: 'center', paddingVertical: 60 },
  vacioIcono:      { fontSize: 48, marginBottom: 12 },
  vacioTexto:      { fontSize: 15, color: '#888', textAlign: 'center' },
  card:            {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 12, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3,
  },
  cardHeader:      { flexDirection: 'row', gap: 12 },
  cardIcono:       { fontSize: 20 },
  cardTextos:      { flex: 1 },
  cardTitulo:      { fontSize: 14, fontWeight: '600', color: '#222' },
  cardSub:         { fontSize: 12, color: '#888', marginTop: 3 },
  cardDescripcion: { fontSize: 13, color: '#555', marginTop: 6, lineHeight: 18 },
});
