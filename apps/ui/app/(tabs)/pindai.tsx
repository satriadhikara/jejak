import React, { useRef } from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";

export default function Pindai() {
    const mapRef = useRef<MapView | null>(null);

    const centerToMyLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            alert("Location permission is required.");
            return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        mapRef.current?.animateToRegion(
            {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            },
            600
        );
    };

    return (
        <View className="flex-1">
            <MapView
                ref={mapRef}
                style={{
                    flex: 1,
                }}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    latitude: -6.2,
                    longitude: 106.8,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            />

            <TouchableOpacity
                onPress={centerToMyLocation}
                className="absolute right-4 bottom-6 size-12 rounded-full bg-white items-center justify-center ios:shadow-lg"
                style={{
                    elevation: 4,
                    shadowColor: "#000",
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 2 },
                }}
            >
                <MaterialIcons name="my-location" size={24} color="#263189" />
            </TouchableOpacity>
        </View>
    );
}


