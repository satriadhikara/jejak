import { View, Text, Pressable } from "react-native";

type Props = {
    label: string;
    bgColor: string;
    dotColor: string;
    onPress?: () => void;
};

export default function StatusBadge({ label, bgColor, dotColor, onPress }: Props) {
    const Content = (
        <View className="flex-row items-center justify-center gap-4 py-[10px] px-4 rounded-full"
            style={{ backgroundColor: bgColor }}>
            <View className="size-6 rounded-full" style={{ backgroundColor: dotColor }} />
            <Text>{label}</Text>
        </View>
    );

    return onPress ? <Pressable onPress={onPress}>{Content}</Pressable> : Content;
}
