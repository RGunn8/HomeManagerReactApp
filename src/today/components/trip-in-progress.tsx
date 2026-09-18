import { preview } from 'radon-ide';
import { Pressable, Text, View } from 'react-native';


export function TripInProgress ({storeName, itemsChecked, itemsTotal, onResumeClick}: {storeName: string; itemsChecked: number; itemsTotal: number; onResumeClick: () => void}) {
    return (
        <View className="flex flex-row w-full bg-clay-tint border border-clay-hairline rounded-2xl p-5 shadow-sm" >
            <View className="flex-col justify-start items-start flex-1">
        
            <Text className="font-sans-semibold text-md text-clay">Trip in Progress</Text>
    
            <Text className="font-sans-semibold text-lg text-ink">{storeName} · {itemsChecked} of {itemsTotal} picked</Text>
             </View>
            <Pressable className={`bg-clay rounded-3xl justify-center px-4 py-2`} onPress={onResumeClick}>
                <Text className="text-[16px] text-cream font-sans-semibold">Resume</Text>
            </Pressable>
        </View>
    );
}

preview(<TripInProgress storeName="Walmart" itemsChecked={3} itemsTotal={10} onResumeClick={() => console.log("Resume clicked")} />);