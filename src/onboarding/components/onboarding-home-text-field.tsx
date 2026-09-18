import { preview } from 'radon-ide';
import { Text, TextInput, View } from 'react-native';


export function OnboardingHomeTextField({ value, onChange, placeholder }: { value: string; onChange: (text: string) => void; placeholder: string }) {       
    return (
         <View className="flex flex-col mx-4 gap-2">

        <Text className="text-ink-faint font-sans text-[12.5px] ">Home Name</Text>

        <TextInput
          autoCapitalize="words"
          autoComplete="off"
          className="h-[70px] w-full rounded-input border border-forest bg-card text-base text-ink text-4xl px-[12px] py-4 font-serif"
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#2521266f" 
          value={value}
        />

            </View>
         
    )
}

preview(<OnboardingHomeTextField value="Home Name" onChange={(text) => console.log(text)} placeholder="Enter your home name" />);