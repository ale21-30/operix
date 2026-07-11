import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { login, guardarToken } from '../services/api';

const logo = require('../../assets/icono.png');
export default function LoginScreen({ navigation }) {
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [cargando,    setCargando]    = useState(false);
  const [verPassword, setVerPassword] = useState(false);

const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Error', 'Por favor completa todos los campos');
    return;
  }
  setCargando(true);
  try {
    const respuesta = await login(email.trim().toLowerCase(), password);
    await guardarToken(respuesta.token);

    // Si es primer login redirige a cambiar contraseña
    if (respuesta.usuario.primer_login) {
      navigation.replace('CambiarPassword', { 
        nombre: respuesta.usuario.nombre.split(' ')[0] 
      });
    } else {
      navigation.replace('Home');
    }
  } catch (error) {
    Alert.alert('Error', error.message || 'Credenciales incorrectas');
  } finally {
    setCargando(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Image
          source={logo}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitulo}>Control de Asistencia</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="tu@correo.com"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={styles.inputPassword}
            placeholder="••••••••"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!verPassword}
          />
          <TouchableOpacity
            style={styles.ojito}
            onPress={() => setVerPassword(!verPassword)}
          >
            <Text style={styles.ojitoTexto}>
              {verPassword ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.boton, cargando && styles.botonDeshabilitado]}
          onPress={handleLogin}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonTexto}>Iniciar sesión</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#04342C',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  subtitulo: {
    fontSize: 14,
    color: '#9FE1CB',
    marginTop: 4,
    letterSpacing: 1,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  label: {
    fontSize: 13,
    color: '#444',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: '#222',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  inputPassword: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: '#222',
  },
  ojito: {
    padding: 14,
  },
  ojitoTexto: {
    fontSize: 18,
  },
  boton: {
    backgroundColor: '#04342C',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});