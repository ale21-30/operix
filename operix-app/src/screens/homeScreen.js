import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, Alert
} from 'react-native';
import { eliminarToken } from '../services/api';

export default function HomeScreen({ navigation }) {

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás segura que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await eliminarToken();
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  // Botones del menú principal
  const opciones = [
    { titulo: 'Registrar Entrada', icono: '🟢', pantalla: 'Entrada', color: '#1D9E75' },
    { titulo: 'Registrar Salida',  icono: '🔴', pantalla: 'Salida',  color: '#E24B4A' },
    { titulo: 'Break de Almuerzo', icono: '🍽️', pantalla: 'Break',   color: '#BA7517' },
    { titulo: 'Registrar Novedad', icono: '📝', pantalla: 'Novedad', color: '#185FA5' },
    { titulo: 'Mi Historial',      icono: '📋', pantalla: 'Historial',color: '#533AB7' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Saludo */}
      <View style={styles.bienvenida}>
        <Text style={styles.hola}>¡Bienvenida! 👋</Text>
        <Text style={styles.fecha}>
          {new Date().toLocaleDateString('es-EC', {
            weekday: 'long', day: 'numeric', month: 'long'
          })}
        </Text>
      </View>

      {/* Menú de opciones */}
      <View style={styles.grid}>
        {opciones.map((op, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.card, { borderLeftColor: op.color }]}
            onPress={() => navigation.navigate(op.pantalla)}
          >
            <Text style={styles.cardIcono}>{op.icono}</Text>
            <Text style={styles.cardTitulo}>{op.titulo}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Botón logout */}
      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutTexto}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  bienvenida: {
    backgroundColor: '#04342C',
    padding: 24,
    paddingTop: 32,
  },
  hola: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  fecha: {
    fontSize: 14,
    color: '#9FE1CB',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  grid: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderLeftWidth: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardIcono: {
    fontSize: 28,
  },
  cardTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  logout: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E24B4A',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoutTexto: {
    color: '#E24B4A',
    fontWeight: '600',
    fontSize: 15,
  },
});