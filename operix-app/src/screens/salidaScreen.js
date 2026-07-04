import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, Image
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { obtenerToken, BASE_URL } from '../services/api';

export default function SalidaScreen({ navigation }) {
  const [cargando,    setCargando]    = useState(false);
  const [ubicacion,   setUbicacion]   = useState(null);
  const [cargandoGPS, setCargandoGPS] = useState(true);
  const [errorGPS,    setErrorGPS]    = useState(null);
  const [foto,        setFoto]        = useState(null);

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
        latitud:   loc.coords.latitude,
        longitud:  loc.coords.longitude,
        precision: Math.round(loc.coords.accuracy)
      });
    } catch (error) {
      setErrorGPS('No se pudo obtener la ubicación.');
    } finally {
      setCargandoGPS(false);
    }
  };

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
        { text: 'Sí, registrar', onPress: () => enviarSalida() }
      ]
    );
  };

  const enviarSalida = async () => {
    setCargando(true);
    try {
      const formData = new FormData();
      formData.append('latitud',  ubicacion.latitud);
      formData.append('longitud', ubicacion.longitud);

      if (foto) {
        formData.append('foto', {
          uri:  foto.uri,
          type: 'image/jpeg',
          name: `salida_${Date.now()}.jpg`,
        });
      }

      const token = await obtenerToken();
      const respuesta = await fetch(`${BASE_URL}/turnos/salida`, {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body:    formData,
      });

      const data = await respuesta.json();
      if (!respuesta.ok) throw new Error(data.error || 'Error del servidor');

      Alert.alert(
        '✅ Salida registrada',
        `Hora: ${data.hora}`,
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
        <Text style={styles.icono}>🔴</Text>
        <Text style={styles.titulo}>Registrar Salida</Text>
        <Text style={styles.descripcion}>
          Toma una foto de evidencia y registra tu salida de la sede.
        </Text>

        {/* GPS */}
        <View style={[
          styles.gpsBox,
          ubicacion ? styles.gpsOk : errorGPS ? styles.gpsError : styles.gpsCargando
        ]}>
          {cargandoGPS ? (
            <View style={styles.gpsRow}>
              <ActivityIndicator size="small" color="#BA7517" />
              <Text style={styles.gpsCargandoTexto}>  Obteniendo GPS...</Text>
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

{foto ? (
  <View style={styles.fotoContainer}>
    <Image source={{ uri: foto.uri }} style={styles.fotoPreview} />
    <TouchableOpacity
      onPress={() => setFoto(null)}
      style={styles.borrarFoto}
    >
      <Text style={styles.borrarFotoTexto}>✕</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={tomarFoto} style={styles.botonRetomar}>
      <Text style={styles.botonRetomarTexto}>📷 Retomar foto</Text>
    </TouchableOpacity>
  </View>
) : (
  <View style={styles.fotoContainer}>
    <TouchableOpacity onPress={tomarFoto} style={styles.botonTomarFoto}>
      <Text style={styles.botonTomarFotoTexto}>📷 Tomar foto</Text>
    </TouchableOpacity>
  </View>
)}

        {/* Hora */}
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
            ⚠️ Esta acción cerrará tu turno activo.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.boton, (!ubicacion || cargando) && styles.botonDeshabilitado]}
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
  gpsBox: { borderRadius: 10, padding: 16, width: '100%', marginBottom: 12 },
  gpsCargando: { backgroundColor: '#FFF3CD' },
  gpsOk:       { backgroundColor: '#E1F5EE' },
  gpsError:    { backgroundColor: '#FCEBEB' },
  gpsRow:      { flexDirection: 'row', alignItems: 'center' },
  gpsCargandoTexto: { fontSize: 14, color: '#856404' },
  gpsOkTexto: { fontSize: 14, fontWeight: '600', color: '#085041', marginBottom: 6 },
  gpsCoordenadas: { fontSize: 12, color: '#0F6E56', fontFamily: 'monospace' },
  gpsPrecision: { fontSize: 11, color: '#888', marginTop: 4 },
  gpsErrorTexto: { fontSize: 13, color: '#A32D2D', lineHeight: 20 },
  reintentar: {
    marginTop: 8, backgroundColor: '#E24B4A',
    borderRadius: 6, padding: 8, alignItems: 'center',
  },
  reintentarTexto: { color: '#fff', fontSize: 13, fontWeight: '600' },
  infoBox: {
    backgroundColor: '#F5F5F5', borderRadius: 10,
    padding: 16, width: '100%', marginBottom: 12,
  },
  infoTitulo: { fontSize: 12, color: '#888', marginBottom: 4, fontWeight: '500' },
  infoTexto: { fontSize: 16, fontWeight: '600', color: '#222' },
  infoSub: { fontSize: 12, color: '#888', marginTop: 2, textTransform: 'capitalize' },
  fotoSection: { width: '100%', marginBottom: 12 },
  botonFoto: {
    backgroundColor: '#F0F7F4', borderRadius: 10,
    borderWidth: 2, borderColor: '#04342C',
    borderStyle: 'dashed', padding: 24,
    alignItems: 'center', marginTop: 8,
  },
  botonFotoIcono: { fontSize: 32, marginBottom: 8 },
  botonFotoTexto: { fontSize: 14, color: '#04342C', fontWeight: '600' },
  fotoContainer: { marginTop: 8, alignItems: 'center' },
  fotoPreview: { width: '100%', height: 200, borderRadius: 10, marginBottom: 8 },
  botonRetomar: {
    backgroundColor: '#F5F5F5', borderRadius: 8,
    padding: 10, alignItems: 'center', width: '100%',
  },
  botonRetomarTexto: { fontSize: 14, color: '#444', fontWeight: '500' },
  advertencia: {
    backgroundColor: '#FFF3CD', borderRadius: 10,
    padding: 14, width: '100%', marginBottom: 12,
  },
  advertenciaTexto: { fontSize: 13, color: '#856404', lineHeight: 20 },
  boton: {
    backgroundColor: '#E24B4A', borderRadius: 12,
    padding: 16, alignItems: 'center',
    width: '100%', marginBottom: 12, marginTop: 8,
  },
  botonDeshabilitado: { opacity: 0.5 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  botonCancelar: { padding: 12, alignItems: 'center', width: '100%' },
  botonCancelarTexto: { color: '#888', fontSize: 15 },
  borrarFoto: {
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: 'rgba(0,0,0,0.6)',
  borderRadius: 16,
  width: 32,
  height: 32,
  alignItems: 'center',
  justifyContent: 'center',
},
borrarFotoTexto: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},
});