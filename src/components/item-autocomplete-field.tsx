import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

export type ItemSuggestion = {
    id: string;
    name: string;
    quantity: number;
    price?: number;
    room?: string;
};

type ItemAutocompleteFieldProps = {
    accessibilityLabel: string;
    autoFocus?: boolean;
    inputClassName?: string;
    onChangeText: (value: string) => void;
    onSelectSuggestion: (suggestion: ItemSuggestion) => void;
    placeholder: string;
    suggestions: ItemSuggestion[];
    value: string;
};

export function ItemAutocompleteField({
    accessibilityLabel,
    autoFocus,
    inputClassName = 'h-[46px] rounded-input border border-hairline bg-white px-3 font-sans text-[15px] text-ink placeholder:text-ink-faint',
    onChangeText,
    onSelectSuggestion,
    placeholder,
    suggestions,
    value,
}: ItemAutocompleteFieldProps) {
    const [isFocused, setIsFocused] = useState(false);
    const matchingSuggestions = useMemo(() => {
        const query = value.trim().toLowerCase();
        if (!isFocused || !query) return [];

        return suggestions
            .filter((item) => item.name.toLowerCase().includes(query))
            .slice(0, 5);
    }, [isFocused, suggestions, value]);

    return (
        <View className="gap-2">
            <TextInput
                accessibilityLabel={accessibilityLabel}
                autoCapitalize="words"
                autoFocus={autoFocus}
                className={inputClassName}
                onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                onChangeText={(text) => {
                    setIsFocused(true);
                    onChangeText(text);
                }}
                onFocus={() => setIsFocused(true)}
                placeholder={placeholder}
                returnKeyType="done"
                value={value}
            />
            {matchingSuggestions.length > 0 ? (
                <View className="overflow-hidden rounded-lg border border-hairline bg-white">
                    {matchingSuggestions.map((suggestion, index) => (
                        <Pressable
                            accessibilityLabel={`${suggestion.name}, ${suggestion.quantity} in stock, ${suggestion.price === undefined ? 'price unavailable' : `$${suggestion.price.toFixed(2)}`}`}
                            accessibilityRole="button"
                            className={`flex-row items-center gap-3 px-3 py-2.5 ${index < matchingSuggestions.length - 1 ? 'border-b border-row-divider' : ''}`}
                            key={suggestion.id}
                            onPress={() => {
                                onSelectSuggestion(suggestion);
                                setIsFocused(false);
                            }}
                        >
                            <View className="min-w-0 flex-1">
                                <Text className="font-sans-semibold text-[14px] text-ink" numberOfLines={1}>{suggestion.name}</Text>
                                <Text className="mt-0.5 font-sans text-[12px] text-ink-muted" numberOfLines={1}>
                                    {suggestion.room ? `${suggestion.room} · ` : ''}{suggestion.quantity} in stock
                                </Text>
                            </View>
                            <Text className="font-sans-semibold text-[13px] text-forest">
                                {suggestion.price === undefined ? 'No price' : `$${suggestion.price.toFixed(2)}`}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            ) : null}
        </View>
    );
}