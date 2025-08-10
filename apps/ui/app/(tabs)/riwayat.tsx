import "react-native-gesture-handler";
import { useMemo, useRef, useState } from "react";
import { View, Text, Pressable, TouchableOpacity, TextInput, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import StatusBadge from "@/components/riwayat/StatusBadge";
import ReportItem from "@/components/riwayat/ReportItem";
import { User } from "lucide-react-native";
import ProfileButton from "@/components/ProfileButton";

// DEBUG MANY ITEMS
// const thumbs = [
//     "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&h=200&fit=crop",
//     "https://images.unsplash.com/photo-1505238680356-667803448bb6?w=400&h=200&fit=crop",
//     "https://images.unsplash.com/photo-1465188035480-cf3a60801ea5?w=400&h=200&fit=crop",
// ];
// const STATUSES = ["DONE", "ON_PROCESS", "CONFIRMED"] as const;
// type Status = typeof STATUSES[number];

// const reportsMany = Array.from({ length: 40 }, (_, i) => ({
//     id: i + 1,
//     title: `Report #${i + 1}`,
//     status: STATUSES[i % STATUSES.length] as Status,
//     thumbnailUri: thumbs[i % thumbs.length],
// }));

const reports = [
    { id: 1, title: "Report #1", status: "DONE", thumbnailUri: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&h=200&fit=crop" },
    { id: 2, title: "Report #2", status: "ON_PROCESS", thumbnailUri: "https://images.unsplash.com/photo-1505238680356-667803448bb6?w=400&h=200&fit=crop" },
    { id: 3, title: "Report #3", status: "CONFIRMED", thumbnailUri: "https://images.unsplash.com/photo-1465188035480-cf3a60801ea5?w=400&h=200&fit=crop" },
];


export default function Riwayat() {
    const sheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ["50%"], []);
    const [value, onChangeText] = useState("");

    const onSubmit = () => console.log("submitted");

    return (
        <View className="flex-1 bg-white">
            <SafeAreaView edges={["top"]} className="flex-1 px-6">
                {/* Header */}
                <View className="flex-row items-center pt-4 pb-2">
                    <Pressable onPress={() => sheetRef.current?.present()}>
                        <MaterialIcons name="help-outline" size={24} color="#000" />
                    </Pressable>
                    <Text className="flex-1 text-center text-lg font-bold">Riwayat</Text>
                    <ProfileButton />
                </View>

                {/* Search */}
                <View className="py-3">
                    <View className="w-full rounded-lg bg-[#EFEFEF] px-4 py-2">
                        <View className="flex-row items-center gap-3">
                            <Feather name="search" size={24} color="#4A739C" />
                            <TextInput
                                className="flex-1 text-lg text-[#4A739C]"
                                value={value}
                                onChangeText={onChangeText}
                                placeholder="Search reports"
                                placeholderTextColor="#365C8A"
                                returnKeyType="search"
                                onSubmitEditing={onSubmit}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            {value ? (
                                <Pressable onPress={() => onChangeText("")}>
                                    <Feather name="x" size={20} color="#365C8A" />
                                </Pressable>
                            ) : null}
                        </View>
                    </View>
                </View>

                {/* Scrollable list */}
                <FlatList
                    className="flex-1"
                    data={reports.filter(r =>
                        value ? r.title.toLowerCase().includes(value.toLowerCase()) : true
                    )}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <ReportItem
                            title={item.title}
                            status={item.status}
                            thumbnailUri={item.thumbnailUri}
                        />
                    )}
                    ItemSeparatorComponent={() => <View className="h-[1px] bg-black/5" />}
                    contentContainerStyle={{ paddingBottom: 16 }}
                    initialNumToRender={8}
                    windowSize={8}
                    removeClippedSubviews
                />
            </SafeAreaView>

            {/* Bottom sheet */}
            <BottomSheetModal
                ref={sheetRef}
                snapPoints={snapPoints}
                enablePanDownToClose
                backgroundStyle={{
                    backgroundColor: "#263189",
                    borderTopLeftRadius: 32,
                    borderTopRightRadius: 32,
                }}
                handleIndicatorStyle={{ marginTop: 8, width: 59, backgroundColor: "#AFB1B680" }}
                backdropComponent={(props) => (
                    <BottomSheetBackdrop
                        {...props}
                        pressBehavior="close"
                        appearsOnIndex={0}
                        disappearsOnIndex={-1}
                    />
                )}
            >
                <BottomSheetView className="p-6 flex-1 justify-center items-center">
                    <Text className="text-xl font-bold text-center mb-7 text-white">
                        Ketahui makanan yang boleh dan tidak boleh kamu makan!
                    </Text>
                    <View className="flex-col items-center justify-center gap-2 mb-12">
                        <StatusBadge label="Done" bgColor="#D1FADF" dotColor="#039855" />
                        <StatusBadge label="On Process" bgColor="#FFF8C9" dotColor="#FFDD00" />
                        <StatusBadge label="Confirmed" bgColor="#FFE6CF" dotColor="#FF9A3C" />
                    </View>
                    <TouchableOpacity
                        className="bg-[#13D599] rounded-full py-4 px-2 w-full mb-8"
                        onPress={() => sheetRef.current?.dismiss()}
                    >
                        <Text className="text-[#EFEFF0] text-center font-bold">Mengerti!</Text>
                    </TouchableOpacity>
                </BottomSheetView>
            </BottomSheetModal>
        </View >
    );
}
