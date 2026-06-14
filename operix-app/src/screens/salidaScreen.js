import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView
} from 'react-native';
import * as Location from 'expo-location';
import { registrarSalida } from '../services/api';

export default function SalidaScreen({ navigation }) {
  const [cargando,    setCargando]    = useState(false);
  const [ubicacion,   setUbicacion]   = useState(null);
  const [cargandoGPS, setCargandoGPS] = useState(true);
  const [errorGPS,    setErrorGPS]    = useState(null);

  useEffect(() => {
    obtenerUbicacion();
  }, []);

  const obtenerUbicacion = async () => {
    setCargandoGPS(true);
    setErrorGPS(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorGPS('Permiso de ubicación denegado.');
        setCargandoGPS(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      setUbicacion({
        latitud:  loc.coords.latitude,
        longitud: loc.coords.longitude,
        precision: Math.round(loc.coords.accuracy)
      });
    } catch (error) {
      setErrorGPS('No se pudo obtener la ubicación.');
    } finally {
      setCargandoGPS(false);
    }
  };

  const handleSalida = async () => {
    if (!ubicacion) {
      Alert.alert('Error', 'Espera a que se obtenga tu ubicación GPS');
      return;
    }

    Alert.alert(
      'Confirmar salida',
      '¿Estás segura que deseas registrar tu salida?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, registrar',
          onPress: async () => {
            setCargando(true);
            try {
              const respuesta = await registrarSalida(
                ubicacion.latitud,
                ubicacion.longitud
              );
              Alert.alert(
                '✅ Salida registrada',
                `Hora: ${respuesta.hora}`,
                [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
              );
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setCargando(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icono}>🔴</Text>
        <Text style={styles.titulo}>Registrar Salida</Text>
        <Text style={styles.descripcion}>
          Al registrar tu salida se guardará la hora actual y tu ubicación GPS como evidencia de fin de turno.
        </Text>

        {/* Estado GPS */}
        <View style={[
          styles.gpsBox,
          ubicacion ? styles.gpsOk : errorGPS ? styles.gpsError : styles.gpsCargando
        ]}>
          {cargandoGPS ? (
            <View style={styles.gpsRow}>
              <ActivityIndicator size="small" color="#BA7517" />
              <Text style={styles.gpsCargandoTexto}>  Obteniendo ubicación GPS...</Text>
            </View>
          ) : errorGPS ? (
            <View>
              <Text style={styles.gpsErrorTexto}>⚠️ {errorGPS}</Text>
              <TouchableOpacity onPress={obtenerUbicacion} style={styles.reintentar}>
                <Text style={styles.reintentarTexto}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : ubicacion ? (
            <View>
              <Text style={styles.gpsOkTexto}>✅ Ubicación obtenida</Text>
              <Text style={styles.gpsCoordenadas}>
                Lat: {ubicacion.latitud.toFixed(6)}{'\n'}
                Lng: {ubicacion.longitud.toFixed(6)}
              </Text>
              <Text style={styles.gpsPrecision}>Precisión: ±{ubicacion.precision}m</Text>
            </View>
          ) : null}
        </View>

        {/* Hora actual */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitulo}>🕐 Hora actual</Text>
          <Text style={styles.infoTexto}>
            {new Date().toLocaleTimeString('es-EC')}
          </Text>
          <Text style={styles.infoSub}>
            {new Date().toLocaleDateString('es-EC', {
              weekday: 'long', day: 'numeric', month: 'long'
            })}
          </Text>
        </View>

        <View style={styles.advertencia}>
          <Text style={styles.advertenciaTexto}>
            ⚠️ Esta acción cerrará tu turno activo. Asegúrate de haber terminado tu jornada.
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.boton,
            (!ubicacion || cargando) && styles.botonDeshabilitado
          ]}
          onPress={handleSalida}
          disabled={!ubicacion || cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonTexto}>
              {cargandoGPS ? 'Esperando GPS...' : 'Registrar mi salida'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonCancelar}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.botonCancelarTexto}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F5F5F5', padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  icono: { fontSize: 48, marginBottom: 12 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#04342C', marginBottom: 8 },
  descripcion: {
    fontSize: 14, color: '#666',
    textAlign: 'center', lineHeight: 22, marginBottom: 24,
  },
  gpsBox: { borderRadius: 10, padding: 16, width: '100%', marginBottom: 12 },
  gpsCargando: { backgroundColor: '#FFF3CD' },
  gpsOk:       { backgroundColor: '#E1F5EE' },
  gpsError:    { backgroundColor: '#FCEBEB' },
  gpsRow:      { flexDirection: 'row', alignItems: 'center' },
  gpsCargandoTexto: { fontSize: 14, color: '#856404' },
  gpsOkTexto:  { fontSize: 14, fontWeight: '600', color: '#085041', marginBottom: 6 },
  gpsCoordenadas: { fontSize: 12, color: '#0F6E56', fontFamily: 'monospace' },
  gpsPrecision: { fontSize: 11, color: '#888', marginTop: 4 },
  gpsErrorTexto: { fontSize: 13, color: '#A32D2D', lineHeight: 20 },
  reintentar: {
    marginTop: 8, backgroundColor: '#E24B4A',
    borderRadius: 6, padding: 8, alignItems: 'center',
  },
  reintentarTexto: { color: '#fff', fontSize: 13, fontWeight: '600' },
  infoBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10, padding: 16,
    width: '100%', marginBottom: 12,
  },
  infoTitulo: { fontSize: 12, color: '#888', marginBottom: 4, fontWeight: '500' },
  infoTexto: { fontSize: 16, fontWeight: '600', color: '#222' },
  infoSub: { fontSize: 12, color: '#888', marginTop: 2, textTransform: 'capitalize' },
  advertencia: {
    backgroundColor: '#FFF3CD', borderRadius: 10,
    padding: 14, width: '100%', marginBottom: 20,
  },
  advertenciaTexto: { fontSize: 13, color: '#856404', lineHeight: 20 },
  boton: {
    backgroundColor: '#E24B4A',
    borderRadius: 12, padding: 16,
    alignItems: 'center', width: '100%', marginBottom: 12,
  },
  botonDeshabilitado: { opacity: 0.5 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  botonCancelar: { padding: 12, alignItems: 'center', width: '100%' },
  botonCancelarTexto: { color: '#888', fontSize: 15 },
});