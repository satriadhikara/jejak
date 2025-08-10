
import { Pressable, View, Text } from "react-native";

const ProfileCard = ({
    title,
    description,
    icon,
    onPress,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
    onPress: () => void;
}) => {
    return (
        <Pressable onPress={onPress} className="bg-[#2631891A] px-4 py-3 rounded-[10px]">
            <View className="flex-row items-center gap-4">
                {icon}
                <Text className="text-xl font-semibold text-[#263189]">{title}</Text>
            </View>
            <Text className="text-[#707070] text-sm">{description}</Text>
        </Pressable>
    );
};

export default ProfileCard;