import { View, Text } from "react-native";

const Top3LeaderboardCard = ({
    rank,
    avatar,
    name,
    points,
}: {
    rank: number;
    avatar: string;
    name: string;
    points: number;
}) => {
    return (
        <View
            className={`flex flex-col items-center ${rank === 1 ? "mb-10" : ""}`}
        >
            <View className="relative items-center justify-center">
                <View
                    className={`bg-white ${
                        rank === 1 ? "size-20" : "size-[74px]"
                    } rounded-full border-[3px] border-[#263189]`}
                />

                <View
                    className="absolute -bottom-3 size-7 rounded-full bg-[#263189] 
                       items-center justify-center"
                >
                    <Text className="text-white font-bold text-sm">{rank}</Text>
                </View>
            </View>

            <View className="w-[110px] flex justify-center items-center mt-3">
                <Text
                    className="font-bold text-[#263189]"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {name}
                </Text>
            </View>

            <Text className="text-[#13D599]">{points} pts</Text>
        </View>
    );
};

export default Top3LeaderboardCard;
