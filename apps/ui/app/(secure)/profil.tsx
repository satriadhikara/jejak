import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from 'react-native-paper';
import type { ComponentProps } from 'react';
import { useAuthContext } from '@/lib/auth-context';
import { useRouter } from 'expo-router';
import { signOut } from '@/lib/auth-client';

export default function Profil() {
  const { session, role } = useAuthContext();
  const router = useRouter();

  const userData = {
    name: session?.user?.name,
    email: session?.user?.email,
    avatar: session?.user?.image || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  };

  return (
    <View className="relative flex-1 bg-[#FAFAFB]">
      {/* Background Image (top area only) */}
      <Image
        source={require('../../assets/ProfilBG.png')}
        className="absolute left-0 top-0 h-full w-full"
        resizeMode="cover"
      />
      <Ionicons
        name="arrow-back"
        size={24}
        className="absolute left-4 top-20 z-20"
        color="#FFFFFF"
        onPress={() => router.back()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="mt-[90px] items-center">
          <Avatar.Image size={90} source={{ uri: userData.avatar }} />
          <Text className="mt-3 text-[17px] font-semibold text-white">{userData.name}</Text>
          <Text className="mt-0.5 text-[13px] text-[#EDEDED]">{userData.email}</Text>
        </View>

        {/* Card Section */}
        <View className="mt-6 min-h-full rounded-t-[32px] bg-white">
          <View className="mx-5 mt-[30px]">
            {/* Menu Card */}
            <View className="rounded-2xl border border-[#F2F2F2] bg-white p-2 shadow-sm">
              <MenuItem
                icon="person-outline"
                label="Edit Profil"
                color="#6B5AED"
                onPress={() => router.push('/(secure)/edit-profil')}
              />
              <MenuItem
                icon="document-text-outline"
                label="Draft Saya"
                color="#6B5AED"
                onPress={() => {}}
              />
              {role === 'admin' && (
                <MenuItem
                  icon="arrow-redo-outline"
                  label="Beralih ke mode admin"
                  color="#6B5AED"
                  onPress={() => router.replace('/(secure)/admin/dashboard')}
                />
              )}
              <MenuItem
                icon="settings-outline"
                label="Pengaturan"
                color="#6B5AED"
                onPress={() => {}}
                hideBorder
              />
            </View>

            {/* Logout Card */}
            <View className="mt-4 rounded-2xl border border-[#F2F2F2] bg-white p-2 shadow-sm">
              <MenuItem
                icon="log-out-outline"
                label="Keluar"
                color="#E74C3C"
                onPress={() => signOut()}
                isLogout
                hideBorder
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

type MenuItemProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  color: string;
  onPress: () => void;
  isLogout?: boolean;
  hideBorder?: boolean;
};

function MenuItem({ icon, label, color, onPress, isLogout, hideBorder }: MenuItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center justify-between px-2 py-3.5 ${
        hideBorder ? '' : 'border-b border-[#F0F0F0]'
      }`}>
      <View className="flex-row items-center gap-3">
        <View
          className={`h-9 w-9 items-center justify-center rounded-xl ${
            isLogout ? 'bg-[#FDEDEC]' : 'bg-[#EEF0FF]'
          }`}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text
          className={`font-inter-medium text-base ${
            isLogout ? 'text-[#EB3030]' : 'text-[#404041]'
          }`}>
          {label}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#B3B3B3" />
    </TouchableOpacity>
  );
}
