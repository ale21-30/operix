import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, TextInput
} from 'react-native';
import { registrarNovedad } from '../services/api';

export default function NovedadScreen({ navigation }) {
  const [descripcion, setDescripcion] = useState('');
  const [cargando, setCargando]       = useState(false);

  const handleNovedad = async () => {
    if (!descripcion.trim()) {
      Alert.alert('Error', 'Por favor describe la novedad');
      return;
    }
    setCargando(true);
    try {
      await registrarNovedad(descripcion);
      Alert.alert(
        '✅ Novedad registrada',
        'La novedad fue guardada correctamente',
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
        <Text style={styles.icono}>📝</Text>
        <Text style={styles.titulo}>Registrar Novedad</Text>
        <Text style={styles.descripcion}>
          Describe cualquier incidencia, observación o situación relevante ocurrida durante tu turno.
        </Text>

        <Text style={styles.label}>Descripción de la novedad</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Ej: Se encontró el piso mojado en el área de recepción..."
          placeholderTextColor="#999"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        <Text style={styles.nota}>
          📸 La foto de evidencia se integrará en la siguiente versión
        </Text>

        <TouchableOpacity
          style={[styles.boton, cargando && styles.botonDeshabilitado]}
          onPress={handleNovedad}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonTexto}>Guardar novedad</Text>
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
  label: {
    fontSize: 13, color: '#444',
    fontWeight: '500', marginBottom: 8,
    alignSelf: 'flex-start',
  },
  textarea: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#222',
    width: '100%',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  nota: {
    fontSize: 12, color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  boton: {
    backgroundColor: '#185FA5',
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