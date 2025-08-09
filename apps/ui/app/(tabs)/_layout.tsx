import { Tabs } from "expo-router";
import {
    House,
    SearchCheck,
    Crown,
    ClipboardClock,
    Camera,
} from "lucide-react-native";
import { Text, View } from "react-native";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    height: 90,
                    paddingTop: 10,
                    paddingBottom: 10,
                    paddingHorizontal: 10,
                },
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
                name="camera"
                options={{
                    title: "",
                    tabBarIcon: () => (
                        <View
                            style={{
                                marginTop: 20,
                                backgroundColor: "#263189",
                                borderRadius: 50,
                                padding: 16,
                            }}
                        >
                            <Camera color="#00D9A3" strokeWidth={2} />
                        </View>
                    ),
                    tabBarLabel: () => null,
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
