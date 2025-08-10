import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, UserRoundPen, Pencil, LogOut } from "lucide-react-native";
import { router } from "expo-router";
import ProfileCard from "@/components/profile/ProfileCard";

export default function Profile() {
    return (
        <View>
            <SafeAreaView>
                <Pressable onPress={() => router.back()} className="px-6 mt-3 mb-6">
                    <ArrowLeft height={30} width={35} color="#000" />
                </Pressable>
                <Text className="px-8 text-2xl font-extrabold mb-7">Akun</Text>
                <View className="px-6 gap-6">
                    <ProfileCard
                        title="Profil"
                        description="Sarah Mahendra"
                        icon={<UserRoundPen size={24} color="#263189" />}
                        onPress={() => { }}
                    />
                    <ProfileCard
                        title="Draft"
                        description="0 Draft belum diselesaikan"
                        icon={<Pencil size={24} color="#263189" />}
                        onPress={() => { }}
                    />
                    <ProfileCard
                        title="Keluar"
                        description=""
                        icon={<LogOut size={24} color="#263189" />}
                        onPress={() => router.replace("/(auth)/login")}
                    />
                </View>
            </SafeAreaView>
        </View >
    );
}