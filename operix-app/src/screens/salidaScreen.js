import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
export default function EntradaScreen() {
  return (
    <View style={styles.c}>
      <Text style={styles.t}>Pantalla de Salida — en construcción</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  c: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#F5F5F5' },
  t: { fontSize:16, color:'#444' }
});