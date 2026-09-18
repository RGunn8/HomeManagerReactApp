import { Text } from 'react-native';


export function TitleText({title}: {title: string}) {
    return (
        <Text className={`text-[32px] font-serif text-ink mb-1`}>{title}</Text>
    );
}   