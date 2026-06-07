import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { registrarEntrada } from '../services/api';

export default function EntradaScreen({ navigation }) {
  const [cargando, setCargando] = useState(false);
  const [ubicacion, setUbicacion] = useState(null);

  // Por ahora usamos coordenadas de la sede de prueba
  // Cuando integremos GPS real esto se obtiene automáticamente
  const SEDE_ID = 1;
  const LAT_PRUEBA = -0.18273600;
  const LNG_PRUEBA = -78.48324500;

  const handleEntrada = async () => {
    setCargando(true);
    try {
      const respuesta = await registrarEntrada(
        SEDE_ID,
        LAT_PRUEBA,
        LNG_PRUEBA
      );
      Alert.alert(
        '✅ Entrada registrada',
        `Hora: ${respuesta.hora}\nSede: ${respuesta.sede}\nDistancia: ${respuesta.distancia}m`,
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icono}>🟢</Text>
        <Text style={styles.titulo}>Registrar Entrada</Text>
        <Text style={styles.descripcion}>
          Al registrar tu entrada se guardará la hora actual y tu ubicación como evidencia de inicio de turno.
        </Text>

        {/* Info de ubicación */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitulo}>📍 Sede asignada</Text>
          <Text style={styles.infoTexto}>Sede Central Quito</Text>
          <Text style={styles.infoSub}>Av. Amazonas y Naciones Unidas</Text>
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

        <Text style={styles.nota}>
          📸 La foto de evidencia se integrará en la siguiente versión
        </Text>

        <TouchableOpacity
          style={[styles.boton, cargando && styles.botonDeshabilitado]}
          onPress={handleEntrada}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonTexto}>Registrar mi entrada</Text>
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
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
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
  icono: {
    fontSize: 48,
    marginBottom: 12,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#04342C',
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 16,
    width: '100%',
    marginBottom: 12,
  },
  infoTitulo: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    fontWeight: '500',
  },
  infoTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  infoSub: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  nota: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginVertical: 16,
    fontStyle: 'italic',
  },
  boton: {
    backgroundColor: '#1D9E75',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botonCancelar: {
    padding: 12,
    alignItems: 'center',
    width: '100%',
  },
  botonCancelarTexto: {
    color: '#888',
    fontSize: 15,
  },
});