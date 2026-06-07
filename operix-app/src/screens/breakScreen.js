import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { iniciarBreak, finalizarBreak, apiRequest } from '../services/api';

export default function BreakScreen({ navigation }) {
  const [cargando, setCargando]       = useState(false);
  const [breakActivo, setBreakActivo] = useState(false);
  const [horaInicio, setHoraInicio]   = useState(null);
  const [verificando, setVerificando] = useState(true);

  // Al entrar a la pantalla verifica si hay un break activo en la BD
  useEffect(() => {
    const verificarBreak = async () => {
      try {
        const respuesta = await apiRequest('/turnos/break/estado', 'GET');
        if (respuesta.breakActivo) {
          setBreakActivo(true);
          setHoraInicio(respuesta.horaInicio);
        }
      } catch (error) {
        // Si no hay turno activo o no hay break, no pasa nada
      } finally {
        setVerificando(false);
      }
    };
    verificarBreak();
  }, []);

  const handleIniciarBreak = async () => {
    setCargando(true);
    try {
      await iniciarBreak();
      const hora = new Date().toLocaleTimeString('es-EC');
      setHoraInicio(hora);
      setBreakActivo(true);
      Alert.alert('🍽️ Break iniciado', `Hora de inicio: ${hora}`);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleFinalizarBreak = async () => {
    setCargando(true);
    try {
      await finalizarBreak();
      const hora = new Date().toLocaleTimeString('es-EC');
      Alert.alert(
        '✅ Break finalizado',
        `Hora de fin: ${hora}`,
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
      setBreakActivo(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setCargando(false);
    }
  };

  if (verificando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#04342C" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icono}>🍽️</Text>
        <Text style={styles.titulo}>Break de Almuerzo</Text>
        <Text style={styles.descripcion}>
          Registra el inicio y fin de tu break de almuerzo. Este tiempo se descontará de tus horas trabajadas.
        </Text>

        {breakActivo && horaInicio && (
          <View style={styles.breakActivo}>
            <Text style={styles.breakActivoTitulo}>⏱️ Break en curso</Text>
            <Text style={styles.breakActivoHora}>Inicio: {horaInicio}</Text>
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitulo}>🕐 Hora actual</Text>
          <Text style={styles.infoTexto}>
            {new Date().toLocaleTimeString('es-EC')}
          </Text>
        </View>

        {!breakActivo ? (
          <TouchableOpacity
            style={[styles.botonIniciar, cargando && styles.botonDeshabilitado]}
            onPress={handleIniciarBreak}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botonTexto}>Iniciar break</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.botonFinalizar, cargando && styles.botonDeshabilitado]}
            onPress={handleFinalizarBreak}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botonTexto}>Finalizar break</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.botonCancelar}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.botonCancelarTexto}>Volver</Text>
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
  breakActivo: {
    backgroundColor: '#E1F5EE',
    borderRadius: 10,
    padding: 16,
    width: '100%',
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1D9E75',
  },
  breakActivoTitulo: { fontSize: 14, fontWeight: '600', color: '#085041' },
  breakActivoHora: { fontSize: 13, color: '#0F6E56', marginTop: 4 },
  infoBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  infoTitulo: { fontSize: 12, color: '#888', marginBottom: 4, fontWeight: '500' },
  infoTexto: { fontSize: 16, fontWeight: '600', color: '#222' },
  botonIniciar: {
    backgroundColor: '#BA7517',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  botonFinalizar: {
    backgroundColor: '#1D9E75',
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