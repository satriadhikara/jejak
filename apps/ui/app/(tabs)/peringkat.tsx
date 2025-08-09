import LeaderboardCard from "@/components/peringkat/LeaderboardCard";
import Top3LeaderboardCard from "@/components/peringkat/Top3LeaderboardCard";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LeaderboardsData = [
    { rank: 1, avatar: "", name: "Bryan Wolf", points: 50 },
    { rank: 2, avatar: "", name: "Meghan Jessica", points: 40 },
    { rank: 3, avatar: "", name: "Alex Turner", points: 30 },
    { rank: 4, avatar: "", name: "Marsha Fisher", points: 30 },
    { rank: 5, avatar: "", name: "Juanita Cormier", points: 25 },
    { rank: 6, avatar: "", name: "You", points: 25 },
    { rank: 7, avatar: "", name: "Tamara Schmidt", points: 20 },
    { rank: 8, avatar: "", name: "Ricardo Veum", points: 15 },
    { rank: 9, avatar: "", name: "Gary Sanford", points: 10 },
    { rank: 10, avatar: "", name: "Becky Bartell", points: 5 },
];

export default function Peringkat() {
    const top3 = LeaderboardsData.slice(0, 3);
    const others = LeaderboardsData.slice(3);

    const top3DisplayOrder = [
        top3.find((p) => p.rank === 2),
        top3.find((p) => p.rank === 1),
        top3.find((p) => p.rank === 3),
    ];

    return (
        <View className="flex-1 bg-white">
            <SafeAreaView edges={["top"]} className="flex-1">
                <View className="flex-1 justify-between">
                    {/* Top header */}
                    <View className="px-6 flex-row justify-between items-center">
                        <Text className="text-2xl font-bold">Peringkat</Text>
                        {/* Placeholder avatar */}
                        <View className="size-9 bg-black rounded-full" />
                    </View>

                    {/* Middle section (Top 3) */}
                    <View className="flex w-full justify-center items-center flex-row">
                        {top3DisplayOrder.map(
                            (player) =>
                                player && (
                                    <Top3LeaderboardCard
                                        key={player.rank}
                                        {...player}
                                    />
                                )
                        )}
                    </View>

                    {/* Bottom leaderboard */}
                    <View className="bg-[#263189] pt-6 rounded-t-[32px]">
                        <View className="gap-2 mx-6 pb-6">
                            {others.map((player) => (
                                <LeaderboardCard
                                    key={player.rank}
                                    {...player}
                                />
                            ))}
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}
