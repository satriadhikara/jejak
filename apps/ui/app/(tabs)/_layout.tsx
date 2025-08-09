import { Tabs } from "expo-router";
import { House, SearchCheck, Crown, ClipboardClock } from "lucide-react-native";
import { Text } from "react-native";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Beranda",
                    tabBarIcon: ({ focused }) => (
                        <House color="#263189" strokeWidth={focused ? 2 : 1} />
                    ),
                    tabBarLabel: ({ focused }) => (
                        <Text
                            style={{
                                color: "#263189",
                                fontWeight: focused ? "bold" : "normal",
                            }}
                        >
                            Beranda
                        </Text>
                    ),
                }}
            />
            <Tabs.Screen
                name="pindai"
                options={{
                    title: "Pindai",
                    tabBarIcon: ({ focused }) => (
                        <SearchCheck
                            color="#263189"
                            strokeWidth={focused ? 2 : 1}
                        />
                    ),
                    tabBarLabel: ({ focused }) => (
                        <Text
                            style={{
                                color: "#263189",
                                fontWeight: focused ? "bold" : "normal",
                            }}
                        >
                            Pindai
                        </Text>
                    ),
                }}
            />
            <Tabs.Screen
                name="peringkat"
                options={{
                    title: "Peringkat",
                    tabBarIcon: ({ focused }) => (
                        <Crown color="#263189" strokeWidth={focused ? 2 : 1} />
                    ),
                    tabBarLabel: ({ focused }) => (
                        <Text
                            style={{
                                color: "#263189",
                                fontWeight: focused ? "bold" : "normal",
                            }}
                        >
                            Peringkat
                        </Text>
                    ),
                }}
            />
            <Tabs.Screen
                name="riwayat"
                options={{
                    title: "Riwayat",
                    tabBarIcon: ({ focused }) => (
                        <ClipboardClock
                            color="#263189"
                            strokeWidth={focused ? 2 : 1}
                        />
                    ),
                    tabBarLabel: ({ focused }) => (
                        <Text
                            style={{
                                color: "#263189",
                                fontWeight: focused ? "bold" : "normal",
                            }}
                        >
                            Riwayat
                        </Text>
                    ),
                }}
            />
        </Tabs>
    );
}
