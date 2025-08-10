import { Pressable } from "react-native";
import { User } from "lucide-react-native";
import { router } from "expo-router";

const ProfileButton = ({
    backgroundColor = "#263189",
}: {
    backgroundColor?: string;
}) => {
    return (
        <Pressable onPress={() => router.push("/profile")} className={`p-[6px] rounded-full bg-[${backgroundColor}]`}>
            <User size={24} color="#FFFFFF" />
        </Pressable>
    );
};

export default ProfileButton;