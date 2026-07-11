import React, { useState, useEffect, createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen     from '../screens/loginScreen';
import HomeScreen      from '../screens/homeScreen';
import EntradaScreen   from '../screens/entradaScreen';
import SalidaScreen    from '../screens/salidaScreen';
import BreakScreen     from '../screens/breakScreen';
import NovedadScreen   from '../screens/novedadScreen';
import HistorialScreen from '../screens/historialScreen';
import CambiarPasswordScreen from '../screens/cambiarPasswordScreen';

import { obtenerToken, eliminarToken } from '../services/api';

const Stack = createNativeStackNavigator();

// Contexto global de sesión — permite cerrar sesión desde cualquier pantalla
export const SesionContext = createContext();

export function useSesion() {
  return useContext(SesionContext);
}

export default function AppNavigator() {
  const [token,    setToken]    = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    verificarSesion();
  }, []);

  const verificarSesion = async () => {
    const tokenGuardado = await obtenerToken();
    setToken(tokenGuardado);
    setCargando(false);
  };

  // Función para cerrar sesión — disponible en toda la app
  const cerrarSesion = async (navegacion) => {
    await eliminarToken();
    setToken(null);
    if (navegacion) {
      navegacion.replace('Login');
    }
  };

  // Función para guardar sesión después del login
  const iniciarSesion = (nuevoToken) => {
    setToken(nuevoToken);
  };

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#04342C' }}>
        <ActivityIndicator size="large" color="#9FE1CB" />
      </View>
    );
  }

  return (
    <SesionContext.Provider value={{ cerrarSesion, iniciarSesion }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={token ? 'Home' : 'Login'}
          screenOptions={{
            headerStyle:      { backgroundColor: '#04342C' },
            headerTintColor:  '#ffffff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Operix', headerBackVisible: false }}
          />
          <Stack.Screen
            name="Entrada"
            component={EntradaScreen}
            options={{ title: 'Registrar Entrada' }}
          />
          <Stack.Screen
            name="Salida"
            component={SalidaScreen}
            options={{ title: 'Registrar Salida' }}
          />
          <Stack.Screen
            name="Break"
            component={BreakScreen}
            options={{ title: 'Break de Almuerzo' }}
          />
          <Stack.Screen
            name="Novedad"
            component={NovedadScreen}
            options={{ title: 'Registrar Novedad' }}
          />
          <Stack.Screen
            name="Historial"
            component={HistorialScreen}
            options={{ title: 'Mi Historial' }}
          />
          <Stack.Screen
  name="CambiarPassword"
  component={CambiarPasswordScreen}
  options={{ headerShown: false }}
/>
        </Stack.Navigator>
      </NavigationContainer>
    </SesionContext.Provider>
  );
}