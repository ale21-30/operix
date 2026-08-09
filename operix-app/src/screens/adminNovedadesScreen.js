import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  ActivityIndicator, Alert, TouchableOpacity, RefreshControl
} from 'react-native';
import { obtenerNovedades } from '../services/api';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Devuelve un Date colocado en el mes actual, día 1
const inicioMesActual = () => {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
};

const formatoMes = (fecha) => fecha.toISOString().slice(0, 7); // YYYY-MM

export default function AdminNovedadesScreen() {
  const [fechaMes, setFechaMes]     = useState(inicioMesActual());
  const [novedades, setNovedades]   = useState([]);
  const [cargando,  setCargando]    = useState(true);
  const [refresh,   setRefresh]     = useState(false);

  const cargarNovedades = async (fecha) => {
    try {
      const respuesta = await obtenerNovedades(formatoMes(fecha));
      setNovedades(respuesta.novedades || []);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setCargando(false);
      setRefresh(false);
    }
  };

  useEffect(() => {
    setCargando(true);
    cargarNovedades(fechaMes);
  }, [fechaMes]);

  const onRefresh = () => {
    setRefresh(true);
    cargarNovedades(fechaMes);
  };

  const cambiarMes = (delta) => {
    setFechaMes(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const esMesActual = formatoMes(fechaMes) === formatoMes(inicioMesActual());

  return (
    <View style={styles.container}>
      {/* Selector de mes */}
      <View style={styles.selectorMes}>
        <TouchableOpacity style={styles.flecha} onPress={() => cambiarMes(-1)}>
          <Text style={styles.flechaTexto}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.mesTexto}>
          {MESES[fechaMes.getMonth()]} {fechaMes.getFullYear()}
        </Text>

        <TouchableOpacity
          style={[styles.flecha, esMesActual && styles.flechaDeshabilitada]}
          onPress={() => !esMesActual && cambiarMes(1)}
          disabled={esMesActual}
        >
          <Text style={styles.flechaTexto}>›</Text>
        </TouchableOpacity>
      </View>

      {cargando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color="#04342C" />
        </View>
      ) : (
        <ScrollView
          style={styles.lista}
          refreshControl={
            <RefreshControl refreshing={refresh} onRefresh={onRefresh} colors={['#04342C']} />
          }
        >
          <Text style={styles.subtitulo}>
            {novedades.length} novedad{novedades.length !== 1 ? 'es' : ''} este mes
          </Text>

          {novedades.length === 0 ? (
            <View style={styles.vacio}>
              <Text style={styles.vacioIcono}>📝</Text>
              <Text style={styles.vacioTexto}>No hay novedades registradas en este mes</Text>
            </View>
          ) : (
            novedades.map((n) => (
              <View key={n.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardEmpleado}>{n.empleado}</Text>
                  <Text style={styles.cardFecha}>
                    {new Date(n.creado_en).toLocaleDateString('es-EC', {
                      day: 'numeric', month: 'short'
                    })}{' '}
                    {new Date(n.creado_en).toLocaleTimeString('es-EC', {
                      hour: '2-digit', minute: '2-digit', timeZone: 'America/Guayaquil'
                    })}
                  </Text>
                </View>
                <Text style={styles.cardSede}>📍 {n.sede}</Text>
                <Text style={styles.cardDescripcion}>{n.descripcion}</Text>
                {n.foto && (
                  <Image source={{ uri: n.foto }} style={styles.cardFoto} resizeMode="cover" />
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: '#F5F5F5' },
  centrado:             { flex: 1, justifyContent: 'center', alignItems: 'center' },
  selectorMes:          {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#04342C', paddingVertical: 12, paddingHorizontal: 20,
  },
  flecha:               { padding: 8, width: 40, alignItems: 'center' },
  flechaDeshabilitada:  { opacity: 0.3 },
  flechaTexto:          { color: '#fff', fontSize: 26, fontWeight: '300' },
  mesTexto:             { color: '#fff', fontSize: 16, fontWeight: '600', textTransform: 'capitalize' },
  lista:                { flex: 1, padding: 16 },
  subtitulo:            { fontSize: 13, color: '#888', marginBottom: 12, fontWeight: '500' },
  vacio:                { alignItems: 'center', paddingVertical: 60 },
  vacioIcono:           { fontSize: 48, marginBottom: 12 },
  vacioTexto:           { fontSize: 15, color: '#888', textAlign: 'center' },
  card:                 {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 12, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3,
  },
  cardHeader:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardEmpleado:         { fontSize: 15, fontWeight: '600', color: '#222', flex: 1 },
  cardFecha:            { fontSize: 12, color: '#888' },
  cardSede:             { fontSize: 12, color: '#666', marginBottom: 8 },
  cardDescripcion:      { fontSize: 14, color: '#333', lineHeight: 20 },
  cardFoto:             { width: '100%', height: 180, borderRadius: 8, marginTop: 10 },
});
