import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2431AE',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          borderTopRightRadius: 40,
          borderTopLeftRadius: 40,
          height: Platform.OS === 'ios' ? 85 : 100,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 18,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                backgroundColor: focused ? '#E8EAFF' : 'transparent',
                borderRadius: 13,
                marginTop: 8,
                padding: 8,
                minHeight: 45,
                minWidth: 45,
                alignItems: 'center',
              }}>
              <MaterialCommunityIcons name="home" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="pindai"
        options={{
          title: 'Pindai',
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                backgroundColor: focused ? '#E8EAFF' : 'transparent',
                borderRadius: 13,
                marginTop: 8,
                padding: 8,
                minHeight: 45,
                minWidth: 45,
                alignItems: 'center',
              }}>
              <AntDesign name="global" size={size} color={color} />
            </View>
          ),
        }}
      />

      {/* Center Floating Button */}
      <Tabs.Screen
        name="kamera"
        options={{
          title: '',
          tabBarStyle: {
            display: 'none',
          },
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                position: 'absolute',
                top: Platform.OS === 'ios' ? -30 : -38,
                backgroundColor: '#2431AE',
                borderRadius: 50,
                width: 75,
                height: 75,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 5,
              }}>
              <Ionicons name="camera-sharp" size={35} color="#1EDD91" />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="peringkat"
        options={{
          title: 'Peringkat',
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                backgroundColor: focused ? '#E8EAFF' : 'transparent',
                borderRadius: 13,
                marginTop: 8,
                padding: 8,
                minHeight: 45,
                minWidth: 45,
                alignItems: 'center',
              }}>
              <Ionicons name="trophy-outline" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ color, size, focused }) => (
            <View
              style={{
                backgroundColor: focused ? '#E8EAFF' : 'transparent',
                borderRadius: 13,
                marginTop: 8,
                padding: 8,
                minHeight: 45,
                minWidth: 45,
                alignItems: 'center',
              }}>
              <Entypo name="text-document" size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
