import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { registrarSalida } from '../services/api';

export default function SalidaScreen({ navigation }) {
  const [cargando, setCargando] = useState(false);

  const LAT_PRUEBA = -0.18273600;
  const LNG_PRUEBA = -78.48324500;

  const handleSalida = async () => {
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
              const respuesta = await registrarSalida(LAT_PRUEBA, LNG_PRUEBA);
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
          Al registrar tu salida se guardará la hora actual y se cerrará tu turno activo.
        </Text>

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
          style={[styles.boton, cargando && styles.botonDeshabilitado]}
          onPress={handleSalida}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonTexto}>Registrar mi salida</Text>
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
  icono: { fontSize: 48, marginBottom: 12 },
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
  advertencia: {
    backgroundColor: '#FFF3CD',
    borderRadius: 10,
    padding: 14,
    width: '100%',
    marginBottom: 20,
  },
  advertenciaTexto: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 20,
  },
  boton: {
    backgroundColor: '#E24B4A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  botonDeshabilitado: { opacity: 0.6 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  botonCancelar: { padding: 12, alignItems: 'center', width: '100%' },
  botonCancelarTexto: { color: '#888', fontSize: 15 },
});