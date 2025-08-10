import { View, Text, TextInput, TextInputProps } from "react-native";

type LabeledInputProps = {
    label: string;
} & TextInputProps;

export default function LabeledInput({ label, ...props }: LabeledInputProps) {
    return (
        <View className="flex flex-col gap-[2px] w-full">
            <Text className="text-xs text-[#6C7278]">
                {label}
            </Text>
            <TextInput
                placeholderTextColor="#6C7278"
                className="px-[14px] border border-[#EDF1F3] rounded-[10px] text-[#1A1C1E]"
                {...props}
            />
        </View>
    );
}
