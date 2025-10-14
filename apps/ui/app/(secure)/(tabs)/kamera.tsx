import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function Camera() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kamera</Text>
      <Text style={styles.subtitle}>Halaman kamera akan ditampilkan di sini</Text>
      <Pressable
        onPress={() => router.push('/edit-draft-detail')}
        style={{ marginTop: 20, padding: 10, backgroundColor: '#2431AE', borderRadius: 5 }}>
        <Text style={{ color: '#fff' }}>Tekan Saya</Text>
      </Pressable>
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
