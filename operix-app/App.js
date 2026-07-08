import React, { useEffect } from 'react';
import * as Updates from 'expo-updates';
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
      console.log('Update check:', err.message);
    }
  };

  return <AppNavigator />;
}