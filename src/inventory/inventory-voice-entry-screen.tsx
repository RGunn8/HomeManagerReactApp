import { useCreateInventoryItems, useInventory, useUpdateInventoryItem } from '@/inventory/hooks/use-inventory';
import { parseVoiceItems, type ParsedVoiceItem } from '@/lib/voice-item-parser';
import { router } from 'expo-router';
import { ExpoSpeechRecognitionModule, speechUnavailableMessage, useSpeechRecognitionEvent } from '@/lib/speech-recognition';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function InventoryVoiceEntryScreen() {
    const { data: inventoryItems = [] } = useInventory();
    const createItems = useCreateInventoryItems();
    const updateItem = useUpdateInventoryItem();
    const [finalText, setFinalText] = useState('');
    const [interimText, setInterimText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState('');
    const [parsedItems, setParsedItems] = useState<ParsedVoiceItem[] | null>(null);

    useSpeechRecognitionEvent('start', () => {
        setIsListening(true);
        setError('');
        setParsedItems(null);
    });
    useSpeechRecognitionEvent('end', () => setIsListening(false));
    useSpeechRecognitionEvent('result', (event) => {
        const recognizedText = event.results[0]?.transcript?.trim();
        if (!recognizedText) return;
        if (event.isFinal) {
            setFinalText((current) => `${current} ${recognizedText}`.trim());
            setInterimText('');
        } else {
            setInterimText(recognizedText);
        }
    });
    useSpeechRecognitionEvent('error', (event) => {
        setIsListening(false);
        if (event.error !== 'aborted' && event.error !== 'no-speech') {
            setError(event.message || 'Speech recognition stopped unexpectedly.');
        }
    });

    const transcript = [finalText, interimText].filter(Boolean).join(' ');

    const startListening = async () => {
        setError('');
        setParsedItems(null);
        setFinalText('');
        setInterimText('');
        if (!ExpoSpeechRecognitionModule) {
            setError(speechUnavailableMessage);
            return;
        }
        try {
            const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
            if (!permission.granted) {
                setError('Microphone and speech recognition permission are needed to transcribe your items.');
                return;
            }
            ExpoSpeechRecognitionModule.start({
                lang: 'en-US',
                interimResults: true,
                continuous: true,
                addsPunctuation: true,
                contextualStrings: inventoryItems.map((item) => item.name),
            });
        } catch {
            setError('Could not start speech recognition. Check microphone permission and try again.');
        }
    };

    const stopListening = () => {
        ExpoSpeechRecognitionModule?.stop();
        const text = transcript.trim();
        if (text) setParsedItems(parseVoiceItems(text));
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setParsedItems((current) => (current ?? []).map((item) => item.id === itemId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item));
    };

    const removeItem = (itemId: string) => {
        setParsedItems((current) => (current ?? []).filter((item) => item.id !== itemId));
    };

    const confirmItems = () => {
        if (!parsedItems || parsedItems.length === 0) return;
        const newItems = parsedItems.filter((parsed) => {
            const existingItem = inventoryItems.find((item) => item.name.trim().toLowerCase() === parsed.name.trim().toLowerCase());
            if (existingItem) {
                updateItem.mutate({ itemId: existingItem.id, updates: { quantity: existingItem.quantity + parsed.quantity } });
            }
            return !existingItem;
        });
        if (newItems.length > 0) {
            createItems.mutate(newItems.map((item) => ({ name: item.name, quantity: item.quantity })));
        }
        router.back();
    };

    const reviewItems = useMemo(() => parsedItems ?? [], [parsedItems]);

    return (
        <SafeAreaView className="flex-1 bg-forest-deep" edges={['top', 'bottom']}>
            <StatusBar style="light" />
            <View className="flex-row items-center justify-between px-screen pt-3">
                <Pressable accessibilityRole="button" onPress={() => {
                    if (isListening) ExpoSpeechRecognitionModule?.abort();
                    router.back();
                }}>
                    <Text className="font-sans-semibold text-[16px] text-cream">Cancel</Text>
                </Pressable>
                <Text className="font-sans-semibold text-[16px] text-cream">Add to inventory</Text>
                <View className="w-14" />
            </View>

            {parsedItems === null ? (
                <View className="flex-1 items-center justify-center px-screen">
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={isListening ? 'Stop listening' : 'Start listening'}
                        className={`h-48 w-48 items-center justify-center rounded-full border-[8px] border-forest-dark ${isListening ? 'bg-overdue' : 'bg-clay'}`}
                        onPress={isListening ? stopListening : startListening}
                    >
                        <Text className="text-[54px] text-cream">{isListening ? '■' : '🎙'}</Text>
                    </Pressable>

                    <View className="mt-14 h-16 flex-row items-center justify-center gap-2">
                        {[18, 34, 24, 48, 30, 40, 22].map((height, index) => (
                            <View className={`w-2 rounded-sm ${isListening ? 'bg-cream/70' : 'bg-cream/35'}`} key={`${height}-${index}`} style={{ height }} />
                        ))}
                    </View>

                    <Text className="mt-8 font-sans-semibold text-[13px] uppercase tracking-[2px] text-clay-light">
                        {isListening ? 'Listening' : 'Voice add'}
                    </Text>
                    <ScrollView className="mt-8 max-h-[190px] w-full" contentContainerClassName="items-center">
                        <Text className="text-center font-serif text-[28px] leading-9 text-cream">
                            {transcript || 'Tap the microphone and say the items you have.'}
                        </Text>
                    </ScrollView>
                    {error ? <Text accessibilityRole="alert" className="mt-5 text-center font-sans text-[14px] text-clay-light">{error}</Text> : null}
                    <Text className="mt-8 text-center font-sans text-[14px] text-cream/70">
                        {isListening ? 'Speak naturally, like "two light bulbs and paper towels."' : 'Tap stop when you\u2019re done speaking.'}
                    </Text>
                </View>
            ) : (
                <View className="flex-1 px-screen pt-6">
                    <Text className="font-sans-semibold text-[13px] uppercase tracking-[2px] text-clay-light">
                        {reviewItems.length} {reviewItems.length === 1 ? 'item' : 'items'} heard
                    </Text>
                    <ScrollView className="mt-4 flex-1" contentContainerClassName="gap-2 pb-4">
                        {reviewItems.length > 0 ? reviewItems.map((item) => (
                            <View className="flex-row items-center gap-3 rounded-card bg-cream/10 px-4 py-3" key={item.id}>
                                <Text className="flex-1 font-sans-semibold text-[16px] text-cream" numberOfLines={1}>{item.name}</Text>
                                <View className="flex-row items-center gap-2">
                                    <Pressable accessibilityLabel={`Decrease ${item.name} quantity`} className="h-8 w-8 items-center justify-center rounded-full bg-cream/15" onPress={() => updateQuantity(item.id, -1)}>
                                        <Text className="text-[18px] text-cream">−</Text>
                                    </Pressable>
                                    <Text className="w-6 text-center font-sans-semibold text-[15px] text-cream">{item.quantity}</Text>
                                    <Pressable accessibilityLabel={`Increase ${item.name} quantity`} className="h-8 w-8 items-center justify-center rounded-full bg-cream/15" onPress={() => updateQuantity(item.id, 1)}>
                                        <Text className="text-[18px] text-cream">+</Text>
                                    </Pressable>
                                </View>
                                <Pressable accessibilityLabel={`Remove ${item.name}`} onPress={() => removeItem(item.id)}>
                                    <Text className="text-[18px] text-clay-light">×</Text>
                                </Pressable>
                            </View>
                        )) : (
                            <Text className="rounded-card border border-dashed border-cream/30 px-4 py-8 text-center font-sans text-[15px] text-cream/70">
                                No items recognized. Try again.
                            </Text>
                        )}
                    </ScrollView>
                    <Pressable accessibilityRole="button" className="mb-2 items-center" onPress={() => setParsedItems(null)}>
                        <Text className="font-sans-semibold text-[14px] text-cream/70">Re-record</Text>
                    </Pressable>
                </View>
            )}

            <View className="px-screen pb-8">
                {parsedItems !== null && reviewItems.length > 0 ? (
                    <Pressable accessibilityRole="button" className="items-center rounded-button bg-clay px-4 py-4" onPress={confirmItems}>
                        <Text className="font-sans-semibold text-[16px] text-cream">Add {reviewItems.length} {reviewItems.length === 1 ? 'item' : 'items'} to inventory</Text>
                    </Pressable>
                ) : parsedItems === null ? (
                    <Text className="text-center font-sans text-[14px] text-cream/70">
                        {isListening ? 'Speak naturally. Your words will appear here.' : 'New items land straight in your inventory.'}
                    </Text>
                ) : null}
            </View>
        </SafeAreaView>
    );
}
