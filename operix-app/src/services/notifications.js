import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { guardarPushToken } from './api';

// Controla cómo se muestra una notificación mientras la app está abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Pide permisos, obtiene el Expo push token del dispositivo y lo registra en el backend.
// Solo tiene sentido llamarla desde el perfil admin.
export const registrarPushToken = async () => {
  try {
    if (!Device.isDevice) {
      Alert.alert('Debug push', 'Device.isDevice es false (no se detecta como dispositivo físico)');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#04342C',
      });
    }

    const { status: estadoExistente } = await Notifications.getPermissionsAsync();
    let estadoFinal = estadoExistente;

    if (estadoExistente !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      estadoFinal = status;
    }

    if (estadoFinal !== 'granted') {
      Alert.alert('Debug push', `Permiso no concedido. Estado: ${estadoFinal}`);
      return null;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    Alert.alert('Debug push', `Permiso OK. projectId: ${projectId || 'INDEFINIDO'}. Pidiendo token...`);

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    Alert.alert('Debug push', `Token obtenido: ${token.slice(0, 30)}... Guardando en backend...`);

    await guardarPushToken(token);
    Alert.alert('Debug push', 'Token guardado correctamente en el backend ✅');

    return token;
  } catch (err) {
    Alert.alert('Debug push - ERROR', String(err?.message || err));
    return null;
  }
};
