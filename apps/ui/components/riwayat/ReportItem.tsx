import { View, Text, Pressable, Image } from "react-native";

type Props = {
    title: string;
    status: string;
    onPress?: () => void;
    thumbnailUri?: string;
};

export default function ReportItem({
    title,
    status,
    onPress,
    thumbnailUri,
}: Props) {
    const statusColor = status === "DONE" ? "#039855" : status === "ON_PROCESS" ? "#FFDD00" : "#FF9A3C";

    const Content = (
        <View className="py-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
                {thumbnailUri ? (
                    <Image
                        source={{ uri: thumbnailUri }}
                        className="w-[100px] h-14 rounded-lg"
                    />
                ) : (
                    <View className="bg-black w-[100px] h-14 rounded-lg" />
                )}
                <Text className="text-lg font-medium text-[#0D141C]">{title}</Text>
            </View>

            <View className="size-5 rounded-full" style={{ backgroundColor: statusColor }} />
        </View>
    );

    return onPress ? <Pressable onPress={onPress}>{Content}</Pressable> : Content;
}
