import { View, Text, Pressable } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Image as RNImage } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import GoogleIcon from "@/assets/images/login/google.svg";
import { router } from "expo-router";

const bg = require("@/assets/images/login/login-bg.png");
const { width, height } = RNImage.resolveAssetSource(bg);
const aspectRatio = width / height;

export default function Login() {
    return (
        <View style={{ flex: 1, backgroundColor: "#fff", position: "relative" }}>
            <ExpoImage source={bg} style={{ width: "100%", aspectRatio }} contentFit="cover" />
            <LinearGradient
                colors={["transparent", "#263189"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0.25 }}
                pointerEvents="none"
                style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "50%" }}
            />
            <View className="flex mx-6 -mt-14">
                <View className="mb-14">
                    <Text className="text-white font-bold text-[40px] mb-[3px]">Jejak</Text>
                    <Text className="text-[#13D599] font-semibold mb-4">Langkah Kecil, Perubahan Besar</Text>
                    <Text className="text-white">Setiap laporan Anda adalah langkah menuju kota yang lebih baik</Text>
                </View>
                <Pressable onPress={() => router.replace("/(tabs)")} className="bg-white py-4 px-[10px] rounded-[32px] flex flex-row items-center justify-center gap-[10px] mb-[10px]">
                    <GoogleIcon width={24} height={24} />
                    <Text className="text-[#263189] font-medium">Masuk dengan Google</Text>
                </Pressable>
                <Pressable onPress={() => router.push("/(auth)/admin-login")} className="items-center">
                    <Text className="text-[#BEC1DB] text-sm underline">Masuk Sebagai Admin</Text>
                </Pressable>
            </View>
        </View>
    );
}
