import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { cambiarPassword, eliminarToken } from '../services/api';

const logo = require('../../assets/icono.png');

export default function CambiarPasswordScreen({ navigation, route }) {
  const [passwordNueva,    setPasswordNueva]    = useState('');
  const [passwordConfirm,  setPasswordConfirm]  = useState('');
  const [verPassword,      setVerPassword]      = useState(false);
  const [cargando,         setCargando]         = useState(false);

  const nombre = route.params?.nombre || '';

  const handleCambiar = async () => {
    if (!passwordNueva || !passwordConfirm) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    if (passwordNueva.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (passwordNueva !== passwordConfirm) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    if (passwordNueva === 'Operix2024') {
      Alert.alert('Error', 'Debes elegir una contraseña diferente a la inicial');
      return;
    }

    setCargando(true);
    try {
      await cambiarPassword(passwordNueva);
      Alert.alert(
        '✅ Contraseña actualizada',
        'Tu contraseña ha sido cambiada correctamente. Ya puedes usar la app.',
        [{ text: 'Continuar', onPress: () => navigation.replace('Home') }]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
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
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.bienvenida}>¡Bienvenida, {nombre}!</Text>
        <Text style={styles.subtitulo}>
          Por seguridad debes crear una contraseña personal antes de continuar.
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.alertaBox}>
          <Text style={styles.alertaTexto}>
            🔒 Esta es tu primera vez iniciando sesión. 
            Por favor cambia tu contraseña temporal.
          </Text>
        </View>

        <Text style={styles.label}>Nueva contraseña</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={styles.inputPassword}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#999"
            value={passwordNueva}
            onChangeText={setPasswordNueva}
            secureTextEntry={!verPassword}
          />
          <TouchableOpacity
            style={styles.ojito}
            onPress={() => setVerPassword(!verPassword)}
          >
            <Text style={styles.ojitoTexto}>{verPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirmar contraseña</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={styles.inputPassword}
            placeholder="Repite tu nueva contraseña"
            placeholderTextColor="#999"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            secureTextEntry={!verPassword}
          />
        </View>

        <Text style={styles.tip}>
          💡 Elige una contraseña que recuerdes fácilmente pero que sea segura.
          No la compartas con nadie.
        </Text>

        <TouchableOpacity
          style={[styles.boton, cargando && styles.botonDeshabilitado]}
          onPress={handleCambiar}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botonTexto}>Guardar mi contraseña</Text>
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
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  bienvenida: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 13,
    color: '#9FE1CB',
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  alertaBox: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#BA7517',
  },
  alertaTexto: {
    fontSize: 13,
    color: '#633806',
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    color: '#444',
    marginBottom: 6,
    fontWeight: '500',
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
  tip: {
    fontSize: 12,
    color: '#888',
    marginBottom: 20,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  boton: {
    backgroundColor: '#04342C',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
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