import { View, Text } from "react-native";
import { Image as ExpoImage } from "expo-image";

const Logo = ({
    className,
}: {
    className?: string;
}) => {
    return (
        <View className={`flex-row items-center gap-[5px] p-[10px] rounded-[10px] bg-white w-auto ${className}`}>
            <ExpoImage
                source={require("@/assets/images/logo.png")}
                style={{ width: 24, height: 32 }}
                contentFit="contain"
            />
            <Text className="font-medium text-[32px] text-[#263189]">Jejak</Text>
        </View>
    );
};

export default Logo;