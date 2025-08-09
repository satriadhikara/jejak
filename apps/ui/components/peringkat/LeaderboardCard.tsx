import { View, Text } from "react-native";

const LeaderboardCard = ({
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
        <View className="bg-[#252728] rounded-xl flex flex-row items-center text-sm font-bold px-4 py-2 justify-between h-12">
            <View className="flex flex-row items-center gap-3">
                <Text className="text-white font-bold">{rank}</Text>
                <View className="bg-white size-8 rounded-full" />
                <Text
                    className="text-white font-bold"
                    style={{
                        fontSize: 14,
                    }}
                >
                    {name}
                </Text>
            </View>
            <Text className="text-white">{points} pts</Text>
        </View>
    );
};

export default LeaderboardCard;
