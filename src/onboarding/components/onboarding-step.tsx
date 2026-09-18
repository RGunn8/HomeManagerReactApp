import { preview } from "radon-ide";
import { Pressable, Text, View } from "react-native";



export function OnboardingStep({ stepIndex, totalSteps, onSkipPressed }: { stepIndex: number; totalSteps: number; onSkipPressed: () => void;  }) {
   return (
    <View className="flex flex-row justify-between items-center px-5 py-3">
        <View className="flex -1 flex-row gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
                <View
                    key={index}
                    className={`h-2 w-[40px] rounded-full ${index <= stepIndex ? "bg-ink" : "bg-ink-muted"}`}
                   
                />
            ))}
        </View>

        <View className="flex-1 flex-row justify-end">
                {stepIndex === 0 ? (
                    <Text className="text-ink-faint font-sans text-[14px]">Step 1 of 3</Text>
                ) : (
                         <Pressable onPress={onSkipPressed}>
                    <Text className="text-forest font-sans text-[16px]">Skip</Text>
                     </Pressable>
                )}
        </View>
    </View>
   )   

}

preview(<OnboardingStep stepIndex={1} totalSteps={3} onSkipPressed={() => console.log("Skip pressed")} />);