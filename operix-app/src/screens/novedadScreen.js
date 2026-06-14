import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView,
  TextInput, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { obtenerToken, BASE_URL } from '../services/api';

export default function NovedadScreen({ navigation }) {
  const [descripcion, setDescripcion] = useState('');
  const [cargando,    setCargando]    = useState(false);
  const [foto,        setFoto]        = useState(null);

  const tomarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara.');
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });
    if (!resultado.canceled) {
      setFoto(resultado.assets[0]);
    }
  };

  const handleNovedad = async () => {
    if (!descripcion.trim()) {
      Alert.alert('Error', 'Por favor describe la novedad');
      return;
    }
    setCargando(true);
    try {
      const formData = new FormData();
      formData.append('descripcion', descripcion);
      if (foto) {
        formData.append('foto', {
          uri:  foto.uri,
          type: 'image/jpeg',
          name: `novedad_${Date.now()}.jpg`,
        });
      }

      const token = await obtenerToken();
      const respuesta = await fetch(`${BASE_URL}/turnos/novedad`, {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body:    formData,
      });

      const data = await respuesta.json();
      if (!respuesta.ok) throw new Error(data.error || 'Error del servidor');

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
          Describe cualquier incidencia y opcionalmente adjunta una foto de evidencia.
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

        {/* Foto opcional */}
        <View style={styles.fotoSection}>
          <Text style={styles.label}>📸 Foto de evidencia (opcional)</Text>
          {foto ? (
            <View style={styles.fotoContainer}>
              <Image source={{ uri: foto.uri }} style={styles.fotoPreview} />
              <TouchableOpacity onPress={tomarFoto} style={styles.botonRetomar}>
                <Text style={styles.botonRetomarTexto}>📷 Retomar foto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={tomarFoto} style={styles.botonFoto}>
              <Text style={styles.botonFotoIcono}>📷</Text>
              <Text style={styles.botonFotoTexto}>Tomar foto opcional</Text>
            </TouchableOpacity>
          )}
        </View>

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

        <TouchableOpacity style={styles.botonCancelar} onPress={() => navigation.goBack()}>
          <Text style={styles.botonCancelarTexto}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F5F5F5', padding: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24,
    alignItems: 'center', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3,
  },
  icono: { fontSize: 48, marginBottom: 12 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#04342C', marginBottom: 8 },
  descripcion: {
    fontSize: 14, color: '#666',
    textAlign: 'center', lineHeight: 22, marginBottom: 24,
  },
  label: {
    fontSize: 13, color: '#444', fontWeight: '500',
    marginBottom: 8, alignSelf: 'flex-start',
  },
  textarea: {
    backgroundColor: '#F5F5F5', borderRadius: 10,
    padding: 14, fontSize: 15, color: '#222',
    width: '100%', minHeight: 120,
    borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 16,
  },
  fotoSection: { width: '100%', marginBottom: 16 },
  botonFoto: {
    backgroundColor: '#F0F7F4', borderRadius: 10,
    borderWidth: 2, borderColor: '#04342C',
    borderStyle: 'dashed', padding: 20,
    alignItems: 'center', marginTop: 8,
  },
  botonFotoIcono: { fontSize: 28, marginBottom: 6 },
  botonFotoTexto: { fontSize: 13, color: '#04342C', fontWeight: '600' },
  fotoContainer: { marginTop: 8, alignItems: 'center' },
  fotoPreview: { width: '100%', height: 180, borderRadius: 10, marginBottom: 8 },
  botonRetomar: {
    backgroundColor: '#F5F5F5', borderRadius: 8,
    padding: 10, alignItems: 'center', width: '100%',
  },
  botonRetomarTexto: { fontSize: 14, color: '#444', fontWeight: '500' },
  boton: {
    backgroundColor: '#185FA5', borderRadius: 12,
    padding: 16, alignItems: 'center',
    width: '100%', marginBottom: 12,
  },
  botonDeshabilitado: { opacity: 0.6 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  botonCancelar: { padding: 12, alignItems: 'center', width: '100%' },
  botonCancelarTexto: { color: '#888', fontSize: 15 },
});