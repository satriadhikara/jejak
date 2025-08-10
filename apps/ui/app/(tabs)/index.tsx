import { SafeAreaView, View, Text, Pressable } from "react-native";
import { useState } from "react";
import { Image as ExpoImage } from "expo-image";
import { Image as RNImage } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Logo from "@/components/Logo";
import ProfileButton from "@/components/ProfileButton";
import { Camera } from "lucide-react-native";
import { router } from "expo-router";

const landing = require("@/assets/images/home/landing.png");
const { width, height } = RNImage.resolveAssetSource(landing);
const aspectRatio = width / height;

export default function Index() {
    const [logoH, setLogoH] = useState(0);

    return (
        <LinearGradient
            colors={["#263189", "#FFFFFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ position: "relative" }}>
                    <ExpoImage
                        source={landing}
                        style={{ width: "100%", aspectRatio }}
                        contentFit="cover"
                    />

                    <View
                        onLayout={(e) => setLogoH(e.nativeEvent.layout.height)}
                        style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: -(logoH / 2 || 0),
                            alignItems: "center",
                        }}
                    >
                        <Logo />
                    </View>
                </View>

                <View style={{ marginTop: logoH / 2, marginBottom: 17 }} />
                <View className="px-6 flex flex-row justify-between items-center mb-[17px]">
                    <View>
                        <Text className="text-white font-medium">Selamat pagi,</Text>
                        <Text className="text-white text-[22px] font-bold">
                            Sarah Mahendra
                        </Text>
                    </View>
                    <ProfileButton backgroundColor="#5D63A6" />
                </View>

                {/* Riwayat */}
                <View className="px-6 flex flex-row justify-between items-center mb-3">
                    <Text className="font-bold text-white text-xl">Riwayat</Text>
                    <Pressable onPress={() => router.push("/(tabs)/riwayat")} className="flex-row items-center gap-2">
                        <Text className="text-[#13D599] text-sm font-medium">Lihat detail</Text>
                    </Pressable>
                </View>
                <View className="mx-6 bg-[#263189] p-5 rounded-xl justify-center items-center gap-1 mb-6">
                    <Text className="text-[#F8F7F4] font-medium">Belum ada riwayat laporan</Text>
                    <View className="flex-row items-center">
                        <Text className="text-[#8F8F8F] text-xs">Mulai Lapor dengan ketuk tombol </Text>
                        <Camera size={24} color="#13D599" strokeWidth={2} />
                    </View>
                </View>

                {/* Leaderboard */}
                <View className="px-6 flex flex-row justify-between items-center mb-3">
                    <Text className="font-bold text-white text-xl">Peringkat</Text>
                    <Pressable onPress={() => router.push("/(tabs)/peringkat")} className="flex-row items-center gap-2">
                        <Text className="text-[#13D599] text-sm font-medium">Lihat detail</Text>
                    </Pressable>
                </View>
                <View className="mx-6 bg-[#263189] p-5 rounded-xl justify-center items-center gap-1 mb-6">
                    <Text className="text-[#F8F7F4] font-medium">Belum ada riwayat laporan</Text>
                    <Text className="text-[#8F8F8F] text-xs">Anda belum masuk leaderboard</Text>
                </View>

                {/* TEMP
                <Pressable onPress={() => router.push("/(auth)/login")} className="bg-[#13D599] p-5 rounded-xl justify-center items-center gap-1 mb-6">
                    <Text className="text-black font-bold">Login</Text>
                </Pressable> */}
            </SafeAreaView>
        </LinearGradient>
    );
}
