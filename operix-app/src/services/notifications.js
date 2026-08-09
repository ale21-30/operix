import { Platform } from 'react-native';
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
      console.log('Las notificaciones push requieren un dispositivo físico');
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
      console.log('Permiso de notificaciones no concedido');
      return null;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });

    await guardarPushToken(token);

    return token;
  } catch (err) {
    console.log('Error registrando push token:', err);
    return null;
  }
};
