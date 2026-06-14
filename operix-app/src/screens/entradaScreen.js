import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, Image
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { registrarEntrada } from '../services/api';

export default function EntradaScreen({ navigation }) {
  const [cargando,    setCargando]    = useState(false);
  const [ubicacion,   setUbicacion]   = useState(null);
  const [cargandoGPS, setCargandoGPS] = useState(true);
  const [errorGPS,    setErrorGPS]    = useState(null);
  const [foto,        setFoto]        = useState(null);

  const SEDE_ID = 1;

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
    // Solicita permiso de cámara
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara para tomar la foto de evidencia.');
      return;
    }

    // Abre la cámara
    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,      // 70% calidad para no pesar demasiado
      base64: false,
    });

    if (!resultado.canceled) {
      setFoto(resultado.assets[0]);
    }
  };

  const handleEntrada = async () => {
    if (!ubicacion) {
      Alert.alert('Error', 'Espera a que se obtenga tu ubicación GPS');
      return;
    }
    if (!foto) {
      Alert.alert('Foto requerida', '¿Deseas continuar sin foto de evidencia?', [
        { text: 'Tomar foto', style: 'cancel' },
        { text: 'Continuar sin foto', onPress: () => enviarEntrada() }
      ]);
      return;
    }
    enviarEntrada();
  };

  const enviarEntrada = async () => {
    setCargando(true);
    try {
      // Prepara el FormData con GPS y foto
      const formData = new FormData();
      formData.append('sede_id', SEDE_ID);
      formData.append('latitud',  ubicacion.latitud);
      formData.append('longitud', ubicacion.longitud);

      if (foto) {
        formData.append('foto', {
          uri:  foto.uri,
          type: 'image/jpeg',
          name: `entrada_${Date.now()}.jpg`,
        });
      }

      const respuesta = await fetch(
        `${require('../services/api').BASE_URL || 'http://TU_IP:3000/api'}/turnos/entrada`,
        {
          method:  'POST',
          headers: {
            'Authorization': `Bearer ${await require('../services/api').obtenerToken()}`,
          },
          body: formData,
        }
      );

      const data = await respuesta.json();

      if (!respuesta.ok) throw new Error(data.error || 'Error del servidor');

      Alert.alert(
        '✅ Entrada registrada',
        `Hora: ${data.hora}\nSede: ${data.sede}\nDistancia: ${data.distancia}m`,
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
          Toma una foto de evidencia y registra tu llegada a la sede.
        </Text>

        {/* Sede */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitulo}>📍 Sede asignada</Text>
          <Text style={styles.infoTexto}>Sede Central Quito</Text>
        </View>

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

        {/* Foto de evidencia */}
        <View style={styles.fotoSection}>
          <Text style={styles.infoTitulo}>📸 Foto de evidencia</Text>

          {foto ? (
            <View style={styles.fotoContainer}>
              <Image source={{ uri: foto.uri }} style={styles.fotoPreview} />
              <TouchableOpacity onPress={tomarFoto} style={styles.botonRetomar}>
                <Text style={styles.botonRetamarTexto}>📷 Retomar foto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={tomarFoto} style={styles.botonFoto}>
              <Text style={styles.botonFotoIcono}>📷</Text>
              <Text style={styles.botonFotoTexto}>Tomar foto de evidencia</Text>
            </TouchableOpacity>
          )}
        </View>

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

        <TouchableOpacity
          style={[styles.boton, (!ubicacion || cargando) && styles.botonDeshabilitado]}
          onPress={handleEntrada}
          disabled={!ubicacion || cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonTexto}>
              {cargandoGPS ? 'Esperando GPS...' : 'Registrar mi entrada'}
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
  infoBox: {
    backgroundColor: '#F5F5F5', borderRadius: 10,
    padding: 16, width: '100%', marginBottom: 12,
  },
  infoTitulo: { fontSize: 12, color: '#888', marginBottom: 4, fontWeight: '500' },
  infoTexto: { fontSize: 16, fontWeight: '600', color: '#222' },
  infoSub: { fontSize: 12, color: '#888', marginTop: 2, textTransform: 'capitalize' },
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
  fotoSection: {
    width: '100%', marginBottom: 12,
  },
  botonFoto: {
    backgroundColor: '#F0F7F4',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#04342C',
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  botonFotoIcono: { fontSize: 32, marginBottom: 8 },
  botonFotoTexto: { fontSize: 14, color: '#04342C', fontWeight: '600' },
  fotoContainer: { marginTop: 8, alignItems: 'center' },
  fotoPreview: {
    width: '100%', height: 200,
    borderRadius: 10, marginBottom: 8,
  },
  botonRetomar: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8, padding: 10,
    alignItems: 'center', width: '100%',
  },
  botonRetamarTexto: { fontSize: 14, color: '#444', fontWeight: '500' },
  boton: {
    backgroundColor: '#1D9E75', borderRadius: 12,
    padding: 16, alignItems: 'center',
    width: '100%', marginBottom: 12, marginTop: 8,
  },
  botonDeshabilitado: { opacity: 0.5 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  botonCancelar: { padding: 12, alignItems: 'center', width: '100%' },
  botonCancelarTexto: { color: '#888', fontSize: 15 },
});