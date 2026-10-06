import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

export type RoomNote = {
    id: string;
    text: string;
    createdAt: number;
};

type RoomNotesTabProps = {
    notes: RoomNote[];
    onAddNote: (text: string) => void;
};

export function RoomNotesTab({ notes, onAddNote }: RoomNotesTabProps) {
    const [noteInput, setNoteInput] = useState('');

    const addNote = () => {
        const text = noteInput.trim();
        if (!text) {
            return;
        }

        onAddNote(text);
        setNoteInput('');
    };

    return (
        <View className="mt-6 gap-4">
            <View className="gap-2">
                <TextInput
                    accessibilityLabel="New note"
                    className="min-h-[52px] rounded-input border border-hairline bg-white px-4 py-3 font-sans text-[16px] text-ink placeholder:text-ink-faint"
                    maxLength={300}
                    multiline
                    onChangeText={setNoteInput}
                    placeholder="Add a note"
                    value={noteInput}
                />
                <View className="flex-row items-center justify-between">
                    <Text className="font-sans text-[13px] text-ink-muted">{noteInput.length}/300</Text>
                    <Pressable
                        accessibilityRole="button"
                        className="rounded-button bg-forest px-4 py-2 disabled:opacity-50"
                        disabled={!noteInput.trim()}
                        onPress={addNote}
                    >
                        <Text className="font-sans-semibold text-[14px] text-white">Add note</Text>
                    </Pressable>
                </View>
            </View>
            <View className="gap-3">
                {notes.map((note) => (
                    <View className="rounded-card border border-hairline bg-white px-4 py-3" key={note.id}>
                        <Text className="font-sans text-[16px] leading-6 text-ink">{note.text}</Text>
                        <Text className="mt-2 font-sans text-[13px] text-ink-muted">
                            {new Date(note.createdAt).toLocaleDateString()}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
