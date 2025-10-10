import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Riwayat() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Riwayat</Text>
      <Text style={styles.subtitle}>Halaman riwayat akan ditampilkan di sini</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2431AE',
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
    marginTop: 8,
  },
});