import AppNavigator from './src/navigation/appNavigator';
export default function App() {
  return <AppNavigator />;
}

import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import AppNavigator from './src/navigation/appNavigator';

export default function App() {

  useEffect(() => {
    verificarActualizacion();
  }, []);

  const verificarActualizacion = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (err) {
      // Si falla silenciosamente no interrumpe la app
      console.log('Update check:', err.message);
    }
  };

  return <AppNavigator />;
}