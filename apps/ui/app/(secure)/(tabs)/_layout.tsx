import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, Image } from 'react-native';
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
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                backgroundColor: focused ? '#E8EAFF' : 'transparent',
                borderRadius: 13,
                marginTop: 8,
                padding: 8,
                minHeight: 45,
                minWidth: 45,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Image
                source={
                  focused
                    ? require('../../../assets/nav-icons/beranda-active.png')
                    : require('../../../assets/nav-icons/beranda.png')
                }
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="pindai"
        options={{
          title: 'Pindai',
          tabBarIcon: ({ focused }) => (
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
              <Image
                source={
                  focused
                    ? require('../../../assets/nav-icons/pindai-active.png')
                    : require('../../../assets/nav-icons/pindai.png')
                }
                style={{ width: 25, height: 25 }}
                resizeMode="contain"
              />
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
          tabBarIcon: () => (
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
              <Image
                source={require('../../../assets/nav-icons/camera.png')}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="peringkat"
        options={{
          title: 'Peringkat',
          tabBarIcon: ({ focused }) => (
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
              <Image
                source={
                  focused
                    ? require('../../../assets/nav-icons/peringkat-active.png')
                    : require('../../../assets/nav-icons/peringkat.png')
                }
                style={{ width: 25, height: 25 }}
                resizeMode="contain"
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ focused }) => (
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
              <Image
                source={
                  focused
                    ? require('../../../assets/nav-icons/riwayat-active.png')
                    : require('../../../assets/nav-icons/riwayat.png')
                }
                style={{ width: 25, height: 25 }}
                resizeMode="contain"
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
