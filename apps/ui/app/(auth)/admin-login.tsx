import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LabeledInput from "@/components/login/LabeledInput";
import { router } from "expo-router";

export default function AdminLogin() {
    return (
        <LinearGradient
            colors={["#263189", "#13D599"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
        >
            <SafeAreaView edges={["top"]} className="flex justify-between flex-1">
                <Pressable onPress={() => router.back()} className="p-4 mt-5">
                    <ArrowLeft width={35} height={30} color="#FFFFFF" />
                </Pressable>

                <View className="flex-1 justify-center items-center mx-6">
                    <View className="bg-white p-6 w-full rounded-xl flex justify-center items-center gap-6">
                        <Text className="text-black font-bold text-2xl">Admin Login</Text>

                        <View className="flex flex-col gap-4 w-full">
                            <LabeledInput
                                label="Email"
                                placeholder="admin@gmail.com"
                                keyboardType="email-address"
                            />

                            <LabeledInput
                                label="Password"
                                placeholder="********"
                                secureTextEntry
                            />
                        </View>

                        <Pressable className="bg-[#1D61E7] px-6 py-[10px] rounded-[10px] justify-center items-center w-full">
                            <Text className="text-white font-medium text-sm">Log In</Text>
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}
