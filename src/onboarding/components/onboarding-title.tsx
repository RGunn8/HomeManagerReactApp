import { preview } from "radon-ide";
import { Text, View } from "react-native";

export function OnboardingTitle({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <View className="flex flex-col justify-center text-center gap-4 px-5">
            <Text className="text-[32px] font-ink font-serif-bold">{title}</Text>
            <Text className="text-[15.5px] font-ink-muted font-sans">{subtitle}</Text>
        </View>
    );
}

preview(<OnboardingTitle title="Welcome to - what should we call your home?" subtitle="Your personal task manager for a productive day!" />);